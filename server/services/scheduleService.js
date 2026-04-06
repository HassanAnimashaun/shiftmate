const { ObjectId } = require("mongodb");
const { connectDB } = require("../db");
const { normalizeSchedule, normalizeTemplate } = require("../utils/normalizeSchedule");

// --- Helpers ---

function getWeekRange(dateStr) {
  const d = new Date(dateStr);
  const day = d.getUTCDay();
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() - ((day + 6) % 7));
  monday.setUTCHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  sunday.setUTCHours(23, 59, 59, 999);

  return { start: monday, end: sunday };
}

function calculateHours(startTime, endTime) {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  return ((eh * 60 + em) - (sh * 60 + sm)) / 60;
}

// --- Helpers ---

function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// --- Conflict Detection ---

async function hasLocationConflict(staffId, date, startTime, endTime, locationId, excludeId = null) {
  const db = await connectDB();

  const dayStart = new Date(date);
  dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setUTCHours(23, 59, 59, 999);

  const query = {
    staffId: new ObjectId(staffId),
    date: { $gte: dayStart, $lte: dayEnd },
    status: { $nin: ["cancelled"] },
  };
  if (excludeId && ObjectId.isValid(excludeId)) {
    query._id = { $ne: new ObjectId(excludeId) };
  }

  const existingShifts = await db.collection("schedules").find(query).toArray();

  const newStart = timeToMinutes(startTime);
  const newEnd = timeToMinutes(endTime);

  for (const shift of existingShifts) {
    const existStart = timeToMinutes(shift.startTime);
    const existEnd = timeToMinutes(shift.endTime);
    const sameLocation = shift.locationId.toString() === locationId.toString();
    const overlaps = newStart < existEnd && newEnd > existStart;

    if (overlaps) {
      return {
        type: "overlap",
        msg: sameLocation
          ? "Employee already has a shift at this location that overlaps this time"
          : "Employee cannot be scheduled at two locations at the same time",
      };
    }

    if (!sameLocation) {
      const gap = newStart >= existEnd ? newStart - existEnd : existStart - newEnd;
      if (gap < 60) {
        return {
          type: "gap",
          gapMinutes: gap,
          msg: `At least 1 hour is required between shifts at different locations (current gap: ${gap} min)`,
        };
      }
    }
  }

  return null;
}

async function hasTimeOffConflict(staffId, date) {
  const db = await connectDB();
  return db.collection("timeOffRequests").findOne({
    staffId: new ObjectId(staffId),
    status: "approved",
    startDate: { $lte: date },
    endDate: { $gte: date },
  });
}

// --- Schedule CRUD ---

async function fetchWeekSchedule(week, locationId) {
  const db = await connectDB();
  const { start, end } = getWeekRange(week);

  const query = { date: { $gte: start, $lte: end } };
  if (locationId && ObjectId.isValid(locationId)) {
    query.locationId = new ObjectId(locationId);
  }

  const schedules = await db.collection("schedules").find(query).sort({ date: 1, startTime: 1 }).toArray();
  return schedules.map(normalizeSchedule);
}

async function insertShift(sanitizedData, createdBy) {
  const db = await connectDB();

  const doc = {
    ...sanitizedData,
    staffId: new ObjectId(sanitizedData.staffId),
    locationId: new ObjectId(sanitizedData.locationId),
    templateId: sanitizedData.templateId ? new ObjectId(sanitizedData.templateId) : null,
    createdBy: new ObjectId(createdBy),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection("schedules").insertOne(doc);
  const saved = await db.collection("schedules").findOne({ _id: result.insertedId });
  return normalizeSchedule(saved);
}

async function updateShift(id, sanitizedData) {
  const db = await connectDB();

  const update = { ...sanitizedData, updatedAt: new Date() };
  if (update.staffId) update.staffId = new ObjectId(update.staffId);
  if (update.locationId) update.locationId = new ObjectId(update.locationId);
  if (update.templateId) update.templateId = new ObjectId(update.templateId);

  const result = await db.collection("schedules").findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: update },
    { returnDocument: "after" }
  );

  return result ? normalizeSchedule(result) : null;
}

async function deleteShift(id) {
  const db = await connectDB();
  const result = await db.collection("schedules").deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

// --- Bulk Operations ---

async function buildConflictDetail(db, staffId, ptoRequest, date) {
  const employee = await db.collection("staff").findOne({ _id: new ObjectId(staffId) });
  return {
    staffId: staffId.toString(),
    employeeName: employee?.name ?? "Unknown Employee",
    ptoType: ptoRequest.type ?? "time off",
    date,
  };
}

async function copyWeek(sourceWeek, targetWeek) {
  const db = await connectDB();
  const { start: srcStart, end: srcEnd } = getWeekRange(sourceWeek);
  const { start: tgtStart } = getWeekRange(targetWeek);

  const offsetMs = tgtStart.getTime() - srcStart.getTime();

  const sourceShifts = await db.collection("schedules")
    .find({ date: { $gte: srcStart, $lte: srcEnd } })
    .toArray();

  const preview = [];
  const conflicts = [];

  for (const shift of sourceShifts) {
    const newDate = new Date(shift.date.getTime() + offsetMs);
    const pto = await hasTimeOffConflict(shift.staffId.toString(), newDate);
    const entry = { ...shift, _id: undefined, date: newDate, createdAt: new Date(), updatedAt: new Date() };
    delete entry._id;

    if (pto) {
      conflicts.push(await buildConflictDetail(db, shift.staffId.toString(), pto, newDate));
    } else {
      preview.push(entry);
    }
  }

  return { preview: preview.map(normalizeSchedule), conflicts };
}

async function confirmCopyWeek(sourceWeek, targetWeek, createdBy) {
  const db = await connectDB();
  const { start: srcStart, end: srcEnd } = getWeekRange(sourceWeek);
  const { start: tgtStart } = getWeekRange(targetWeek);

  const offsetMs = tgtStart.getTime() - srcStart.getTime();

  const sourceShifts = await db.collection("schedules")
    .find({ date: { $gte: srcStart, $lte: srcEnd } })
    .toArray();

  const docs = [];
  const conflicts = [];

  for (const shift of sourceShifts) {
    const newDate = new Date(shift.date.getTime() + offsetMs);
    const pto = await hasTimeOffConflict(shift.staffId.toString(), newDate);
    if (pto) {
      conflicts.push(await buildConflictDetail(db, shift.staffId.toString(), pto, newDate));
      continue;
    }
    const locConflict = await hasLocationConflict(
      shift.staffId.toString(), newDate, shift.startTime, shift.endTime,
      shift.locationId.toString(), null
    );
    if (locConflict) {
      const employee = await db.collection("staff").findOne({ _id: shift.staffId });
      conflicts.push({
        staffId: shift.staffId.toString(),
        employeeName: employee?.name ?? "Unknown Employee",
        ptoType: null,
        msg: locConflict.msg,
        date: newDate,
      });
      continue;
    }
    docs.push({
      staffId: shift.staffId,
      locationId: shift.locationId,
      date: newDate,
      startTime: shift.startTime,
      endTime: shift.endTime,
      shiftLabel: shift.shiftLabel,
      scheduledHours: shift.scheduledHours,
      status: "scheduled",
      notes: shift.notes ?? "",
      templateId: shift.templateId ?? null,
      createdBy: new ObjectId(createdBy),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  if (docs.length > 0) {
    await db.collection("schedules").insertMany(docs, { ordered: false });
  }

  return { inserted: docs.length, skipped: conflicts.length, conflicts };
}

async function bulkAssignShifts(staffIds, templateId, locationId, dates, createdBy) {
  const db = await connectDB();

  const template = await db.collection("shiftTemplates").findOne({ _id: new ObjectId(templateId) });
  if (!template) throw new Error("Template not found");

  const docs = [];
  const conflicts = [];

  for (const staffId of staffIds) {
    for (const dateStr of dates) {
      const date = new Date(dateStr);
      const pto = await hasTimeOffConflict(staffId, date);
      if (pto) {
        conflicts.push(await buildConflictDetail(db, staffId, pto, date));
        continue;
      }
      const locConflict = await hasLocationConflict(staffId, date, template.startTime, template.endTime, locationId);
      if (locConflict) {
        const employee = await db.collection("staff").findOne({ _id: new ObjectId(staffId) });
        conflicts.push({
          staffId,
          employeeName: employee?.name ?? "Unknown Employee",
          ptoType: null,
          msg: locConflict.msg,
          date,
        });
        continue;
      }
      docs.push({
        staffId: new ObjectId(staffId),
        locationId: new ObjectId(locationId),
        date,
        startTime: template.startTime,
        endTime: template.endTime,
        shiftLabel: template.shiftLabel,
        scheduledHours: template.scheduledHours,
        status: "scheduled",
        notes: "",
        templateId: template._id,
        createdBy: new ObjectId(createdBy),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  if (docs.length > 0) {
    await db.collection("schedules").insertMany(docs, { ordered: false });
  }

  return { inserted: docs.length, skipped: conflicts.length, conflicts };
}

// --- Payroll / Hours ---

async function getHoursForPeriod(staffId, startDate, endDate) {
  const db = await connectDB();
  const result = await db.collection("schedules").aggregate([
    {
      $match: {
        staffId: new ObjectId(staffId),
        date: { $gte: new Date(startDate), $lte: new Date(endDate) },
        status: { $in: ["scheduled", "completed"] },
      },
    },
    {
      $group: {
        _id: "$staffId",
        totalHours: { $sum: "$scheduledHours" },
        shiftCount: { $sum: 1 },
      },
    },
  ]).toArray();

  return result[0] || { totalHours: 0, shiftCount: 0 };
}

// --- Shift Templates ---

async function fetchTemplates() {
  const db = await connectDB();
  const templates = await db.collection("shiftTemplates").find({}).sort({ name: 1 }).toArray();
  return templates.map(normalizeTemplate);
}

async function insertTemplate(sanitizedData, createdBy) {
  const db = await connectDB();
  const doc = {
    ...sanitizedData,
    createdBy: new ObjectId(createdBy),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const result = await db.collection("shiftTemplates").insertOne(doc);
  const saved = await db.collection("shiftTemplates").findOne({ _id: result.insertedId });
  return normalizeTemplate(saved);
}

async function updateTemplate(id, sanitizedData) {
  const db = await connectDB();
  const result = await db.collection("shiftTemplates").findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...sanitizedData, updatedAt: new Date() } },
    { returnDocument: "after" }
  );
  return result ? normalizeTemplate(result) : null;
}

async function deleteTemplate(id) {
  const db = await connectDB();
  const result = await db.collection("shiftTemplates").deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

// --- DB Indexes ---

async function ensureScheduleIndexes() {
  const db = await connectDB();
  const col = db.collection("schedules");
  await col.createIndex({ date: 1, locationId: 1 });
  await col.createIndex({ staffId: 1, date: 1 });
  await col.createIndex(
    { staffId: 1, date: 1, startTime: 1, endTime: 1 },
    { unique: true }
  );
}

// --- Seed Default Templates ---

async function seedDefaultTemplates({ force = false } = {}) {
  const db = await connectDB();
  if (!force) {
    const existing = await db.collection("shiftTemplates").countDocuments();
    if (existing > 0) return;
  }

  const defaults = [
    { name: "Full day",      startTime: "08:45", endTime: "17:00", scheduledHours: 8.25, shiftLabel: "full"   },
    { name: "Early",         startTime: "08:15", endTime: "16:00", scheduledHours: 7.75, shiftLabel: "early"  },
    { name: "Half day (5h)", startTime: "12:00", endTime: "17:00", scheduledHours: 5.0,  shiftLabel: "half"   },
    { name: "Half day (4h)", startTime: "12:00", endTime: "16:00", scheduledHours: 4.0,  shiftLabel: "half"   },
  ];

  const now = new Date();
  await db.collection("shiftTemplates").insertMany(
    defaults.map((t) => ({ ...t, createdBy: null, createdAt: now, updatedAt: now }))
  );
  console.log("Seeded default shift templates");
}

module.exports = {
  getWeekRange,
  calculateHours,
  hasTimeOffConflict,
  hasLocationConflict,
  fetchWeekSchedule,
  insertShift,
  updateShift,
  deleteShift,
  copyWeek,
  confirmCopyWeek,
  bulkAssignShifts,
  getHoursForPeriod,
  fetchTemplates,
  insertTemplate,
  updateTemplate,
  deleteTemplate,
  ensureScheduleIndexes,
  seedDefaultTemplates,
};

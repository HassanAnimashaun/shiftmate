const { ObjectId } = require("mongodb");
const {
  fetchWeekSchedule,
  insertShift,
  updateShift,
  deleteShift,
  copyWeek,
  confirmCopyWeek,
  bulkAssignShifts,
  hasTimeOffConflict,
  hasLocationConflict,
  getHoursForPeriod,
  fetchTemplates,
  insertTemplate,
  updateTemplate,
  deleteTemplate,
  seedDefaultTemplates,
} = require("../../services/scheduleService");
const {
  sanitizeScheduleInput,
  sanitizeTemplateInput,
} = require("../../utils/sanitizeScheduleInput");

// GET /api/admin/schedule?week=2026-03-30&locationId=xxx
async function getWeekSchedule(req, res) {
  try {
    const { week, locationId } = req.query;
    if (!week) return res.status(400).json({ msg: "week query param required" });

    const schedules = await fetchWeekSchedule(week, locationId);
    res.json(schedules);
  } catch (err) {
    console.error("Failed to fetch week schedule", err);
    res.status(500).json({ msg: "Failed to fetch week schedule" });
  }
}

// POST /api/admin/schedule
async function createShift(req, res) {
  try {
    const sanitized = sanitizeScheduleInput(req.body);

    if (!sanitized.staffId || !sanitized.locationId || !sanitized.date || !sanitized.startTime || !sanitized.endTime) {
      return res.status(400).json({ msg: "staffId, locationId, date, startTime, and endTime are required" });
    }

    if (!ObjectId.isValid(sanitized.staffId) || !ObjectId.isValid(sanitized.locationId)) {
      return res.status(400).json({ msg: "Invalid staffId or locationId" });
    }

    const ptoConflict = await hasTimeOffConflict(sanitized.staffId, sanitized.date);
    if (ptoConflict) {
      return res.status(409).json({ msg: "Employee has approved time off on this date" });
    }

    const locConflict = await hasLocationConflict(
      sanitized.staffId, sanitized.date, sanitized.startTime, sanitized.endTime, sanitized.locationId
    );
    if (locConflict) {
      return res.status(409).json({ msg: locConflict.msg });
    }

    const shift = await insertShift(sanitized, req.user.id);
    res.status(201).json(shift);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ msg: "A shift for this employee at this time already exists" });
    }
    console.error("Failed to create shift", err);
    res.status(500).json({ msg: "Failed to create shift" });
  }
}

// PUT /api/admin/schedule/:id
async function editShift(req, res) {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ msg: "Invalid shift id" });

    const sanitized = sanitizeScheduleInput(req.body);

    if (sanitized.staffId && sanitized.date) {
      const ptoConflict = await hasTimeOffConflict(sanitized.staffId, sanitized.date);
      if (ptoConflict) {
        return res.status(409).json({ msg: "Employee has approved time off on this date" });
      }
    }

    if (sanitized.staffId && sanitized.date && sanitized.startTime && sanitized.endTime && sanitized.locationId) {
      const locConflict = await hasLocationConflict(
        sanitized.staffId, sanitized.date, sanitized.startTime, sanitized.endTime,
        sanitized.locationId, id
      );
      if (locConflict) {
        return res.status(409).json({ msg: locConflict.msg });
      }
    }

    const updated = await updateShift(id, sanitized);

    if (!updated) return res.status(404).json({ msg: "Shift not found" });
    res.json(updated);
  } catch (err) {
    console.error("Failed to update shift", err);
    res.status(500).json({ msg: "Failed to update shift" });
  }
}

// DELETE /api/admin/schedule/:id
async function removeShift(req, res) {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ msg: "Invalid shift id" });

    const deleted = await deleteShift(id);
    if (!deleted) return res.status(404).json({ msg: "Shift not found" });
    res.json({ msg: "Shift deleted" });
  } catch (err) {
    console.error("Failed to delete shift", err);
    res.status(500).json({ msg: "Failed to delete shift" });
  }
}

// POST /api/admin/schedule/copy-week
async function copyWeekHandler(req, res) {
  try {
    const { sourceWeek, targetWeek, publish } = req.body;
    if (!sourceWeek || !targetWeek) {
      return res.status(400).json({ msg: "sourceWeek and targetWeek are required" });
    }

    if (publish) {
      const result = await confirmCopyWeek(sourceWeek, targetWeek, req.user.id);
      return res.json(result);
    }

    const preview = await copyWeek(sourceWeek, targetWeek);
    res.json(preview);
  } catch (err) {
    console.error("Failed to copy week", err);
    res.status(500).json({ msg: "Failed to copy week" });
  }
}

// POST /api/admin/schedule/bulk
async function bulkAssign(req, res) {
  try {
    const { staffIds, templateId, locationId, dates } = req.body;

    if (!Array.isArray(staffIds) || staffIds.length === 0) {
      return res.status(400).json({ msg: "staffIds array is required" });
    }
    if (!templateId || !ObjectId.isValid(templateId)) {
      return res.status(400).json({ msg: "Valid templateId is required" });
    }
    if (!locationId || !ObjectId.isValid(locationId)) {
      return res.status(400).json({ msg: "Valid locationId is required" });
    }
    if (!Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({ msg: "dates array is required" });
    }

    const result = await bulkAssignShifts(staffIds, templateId, locationId, dates, req.user.id);
    res.status(201).json(result);
  } catch (err) {
    console.error("Failed to bulk assign shifts", err);
    res.status(500).json({ msg: "Failed to bulk assign shifts" });
  }
}

// GET /api/admin/schedule/location-conflicts?staffId=&date=&startTime=&endTime=&locationId=&excludeId=
async function checkLocationConflictsHandler(req, res) {
  try {
    const { staffId, date, startTime, endTime, locationId, excludeId } = req.query;
    if (!staffId || !date || !startTime || !endTime || !locationId) {
      return res.status(400).json({ msg: "staffId, date, startTime, endTime, and locationId are required" });
    }
    if (!ObjectId.isValid(staffId) || !ObjectId.isValid(locationId)) {
      return res.status(400).json({ msg: "Invalid staffId or locationId" });
    }

    const conflict = await hasLocationConflict(staffId, new Date(date), startTime, endTime, locationId, excludeId || null);
    res.json({ conflict: !!conflict, detail: conflict || null });
  } catch (err) {
    console.error("Failed to check location conflicts", err);
    res.status(500).json({ msg: "Failed to check location conflicts" });
  }
}

// GET /api/admin/schedule/conflicts?staffId=xxx&date=2026-03-30
async function checkConflicts(req, res) {
  try {
    const { staffId, date } = req.query;
    if (!staffId || !date) return res.status(400).json({ msg: "staffId and date are required" });
    if (!ObjectId.isValid(staffId)) return res.status(400).json({ msg: "Invalid staffId" });

    const conflict = await hasTimeOffConflict(staffId, new Date(date));
    res.json({ conflict: !!conflict, detail: conflict || null });
  } catch (err) {
    console.error("Failed to check conflicts", err);
    res.status(500).json({ msg: "Failed to check conflicts" });
  }
}

// GET /api/admin/schedule/hours?staffId=xxx&start=...&end=...
async function getHours(req, res) {
  try {
    const { staffId, start, end } = req.query;
    if (!staffId || !start || !end) return res.status(400).json({ msg: "staffId, start, and end are required" });
    if (!ObjectId.isValid(staffId)) return res.status(400).json({ msg: "Invalid staffId" });

    const result = await getHoursForPeriod(staffId, start, end);
    res.json(result);
  } catch (err) {
    console.error("Failed to get hours", err);
    res.status(500).json({ msg: "Failed to get hours" });
  }
}

// POST /api/admin/schedule/templates/restore-defaults
async function restoreDefaultTemplates(req, res) {
  try {
    await seedDefaultTemplates({ force: true });
    const templates = await fetchTemplates();
    res.json(templates);
  } catch (err) {
    console.error("Failed to restore default templates", err);
    res.status(500).json({ msg: "Failed to restore default templates" });
  }
}

// GET /api/admin/schedule/templates
async function getTemplates(req, res) {
  try {
    const templates = await fetchTemplates();
    res.json(templates);
  } catch (err) {
    console.error("Failed to fetch templates", err);
    res.status(500).json({ msg: "Failed to fetch templates" });
  }
}

// POST /api/admin/schedule/templates
async function createTemplate(req, res) {
  try {
    const sanitized = sanitizeTemplateInput(req.body);
    if (!sanitized.name || !sanitized.startTime || !sanitized.endTime) {
      return res.status(400).json({ msg: "name, startTime, and endTime are required" });
    }

    const template = await insertTemplate(sanitized, req.user.id);
    res.status(201).json(template);
  } catch (err) {
    console.error("Failed to create template", err);
    res.status(500).json({ msg: "Failed to create template" });
  }
}

// PUT /api/admin/schedule/templates/:id
async function editTemplate(req, res) {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ msg: "Invalid template id" });

    const sanitized = sanitizeTemplateInput(req.body);
    const updated = await updateTemplate(id, sanitized);
    if (!updated) return res.status(404).json({ msg: "Template not found" });
    res.json(updated);
  } catch (err) {
    console.error("Failed to update template", err);
    res.status(500).json({ msg: "Failed to update template" });
  }
}

// DELETE /api/admin/schedule/templates/:id
async function removeTemplate(req, res) {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ msg: "Invalid template id" });

    const deleted = await deleteTemplate(id);
    if (!deleted) return res.status(404).json({ msg: "Template not found" });
    res.json({ msg: "Template deleted" });
  } catch (err) {
    console.error("Failed to delete template", err);
    res.status(500).json({ msg: "Failed to delete template" });
  }
}

module.exports = {
  getWeekSchedule,
  createShift,
  editShift,
  removeShift,
  copyWeekHandler,
  bulkAssign,
  checkConflicts,
  checkLocationConflictsHandler,
  getHours,
  getTemplates,
  createTemplate,
  editTemplate,
  removeTemplate,
  restoreDefaultTemplates,
};

function normalizeSchedule(doc) {
  if (!doc) return null;
  return {
    id: doc._id?.toString() ?? null,
    staffId: doc.staffId?.toString() ?? null,
    locationId: doc.locationId?.toString() ?? null,
    date: doc.date instanceof Date ? doc.date.toISOString().split("T")[0] : doc.date,
    startTime: doc.startTime,
    endTime: doc.endTime,
    shiftLabel: doc.shiftLabel ?? "custom",
    status: doc.status ?? "scheduled",
    notes: doc.notes ?? "",
    scheduledHours: doc.scheduledHours ?? null,
    templateId: doc.templateId?.toString() ?? null,
    createdAt: doc.createdAt ?? null,
    updatedAt: doc.updatedAt ?? null,
  };
}

function normalizeScheduleWithEmployee(doc, employee) {
  const base = normalizeSchedule(doc);
  if (!base) return null;
  return {
    ...base,
    employee: employee
      ? {
          id: employee._id.toString(),
          name: `${employee.firstName} ${employee.lastName}`,
          role: employee.role ?? null,
        }
      : null,
  };
}

function normalizeTemplate(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    name: doc.name,
    startTime: doc.startTime,
    endTime: doc.endTime,
    shiftLabel: doc.shiftLabel ?? "custom",
    scheduledHours: doc.scheduledHours ?? null,
    createdAt: doc.createdAt ?? null,
  };
}

module.exports = { normalizeSchedule, normalizeScheduleWithEmployee, normalizeTemplate };

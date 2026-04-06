function sanitizeScheduleInput(body) {
  const sanitized = {};

  if (body.staffId) sanitized.staffId = body.staffId.toString().trim();
  if (body.locationId) sanitized.locationId = body.locationId.toString().trim();
  if (body.date) sanitized.date = new Date(body.date);

  if (typeof body.startTime === "string") {
    sanitized.startTime = body.startTime.trim();
  }
  if (typeof body.endTime === "string") {
    sanitized.endTime = body.endTime.trim();
  }

  const validLabels = ["full", "early", "half", "custom"];
  if (typeof body.shiftLabel === "string") {
    const label = body.shiftLabel.trim().toLowerCase();
    sanitized.shiftLabel = validLabels.includes(label) ? label : "custom";
  }

  const validStatuses = ["scheduled", "completed", "missed", "cancelled"];
  if (typeof body.status === "string") {
    const s = body.status.trim().toLowerCase();
    sanitized.status = validStatuses.includes(s) ? s : "scheduled";
  } else {
    sanitized.status = "scheduled";
  }

  sanitized.notes = typeof body.notes === "string" ? body.notes.trim() : "";

  if (sanitized.startTime && sanitized.endTime) {
    const [sh, sm] = sanitized.startTime.split(":").map(Number);
    const [eh, em] = sanitized.endTime.split(":").map(Number);
    sanitized.scheduledHours = ((eh * 60 + em) - (sh * 60 + sm)) / 60;
  }

  if (body.templateId) sanitized.templateId = body.templateId.toString().trim();
  if (body.notes !== undefined) sanitized.notes = typeof body.notes === "string" ? body.notes.trim() : "";

  return sanitized;
}

function sanitizeTemplateInput(body) {
  const sanitized = {};

  if (typeof body.name === "string") sanitized.name = body.name.trim();

  if (typeof body.startTime === "string") sanitized.startTime = body.startTime.trim();
  if (typeof body.endTime === "string") sanitized.endTime = body.endTime.trim();

  const validLabels = ["full", "early", "half", "custom"];
  if (typeof body.shiftLabel === "string") {
    const label = body.shiftLabel.trim().toLowerCase();
    sanitized.shiftLabel = validLabels.includes(label) ? label : "custom";
  }

  if (sanitized.startTime && sanitized.endTime) {
    const [sh, sm] = sanitized.startTime.split(":").map(Number);
    const [eh, em] = sanitized.endTime.split(":").map(Number);
    sanitized.scheduledHours = ((eh * 60 + em) - (sh * 60 + sm)) / 60;
  }

  return sanitized;
}

module.exports = { sanitizeScheduleInput, sanitizeTemplateInput };

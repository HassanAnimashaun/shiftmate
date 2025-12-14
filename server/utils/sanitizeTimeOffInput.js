function sanitizeTimeOffInput(body, { isAdmin = false } = {}) {
  const sanitized = {};

  const allowedTypes = ["vacation", "sick", "personal", "emergency"];

  if (typeof body.type === "string") {
    const trimmed = body.type.trim().toLowerCase();
    sanitized.type = allowedTypes.includes(trimmed) ? trimmed : "other";
  }

  if (body.startDate) sanitized.startDate = new Date(body.startDate);
  if (body.endDate) sanitized.endDate = new Date(body.endDate);

  sanitized.reason = typeof body.reason === "string" ? body.reason.trim() : "";

  if (isAdmin && typeof body.status === "string") {
    const allowedStatuses = ["pending", "approved", "denied"];
    sanitized.status = allowedStatuses.includes(body.status)
      ? body.status
      : "pending";
  } else {
    sanitized.status = "pending";
  }

  return sanitized;
}

module.exports = { sanitizeTimeOffInput };

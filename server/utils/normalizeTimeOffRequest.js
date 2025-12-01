function normalizeTimeOffRequest(req) {
  if (!req) return null;

  return {
    id: req._id?.toString() ?? "",
    staffId: req.staffId?.toString?.() ?? "",
    type: req.type ?? "",
    startDate: req.startDate ?? "",
    endDate: req.endDate ?? "",
    reason: req.reason ?? "",
    status: req.status ?? "pending",
    createdAt: req.createdAt ?? "",
    updatedAt: req.updatedAt ?? "",
  };
}
module.exports = { normalizeTimeOffRequest };

const {
  insertTimeOffRequest,
  findRequestsByStaffId,
  findStaffById,
} = require("../../services/timeOffService");
const { sanitizeTimeOffInput } = require("../../utils/sanitizeTimeOffInput");

async function createTimeOffRequest(req, res) {
  try {
    const sanitized = sanitizeTimeOffInput(req.body);

    const saved = await insertTimeOffRequest(req.user.id, sanitized);

    res.status(201).json(saved);
  } catch (err) {
    console.log("Failed to submit time-off request", err);
    res.status(500).json({ msg: "failed to submit time-off request" });
  }
}

async function getMyTimeOffRequests(req, res) {
  try {
    const staff = await findStaffById(req.user.id);
    if (!staff) {
      return res.status(404).json({ msg: "employee not found" });
    }

    const requests = await findRequestsByStaffId(req.user.id);

    return res.json({ requests });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
}

module.exports = {
  createTimeOffRequest,
  getMyTimeOffRequests,
};

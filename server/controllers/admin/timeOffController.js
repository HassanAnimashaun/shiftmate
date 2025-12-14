const { ObjectId } = require("mongodb");

const {
  fetchPendingRequests,
  countPendingRequests,
  updateRequestStatus,
} = require("../../services/timeOffService");

async function getPendingTimeOffRequests(_req, res) {
  try {
    const combined = await fetchPendingRequests();
    res.json(combined);
  } catch (err) {
    console.error("Failed to fetch time off requests", err);
    res.status(500).json({ msg: "Failed to fetch time off requests" });
  }
}

async function getPendingTimeOffCount(_req, res) {
  try {
    const countRequest = await countPendingRequests();
    res.status(200).json({ countRequest });
  } catch (err) {
    console.error("Failed to fetch request", err);
    res.status(500).json({ msg: "Failed to fetch request" });
  }
}

async function changeTimeOffStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid request id" });
    }

    const valid = ["approved", "pending", "denied"];

    if (!valid.includes(status)) {
      return res.status(400).json({ msg: "Invalid status update" });
    }

    const result = await updateRequestStatus(id, status);

    if (!result.value) {
      return res.status(200).json({ msg: "Status already set" });
    }

    return res.json({ msg: "Status updated", request: result.value });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
}

module.exports = {
  getPendingTimeOffRequests,
  getPendingTimeOffCount,
  changeTimeOffStatus,
};

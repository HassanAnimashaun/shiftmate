const express = require("express");
const { ObjectId } = require("mongodb");

const { connectDB } = require("../../db");
const verifyToken = require("../../middleware/authMiddleware");
const requireRole = require("../../middleware/roleMiddleware");
const {
  normalizeTimeOffRequest,
} = require("../../utils/normalizeTimeOffRequest.js");
const {
  normalizeEmployeeForTimeOff,
} = require("../../utils/normalizeEmployeeForTimeOff.js");
const {
  normalizeTimeOffWithEmployee,
} = require("../../utils/normalizeTimeOffWithEmployee.js");

// Placeholder admin routes for handling time-off requests (approve/deny/list/etc.).
const router = express.Router();

// GET /api/admin/staff — fetch all time off request
router.get("/", verifyToken, requireRole, async (req, res) => {
  try {
    const db = await connectDB();
    const requests = await db.collection("timeOffRequests").find().toArray();

    if (requests.length === 0) return res.status(200).json([]);

    const staffIds = [...new Set(requests.map((r) => r.staffId))].map(
      (id) => new ObjectId(id)
    );

    const staff = await db.collection(staff).find({ _id: { $in: staffIds } });

    const combined = requests.map((req) => {
      const employee = staff.find(
        (s) => s._id.toString() === req.staffId.toString()
      );

      return normalizeTimeOffWithEmployee;
    });

    res.json(combined);
  } catch (err) {
    console.error("Failed to fetch time off requests", err);
    res.status(500).json({ msg: "Failed to fetch time off requests" });
  }
});

module.exports = router;

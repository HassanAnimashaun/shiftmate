const express = require("express");
const { ObjectId } = require("mongodb");

const { connectDB } = require("../../db");
const verifyToken = require("../../middleware/authMiddleware");
const requireRole = require("../../middleware/roleMiddleware");

const {
  normalizeTimeOffWithEmployee,
} = require("../../utils/normalizeTimeOffWithEmployee.js");

const { countTimeOffRequest } = require("../../utils/staff");

// Placeholder admin routes for handling time-off requests (approve/deny/list/etc.).
const router = express.Router();

// GET /api/admin/timeoff — fetch all time off request
router.get("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const db = await connectDB();

    const requests = await db.collection("timeOffRequests").find().toArray();
    if (requests.length === 0) return res.status(200).json([]);

    const staffIds = [...new Set(requests.map((r) => r.staffId))].map(
      (id) => new ObjectId(id)
    );

    const staff = await db
      .collection("staff")
      .find({ _id: { $in: staffIds } })
      .toArray();

    const staffById = new Map(staff.map((s) => [s._id.toString(), s]));

    const combined = requests.map((req) =>
      normalizeTimeOffWithEmployee(
        req,
        staffById.get(req.staffId?.toString() ?? String(req.staffId || ""))
      )
    );

    res.json(combined);
  } catch (err) {
    console.error("Failed to fetch time off requests", err);
    res.status(500).json({ msg: "Failed to fetch time off requests" });
  }
});

// GET /api/admin/timeoff/count — count total number of pending requests
router.get("/count", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const db = await connectDB();

    const countRequest = await countTimeOffRequest(db);
    res.status(200).json({ countRequest });
  } catch (err) {
    console.error("Failed to fetch request", err);
    res.status(500).json({ msg: "Failed to fetch request" });
  }
});

module.exports = router;

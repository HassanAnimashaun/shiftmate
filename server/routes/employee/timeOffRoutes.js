const express = require("express");
const { ObjectId } = require("mongodb");

const { connectDB } = require("../../db");
const verifyToken = require("../../middleware/authMiddleware");
const requireRole = require("../../middleware/roleMiddleware");
const { sanitizeTimeOffInput } = require("../../utils/sanitizeTimeOffInput");
const {
  normalizeTimeOffRequest,
} = require("../../utils/normalizeTimeOffRequest");
// Placeholder admin routes for handling time-off requests (approve/deny/list/etc.).
const router = express.Router();

// POST /api/employee/timeoff — creates time off request
router.post("/", verifyToken, async (req, res) => {
  try {
    const db = await connectDB();

    const sanitized = sanitizeTimeOffInput(req.body);

    const newRequest = {
      ...sanitized,
      staffId: new ObjectId(req.user.id),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("timeOffRequests").insertOne(newRequest);

    const saved = await db
      .collection("timeOffRequests")
      .findOne({ _id: result.insertedId });

    res.status(201).json(normalizeTimeOffRequest(saved));
  } catch (err) {
    console.log("Failed to submit time-off request", err);
    res.status(500).json({ msg: "failed to submit time-off request" });
  }
});

// GET /api/employee/myRequest — grabs current employees request and status
router.get("/my-request", verifyToken, async (req, res) => {
  try {
    const db = await connectDB();

    const staff = await db
      .collection("staff")
      .findOne({ _id: new ObjectId(req.user.id) });
    if (!staff) {
      return res.status(404).json({ msg: "employee not found" });
    }

    const requests = await db
      .collection("timeOffRequests")
      .find({ staffId: new ObjectId(req.user.id) })
      .sort({ createdAt: -1 })
      .toArray();

    return res.json({ requests });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
});
module.exports = router;

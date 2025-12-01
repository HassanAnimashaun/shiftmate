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

module.exports = router;

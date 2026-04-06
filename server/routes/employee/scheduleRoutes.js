const express = require("express");
const verifyToken = require("../../middleware/authMiddleware");
const { getMySchedule } = require("../../controllers/employee/scheduleController");

const router = express.Router();

// GET /api/employee/schedule?week=2026-03-30
router.get("/", verifyToken, getMySchedule);

module.exports = router;

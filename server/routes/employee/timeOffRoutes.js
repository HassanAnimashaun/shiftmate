const express = require("express");
const verifyToken = require("../../middleware/authMiddleware");
const requireRole = require("../../middleware/roleMiddleware");
const {
  createTimeOffRequest,
  getMyTimeOffRequests,
} = require("../../controllers/employee/timeOffController");
// Placeholder admin routes for handling time-off requests (approve/deny/list/etc.).
const router = express.Router();

// POST /api/employee/timeoff — creates time off request
router.post("/", verifyToken, createTimeOffRequest);

// GET /api/employee/myRequest — grabs current employees request and status
router.get("/my-request", verifyToken, getMyTimeOffRequests);
module.exports = router;

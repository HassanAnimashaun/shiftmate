const express = require("express");
const verifyToken = require("../../middleware/authMiddleware");
const requireRole = require("../../middleware/roleMiddleware");
const {
  getPendingTimeOffRequests,
  getPendingTimeOffCount,
  changeTimeOffStatus,
} = require("../../controllers/admin/timeOffController");

// Placeholder admin routes for handling time-off requests (approve/deny/list/etc.).
const router = express.Router();

// GET /api/admin/timeoff — fetch all time off request
router.get(
  "/",
  verifyToken,
  requireRole("admin"),
  getPendingTimeOffRequests
);

// GET /api/admin/timeoff/count — count total number of pending requests
router.get("/count", verifyToken, requireRole("admin"), getPendingTimeOffCount);

// PATCH /api/admin/timeoff/:id/status - changes status of time off request
router.patch(
  "/:id/status",
  verifyToken,
  requireRole("admin"),
  changeTimeOffStatus
);

module.exports = router;

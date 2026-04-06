const express = require("express");
const verifyToken = require("../../middleware/authMiddleware");
const requireRole = require("../../middleware/roleMiddleware");
const {
  getWeekSchedule,
  createShift,
  editShift,
  removeShift,
  copyWeekHandler,
  bulkAssign,
  checkConflicts,
  checkLocationConflictsHandler,
  getHours,
  getTemplates,
  createTemplate,
  editTemplate,
  removeTemplate,
  restoreDefaultTemplates,
} = require("../../controllers/admin/scheduleController");

const router = express.Router();

// All routes require admin auth
router.use(verifyToken, requireRole("admin"));

// Schedules CRUD
router.get("/", getWeekSchedule);
router.post("/", createShift);
router.put("/:id", editShift);
router.delete("/:id", removeShift);

// Bulk operations
router.post("/copy-week", copyWeekHandler);
router.post("/bulk", bulkAssign);

// Conflict checks
router.get("/conflicts", checkConflicts);
router.get("/location-conflicts", checkLocationConflictsHandler);

// Payroll / hours
router.get("/hours", getHours);

// Shift templates
router.get("/templates", getTemplates);
router.post("/templates/restore-defaults", restoreDefaultTemplates);
router.post("/templates", createTemplate);
router.put("/templates/:id", editTemplate);
router.delete("/templates/:id", removeTemplate);

module.exports = router;

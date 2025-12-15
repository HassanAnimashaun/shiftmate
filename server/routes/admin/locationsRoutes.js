const express = require("express");
const { getAllLocations } = require("../../controllers/admin/locationsController.js");
const verifyToken = require("../../middleware/authMiddleware");
const requireRole = require("../../middleware/roleMiddleware");

const router = express.Router();

router.get("/", verifyToken, requireRole("admin"), getAllLocations);

module.exports = router;

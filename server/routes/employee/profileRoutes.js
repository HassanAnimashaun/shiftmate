const express = require("express");
const { ObjectId } = require("mongodb");

const { connectDB } = require("../../db");
const verifyToken = require("../../middleware/authMiddleware");
const { sanitizeStaffMember } = require("../../utils/staff");

const router = express.Router();

router.use(verifyToken);

// GET /api/employee/me — fetch the currently authenticated user
router.get("/me", async (req, res) => {
  try {
    const db = await connectDB();
    const user = await db
      .collection("staff")
      .findOne(
        { _id: new ObjectId(req.user.id) },
        { projection: { password: 0 } }
      );

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({ user: sanitizeStaffMember(user) });
  } catch (err) {
    console.error("Failed to fetch current user", err);
    res.status(401).json({ msg: "Invalid token" });
  }
});

module.exports = router;

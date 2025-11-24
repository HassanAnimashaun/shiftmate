const express = require("express");
const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");

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

// POST /api/employee/new-password — change current user's password
router.post("/new-password", async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};

  if (!newPassword) {
    return res.status(400).json({ msg: "New password is required" });
  }

  try {
    const db = await connectDB();
    const user = await db
      .collection("staff")
      .findOne({ _id: new ObjectId(req.user.id) });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const mustVerifyCurrentPassword =
      !user.mustChangePassword || Boolean(currentPassword);

    if (mustVerifyCurrentPassword) {
      if (!currentPassword) {
        return res.status(401).json({ msg: "Current password is required" });
      }

      const ok = await bcrypt.compare(currentPassword, user.password);
      if (!ok) {
        return res.status(401).json({ msg: "Current password is incorrect" });
      }
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await db.collection("staff").updateOne(
      { _id: new ObjectId(req.user.id) },
      {
        $set: {
          password: hashed,
          mustChangePassword: false,
          updatedAt: new Date(),
        },
        // Remove any temporary secrets once the user sets a real password
        $unset: {
          tempOtp: "",
          tempPassword: "",
        },
      }
    );

    res.status(200).json({ msg: "Password updated" });
  } catch (err) {
    console.error("Failed to change password", err);
    res.status(500).json({ msg: "Failed to change password" });
  }
});

module.exports = router;

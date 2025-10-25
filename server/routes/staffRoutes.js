const express = require("express");
const router = express.Router();
const { connectDB } = require("../db");
const verifyToken = require("../middleware/authMiddleware");

// GET /api/staff — fetch all staff members
router.get("/", verifyToken, async (req, res) => {
  try {
    const db = await connectDB();
    const staffList = await db.collection("staff").find({}).toArray();
    res.status(200).json(staffList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch staff" });
  }
});

// GET /api/staff/me — fetch the currently authenticated user
router.get("/me", async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ msg: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const db = await connectDB();
    const user = await db.collection("staff").findOne(
      { _id: new ObjectId(decoded.id) },
      { projection: { password: 0 } } // exclude sensitive fields
    );

    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json({ user });
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
});
module.exports = router;

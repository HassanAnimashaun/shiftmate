const express = require("express");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
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

// DELETE /api/delete/staff - delete selected user
router.delete("/delete/staff/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid staff ID" });
    }

    const result = await db
      .collection("staff")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ msg: "Not found" });
    }

    res.status(200).json({ msg: "Staff member deleted successfully" });
  } catch (err) {
    console.log("Failed to delete staff: ", err);
    res.status(500).json({ msg: "Server error while deleting staff" });
  }
});
module.exports = router;

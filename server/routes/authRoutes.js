require("dotenv").config();

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { connectDB } = require("../db");
const JWT = require("jsonwebtoken");
const verifyToken = require("../middleware/authMiddleware");

// Login Route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: "Username and password required" });
  }

  try {
    const db = await connectDB();
    const user = await db.collection("staff").findOne({ username });

    if (!user) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    // Create JWT token
    const token = JWT.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT.SECERET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      msg: "Login successful",
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/me", verifyToken, (req, res) => {
  res.status(200).json({ user: req.user });
});

module.exports = router;

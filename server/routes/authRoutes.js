require("dotenv").config();

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { connectDB } = require("../db");
const JWT = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const verifyToken = require("../middleware/authMiddleware");

const ONE_HOUR_IN_MS = 60 * 60 * 1000;
const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

if (!JWT_SECRET) {
  console.warn("JWT_SECRET environment variable is not defined.");
}

function buildUserResponse(user) {
  const fallbackNameParts = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ");

  const employmentType =
    user.employmentType || (user.role === "admin" ? "admin" : null);
  const role = employmentType === "admin" ? "admin" : user.role;

  return {
    id: user._id.toString(),
    username: user.username,
    role,
    employmentType,
    name: user.name || fallbackNameParts || user.username,
    mustChangePassword: Boolean(user.mustChangePassword),
  };
}

// Login Route
router.post("/login", async (req, res) => {
  const rawUsername = req.body?.username || "";
  const password = req.body?.password;

  if (!rawUsername || !password) {
    return res.status(400).json({ msg: "Username and password required" });
  }

  const loginId = rawUsername.trim();

  try {
    const db = await connectDB();
    const user = await db.collection("staff").findOne({
      $or: [{ username: loginId }, { email: loginId }],
    });

    if (!user) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const provided = String(password);

    let isMatch = false;
    if (user.password) {
      isMatch = await bcrypt.compare(provided, user.password);
    }

    // Accept the plain temp OTP/password as a fallback (for freshly created accounts)
    const matchesTempSecret =
      !isMatch &&
      (provided === user.tempOtp || provided === user.tempPassword);

    if (!isMatch && matchesTempSecret) {
      // Re-hash and persist so subsequent logins use the hashed value
      const hashed = await bcrypt.hash(provided, 10);
      await db
        .collection("staff")
        .updateOne({ _id: user._id }, { $set: { password: hashed } });
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    if (!JWT_SECRET) {
      return res
        .status(500)
        .json({ msg: "Authentication service misconfigured" });
    }

    const userPayload = buildUserResponse(user);

    // Create JWT token
    const token = JWT.sign(userPayload, JWT_SECRET, { expiresIn: "1h" });

    res
      .cookie("token", token, {
        ...COOKIE_OPTIONS,
        maxAge: ONE_HOUR_IN_MS,
      })
      .status(200)
      .json({
        msg: "Login successful",
        user: userPayload,
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/me", verifyToken, async (req, res) => {
  try {
    const db = await connectDB();
    const user = await db.collection("staff").findOne(
      { _id: new ObjectId(req.user.id) },
      {
        projection: { password: 0 },
      }
    );

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({ user: buildUserResponse(user) });
  } catch (err) {
    console.error("Failed to fetch current user", err);
    res.status(500).json({ msg: "Failed to fetch user profile" });
  }
});

router.post("/logout", (req, res) => {
  res
    .clearCookie("token", COOKIE_OPTIONS)
    .status(200)
    .json({ msg: "Logout successful" });
});

module.exports = router;

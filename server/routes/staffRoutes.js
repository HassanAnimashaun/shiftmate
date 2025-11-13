const express = require("express");
const crypto = require("crypto")
const { ObjectId } = require("mongodb");
const router = express.Router();
const { connectDB } = require("../db");
const verifyToken = require("../middleware/authMiddleware");
const bcrypt = require("bcrypt");

function sanitizeStaffMember(staffMember) {
  if (!staffMember) return null;

  const {
    _id,
    firstName = "",
    lastName = "",
    username = "",
    name = "",
    email = "",
    phone = "",
    position = "",
    employmentType = "",
    hourlyRate = null,
    role = "employee",
    createdAt,
    updatedAt,
  } = staffMember;

  const derivedName = (name || `${firstName} ${lastName}`.trim()).trim();

  return {
    id: _id?.toString(),
    name: derivedName || username,
    email,
    phone,
    position,
    employmentType,
    hourlyRate: hourlyRate === null ? null : Number(hourlyRate),
    role,
    username,
    createdAt,
    updatedAt,
  };
}

// GET /api/staff — fetch all staff members
router.get("/", verifyToken, async (req, res) => {
  try {
    const db = await connectDB();
    const staffList = await db
      .collection("staff")
      .find({}, { projection: { password: 0 } })
      .toArray();
    res.status(200).json(staffList.map(sanitizeStaffMember));
  } catch (err) {
    console.error("Failed to fetch staff", err);
    res.status(500).json({ msg: "Failed to fetch staff" });
  }
});

// GET /api/staff/count — count number of employees
router.get("/count", verifyToken, async (req, res) => {
  try {
    const db = await connectDB();
    const staffCollection = await db.collection("staff");

    const employeeCount = await staffCollection.countDocuments({
      role: "employee",
    });

    res.status(200).json({ employeeCount });
  } catch (err) {
    console.error("Failed to fetch staff", err);
    res.status(500).json({ msg: "Failed to fetch staff" });
  }
});
// GET /api/staff/me — fetch the currently authenticated user
router.get("/me", verifyToken, async (req, res) => {
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

    res.json({ user: sanitizeStaffMember(user) });
  } catch (err) {
    console.error("Failed to fetch current user", err);
    res.status(401).json({ msg: "Invalid token" });
  }
});

// POST /api/staff — add a new staff member
router.post("/", verifyToken, async (req, res) => {
  const { name, email, phone, position, employmentType, hourlyRate, role } =
    req.body ?? {};

  if (!name) {
    return res.status(400).json({ msg: "Name is required" });
  }

  const normalizedHourlyRate =
    hourlyRate === undefined || hourlyRate === null || hourlyRate === ""
      ? null
      : Number(hourlyRate);

  if (normalizedHourlyRate !== null && Number.isNaN(normalizedHourlyRate)) {
    return res.status(400).json({ msg: "Hourly rate must be a number" });
  }

  try {
    const db = await connectDB();
    const now = new Date();
    const result = await db.collection("staff").insertOne({
      name,
      email: email ?? "",
      phone: phone ?? "",
      position: position ?? "",
      employmentType: employmentType ?? "",
      hourlyRate: normalizedHourlyRate,
      role: role ?? "employee",
      createdAt: now,
      updatedAt: now,
    });

    const inserted = await db
      .collection("staff")
      .findOne({ _id: result.insertedId }, { projection: { password: 0 } });

    res.status(201).json(sanitizeStaffMember(inserted));
  } catch (err) {
    console.error("Failed to add staff", err);
    res.status(500).json({ msg: "Failed to add staff" });
  }
});

// PUT /api/staff/:id — update a staff member
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ msg: "Invalid staff ID" });
  }

  const allowedFields = [
    "name",
    "email",
    "phone",
    "position",
    "employmentType",
    "hourlyRate",
    "role",
  ];

  const updates = {};
  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      updates[field] =
        field === "hourlyRate" && req.body[field] !== null
          ? Number(req.body[field])
          : req.body[field];
    }
  }
  console.log("Updating staff ID:", id, "with data:", updates);

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ msg: "No valid fields provided for update" });
  }

  try {
    const db = await connectDB();
    const result = await db.collection("staff").findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after", projection: { password: 0 } }
    );

    if (!result.value) {
      return res.status(404).json({ msg: "Staff member not found" });
    }

    res.status(200).json(sanitizeStaffMember(result.value));
  } catch (err) {
    console.error(err);
    console.error("Failed to update staff", err);
    res.status(500).json({ msg: "Failed to update staff" });
  }
});

// DELETE /api/staff/:id — delete a staff member
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ msg: "Invalid staff ID" });
  }

  try {
    const db = await connectDB();
    const result = await db
      .collection("staff")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ msg: "Staff member not found" });
    }

    res.status(200).json({ msg: "Staff member deleted successfully" });
  } catch (err) {
    console.error("Failed to delete staff", err);
    res.status(500).json({ msg: "Server error while deleting staff" });
  }
});

// POST /api/onboard - creates new user profile and temporary OTP
router.post("/onboard", verifyToken, async (req, res) => {
  try {
    const { firstName, lastName, email, role = "employee" } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: "firstName, lastName and email are required" });
    }

    const db = await connectDB();
    const staffCollection = db.collection("staff");

    // Generate username
    const username = `${firstName}${lastName}`.toLowerCase().replace(/\s+/g, "");

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Hash OTP
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Insert to DB
    const newStaff = {
      firstName,
      lastName,
      email,
      username,
      password: hashedOtp,
      role,
      mustChangePassword: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await staffCollection.insertOne(newStaff);

    res.status(201).json({
      message: "Employee onboarded successfully",
      username,
      otp,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to onboard employee" });
  }
});

// POST /api/staff/new-password - updates OTP with new password
router.post("/new-password", verifyToken, async (req, res) => {
  const { username, newPassword } = req.body ?? {};

  if (!username || !newPassword) {
    return res.status(400).json({ msg: "Username and new password are required" });
  }

  try {
    const db = await connectDB();
    const staffCollection = db.collection("staff");
    const hashed = await bcrypt.hash(newPassword, 10);
    const result = await staffCollection.updateOne(
      { username },
      { $set: { password: hashed, mustChangePassword: false, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Failed to change password", err);
    res.status(500).json({ msg: "Failed to change password" });
  }
});

module.exports = router;

const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();
const { connectDB } = require("../db");
const verifyToken = require("../middleware/authMiddleware");

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

// GET /api/staff/me — fetch the currently authenticated user
router.get("/me", verifyToken, async (req, res) => {
  try {
    const db = await connectDB();
    const user = await db.collection("staff").findOne(
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
  const {
    name,
    email,
    phone,
    position,
    employmentType,
    hourlyRate,
    role,
  } = req.body ?? {};

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

module.exports = router;

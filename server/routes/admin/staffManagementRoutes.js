const express = require("express");
const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");

const { connectDB } = require("../../db");
const verifyToken = require("../../middleware/authMiddleware");
const requireRole = require("../../middleware/roleMiddleware");

// Util
const { sanitizeStaffMember, parseHourlyRate } = require("../../utils/staff");
const { splitName } = require("../../utils/splitName.js");
const { generateUsername } = require("../../utils/generateUsername.js");
const { generateOtp } = require("../../utils/generateOtp.js");

const router = express.Router();

router.use(verifyToken, requireRole("admin"));

// GET /api/admin/staff — fetch all staff members
router.get("/", async (req, res) => {
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

// GET /api/admin/staff/count — count number of employees
router.get("/count", async (req, res) => {
  try {
    const db = await connectDB();
    const employeeCount = await db
      .collection("staff")
      .countDocuments({ role: "employee" });

    res.status(200).json({ employeeCount });
  } catch (err) {
    console.error("Failed to fetch staff", err);
    res.status(500).json({ msg: "Failed to fetch staff" });
  }
});

// POST /api/admin/staff — add a new staff member
router.post("/", async (req, res) => {
  const { name, email, phone, position, employmentType, hourlyRate, role } =
    req.body ?? {};

  if (!name) {
    return res.status(400).json({ msg: "Name is required" });
  }

  const { value: normalizedHourlyRate, error: hourlyRateError } =
    parseHourlyRate(hourlyRate);

  if (hourlyRateError) {
    return res.status(400).json({ msg: hourlyRateError });
  }

  try {
    const db = await connectDB();
    const now = new Date();

    const { firstName, lastName } = splitName(name);
    const username = generateUsername(firstName, lastName);
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    const result = await db.collection("staff").insertOne({
      name,
      firstName,
      lastName,
      username,
      email: email ?? "",
      phone: phone ?? "",
      position: position ?? "",
      employmentType: employmentType ?? "",
      hourlyRate: normalizedHourlyRate,
      role: role ?? "employee",
      password: hashedOtp,
      mustChangePassword: true,
      createdAt: now,
      updatedAt: now,
    });

    const inserted = await db
      .collection("staff")
      .findOne({ _id: result.insertedId }, { projection: { password: 0 } });
    res.status(201).json({
      ...sanitizeStaffMember(inserted),
      username,
      tempPassword: otp,
      mustChangePassword: true,
    });
  } catch (err) {
    console.error("Failed to add staff", err);
    res.status(500).json({ msg: "Failed to add staff" });
  }
});

// PUT /api/admin/staff/:id — update a staff member
router.put("/:id", async (req, res) => {
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
      if (field === "hourlyRate") {
        const { value, error } = parseHourlyRate(req.body[field]);
        if (error) {
          return res.status(400).json({ msg: error });
        }
        updates[field] = value;
      } else {
        updates[field] = req.body[field];
      }
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

// DELETE /api/admin/staff/:id — delete a staff member
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ msg: "Invalid staff ID" });
  }

  try {
    const db = await connectDB();
    const result = await db.collection("staff").deleteOne({
      _id: new ObjectId(id),
    });

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

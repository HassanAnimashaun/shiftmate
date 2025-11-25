const express = require("express");
const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");

const { connectDB } = require("../../db");
const verifyToken = require("../../middleware/authMiddleware");
const requireRole = require("../../middleware/roleMiddleware");

// Util
const {
  sanitizeStaffMember,
  parseHourlyRate,
  countEmployeesByRole,
} = require("../../utils/staff");
const { splitName } = require("../../utils/splitName.js");
const { generateUsername } = require("../../utils/generateUsername.js");
const { generateOtp } = require("../../utils/generateOtp.js");

const router = express.Router();

router.use(verifyToken, requireRole("admin"));

// Normalize incoming staff payload so DB fields stay consistent.
function normalizeStaffPayload(body = {}, { isUpdate = false } = {}) {
  const normalized = {};

  const name = body.name?.toString().trim();
  const email = body.email?.toString().trim();
  const phone = body.phone?.toString().trim();
  const position = body.position?.toString().trim();

  const employmentRaw = body.employmentType;
  const normalizedEmploymentType = employmentRaw
    ? employmentRaw.toString().trim().toLowerCase()
    : undefined;

  const roleRaw = body.role;
  const normalizedRole = roleRaw ? roleRaw.toString().trim().toLowerCase() : undefined;

  const isAdmin =
    normalizedEmploymentType === "admin" || normalizedRole === "admin";

  const resolvedEmploymentType = normalizedEmploymentType ?? (isAdmin ? "admin" : "");
  const resolvedRole = isAdmin ? "admin" : "employee";

  const hourlyRateRaw = body.hourlyRate;
  const parsedHourly =
    hourlyRateRaw === undefined || hourlyRateRaw === null || hourlyRateRaw === ""
      ? null
      : Number(hourlyRateRaw);

  const base = {
    name,
    email,
    phone,
    position,
    employmentType: resolvedEmploymentType,
    hourlyRate: parsedHourly,
    role: resolvedRole,
  };

  if (isUpdate) {
    for (const [key, value] of Object.entries(base)) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        normalized[key] = value;
      }
    }
  } else {
    Object.assign(normalized, base);
  }

  return normalized;
}

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
    const employeeCount = await countEmployeesByRole(db);

    res.status(200).json({ employeeCount });
  } catch (err) {
    console.error("Failed to fetch staff", err);
    res.status(500).json({ msg: "Failed to fetch staff" });
  }
});

// POST /api/admin/staff — add a new staff member
router.post("/", async (req, res) => {
  const {
    name,
    email,
    phone,
    position,
    employmentType,
    hourlyRate,
    role,
  } = normalizeStaffPayload(req.body ?? {});

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
    const otp = generateOtp(); // plain OTP to share with employee
    const hashedOtp = await bcrypt.hash(otp, 10); // stored securely for login validation

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
      tempOtp: otp, // persisted so admin can reference it
      tempPassword: otp,
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
      tempOtp: otp,
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

  const updates = normalizeStaffPayload(req.body ?? {}, { isUpdate: true });
  if (updates.hourlyRate !== undefined) {
    const { value, error } = parseHourlyRate(updates.hourlyRate);
    if (error) {
      return res.status(400).json({ msg: error });
    }
    updates.hourlyRate = value;
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

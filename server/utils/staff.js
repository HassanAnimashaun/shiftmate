function sanitizeStaffMember(staffMember = {}) {
  if (!staffMember) {
    return null;
  }

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
    mustChangePassword = false,
    tempPassword,
    tempOtp,
    createdAt,
    updatedAt,
  } = staffMember;

  let normalizedEmploymentType = employmentType;
  if (normalizedEmploymentType) {
    normalizedEmploymentType = normalizedEmploymentType
      .toString()
      .trim()
      .toLowerCase();
  }

  const derivedName = (name || `${firstName} ${lastName}`.trim()).trim();

  return {
    id: _id?.toString(),
    name: derivedName || username,
    email,
    phone,
    position,
    employmentType: employmentType || null,
    hourlyRate: hourlyRate === null ? null : Number(hourlyRate),
    role,
    username,
    mustChangePassword,
    tempPassword,
    tempOtp,
    createdAt,
    updatedAt,
  };
}

function parseHourlyRate(value) {
  if (value === undefined || value === null || value === "") {
    return { value: null };
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return {
      error: "Hourly rate must be a number",
    };
  }

  return { value: numericValue };
}

async function countEmployeesByRole(db) {
  return db.collection("staff").countDocuments({ role: "employee" });
}

async function countTimeOffRequest(db) {
  return db.collection("timeOffRequests").countDocuments({ status: "pending" });
}

module.exports = {
  sanitizeStaffMember,
  parseHourlyRate,
  countEmployeesByRole,
  countTimeOffRequest,
};

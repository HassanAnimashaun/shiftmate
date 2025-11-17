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

module.exports = {
  sanitizeStaffMember,
  parseHourlyRate,
};

function normalizeEmployeeForTimeOff(emp) {
  if (!emp) return null;

  return {
    id: emp._id?.toString() ?? "",
    name: emp.name ?? "",
    username: emp.username ?? "",
    email: emp.email ?? "",
    phone: emp.phone ?? "",
    position: emp.position ?? "",
  };
}
module.exports = { normalizeEmployeeForTimeOff };

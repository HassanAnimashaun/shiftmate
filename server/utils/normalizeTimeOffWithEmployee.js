const {
  normalizeTimeOffRequest,
} = require("./normalizeTimeOffRequest.js");
const {
  normalizeEmployeeForTimeOff,
} = require("./normalizeEmployeeForTimeOff.js");

function normalizeTimeOffWithEmployee(request, employee) {
  return {
    ...normalizeTimeOffRequest(request),
    employee: normalizeEmployeeForTimeOff(employee),
  };
}

module.exports = { normalizeTimeOffWithEmployee };

import api from '../api.js';

// Placeholder for employee time-off related API calls.
const EmployeeTimeOffService = {
  // Employee submits a new time-off request (POST)
  submitTimeOff(data) {
    return api.post('/employee/timeoff', data);
  },
  // Get current Employees request (GET)
  getMyRequest() {
    return api.get('/employee/timeoff/my-request');
  },
};

export default EmployeeTimeOffService;

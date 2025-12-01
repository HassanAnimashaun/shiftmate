import api from '../api';

// Placeholder for employee time-off related API calls.
const EmployeeTimeOffService = {
  // Employee submits a new time-off request (POST)
  submitTimeOff(data) {
    return api.post('/employee/timeoff', data);
  },
};

export default EmployeeTimeOffService;

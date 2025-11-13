import api from './api';

const AdminService = {
  // Fetch all employees
  getAllStaff() {
    return api.get('/staff');
  },

  // Number of emplpoyees
  totalEmployees() {
    return api.get('/staff/count');
  },

  // Add new employee
  addStaff(data) {
    return api.post('/staff', data);
  },

  // Onboard a new employee with OTP credentials
  onboardStaff(data) {
    return api.post('/staff/onboard', data);
  },

  // Delete staff by ID
  deleteEmployee(id) {
    return api.delete(`/staff/${id}`);
  },

  // Update staff info
  updateStaff(id, data) {
    return api.put(`/staff/${id}`, data);
  },
};

export default AdminService;

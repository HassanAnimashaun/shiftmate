import api from './api';

const AdminService = {
  // Fetch all employees
  getAllStaff() {
    return api.get('/staff', { withCredentials: true });
  },

  // Add new employee
  addStaff(data) {
    return api.post('/staff', data, { withCredentials: true });
  },

  // Delete staff by ID
  deleteEmployee(id) {
    return api.delete(`/delete/staff/${id}`, { withCredentials: true });
  },

  // Update staff info
  updateStaff(id, data) {
    return api.put(`/staff/${id}`, data, { withCredentials: true });
  },
};

export default AdminService;

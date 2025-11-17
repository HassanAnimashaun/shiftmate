import api from './api';

const AdminService = {
  // Fetch all employees
  getAllStaff() {
    return api.get('/admin/staff');
  },

  // Number of emplpoyees
  totalEmployees() {
    return api.get('/admin/staff/count');
  },

  // Add new employee
  addStaff(data) {
    return api.post('/admin/staff', data);
  },

  // Delete staff by ID
  deleteEmployee(id) {
    return api.delete(`/admin/staff/${id}`);
  },

  // Update staff info
  updateStaff(id, data) {
    return api.put(`/admin/staff/${id}`, data);
  },
};

export default AdminService;

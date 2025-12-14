import api from '../api';
const AdminTimeOffService = {
  // Get all time off request
  getRequests() {
    return api.get('/admin/timeoff');
  },
  // Get pending time off request count
  getPendingCount() {
    return api.get('/admin/timeoff/count');
  },
  updateRequestStatus(id, status) {
    return api.patch(`/admin/timeoff/${id}/status`, { status });
  },
};

export default AdminTimeOffService;

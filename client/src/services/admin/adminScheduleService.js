import api from '../api';

const adminScheduleService = {
  // === LOCATIONS ===
  getAllLocations() {
    return api.get('/admin/location');
  },

  // === SCHEDULES ===
  getWeekSchedule(weekStart, locationId) {
    const params = { week: weekStart };
    if (locationId) params.locationId = locationId;
    return api.get('/admin/schedule', { params });
  },

  createShift(data) {
    return api.post('/admin/schedule', data);
  },

  updateShift(id, data) {
    return api.put(`/admin/schedule/${id}`, data);
  },

  deleteShift(id) {
    return api.delete(`/admin/schedule/${id}`);
  },

  copyWeek(sourceWeek, targetWeek, publish = false) {
    return api.post('/admin/schedule/copy-week', { sourceWeek, targetWeek, publish });
  },

  bulkAssign(data) {
    return api.post('/admin/schedule/bulk', data);
  },

  checkConflicts(staffId, date) {
    return api.get('/admin/schedule/conflicts', { params: { staffId, date } });
  },

  checkLocationConflicts(staffId, date, startTime, endTime, locationId, excludeId = null) {
    const params = { staffId, date, startTime, endTime, locationId };
    if (excludeId) params.excludeId = excludeId;
    return api.get('/admin/schedule/location-conflicts', { params });
  },

  getHoursSummary(staffId, start, end) {
    return api.get('/admin/schedule/hours', { params: { staffId, start, end } });
  },

  // === SHIFT TEMPLATES ===
  getTemplates() {
    return api.get('/admin/schedule/templates');
  },

  restoreDefaultTemplates() {
    return api.post('/admin/schedule/templates/restore-defaults');
  },

  createTemplate(data) {
    return api.post('/admin/schedule/templates', data);
  },

  updateTemplate(id, data) {
    return api.put(`/admin/schedule/templates/${id}`, data);
  },

  deleteTemplate(id) {
    return api.delete(`/admin/schedule/templates/${id}`);
  },
};

export default adminScheduleService;

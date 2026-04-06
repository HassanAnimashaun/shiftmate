import api from '../api';

const employeeScheduleService = {
  getMySchedule(weekStart) {
    return api.get('/employee/schedule', { params: { week: weekStart } });
  },
};

export default employeeScheduleService;

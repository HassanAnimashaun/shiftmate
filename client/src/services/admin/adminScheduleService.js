import api from '../api';

const adminScheduleSerice = {
  // Fetch all locations
  getAllLocations() {
    return api.get('/admin/location');
  },
};

export default adminScheduleSerice;

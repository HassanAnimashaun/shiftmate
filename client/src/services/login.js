import api from '/src/services/api';

export default {
  login(credentials) {
    return api.post('/auth/login', credentials);
  },
};

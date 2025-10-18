import api from '/src/services/api';

let currentUser = null;

async function login(credentials) {
  const response = await api.post('/auth/login', credentials);
  currentUser = response.data?.user ?? null;
  return response.data;
}

async function fetchCurrentUser() {
  try {
    const response = await api.get('/auth/me');
    currentUser = response.data?.user ?? null;
  } catch {
    currentUser = null;
  }
  return currentUser;
}

function getCurrentUser() {
  return currentUser;
}

async function logout() {
  await api.post('/auth/logout');
  currentUser = null;
}

export default {
  login,
  fetchCurrentUser,
  getCurrentUser,
  logout,
};

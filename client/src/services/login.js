let userCache = null;
let fetchPromise = null;
let loggedOut = false;

import api from '@/services/api';

async function login(credentials) {
  try {
    const res = await api.post('/auth/login', credentials, {
      withCredentials: true,
    });

    userCache = res.data?.user ?? null;
    loggedOut = false;
    return userCache;
  } catch (err) {
    userCache = null;
    console.error(err.msg);
  }
}

async function fetchCurrentUser() {
  if (userCache) return userCache;
  if (fetchPromise) return fetchPromise;

  fetchPromise = api
    .get('/auth/me', { withCredentials: true })
    .then(res => {
      if (loggedOut) return null;
      userCache = res.data?.user ?? null;
      fetchPromise = null;
      return userCache;
    })
    .catch(err => {
      if (!loggedOut && err.response?.status === 401) {
        userCache = null;
      }
      fetchPromise = null;
      return null;
    });

  return fetchPromise;
}

async function logout() {
  loggedOut = true;
  try {
    await api.post('/auth/logout', { withCredentials: true });
  } finally {
    userCache = null;
    fetchPromise = null;
  }
  return true;
}

export default {
  login,
  fetchCurrentUser,
  logout,
};

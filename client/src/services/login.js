import api from '/src/services/api';

async function login(credentials) {
  const response = await api.post('/auth/login', credentials);
  userCache = response.data?.user ?? null;
  return response.data;
}

async function fetchCurrentUser() {
  // Return cached user if available
  if (userCache) return userCache;

  // If a fetch is already in progress, return the same promise
  if (fetchPromise) return fetchPromise;

  fetchPromise = api
    .get('/auth/me')
    .then((res) => {
      userCache = res.data?.user ?? null;
      fetchPromise = null;
      return userCache;
    })
    .catch(() => {
      fetchPromise = null;
      userCache = null;
      return null;
    });

  return fetchPromise;
}

async function logout() {
  await api.post('/auth/logout');
  userCache = null;
  fetchPromise = null;
  return true;
}

export default {
  login,
  fetchCurrentUser,
  logout,
};

// Cache the current user in-memory for the session and coalesce concurrent /me requests
let userCache = null;
let fetchPromise = null;

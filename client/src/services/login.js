let userCache = null;
let fetchPromise = null;
let loggedOut = false;

async function fetchCurrentUser() {
  if (userCache) return userCache;
  if (fetchPromise) return fetchPromise;

  fetchPromise = api
    .get('/auth/me', { withCredentials: true })
    .then((res) => {
      if (loggedOut) return null; // Ignore response after logout
      userCache = res.data?.user ?? null;
      fetchPromise = null;
      return userCache;
    })
    .catch(() => {
      if (!loggedOut) {
        userCache = null;
      }
      fetchPromise = null;
      return null;
    });

  return fetchPromise;
}

async function logout() {
  loggedOut = true; // prevent stale overwrite
  try {
    await api.post('/auth/logout', {}, { withCredentials: true });
  } finally {
    userCache = null;
    fetchPromise = null;
  }
}

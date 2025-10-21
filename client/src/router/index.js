import { createWebHistory, createRouter } from 'vue-router';

import Login from '@/views/Login.vue';
import Dashboard from '@/views/admin/AdminDashboard.vue';
import authService from '@/services/login';

async function ensureCurrentUser() {
  const user = await authService.fetchCurrentUser();
  return user;
}

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'Login-page',
      component: Login,
      meta: { requiresGuest: true },
    },
    {
      path: '/dashboard',
      name: 'AdminDashboard-page',
      component: Dashboard,
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);

  if (!requiresAuth && !requiresGuest) {
    return next();
  }

  const user = await ensureCurrentUser();

  if (requiresAuth && !user) {
    return next('/login');
  }

  if (requiresGuest && user) {
    return next('/dashboard');
  }

  return next();
});
export default router;

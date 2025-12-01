import { createWebHistory, createRouter } from 'vue-router';

import Login from '@/views/Login.vue';
import SetPassword from '@/views/SetPassword.vue';
import authService from '@/services/auth/login';
import { adminRoutes } from './admin.routes';
import { employeeRoutes } from './employee.routes';

async function ensureCurrentUser() {
  const user = await authService.fetchCurrentUser();
  return user;
}

const getDefaultRoute = user => (user?.role === 'admin' ? '/admin' : '/employee');

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
    employeeRoutes,
    adminRoutes,
    {
      path: '/set-password',
      name: 'SetPassword',
      component: SetPassword,
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);
  const requiredEmploymentType = to.matched.find(record => record.meta?.requiresEmploymentType)
    ?.meta?.requiresEmploymentType;

  const user = await ensureCurrentUser();
  if (requiresAuth && !user) {
    return next('/login');
  }

  if (user?.mustChangePassword && to.name !== 'SetPassword') {
    return next('/set-password');
  }

  if (to.name === 'SetPassword' && user && !user.mustChangePassword) {
    return next(getDefaultRoute(user));
  }

  if (requiresGuest && user) {
    return next(getDefaultRoute(user));
  }

  if (
    requiredEmploymentType &&
    user &&
    !(
      user.employmentType === requiredEmploymentType ||
      user.role === requiredEmploymentType ||
      user.role === 'admin'
    )
  ) {
    return next(getDefaultRoute(user));
  }

  return next();
});
export default router;

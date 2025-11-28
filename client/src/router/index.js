import { createWebHistory, createRouter } from 'vue-router';

import Login from '@/views/Login.vue';
import AdminDashboardLayout from '@/views/admin/AdminDashboard.vue';
import EmployeesView from '@/components/admin/employees/EmployeesView.vue';
import DashboardViews from '@/components/admin/dashboard/DashboardView.vue';
import EmployeeDashboard from '@/views/employee/EmployeeDashboard.vue';
import SetPassword from '@/views/SetPassword.vue';
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
      path: '/employee',
      name: 'EmployeeDashboard-page',
      component: EmployeeDashboard,
      meta: { requiresAuth: true, requiresEmploymentType: 'employee' },
    },
    {
      path: '/admin',
      name: 'AdminDashboard-page',
      component: AdminDashboardLayout,
      children: [
        {
          path: '',
          redirect: { name: 'employees' },
        },
        {
          path: 'employees',
          name: 'employees',
          component: EmployeesView,
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: DashboardViews,
        },
      ],
      meta: { requiresAuth: true, requiresEmploymentType: 'admin' },
    },
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
    return next('/admin');
  }

  if (requiresGuest && user) {
    return next('/admin');
  }

  if (
    requiredEmploymentType &&
    user &&
    !(user.employmentType === requiredEmploymentType || user.role === 'admin')
  ) {
    // Send users to their own dashboard if they hit a restricted route
    return next('/employee');
  }

  return next();
});
export default router;

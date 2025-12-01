import AdminDashboardLayout from '@/views/admin/AdminDashboard.vue';
import EmployeesView from '@/components/admin/employees/EmployeesView.vue';
import DashboardViews from '@/components/admin/dashboard/DashboardView.vue';
import RequestTimeOff from '@/components/admin/request/RequestTimeOffView.vue';

export const adminRoutes = {
  path: '/admin',
  name: 'AdminDashboard-page',
  component: AdminDashboardLayout,
  children: [
    {
      path: '',
      redirect: { name: 'employees' },
    },
    {
      path: 'dashboard',
      name: 'dashboard',
      component: DashboardViews,
    },
    {
      path: 'employees',
      name: 'employees',
      component: EmployeesView,
    },
    {
      path: 'request',
      name: 'request',
      component: RequestTimeOff,
    },
  ],
  meta: { requiresAuth: true, requiresEmploymentType: 'admin' },
};

export default adminRoutes;

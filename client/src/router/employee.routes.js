import EmployeeDashboard from '@/views/employee/EmployeeDashboard.vue';
import RequestTimeOff from '@/components/employee/requestTimeOff/RequestTimeOff.vue';

export const employeeRoutes = {
  path: '/employee',
  name: 'EmployeeDashboard-page',
  component: EmployeeDashboard,
  children: [
    {
      path: '',
      name: 'employee-request',
      component: RequestTimeOff,
    },
  ],
  alias: '/employee/dashboard',
  meta: { requiresAuth: true, requiresEmploymentType: 'employee' },
};

export default employeeRoutes;

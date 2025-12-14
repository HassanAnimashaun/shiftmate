import EmployeeDashboard from '@/views/employee/EmployeeDashboard.vue';
import RequestTimeOff from '@/components/employee/requestTimeOff/RequestTimeOff.vue';
import MyRequestTimeOff from '@/components/employee/myRequest/MyRequestView.vue';

export const employeeRoutes = {
  path: '/employee',
  name: 'EmployeeDashboard-page',
  component: EmployeeDashboard,
  children: [
    {
      path: '',
      redirect: { name: 'employee-request' },
    },
    {
      path: 'request',
      name: 'employee-request',
      component: RequestTimeOff,
    },
    {
      path: 'employeeMyRequest',
      name: 'employee-myrequest',
      component: MyRequestTimeOff,
    },
  ],
  meta: { requiresAuth: true, requiresEmploymentType: 'employee' },
};

export default employeeRoutes;

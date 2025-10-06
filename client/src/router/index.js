import { createWebHistory, createRouter } from 'vue-router'

import Login from '@/views/Login.vue'
import Dashboard from '@/views/Dashboard.vue';

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
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
    },
  ],
})


// router.beforeEach((to, from, next) => {
//   const token = localStorage.getItem("token");

//   if (to.meta.requiresAuth && !token) {
//     next('/login');
//   } else if (to.path === '/login' && token) {
//     next('/dashboard');
//     next();
//   }
// });
export default router;

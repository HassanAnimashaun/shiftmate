import { createMemoryHistory, createRouter } from 'vue-router'

import Login from '../views/Login.vue'

export const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: '/',
      name: 'Login',
      component: Login,
    },
  ],
})

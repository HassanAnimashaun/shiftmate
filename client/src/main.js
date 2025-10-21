import { createApp } from 'vue';
import App from './App.vue';
import './assets/main.css';
import { router } from './router';
import authService from '@/services/login';

const app = createApp(App);

(async () => {
  await authService.fetchCurrentUser();
  app.use(router).mount('#app');
})();

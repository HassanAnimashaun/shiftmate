<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <nav class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
    <!-- ADMIN -->
    <div v-if="user?.role === 'admin'">
      <template class="flex flex-col gap-7 text-lg">
        <SidebarLink class="nav-item active">📊 Dashboard</SidebarLink>
        <div class="nav-item">📅 Schedule</div>
        <div class="nav-item">👥 Employees</div>
        <div class="nav-item">📝 Time Off Requests</div>
        <div class="nav-item">📈 Reports</div>
      </template>
    </div>

    <!-- EMPLOYEE -->
    <div v-else-if="user?.role === 'employee'">
      <template class="flex flex-col gap-7 text-lg">
        <SidebarLink class="nav-item active">📅 My Schedule</SidebarLink>
        <div class="nav-item">🏖️ Request Time Off</div>
        <div class="nav-item">📋 My Requests</div>
      </template>
    </div>
  </nav>
</template>

<script>
import LoginService from '@/services/login';
export default {
  data() {
    return {
      user: null,
    };
  },
  async created() {
    try {
      this.user = await LoginService.fetchCurrentUser();
    } catch (err) {
      console.log('Failed to fetch user:', err);
    }
  },
};
</script>

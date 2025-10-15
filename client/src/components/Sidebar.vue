<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <nav class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
    <!-- ADMIN -->
    <div>
      <template class="flex flex-col gap-3">
        <SidebarLink class="nav-item active">📊 Dashboard</SidebarLink>
        <div class="nav-item">📅 Schedule</div>
        <div class="nav-item">👥 Employees</div>
        <div class="nav-item">📝 Time Off Requests</div>
        <div class="nav-item">📈 Reports</div>
      </template>
    </div>

    <!-- EMPLOYEE -->
    <div>
      <template class="flex flex-col gap-3">
        <SidebarLink class="nav-item active">📅 My Schedule</SidebarLink>
        <div class="nav-item">🏖️ Request Time Off</div>
        <div class="nav-item">📋 My Requests</div>
      </template>
    </div>
  </nav>
</template>

<script>
export default {
  data() {
    return {
      role: '',
    };
  },
};
</script>

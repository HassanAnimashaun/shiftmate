<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <nav class="bg-white rounded-2xl shadow-lg p-4 flex flex-col gap-3">
    <router-link
      v-for="item in menuItems"
      :key="item.key"
      :to="item.to"
      class="flex items-center gap-2 px-3 py-2 rounded-lg"
      :class="[
        $route.name === item.key
          ? 'bg-purple-200 text-purple-800 font-medium'
          : 'text-gray-700 hover:bg-purple-100',
      ]"
    >
      <span>{{ item.icon }}</span>
      <span>{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<script>
export default {
  props: ['activeTab'],
  emits: ['changeTab'],
  data() {
    return {
      menuItems: [
        { key: 'dashboard', label: 'Dashboard', icon: '📊' },
        { key: 'schedule', label: 'Schedule', icon: '📅' },
        { key: 'employees', label: 'Employees', icon: '👥', to: '/dashboard/employees' },
        { key: 'timeoff', label: 'Time Off Requests', icon: '📝' },
        { key: 'reports', label: 'Reports', icon: '📈' },
      ],
    };
  },
};
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
    <StatCard :value="loading ? null : employeeCount" :loading="loading" label="Total Employees" />

    <StatCard :value="loading ? null : 3" :loading="loading" label="Pending Requests" />
    <StatCard :value="loading ? null : 45" :loading="loading" label="Weekly Hours" />
    <StatCard :value="loading ? null : '80%'" :loading="loading" label="Schedule Coverage" />
  </div>
</template>

<script>
import StatCard from './StatCard.vue';
export default {
  name: 'OverviewPanel',
  components: { StatCard },
  props: {
    employeeCount: Number,
  },
};
</script>

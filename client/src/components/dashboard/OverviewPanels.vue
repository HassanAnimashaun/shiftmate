<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
    <StatCard :value="employeeCount" label="Total Employees" />
    <StatCard :value="3" label="Pending Requests" />
    <StatCard :value="45" label="Weekly Hours" />
    <StatCard :value="'80%'" label="Schedule Coverage" />
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

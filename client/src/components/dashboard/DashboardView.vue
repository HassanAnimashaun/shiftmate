<template>
  <div class="p-6 bg-white rounded-2xl shadow-md flex-1">
    <div class="flex flex-col items-start mb-3 gap-3">
      <h2 class="text-2xl font-semibold text-gray-800">Dashboard Overview</h2>
    </div>

    <OverviewPanel :employeeCount="employeeCount" />

    <!-- ACTIVITIES -->
    <div class="flex flex-col items-start mb-3 gap-3">
      <h2 class="text-xl font-semibold text-gray-800">Recent Activity</h2>
    </div>
    <ActivityPanel />
  </div>
</template>

<script>
import AdminService from '@/services/adminService';
import ActivityPanel from '@/components/ActivityPanels.vue';
import OverviewPanel from '@/components/dashboard/OverviewPanels.vue';

export default {
  name: 'DashboardView',
  components: {
    ActivityPanel,
    OverviewPanel,
  },
  data() {
    return {
      employeeCount: 0,
    };
  },

  async mounted() {
    await this.fetchEmployeeCount();
  },

  methods: {
    async fetchEmployeeCount() {
      try {
        const res = await AdminService.totalEmployees();
        this.employeeCount = res.data.employeeCount ?? 0;
      } catch (err) {
        console.log(err);
      }
    },
  },
};
</script>

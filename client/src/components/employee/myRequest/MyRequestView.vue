<template>
  <div class="p-6 bg-white rounded-2xl shadow-md flex-1">
    <div class="flex flex-col items-start mb-3 gap-3">
      <h2 class="text-2xl font-semibold text-gray-800">My Request</h2>
    </div>
    <p v-if="error" class="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
      {{ error }}
    </p>
    <p v-else-if="loading" class="mb-4 text-sm text-gray-500">Loading Request...</p>

    <!-- REQUEST -->
    <RequestPanels v-if="!loading" :myRequests="myRequests" />
  </div>
</template>

<script>
import EmployeeTimeOffService from '@/services/employee/employeeTimeOffService';
import RequestPanels from '@/components/employee/myRequest/MyRequestPanels.vue';

export default {
  name: 'myRequest',
  components: {
    RequestPanels,
  },

  data() {
    return {
      myRequests: [],
      loading: false,
      error: '',
    };
  },

  async mounted() {
    await this.getMyRequest();
  },

  methods: {
    async getMyRequest() {
      try {
        this.loading = true;
        const res = await EmployeeTimeOffService.getMyRequest();
        const requests = res.data?.requests ?? res.data;
        this.myRequests = Array.isArray(requests) ? requests : [];
      } catch (err) {
        console.error('Failed to load current request:', err);
        this.error = err.response?.data?.msg || 'Failed to load request';
        this.myRequests = [];
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

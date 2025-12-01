<template>
  <div class="p-6 bg-white rounded-2xl shadow-md flex-1">
    <div class="flex flex-col items-start mb-3 gap-3">
      <h2 class="text-2xl font-semibold text-gray-800">Time Off Requests</h2>
    </div>

    <p v-if="error" class="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
      {{ error }}
    </p>
    <p v-else-if="loading" class="mb-4 text-sm text-gray-500">Loading Request Time Off...</p>

    <requestList v-if="!loading" :employees="employees" />
  </div>
</template>

<script>
import requestList from './RequestList.vue';
import AdminService from '@/services/admin/adminStaffService';
export default {
  components: requestList,
  data() {
    return {
      employees: [],
      loading: false,
      error: '',
    };
  },
  async mounted() {
    await this.fetchRequest();
  },

  methods: {
    async fetchRequest() {
      try {
        this.loading = true;
        this.error = '';
        const res = await AdminService.getAllStaff();
        this.employees = Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.error('Failed to load employees:', err);
        this.error = err.response?.data?.msg || 'Failed to load employees';
        this.employees = [];
      }
      this.loading = false;
    },
  },
};
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs px-4"
  >
    <!-- MODAL CONTAINER -->
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
      <!-- HEADER -->
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-800">
          {{ employee?.name }}
        </h2>
      </div>

      <!-- EMPLOYEE DETAILS -->
      <div class="flex flex-col gap-3 text-gray-700">
        <div>
          <p class="text-sm font-semibold text-gray-600">Role</p>
          <p class="text-base">
            {{ formatEmploymentRole(employee.role) }}
          </p>
        </div>

        <div v-if="employee?.employmentType">
          <p class="text-sm font-semibold text-gray-600">Employment Type</p>
          <p class="text-base">
            {{ formatEmploymentType(employee.employmentType) }}
          </p>
        </div>

        <div v-if="employee?.email">
          <p class="text-sm font-semibold text-gray-600">Email</p>
          <p class="text-base">{{ employee.email }}</p>
        </div>

        <div v-if="employee?.phone">
          <p class="text-sm font-semibold text-gray-600">Phone</p>
          <p class="text-base">{{ employee.phone }}</p>
        </div>

        <div>
          <p class="text-sm font-semibold text-gray-600">Account Created</p>
          <p class="text-base">
            {{ formatDate(employee?.createdAt) }}
          </p>
        </div>

        <div v-if="employee?.mustChangePassword === true">
          <p class="text-sm font-semibold text-gray-600">Password Status</p>
          <p class="text-base text-orange-600 font-medium">
            User must change password on next login
          </p>
        </div>
      </div>

      <!-- ACTIONS -->
      <div class="flex justify-end mt-6">
        <button
          @click="$emit('close')"
          class="bg-gradient-to-r from-purple-500 to-indigo-400 text-white px-6 py-2 rounded-full shadow hover:opacity-90 transition text-sm"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EmployeeViewModal',
  props: {
    open: { type: Boolean, required: true },
    employee: { type: Object, default: null },
  },
  emits: ['close'],
  methods: {
    formatEmploymentRole(type) {
      const map = {
        admin: 'Admin',
        employee: 'Employee',
      };
      return map[type] || type;
    },
    formatEmploymentType(type) {
      const map = {
        fullTime: 'Full-time',
        partTime: 'Part-time',
        admin: 'Admin',
      };
      return map[type] || type;
    },
    formatDate(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString();
    },
  },
};
</script>

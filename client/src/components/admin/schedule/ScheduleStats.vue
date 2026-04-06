<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
    <div
      class="bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl px-4 py-4 text-center shadow-sm"
    >
      <p class="text-2xl font-bold text-gray-800">{{ totalHours }}</p>
      <p class="text-gray-700 text-sm font-medium">Total Hours</p>
    </div>
    <div
      class="bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl px-4 py-4 text-center shadow-sm"
    >
      <p class="text-2xl font-bold text-gray-800">{{ shiftCount }}</p>
      <p class="text-gray-700 text-sm font-medium">Shifts Scheduled</p>
    </div>
    <div
      class="bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl px-4 py-4 text-center shadow-sm"
    >
      <p class="text-2xl font-bold text-gray-800">{{ cancelledCount }}</p>
      <p class="text-gray-700 text-sm font-medium">Cancelled</p>
    </div>
    <div
      class="bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl px-4 py-4 text-center shadow-sm"
    >
      <p class="text-2xl font-bold text-gray-800">{{ employeeCount }}</p>
      <p class="text-gray-700 text-sm font-medium">Employees</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ScheduleStats',
  props: {
    shifts: { type: Array, required: true },
    employees: { type: Array, required: true },
  },
  computed: {
    activeShifts() {
      return this.shifts.filter((s) => s.status !== 'cancelled');
    },
    totalHours() {
      const total = this.activeShifts.reduce((sum, s) => sum + (s.scheduledHours || 0), 0);
      return total % 1 === 0 ? total : total.toFixed(2);
    },
    shiftCount() {
      return this.activeShifts.length;
    },
    cancelledCount() {
      return this.shifts.filter((s) => s.status === 'cancelled').length;
    },
    employeeCount() {
      return this.employees.length;
    },
  },
};
</script>

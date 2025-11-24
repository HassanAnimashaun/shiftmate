<template>
  <div class="flex flex-col gap-4">
    <!-- EMPLOYEE CARDS -->
    <div
      v-for="emp in employees"
      :key="emp.id || emp._id"
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl px-6 py-4 shadow-sm hover:shadow-md transition"
    >
      <!-- EMPLOYEE INFO -->
      <div class="flex flex-col">
        <h2 class="text-black font-semibold text-lg">{{ emp.name }}</h2>
        <span class="text-gray-700 text-sm">
          {{ formatEmploymentType(emp.employmentType) || 'Employee' }}
        </span>
      </div>

      <!-- ACTION BUTTONS -->
      <div class="flex gap-3 mt-3 sm:mt-0">
        <button
          @click="$emit('view', emp)"
          class="bg-gradient-to-r from-purple-500 to-indigo-400 text-white font-medium px-5 py-1.5 rounded-full text-sm shadow-sm hover:opacity-90 transition"
        >
          View
        </button>

        <button
          @click="$emit('edit', emp)"
          class="bg-gradient-to-r from-purple-500 to-indigo-400 text-white font-medium px-5 py-1.5 rounded-full text-sm shadow-sm hover:opacity-90 transition"
        >
          Edit
        </button>

        <button
          @click="$emit('delete', emp.id || emp._id)"
          class="bg-gradient-to-r from-cyan-100 to-cyan-200 text-gray-800 font-medium px-5 py-1.5 rounded-full text-sm shadow-sm hover:shadow transition"
        >
          Delete
        </button>
      </div>
    </div>

    <!-- EMPTY STATE -->
    <div v-if="employees.length === 0" class="text-center py-8 text-gray-500 font-medium">
      No employees found.
    </div>
  </div>
</template>

<script>
export default {
  name: 'EmployeeList',
  props: {
    employees: {
      type: Array,
      required: true,
    },
  },
  emits: ['view', 'edit', 'delete'],
  methods: {
    formatEmploymentType(type) {
      if (!type) return '';
      const lookup = {
        fullTime: 'Full-time',
        partTime: 'Part-time',
        contractor: 'Contractor',
        admin: 'Admin',
      };
      return lookup[type] || type;
    },
  },
};
</script>

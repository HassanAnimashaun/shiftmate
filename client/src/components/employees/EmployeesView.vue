<template>
  <div class="p-6 bg-white rounded-2xl shadow-md flex-1">
    <div class="flex flex-col items-start mb-3 gap-3">
      <h2 class="text-2xl font-semibold text-gray-800">Employee Management</h2>
      <AddEmployeeButton @add="openAddForm" />
    </div>

    <EmployeeList :employees="employees" @edit="editEmployee" @delete="deleteEmployee" />

    <!-- Add/Edit Modal -->
    <EmployeeForm
      v-if="showForm"
      :employee="selectedEmployee"
      @close="closeForm"
      @saved="fetchEmployees"
    />
  </div>
</template>

<script>
import AdminService from '@/services/adminService';
import AddEmployeeButton from './AddEmployeeButton.vue';
import EmployeeList from './EmployeeList.vue';
import EmployeeForm from './EmployeeForm.vue';

export default {
  name: 'EmployeesView',
  components: { EmployeeList, AddEmployeeButton, EmployeeForm },
  data() {
    return {
      employees: [],
      showForm: false,
      selectedEmployee: null,
    };
  },
  async mounted() {
    this.fetchEmployees();
  },
  methods: {
    async fetchEmployees() {
      try {
        const res = await AdminService.getAllStaff();
        this.employees = res.data;
      } catch (err) {
        console.error('Failed to load employees:', err);
      }
    },
    openAddForm() {
      this.selectedEmployee = null;
      this.showForm = true;
    },
    editEmployee(employee) {
      this.selectedEmployee = employee;
      this.showForm = true;
    },
    closeForm() {
      this.showForm = false;
    },
    async deleteEmployee(id) {
      try {
        await AdminService.deleteEmployee(id);
        this.fetchEmployees();
      } catch (err) {
        console.log('Failed to delete employee', err);
      }
    },
  },
};
</script>

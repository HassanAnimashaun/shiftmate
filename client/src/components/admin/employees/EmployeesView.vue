<template>
  <div class="p-6 bg-white rounded-2xl shadow-md flex-1">
    <div class="flex flex-col items-start mb-3 gap-3">
      <h2 class="text-2xl font-semibold text-gray-800">Employee Management</h2>
      <AddEmployeeButton @add="openAddForm" />
    </div>

    <p v-if="error" class="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
      {{ error }}
    </p>
    <p v-else-if="loading" class="mb-4 text-sm text-gray-500">Loading employees...</p>

    <EmployeeList
      v-if="!loading"
      :employees="employees"
      @view="viewEmployee"
      @edit="editEmployee"
      @delete="deleteEmployee"
    />

    <EmployeeView
      :open="showViewModal"
      :employee="selectedEmployee"
      @close="showViewModal = false"
    />

    <EmployeeForm
      v-if="showForm"
      :employee="selectedEmployee"
      @close="closeForm"
      @saved="handleEmployeeSaved"
    />
  </div>
</template>

<script>
import AdminService from '@/services/admin/adminStaffService';
import AddEmployeeButton from './AddEmployeeButton.vue';
import EmployeeList from './EmployeeList.vue';
import EmployeeForm from './EmployeeForm.vue';
import EmployeeView from './EmployeeViewModal.vue';

export default {
  name: 'EmployeesView',
  components: { EmployeeList, AddEmployeeButton, EmployeeForm, EmployeeView },
  data() {
    return {
      employees: [],
      showForm: false,
      showViewModal: false,
      selectedEmployee: null,
      loading: false,
      error: '',
    };
  },

  async mounted() {
    await this.fetchEmployees();
  },

  methods: {
    async fetchEmployees() {
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

    openAddForm() {
      this.selectedEmployee = null;
      this.showForm = true;
    },

    editEmployee(employee) {
      this.selectedEmployee = employee;
      this.showForm = true;
    },

    viewEmployee(employee) {
      this.selectedEmployee = employee;
      this.showViewModal = true;
    },

    closeForm() {
      this.showForm = false;
      this.selectedEmployee = null;
    },

    async handleEmployeeSaved(payload) {
      if (payload?.onboarding) {
        this.selectedEmployee = null;
        this.showForm = true;
        return;
      }

      await this.fetchEmployees();
      this.closeForm();
    },

    async deleteEmployee(id) {
      try {
        await AdminService.deleteEmployee(id);
        await this.fetchEmployees();
      } catch (err) {
        console.log('Failed to delete employee', err);
        this.error = err.response?.data?.msg || 'Failed to delete employee';
      }
    },
  },
};
</script>

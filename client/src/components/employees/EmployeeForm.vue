<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
    <div class="relative w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">
      <button
        type="button"
        class="absolute right-4 top-4 text-gray-400 transition hover:text-gray-600"
        @click="handleClose"
        aria-label="Close form"
      >
        ✕
      </button>

      <h2 class="mb-6 text-2xl font-semibold text-gray-800">
        {{ employee ? 'Edit Employee' : 'Add Employee' }}
      </h2>

      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div>
          <label for="name" class="mb-2 block text-sm font-medium text-gray-700">Full Name</label>
          <input
            id="name"
            v-model.trim="form.name"
            type="text"
            required
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter employee name"
          />
        </div>

        <div>
          <label for="email" class="mb-2 block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            v-model.trim="form.email"
            type="email"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="name@example.com"
          />
        </div>

        <div>
          <label for="phone" class="mb-2 block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            id="phone"
            v-model.trim="form.phone"
            type="tel"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter employee phone"
          />
        </div>

        <div>
          <label for="position" class="mb-2 block text-sm font-medium text-gray-700">Position</label>
          <input
            id="position"
            v-model.trim="form.position"
            type="text"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter employee position"
          />
        </div>

        <div>
          <label for="employmentType" class="mb-2 block text-sm font-medium text-gray-700">Employment Type</label>
          <select
            id="employmentType"
            v-model="form.employmentType"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option disabled value="">Select employment type</option>
            <option value="fullTime">Full-time</option>
            <option value="partTime">Part-time</option>
            <option value="contractor">Contractor</option>
          </select>
        </div>

        <div>
          <label for="role" class="mb-2 block text-sm font-medium text-gray-700">Role</label>
          <input
            id="role"
            v-model.trim="form.role"
            type="text"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="e.g. Nurse, Manager"
          />
        </div>

        <div v-if="form.employmentType === 'partTime' || form.employmentType === 'contractor'">
          <label for="hourlyRate" class="mb-2 block text-sm font-medium text-gray-700">Hourly Rate</label>
          <input
            id="hourlyRate"
            v-model.number="form.hourlyRate"
            type="number"
            min="0"
            step="0.01"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter hourly rate"
          />
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            @click="handleClose"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="rounded-lg bg-gradient-to-r from-indigo-400 to-purple-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            :disabled="saving"
          >
            {{ saving ? 'Saving...' : employee ? 'Save Changes' : 'Add Employee' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import AdminService from '@/services/adminService';

const DEFAULT_FORM = {
  name: '',
  email: '',
  phone: '',
  position: '',
  employmentType: 'fullTime',
  hourlyRate: null,
  role: 'employee',
};

export default {
  name: 'EmployeeForm',
  props: {
    employee: {
      type: Object,
      default: null,
    },
  },
  emits: ['close', 'saved'],
  data() {
    return {
      form: { ...DEFAULT_FORM },
      saving: false,
      error: '',
    };
  },
  watch: {
    employee: {
      handler(newEmployee) {
        if (!newEmployee) {
          this.form = { ...DEFAULT_FORM };
          return;
        }

        const source = {
          name: newEmployee.name ?? '',
          email: newEmployee.email ?? '',
          phone: newEmployee.phone ?? '',
          position: newEmployee.position ?? '',
          employmentType: newEmployee.employmentType || 'fullTime',
          hourlyRate:
            newEmployee.hourlyRate === null || newEmployee.hourlyRate === undefined
              ? null
              : Number(newEmployee.hourlyRate),
          role: newEmployee.role || 'employee',
        };

        this.form = { ...DEFAULT_FORM, ...source };
      },
      immediate: true,
    },
  },
  methods: {
    handleClose() {
      this.$emit('close');
      this.error = '';
    },
    async handleSubmit() {
      this.saving = true;
      this.error = '';

      const payload = {
        ...this.form,
        hourlyRate:
          this.form.hourlyRate === null || this.form.hourlyRate === ''
            ? null
            : Number(this.form.hourlyRate),
      };

      try {
        const id = this.employee?.id || this.employee?._id;

        if (id) {
          await AdminService.updateStaff(id, payload);
        } else {
          await AdminService.addStaff(payload);
        }

        this.$emit('saved');
        this.handleClose();
        this.form = { ...DEFAULT_FORM };
      } catch (err) {
        this.error = err.response?.data?.msg || 'Unable to save employee';
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>

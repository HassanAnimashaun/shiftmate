<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs px-4">
    <div class="relative w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">
      <button
        type="button"
        class="absolute right-4 top-4 text-gray-400 transition hover:text-gray-600"
        @click="handleClose"
        aria-label="Close form"
      >
        ✕
      </button>

      <div v-if="onboarding" class="space-y-6">
        <h2 class="text-2xl font-semibold text-gray-800">Employee Onboarding Info</h2>

        <div>
          <p class="text-sm text-gray-600 mb-1">Username</p>
          <div class="flex items-center justify-between bg-gray-100 p-2 rounded">
            <span class="font-medium text-gray-800">{{ onboarding.username }}</span>
            <button @click="copy(onboarding.username)" class="text-purple-600 text-sm">Copy</button>
          </div>
        </div>

        <div>
          <p class="text-sm text-gray-600 mb-1">Temporary OTP</p>
          <div class="flex items-center justify-between bg-gray-100 p-2 rounded">
            <span class="font-medium text-gray-800">{{ onboarding.tempOtp }}</span>
            <button @click="copy(onboarding.tempOtp)" class="text-purple-600 text-sm">Copy</button>
          </div>
        </div>

        <p class="text-xs text-gray-500">
          Share this OTP with the employee so they can sign in and change their password.
        </p>

        <div class="flex justify-end pt-4">
          <button class="rounded-lg bg-purple-600 text-white px-4 py-2" @click="handleClose">
            Done
          </button>
        </div>
      </div>

      <div v-else>
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
            <label for="phone" class="mb-2 block text-sm font-medium text-gray-700"
              >Phone Number</label
            >
            <input
              id="phone"
              v-model.trim="form.phone"
              type="tel"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter employee phone"
            />
          </div>
          <div>
            <label for="role" class="mb-2 block text-sm font-medium text-gray-700"> Role </label>
            <select
              id="role"
              v-model="form.role"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option disabled value="">Select role</option>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <!-- EMPLOYEE ONLY -->
          <div v-if="form.role === 'employee'">
            <label for="position" class="mb-2 block text-sm font-medium text-gray-700">
              Position
            </label>
            <select
              id="position"
              v-model="form.position"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="employee">Employee</option>
              <option value="lead">Lead</option>
              <option value="manager">Manager</option>
            </select>
            <p class="mt-1 text-xs text-gray-500">
              Position is for internal reference. Admin access is controlled by the role above.
            </p>
          </div>

          <div v-if="form.role === 'employee'">
            <label for="employmentType" class="mb-2 block text-sm font-medium text-gray-700">
              Employment Type
            </label>
            <select
              id="employmentType"
              v-model="form.employmentType"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option disabled value="">Select employment type</option>
              <option value="fullTime">Full-time</option>
              <option value="partTime">Part-time</option>
            </select>
          </div>

          <div v-if="form.role === 'employee'">
            <label for="hourlyRate" class="mb-2 block text-sm font-medium text-gray-700">
              Hourly Rate
            </label>
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
  </div>
</template>

<script>
import AdminService from '@/services/adminService';

const DEFAULT_FORM = {
  name: '',
  email: '',
  phone: '',
  role: 'employee',
  position: '',
  employmentType: 'fullTime',
  hourlyRate: null,
};

export default {
  name: 'EmployeeForm',
  props: {
    employee: { type: Object, default: null },
  },
  emits: ['close', 'saved'],

  data() {
    return {
      form: { ...DEFAULT_FORM },
      onboarding: null,
      saving: false,
      error: '',
    };
  },

  watch: {
    'form.role'(newRole) {
      if (newRole === 'admin') {
        this.form.position = '';
        this.form.employmentType = '';
        this.form.hourlyRate = null;
      } else if (!this.form.employmentType) {
        this.form.employmentType = 'fullTime';
      }
    },
    employee: {
      handler(newEmployee) {
        if (!newEmployee) {
          this.form = { ...DEFAULT_FORM };
          this.onboarding = null;
          return;
        }

        this.form = {
          ...DEFAULT_FORM,
          name: newEmployee.name ?? '',
          email: newEmployee.email ?? '',
          phone: newEmployee.phone ?? '',
          role: newEmployee.role ?? 'employee',
          position: newEmployee.position ?? '',
          employmentType:
            newEmployee.role === 'employee'
              ? newEmployee.employmentType || 'fullTime'
              : '',
          hourlyRate:
            newEmployee.role === 'employee'
              ? newEmployee.hourlyRate ?? null
              : null,
        };
        this.onboarding = null;
      },
      immediate: true,
    },
  },

  methods: {
    handleClose() {
      this.$emit('close');
      this.error = '';
      this.onboarding = null;
    },
    copy(text) {
      navigator.clipboard.writeText(text);
    },

    async handleSubmit() {
      this.saving = true;
      this.error = '';

      const derivedRole = this.form.role === 'admin' ? 'admin' : 'employee';

      const payload = {
        ...this.form,
        position: derivedRole === 'employee' ? this.form.position : '',
        employmentType: derivedRole === 'employee' ? this.form.employmentType : '',
        role: derivedRole,
        hourlyRate:
          derivedRole === 'employee' && this.form.hourlyRate !== null && this.form.hourlyRate !== ''
            ? Number(this.form.hourlyRate)
            : null,
      };

      try {
        const id = this.employee?._id || this.employee?.id;

        if (id) {
          await AdminService.updateStaff(id, payload);
          this.$emit('saved');
          this.form = { ...DEFAULT_FORM };
          this.handleClose();
          return;
        }

        const response = await AdminService.addStaff(payload);
        const tempSecret = response.data?.tempOtp || response.data?.tempPassword;

        this.onboarding = tempSecret
          ? {
              username: response.data.username,
              tempOtp: tempSecret,
            }
          : null;

        this.$emit('saved', { onboarding: this.onboarding });
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

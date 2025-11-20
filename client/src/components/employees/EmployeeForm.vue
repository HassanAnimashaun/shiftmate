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

      <!-- ⭐ ONBOARDING MODE -->
      <div v-if="onboardingInfo" class="space-y-6">
        <h2 class="text-2xl font-semibold text-gray-800">Employee Onboarding Info</h2>

        <div>
          <p class="text-sm text-gray-600 mb-1">Username</p>
          <div class="flex items-center justify-between bg-gray-100 p-2 rounded">
            <span>{{ onboardingInfo.username }}</span>
            <button @click="copy(onboardingInfo.username)" class="text-purple-600">Copy</button>
          </div>
        </div>

        <div>
          <p class="text-sm text-gray-600 mb-1">Temporary Password</p>
          <div class="flex items-center justify-between bg-gray-100 p-2 rounded">
            <span>{{ onboardingInfo.tempPassword }}</span>
            <button @click="copy(onboardingInfo.tempPassword)" class="text-purple-600">Copy</button>
          </div>
        </div>

        <div class="flex justify-end pt-4">
          <button class="rounded-lg bg-purple-600 text-white px-4 py-2" @click="handleClose">
            Done
          </button>
        </div>
      </div>

      <!-- ⭐ ORIGINAL FORM (ADD/EDIT MODE) -->
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
            <label for="position" class="mb-2 block text-sm font-medium text-gray-700"
              >Position</label
            >
            <input
              id="position"
              v-model.trim="form.position"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter employee position"
            />
          </div>

          <div>
            <label for="employmentType" class="mb-2 block text-sm font-medium text-gray-700"
              >Employment Type</label
            >
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

          <div>
            <label for="hourlyRate" class="mb-2 block text-sm font-medium text-gray-700"
              >Hourly Rate</label
            >
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
  position: '',
  employmentType: 'fullTime',
  hourlyRate: null,
  role: 'employee',
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
      onboardingInfo: null,
      saving: false,
      error: '',
    };
  },

  watch: {
    employee: {
      handler(newEmployee) {
        if (!newEmployee) {
          this.form = { ...DEFAULT_FORM };
          this.onboardingInfo = null;
          return;
        }

        const source = {
          name: newEmployee.name ?? '',
          email: newEmployee.email ?? '',
          phone: newEmployee.phone ?? '',
          position: newEmployee.position ?? '',
          employmentType: newEmployee.employmentType || 'fullTime',
          hourlyRate: newEmployee.hourlyRate ?? null,
          role: newEmployee.role || 'employee',
        };

        this.form = { ...DEFAULT_FORM, ...source };
        this.onboardingInfo = null;
      },
      immediate: true,
    },
  },

  methods: {
    handleClose() {
      this.$emit('close');
      this.error = '';
      this.onboardingInfo = null;
    },

    copy(text) {
      navigator.clipboard.writeText(text);
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

        let response;
        if (id) {
          response = await AdminService.updateStaff(id, payload);
        } else {
          response = await AdminService.addStaff(payload);
        }

        // ⭐ Build onboarding object if new employee was created
        const onboardingPayload = response.data.tempPassword
          ? {
              username: response.data.username,
              tempPassword: response.data.tempPassword,
            }
          : null;

        this.$emit('saved', { onboarding: onboardingPayload });

        // Reset the form
        this.form = { ...DEFAULT_FORM };

        this.handleClose();
      } catch (err) {
        this.error = err.response?.data?.msg || 'Unable to save employee';
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>

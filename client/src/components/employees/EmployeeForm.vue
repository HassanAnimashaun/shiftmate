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

      <h2 class="mb-6 text-2xl font-semibold text-gray-800">
        {{ employee ? 'Edit Employee' : 'Onboard Employee' }}
      </h2>

      <div
        v-if="!employee && generatedCredentials"
        class="mb-6 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-900"
      >
        <p class="font-semibold text-indigo-950">Employee account created</p>
        <p class="mt-2">
          Share these temporary credentials with the employee. The OTP expires after their first login.
        </p>
        <div class="mt-3 grid gap-2 md:grid-cols-2">
          <div class="rounded-lg bg-white px-3 py-2 shadow-sm">
            <p class="text-xs uppercase tracking-wide text-gray-500">Username</p>
            <p class="font-mono text-base font-semibold text-gray-900">
              {{ generatedCredentials.username }}
            </p>
          </div>
          <div class="rounded-lg bg-white px-3 py-2 shadow-sm">
            <p class="text-xs uppercase tracking-wide text-gray-500">One-time password</p>
            <p class="font-mono text-base font-semibold text-gray-900">
              {{ generatedCredentials.otp }}
            </p>
          </div>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label for="firstName" class="mb-2 block text-sm font-medium text-gray-700">First Name</label>
            <input
              id="firstName"
              v-model.trim="form.firstName"
              type="text"
              required
              class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter first name"
            />
          </div>
          <div>
            <label for="lastName" class="mb-2 block text-sm font-medium text-gray-700">Last Name</label>
            <input
              id="lastName"
              v-model.trim="form.lastName"
              type="text"
              required
              class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter last name"
            />
          </div>
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
            <option disabled value="">Select employment Role</option>
            <option value="employee">Employee</option>
            <option value="doctor">Doctor</option>
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
            {{ saving ? 'Saving...' : employee ? 'Save Changes' : 'Onboard Employee' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import AdminService from '@/services/adminService';

const DEFAULT_FORM = {
  firstName: '',
  lastName: '',
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
      generatedCredentials: null,
    };
  },
  watch: {
    employee: {
      handler(newEmployee) {
        if (!newEmployee) {
          this.form = { ...DEFAULT_FORM };
          this.generatedCredentials = null;
          return;
        }

        const source = {
          firstName: newEmployee.firstName ?? '',
          lastName: newEmployee.lastName ?? '',
          email: newEmployee.email ?? '',
          phone: newEmployee.phone ?? '',
          position: newEmployee.position ?? '',
          employmentType: newEmployee.employmentType || 'fullTime',
          role: newEmployee.role || 'employee',
          hourlyRate:
            newEmployee.hourlyRate === null || newEmployee.hourlyRate === undefined
              ? null
              : Number(newEmployee.hourlyRate),
        };

        if ((!source.firstName || !source.lastName) && newEmployee.name) {
          const [first = '', ...rest] = newEmployee.name.split(/\s+/);
          source.firstName = source.firstName || first;
          source.lastName = source.lastName || rest.join(' ');
        }

        this.form = { ...DEFAULT_FORM, ...source };
        this.generatedCredentials = null;
      },
      immediate: true,
    },
  },
  methods: {
    handleClose() {
      this.$emit('close');
      this.error = '';
      this.generatedCredentials = null;
      this.form = { ...DEFAULT_FORM };
    },
    async handleSubmit() {
      this.saving = true;
      this.error = '';

      const hourlyRateValue =
        this.form.hourlyRate === null || this.form.hourlyRate === ''
          ? null
          : Number(this.form.hourlyRate);

      if (hourlyRateValue !== null && Number.isNaN(hourlyRateValue)) {
        this.error = 'Hourly rate must be a number';
        this.saving = false;
        return;
      }

      const payload = {
        firstName: this.form.firstName,
        lastName: this.form.lastName,
        name: `${this.form.firstName} ${this.form.lastName}`.trim(),
        email: this.form.email,
        phone: this.form.phone,
        position: this.form.position,
        employmentType: this.form.employmentType,
        role: this.form.role,
        hourlyRate: hourlyRateValue,
      };

      try {
        const id = this.employee?.id || this.employee?._id;

        if (id) {
          await AdminService.updateStaff(id, payload);
        } else {
          const response = await AdminService.onboardStaff(payload);
          this.generatedCredentials = {
            username: response.data?.username,
            otp: response.data?.otp,
          };
        }

        this.$emit('saved');
        if (id) {
          this.handleClose();
        } else {
          this.form = { ...DEFAULT_FORM };
        }
      } catch (err) {
        this.error =
          err.response?.data?.msg ||
          err.response?.data?.error ||
          'Unable to save employee';
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>

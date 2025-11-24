<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
      <div class="mb-6 text-center">
        <h1 class="text-2xl font-bold text-purple-700">Set Your Password</h1>
        <p class="text-sm text-gray-500">Use your temporary password to create a new one.</p>
      </div>
      <form class="space-y-5" @submit.prevent="handleSubmit">
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700" for="currentPassword">
            Current (temporary) password
          </label>
          <input
            id="currentPassword"
            v-model.trim="currentPassword"
            type="password"
            required
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter the temporary password"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700" for="newPassword">New password</label>
          <input
            id="newPassword"
            v-model.trim="newPassword"
            type="password"
            required
            minlength="6"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Create a new password"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700" for="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            v-model.trim="confirmPassword"
            type="password"
            required
            minlength="6"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Re-enter the new password"
          />
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        <p v-if="success" class="text-sm text-green-600">{{ success }}</p>

        <button
          type="submit"
          class="w-full rounded-lg bg-gradient-to-r from-indigo-400 to-purple-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          :disabled="saving"
        >
          {{ saving ? 'Saving...' : 'Save Password' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import authService from '@/services/login';

export default {
  name: 'SetPassword',
  data() {
    return {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      error: '',
      success: '',
      saving: false,
    };
  },
  methods: {
    async handleSubmit() {
      this.error = '';
      this.success = '';

      if (this.newPassword !== this.confirmPassword) {
        this.error = 'New passwords do not match';
        return;
      }

      this.saving = true;

      try {
        await authService.changePassword({
          currentPassword: this.currentPassword,
          newPassword: this.newPassword,
        });

        this.success = 'Password updated successfully. Redirecting...';
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';

        setTimeout(() => {
          this.$router.push('/admin');
        }, 800);
      } catch (err) {
        this.error = err.response?.data?.msg || 'Unable to update password';
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>

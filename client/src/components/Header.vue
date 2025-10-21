<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <header
    class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md flex justify-between items-center"
  >
    <h1 class="text-2xl font-semibold text-gray-700">ShiftMate</h1>

    <!-- Dropdown Menu -->
    <div>
      <button
        @click="dropdown = !dropdown"
        class="bg-purple-200 text-purple-700 px-3 py-1 rounded-lg text-sm"
      >
        {{ name }}
      </button>
      <div
        v-show="dropdown"
        class="dropdown bg-gray-200 flex flex-col rounded mt-1 p-2 text-sm w-32"
      >
        <button @click="logout" class="px-2 py-1 hover:bg-blue-300 rounded">SignOut</button>
      </div>
    </div>
  </header>
</template>

<script>
import authService from '../services/login';
export default {
  data() {
    return {
      name: 'Name Here',
      dropdown: false,
    };
  },
  methods: {
    async logout() {
      try {
        await authService.logout({});
        this.$router.push('/');
      } catch (err) {
        console.error(err);
      }
    },
  },
};
</script>

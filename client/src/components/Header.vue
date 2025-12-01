<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <header
    class="bg-white rounded-2xl shadow-lg w-full p-4 mb-4 flex flex-col md:flex-row justify-between items-center mx-auto max-w-7xl transition-all duration-300"
  >
    <!-- Logo -->
    <h1 class="text-2xl font-semibold text-gray-700 flex items-center justify-center">
      <img class="w-36 md:w-40" src="/logo.png" alt="Logo" />
    </h1>

    <!-- User Dropdown -->
    <div class="relative mt-4 md:mt-0 w-full md:w-auto flex justify-center md:justify-end">
      <button
        @click="toggleDropdown"
        class="bg-purple-200 text-purple-700 px-4 py-2 rounded-lg text-lg font-medium hover:bg-purple-300 transition w-full md:w-auto"
      >
        {{ user?.name || 'User' }}
      </button>

      <!-- Animated dropdown -->
      <transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div
          v-if="dropdown"
          ref="dropdown"
          class="absolute top-full mt-2 bg-gray-100 flex flex-col rounded-xl p-3 text-sm w-56 md:w-40 shadow-lg z-50 border border-gray-200 left-1/2 -translate-x-1/2 md:left-auto md:right-0 md:translate-x-0"
        >
          <button
            @click="logout"
            class="px-3 py-2 rounded-md text-gray-700 hover:bg-purple-100 text-left transition"
          >
            Sign Out
          </button>
        </div>
      </transition>
    </div>
  </header>
</template>

<script>
import LoginService from '@/services/auth/login';

export default {
  data() {
    return {
      user: null,
      dropdown: false,
    };
  },
  methods: {
    toggleDropdown() {
      this.dropdown = !this.dropdown;
    },
    handleClickOutside(e) {
      const dropdownEl = this.$refs.dropdown;
      const buttonEl = this.$el.querySelector('button');

      if (
        this.dropdown &&
        dropdownEl &&
        !dropdownEl.contains(e.target) &&
        !buttonEl.contains(e.target)
      ) {
        this.dropdown = false;
      }
    },
    async logout() {
      try {
        await LoginService.logout();
        this.user = null;
        this.$router.push('/');
      } catch (err) {
        console.error(err);
      }
    },
  },
  async created() {
    try {
      this.user = await LoginService.fetchCurrentUser();
      document.addEventListener('click', this.handleClickOutside);
    } catch (err) {
      console.log(err);
    }
  },
  unmounted() {
    document.removeEventListener('click', this.handleClickOutside);
  },
};
</script>

<template>
  <div
    class="flex h-screen justify-center items-center"
  >
    <div class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
      <!-- HEADER -->
      <div class="text-center mb-6">
        <h1 class="text-purple-600 font-bold text-2xl">Login</h1>
        <p class="text-gray-500">Employee Scheduling System</p>
      </div>

      <!-- FORM -->
      <form @submit.prevent="handleLogin" class="space-y-6">
        <!-- USERNAME FIELD -->
        <div>
          <label for="username" class="block text-sm pb-2 font-medium text-gray-700">Username</label>
          <input
            v-model="username"
            type="text"
            required
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter your username"
          />
        </div>

        <!-- PASSWORD FEILD-->
        <div class="relative">
          <label for="password" class="block text-sm pb-2 font-medium text-gray-700">Password</label>
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            required
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter your password"
          />
          <button
            type="button"
            @click.prevent="togglePassword"
            class="absolute inset-y-0 right-0 pr-2 pt-7 flex items-center"
          >
            <span
              v-if="showPassword"
              class="material-symbols-outlined text-gray-500"
            >
              visibility
            </span>
            <span v-else class="material-symbols-outlined text-gray-500">
              visibility_off
            </span>
          </button>
        </div>

        <div v-if="error" class="text-red-500 text-sm mb-2">
          {{ error }}
        </div>

        <button
          type="submit"
          class="bg-gradient-to-r from-indigo-400 to-purple-500 text-white font-semibold py-2 rounded-lg hover:opacity-90 transition w-full"
        >
          Sign In
        </button>
        <!-- FOOTER -->
        <div class="mt-6 flex justify-center space-x-4 text-sm">
          <a href="#" class="text-purple-600 hover:underline">Forgot Password?</a>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import authService from '../services/login'
export default {
  name: 'Login-page',
  data(){
    return{
     username: "",
     password: "",
     showPassword: false,
     error: ""
    }
  },
  methods:{
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
   async handleLogin() {
      try{
        const data = await authService.login({
          username: this.username,
          password: this.password
        })
        localStorage.setItem('token', data.token)
        this.error = data.msg

        this.$router.push('/dashboard')
      }catch(err){
        this.error = err.response?.data?.msg || 'Server error'
      }
    },
  },
}
</script>

<style scoped>
/* Removed @apply rules since they are not supported without Tailwind JIT or PostCSS config */
</style>

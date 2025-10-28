<template>
  <div class="flex flex-col h-screen justify-center items-center">
    <div class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
      <form @submit.prevent="" method="post">
        <!-- NAME -->
        <div>
          <label for="name" class="block text-sm pb-2 font-medium text-gray-700">Full Name</label>
          <input
            v-model="form.name"
            type="text"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 mb-5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter employee name"
          />
        </div>

        <!-- EMAIL -->
        <div>
          <label for="email" class="block text-sm pb-2 font-medium text-gray-700">Email</label>
          <input
            v-model="form.email"
            type="email"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 mb-5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter Employee email"
          />
        </div>
        <!-- PHONE -->
        <div>
          <label for="phone" class="block text-sm pb-2 font-medium text-gray-700"
            >Phone Number</label
          >
          <input
            v-model="form.phone"
            type="tel"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 mb-5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter employee phone"
          />
        </div>
        <!-- POSITION -->
        <div>
          <label for="positon" class="block text-sm pb-2 font-medium text-gray-700">Position</label>
          <input
            v-model="form.position"
            type="text"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 mb-5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter employee position"
          />
        </div>
        <!-- EMPLOYMENT -->
        <div>
          <label for="emplployment" class="block text-sm pb-2 font-medium text-gray-700"
            >Employment</label
          >
          <select
            v-model="form.emplployment"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 mb-5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="" disabled>Select role</option>
            <option value="fullTime">Full-time</option>
            <option value="partTime">Part-Time</option>
            <option value="doctor">doctor</option>
          </select>
        </div>
        <!-- HOURLY RATE -->
        <div>
          <label
            v-if="form.role === employee"
            for="hourlyRate"
            class="block text-sm pb-2 font-medium text-gray-700"
            >Hourly Rate</label
          >
          <input
            v-model="form.hourlyRate"
            type="number"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 mb-5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter employee rate"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EmployeeForm',
  data() {
    return {
      form: {
        name: '',
        email: '',
        phone: '',
        position: '',
        role: '',
        employmentType: '',
        hourlyRate: '',
      },
    };
  },
};
</script>

<style></style>

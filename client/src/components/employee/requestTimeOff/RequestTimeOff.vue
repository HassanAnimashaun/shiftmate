<template>
  <div class="p-6 bg-white rounded-2xl shadow-md flex-1">
    <div>
      <form @submit.prevent="submitTimeOff">
        <div class="flex flex-col items-start mb-3 gap-3">
          <h2 class="text-2xl font-semibold text-gray-800">Request Time Off</h2>
        </div>

        <!-- START DATE -->
        <div>
          <label for="startDate" class="block text-sm pb-2 font-medium text-gray-700"
            >Start Date</label
          >
          <input
            v-model="form.startDate"
            type="date"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            required
          />
        </div>
        <!-- End DATE -->
        <div>
          <label for="endDate" class="block text-sm pb-2 font-medium text-gray-700">End Date</label>
          <input
            v-model="form.endDate"
            type="date"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            required
          />
        </div>

        <!-- TYPE OF REQUEST  -->
        <div>
          <label for="type" class="mb-2 block text-sm font-medium text-gray-700">
            Employment Type
          </label>
          <select
            id="requestType"
            v-model="form.type"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          >
            <option disabled value="">Select type</option>
            <option value="vacation">Vacation</option>
            <option value="sick">Sick-Leave</option>
            <option value="personal">Personal</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>

        <!-- REASON -->
        <div>
          <label for="reason" class="block text-sm pb-2 font-medium text-gray-700"
            >Reason (OPTIONAL)</label
          >
          <textarea
            v-model="form.reason"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        <button
          class="bg-purple-200 text-white px-4 py-2 rounded-lg text-md font-medium bg-gradient-to-r from-purple-500 to-indigo-400 hover:bg-purple-300 transition w-full md:w-auto"
        >
          Submit Request
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import EmployeeTimeOffService from '@/services/employee/employeeTimeOffService';
export default {
  name: 'requestOff',

  data() {
    return {
      form: {
        type: '',
        startDate: '',
        endDate: '',
        reason: '',
      },
    };
  },
  methods: {
    async submitTimeOff() {
      try {
        const result = await EmployeeTimeOffService.submitTimeOff(this.form);
        console.log('Success:', result.data);
      } catch (err) {
        console.log('Error submitting request: ', err);
      }
    },
  },
};
</script>

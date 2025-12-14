<template>
  <div class="flex flex-col gap-4">
    <div
      v-for="my in myRequests"
      :key="my.id || my._id"
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl px-6 py-4 shadow-sm hover:shadow-md transition"
    >
      <div class="flex flex-col">
        <h2 class="text-black font-semibold text-lg">
          {{ formatDateRange(my.startDate, my.endDate) }}
        </h2>

        <span class="text-gray-700 text-sm"> {{ getDisplayRequestType(my) }} </span>

        <span v-if="my.reason" class="text-black-700 italic"> "{{ my.reason }}" </span>
      </div>

      <div class="flex gap-3 mt-3 sm:mt-0">
        <button
          class="bg-gradient-to-r from-purple-500 to-indigo-400 text-white font-medium px-5 py-1.5 rounded-full text-sm shadow-sm hover:opacity-90 transition"
        >
          {{ my.status }}
        </button>
      </div>
    </div>

    <div v-if="myRequests.length === 0" class="text-center py-8 text-gray-500 font-medium">
      No requests found.
    </div>
  </div>
</template>

<script>
export default {
  name: 'RequestPanels',
  props: {
    myRequests: Array,
  },
  methods: {
    formatDateRange(startDate, endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const month = start.toLocaleString('en-US', { month: 'long' });
      const startDay = start.getDate();
      const endDay = end.getDate();
      const year = start.getFullYear();

      return `${month} ${startDay}-${endDay}, ${year}`;
    },
    getDisplayRequestType(my) {
      return `${this.formatRequestType(my.type)} | Submitted ${this.formatDateSubmited(my.createdAt)}`;
    },

    formatRequestType(type) {
      if (!type) return 'Personal';
      const lookup = {
        personal: 'Personal',
        vacation: 'Vacation',
        sick: 'Sick',
        emergency: 'Emergency',
      };
      return lookup[type] || type;
    },

    formatDateSubmited(createdAt) {
      const date = new Date(createdAt);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    },
  },
};
</script>

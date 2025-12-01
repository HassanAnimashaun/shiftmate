<template>
  <div class="flex flex-col gap-4">
    <div
      v-for="req in request"
      :key="req.id || req._id"
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl px-6 py-4 shadow-sm hover:shadow-md transition"
    >
      <h2 class="text-black font-semibold text-lg">
        {{ req.employee?.name || 'Unknown Employee' }}
      </h2>

      <span class="text-gray-700 text-sm">
        {{ req.type }} • {{ req.startDate }} → {{ req.endDate }}
      </span>

      <div class="flex gap-3 mt-3 sm:mt-0">
        <button
          @click="$emit('accept', req)"
          class="bg-gradient-to-r from-purple-500 to-indigo-400 text-white font-medium px-5 py-1.5 rounded-full text-sm shadow-sm hover:opacity-90 transition"
        >
          Accept
        </button>

        <button
          @click="$emit('deny', req)"
          class="bg-gradient-to-r from-purple-500 to-indigo-400 text-white font-medium px-5 py-1.5 rounded-full text-sm shadow-sm hover:opacity-90 transition"
        >
          Deny
        </button>
      </div>
    </div>

    <div v-if="request.length === 0" class="text-center py-8 text-gray-500 font-medium">
      No employees found.
    </div>
  </div>
</template>

<script>
export default {
  name: 'requestList',
  props: {
    request: Array,
  },
};
</script>

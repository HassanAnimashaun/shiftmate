<template>
  <div class="flex flex-wrap gap-2">
    <button
      @click="$emit('add-shift')"
      class="bg-gradient-to-r from-purple-500 to-indigo-400 text-white font-medium px-4 py-2 rounded-lg text-sm hover:opacity-90 transition"
    >
      + Add Shift
    </button>
    <button
      @click="$emit('copy-week')"
      class="bg-white border border-gray-300 text-gray-700 font-medium px-4 py-2 rounded-lg text-sm hover:bg-purple-50 transition"
    >
      📋 Copy Last Week
    </button>
    <button
      @click="$emit('bulk-assign')"
      class="bg-white border border-gray-300 text-gray-700 font-medium px-4 py-2 rounded-lg text-sm hover:bg-purple-50 transition"
    >
      👥 Bulk Assign
    </button>
    <button
      @click="$emit('manage-templates')"
      class="bg-white border border-gray-300 text-gray-500 font-medium px-4 py-2 rounded-lg text-sm hover:bg-purple-50 transition"
    >
      Manage Templates
    </button>
  </div>
</template>

<script>
export default {
  name: 'ScheduleToolbar',
  emits: ['add-shift', 'copy-week', 'bulk-assign', 'manage-templates'],
};
</script>

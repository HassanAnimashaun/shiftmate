<template>
  <div
    class="flex flex-col justify-center items-center bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl px-6 py-6 shadow-sm hover:shadow-md transition text-center"
  >
    <p class="text-3xl font-bold text-gray-800">{{ value }}</p>
    <p class="text-gray-700 font-medium">{{ label }}</p>
  </div>
</template>

<script>
export default {
  name: 'StatCard',
  props: {
    value: [String, Number],
    label: String,
  },
};
</script>

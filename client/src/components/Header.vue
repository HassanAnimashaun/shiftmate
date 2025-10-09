<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <header
    class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md flex justify-between item-center"
  >
    <h1 class="text-2xl font-semibold text-gray-700">ShiftMate</h1>
    <div class="flex">
      <button class="bg-purple-200 text-purple-700 px-3 py-1 rounded-lg text-sm">{{ name }}</button>
    </div>
  </header>
</template>

<script>
export default {
  data() {
    return {
      name: 'Name Here',
    };
  },
};
</script>

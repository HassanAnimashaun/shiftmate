<template>
  <div class="flex flex-wrap gap-2">
    <div v-if="loading" class="text-sm text-gray-400 py-2">Loading locations...</div>
    <button
      v-for="loc in locations"
      :key="loc._id"
      type="button"
      :class="[
        'px-4 py-2 rounded-lg text-sm font-medium border transition',
        modelValue === loc._id
          ? 'bg-gradient-to-r from-purple-500 to-indigo-400 text-white border-transparent shadow-sm'
          : 'bg-white text-gray-600 border-gray-300 hover:bg-purple-50 hover:border-purple-300',
      ]"
      @click="$emit('update:modelValue', loc._id)"
    >
      {{ loc.name }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'AdminLocationSelector',
  props: {
    locations: {
      type: Array,
      required: true,
    },
    modelValue: {
      type: String,
      default: '',
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
};
</script>

<template>
  <div class="w-64">
    <select
      class="w-full rounded-lg border px-3 py-2"
      :disabled="loading"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option disabled value="">{{ loading ? 'Loading locations...' : 'Select Location' }}</option>
      <option v-for="loc in locations" :key="loc._id" :value="loc._id">{{ loc.name }}</option>
    </select>
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
};
</script>

<template>
  <div
    :class="chipClasses"
    class="px-2 py-1 rounded-md text-xs font-medium cursor-pointer hover:opacity-80 transition"
    @click.stop="$emit('click')"
  >
    {{ label }}
  </div>
</template>

<script>
export default {
  name: 'ShiftChip',
  props: {
    shift: { type: Object, required: true },
  },
  emits: ['click'],
  computed: {
    label() {
      if (this.shift.status === 'cancelled') return 'Cancelled';
      return `${this.formatTime(this.shift.startTime)}–${this.formatTime(this.shift.endTime)}`;
    },
    chipClasses() {
      if (this.shift.status === 'cancelled') return 'bg-gray-100 text-gray-400 line-through';
      const map = {
        full: 'bg-purple-100 text-purple-800',
        early: 'bg-purple-100 text-purple-800',
        half: 'bg-amber-100 text-amber-800',
        custom: 'bg-blue-100 text-blue-800',
      };
      return map[this.shift.shiftLabel] || map.custom;
    },
  },
  methods: {
    formatTime(t) {
      if (!t) return '';
      const [h, m] = t.split(':');
      const hour = parseInt(h, 10);
      const suffix = hour >= 12 ? 'PM' : 'AM';
      const display = hour > 12 ? hour - 12 : hour || 12;
      return m === '00' ? `${display}${suffix}` : `${display}:${m}${suffix}`;
    },
  },
};
</script>

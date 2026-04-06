<template>
  <div class="flex items-center gap-2">
    <button
      @click="prevWeek"
      class="border border-gray-300 rounded-lg px-3 py-2 hover:bg-purple-50 transition"
    >
      ‹
    </button>
    <span class="text-sm font-medium text-gray-700 min-w-[180px] text-center">
      {{ formattedRange }}
    </span>
    <button
      @click="nextWeek"
      class="border border-gray-300 rounded-lg px-3 py-2 hover:bg-purple-50 transition"
    >
      ›
    </button>
    <button @click="goToday" class="text-sm text-purple-600 hover:underline ml-2">Today</button>
  </div>
</template>

<script>
export default {
  name: 'WeekNavigator',
  props: {
    weekStart: { type: String, required: true },
  },
  emits: ['change'],
  computed: {
    formattedRange() {
      const start = new Date(this.weekStart + 'T00:00:00');
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const opts = { month: 'short', day: 'numeric' };
      const startStr = start.toLocaleDateString('en-US', opts);
      const endStr = end.toLocaleDateString('en-US', { ...opts, year: 'numeric' });
      return `${startStr} – ${endStr}`;
    },
  },
  methods: {
    toLocalDateStr(date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    },
    prevWeek() {
      const d = new Date(this.weekStart + 'T00:00:00');
      d.setDate(d.getDate() - 7);
      this.$emit('change', this.toLocalDateStr(d));
    },
    nextWeek() {
      const d = new Date(this.weekStart + 'T00:00:00');
      d.setDate(d.getDate() + 7);
      this.$emit('change', this.toLocalDateStr(d));
    },
    goToday() {
      const now = new Date();
      const day = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((day + 6) % 7));
      this.$emit('change', this.toLocalDateStr(monday));
    },
  },
};
</script>

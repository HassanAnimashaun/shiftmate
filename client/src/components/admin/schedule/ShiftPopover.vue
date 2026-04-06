<template>
  <div class="fixed inset-0 z-40" @click.self="$emit('close')">
    <div
      class="absolute z-50 w-52 rounded-xl bg-white shadow-xl border border-gray-100 overflow-hidden"
      :style="positionStyle"
    >
      <!-- Shift summary -->
      <div class="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ shift.date }}</p>
        <p class="text-sm font-bold text-gray-800 mt-0.5">
          {{ formatTime(shift.startTime) }} – {{ formatTime(shift.endTime) }}
        </p>
        <p class="text-xs text-gray-500 mt-0.5 capitalize">{{ shift.shiftLabel }} · {{ shift.scheduledHours }}h</p>
      </div>

      <!-- Actions -->
      <div class="py-1">
        <button
          class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition flex items-center gap-2"
          @click="$emit('edit', shift)"
        >
          ✏️ Edit shift
        </button>
        <button
          class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition flex items-center gap-2"
          @click="$emit('duplicate', shift)"
        >
          📋 Duplicate
        </button>
        <button
          v-if="shift.status !== 'cancelled'"
          class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition flex items-center gap-2"
          @click="$emit('mark-status', shift, 'cancelled')"
        >
          🚫 Cancel shift
        </button>
        <button
          v-if="shift.status === 'scheduled'"
          class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition flex items-center gap-2"
          @click="$emit('mark-status', shift, 'completed')"
        >
          ✅ Mark completed
        </button>
        <div class="border-t border-gray-100 mt-1 pt-1">
          <button
            class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2"
            @click="$emit('delete', shift)"
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ShiftPopover',
  props: {
    shift: { type: Object, required: true },
    anchor: { type: Object, default: null }, // { x, y } from click event
  },
  emits: ['close', 'edit', 'duplicate', 'delete', 'mark-status'],
  computed: {
    positionStyle() {
      if (!this.anchor) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
      const x = Math.min(this.anchor.x, window.innerWidth - 220);
      const y = Math.min(this.anchor.y + 8, window.innerHeight - 260);
      return { top: `${y}px`, left: `${x}px` };
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

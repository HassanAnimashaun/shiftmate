<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs px-4">
    <div class="relative w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">
      <button
        type="button"
        class="absolute right-4 top-4 text-gray-400 transition hover:text-gray-600"
        @click="$emit('close')"
      >
        ✕
      </button>

      <h2 class="mb-1 text-2xl font-semibold text-gray-800">Copy Week</h2>
      <p class="text-sm text-gray-500 mb-6">
        {{ sourceLabel }} → {{ targetLabel }}
      </p>

      <div v-if="loading" class="text-sm text-gray-500 py-6 text-center">Loading preview...</div>
      <div v-else-if="error" class="text-sm text-red-600 py-4">{{ error }}</div>
      <div v-else>
        <!-- Conflict badge -->
        <div v-if="conflicts.length === 0" class="mb-4 rounded-lg border bg-green-50 border-green-200 text-green-800 px-4 py-2 text-sm font-medium">
          No conflicts
        </div>
        <div v-else class="mb-4 space-y-2">
          <p class="text-xs font-semibold text-amber-700 uppercase tracking-wide">Skipped — Approved Time Off</p>
          <div
            v-for="(c, i) in conflicts"
            :key="i"
            class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900"
          >
            <span class="font-semibold">{{ c.employeeName }}</span> has been approved for
            <span class="font-semibold">{{ c.ptoType }}</span> and cannot be scheduled for the week of {{ targetLabel }}.
          </div>
        </div>

        <!-- Preview list -->
        <div class="max-h-60 overflow-y-auto space-y-1 mb-6">
          <div
            v-for="(shift, i) in preview"
            :key="i"
            class="flex justify-between text-xs text-gray-700 bg-gray-50 rounded-lg px-3 py-2"
          >
            <span>{{ shift.date }}</span>
            <span>{{ shift.startTime }}–{{ shift.endTime }}</span>
          </div>
          <p v-if="preview.length === 0" class="text-sm text-gray-400 text-center py-4">
            No shifts to copy.
          </p>
        </div>

        <p v-if="saveError" class="text-sm text-red-600 mb-3">{{ saveError }}</p>

        <div class="flex justify-end gap-3">
          <button
            type="button"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            type="button"
            :disabled="publishing || preview.length === 0"
            class="rounded-lg bg-gradient-to-r from-purple-500 to-indigo-400 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
            @click="publish"
          >
            {{ publishing ? 'Publishing...' : `Publish ${preview.length} shift(s)` }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import adminScheduleService from '@/services/admin/adminScheduleService';

export default {
  name: 'CopyWeekModal',
  props: {
    currentWeekStart: { type: String, required: true },
  },
  emits: ['close', 'copied'],
  data() {
    return {
      preview: [],
      conflicts: [],
      loading: false,
      publishing: false,
      error: '',
      saveError: '',
    };
  },
  computed: {
    sourceWeek() {
      const d = new Date(this.currentWeekStart + 'T00:00:00');
      d.setDate(d.getDate() - 7);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    },
    targetWeek() {
      return this.currentWeekStart;
    },
    sourceLabel() {
      return this.formatWeekRange(this.sourceWeek);
    },
    targetLabel() {
      return this.formatWeekRange(this.targetWeek);
    },
  },
  async mounted() {
    await this.loadPreview();
  },
  methods: {
    formatWeekRange(weekStart) {
      const start = new Date(weekStart + 'T00:00:00');
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const opts = { month: 'short', day: 'numeric' };
      return `${start.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', opts)}`;
    },
    async loadPreview() {
      this.loading = true;
      this.error = '';
      try {
        const res = await adminScheduleService.copyWeek(this.sourceWeek, this.targetWeek, false);
        this.preview = res.data.preview || [];
        this.conflicts = res.data.conflicts || [];
      } catch (err) {
        this.error = err.response?.data?.msg || 'Failed to load preview';
      } finally {
        this.loading = false;
      }
    },
    async publish() {
      this.publishing = true;
      this.saveError = '';
      try {
        await adminScheduleService.copyWeek(this.sourceWeek, this.targetWeek, true);
        this.$emit('copied');
      } catch (err) {
        this.saveError = err.response?.data?.msg || 'Failed to publish shifts';
      } finally {
        this.publishing = false;
      }
    },
  },
};
</script>

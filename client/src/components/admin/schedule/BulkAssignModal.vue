<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs px-4">
    <div class="relative w-full max-w-xl rounded-2xl bg-white p-8 shadow-xl max-h-[90vh] overflow-y-auto">
      <button
        type="button"
        class="absolute right-4 top-4 text-gray-400 transition hover:text-gray-600"
        @click="$emit('close')"
      >
        ✕
      </button>

      <h2 class="mb-6 text-2xl font-semibold text-gray-800">Bulk Assign Shifts</h2>

      <!-- Employee checklist -->
      <div class="mb-5">
        <label class="mb-2 block text-sm font-medium text-gray-700">Employees</label>
        <div class="border border-gray-200 rounded-lg max-h-40 overflow-y-auto divide-y divide-gray-100">
          <label
            v-for="emp in employees"
            :key="emp.id || emp._id"
            class="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              :value="emp.id || emp._id"
              v-model="selectedStaffIds"
              class="accent-purple-500"
            />
            <div
              class="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0"
            >
              {{ getInitials(emp.name) }}
            </div>
            <span class="text-sm text-gray-700">{{ emp.name }}</span>
          </label>
        </div>
        <button
          type="button"
          class="mt-1 text-xs text-purple-600 hover:underline"
          @click="toggleAll"
        >
          {{ selectedStaffIds.length === employees.length ? 'Deselect all' : 'Select all' }}
        </button>
      </div>

      <!-- Template selector -->
      <div class="mb-5">
        <label class="mb-2 block text-sm font-medium text-gray-700">Shift Template</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tmpl in templates"
            :key="tmpl.id"
            type="button"
            :class="[
              'px-3 py-2 rounded-lg text-xs font-medium border transition',
              selectedTemplateId === tmpl.id
                ? 'bg-purple-500 text-white border-purple-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-purple-50',
            ]"
            @click="selectedTemplateId = tmpl.id"
          >
            <span class="font-semibold">{{ tmpl.name }}</span>
            <span class="ml-1 text-opacity-80">{{ tmpl.startTime }}–{{ tmpl.endTime }}</span>
          </button>
        </div>
      </div>

      <!-- Location -->
      <div class="mb-5">
        <label class="mb-2 block text-sm font-medium text-gray-700">Location</label>
        <select
          v-model="selectedLocationId"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option disabled value="">Select location</option>
          <option v-for="loc in locations" :key="loc._id || loc.id" :value="loc._id || loc.id">
            {{ loc.name }}
          </option>
        </select>
      </div>

      <!-- Day pills -->
      <div class="mb-6">
        <label class="mb-2 block text-sm font-medium text-gray-700">Days (this week)</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="day in weekDays"
            :key="day.date"
            type="button"
            :class="[
              'px-3 py-1.5 rounded-full text-xs font-medium border transition',
              selectedDates.includes(day.date)
                ? 'bg-purple-500 text-white border-purple-500'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-purple-50',
            ]"
            @click="toggleDay(day.date)"
          >
            {{ day.label }}<span class="ml-1 opacity-70">{{ day.shortDate }}</span>
          </button>
        </div>
      </div>

      <!-- Summary -->
      <div class="mb-4 rounded-lg bg-purple-50 px-4 py-3 text-sm text-purple-800">
        {{ shiftCount }} shift(s) will be created
        ({{ selectedStaffIds.length }} employees × {{ selectedDates.length }} days)
      </div>

      <!-- Conflict alerts -->
      <div v-if="conflicts.length" class="mb-4 space-y-2">
        <p class="text-xs font-semibold text-amber-700 uppercase tracking-wide">Skipped — Approved Time Off</p>
        <div
          v-for="(c, i) in conflicts"
          :key="i"
          class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900"
        >
          <span class="font-semibold">{{ c.employeeName }}</span> has been approved for
          <span class="font-semibold">{{ c.ptoType }}</span> and cannot be scheduled for the week of {{ weekLabel }}.
        </div>
      </div>

      <p v-if="error" class="text-sm text-red-600 mb-3">{{ error }}</p>

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
          :disabled="saving || shiftCount === 0 || !selectedTemplateId || !selectedLocationId"
          class="rounded-lg bg-gradient-to-r from-purple-500 to-indigo-400 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
          @click="handleAssign"
        >
          {{ saving ? 'Creating...' : `Create ${shiftCount} shift(s)` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import adminScheduleService from '@/services/admin/adminScheduleService';

export default {
  name: 'BulkAssignModal',
  props: {
    employees: { type: Array, required: true },
    locations: { type: Array, required: true },
    templates: { type: Array, required: true },
    weekStart: { type: String, required: true },
  },
  emits: ['close', 'assigned'],
  data() {
    return {
      selectedStaffIds: [],
      selectedTemplateId: null,
      selectedLocationId: '',
      selectedDates: [],
      saving: false,
      error: '',
      conflicts: [],
    };
  },
  computed: {
    weekLabel() {
      const start = new Date(this.weekStart + 'T00:00:00');
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const opts = { month: 'short', day: 'numeric' };
      return `${start.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`;
    },
    weekDays() {
      const days = [];
      const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      for (let i = 0; i < 7; i++) {
        const d = new Date(this.weekStart + 'T00:00:00');
        d.setDate(d.getDate() + i);
        const y = d.getFullYear();
        const mo = String(d.getMonth() + 1).padStart(2, '0');
        const dy = String(d.getDate()).padStart(2, '0');
        const dateStr = `${y}-${mo}-${dy}`;
        days.push({
          label: labels[i],
          date: dateStr,
          shortDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        });
      }
      return days;
    },
    shiftCount() {
      return this.selectedStaffIds.length * this.selectedDates.length;
    },
  },
  mounted() {
    // Default Mon–Fri selected
    this.selectedDates = this.weekDays.slice(0, 5).map((d) => d.date);
  },
  methods: {
    getInitials(name) {
      if (!name) return '?';
      return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    },
    toggleAll() {
      if (this.selectedStaffIds.length === this.employees.length) {
        this.selectedStaffIds = [];
      } else {
        this.selectedStaffIds = this.employees.map((e) => e.id || e._id);
      }
    },
    toggleDay(date) {
      const idx = this.selectedDates.indexOf(date);
      if (idx === -1) {
        this.selectedDates.push(date);
      } else {
        this.selectedDates.splice(idx, 1);
      }
    },
    async handleAssign() {
      this.saving = true;
      this.error = '';
      this.conflicts = [];
      try {
        const res = await adminScheduleService.bulkAssign({
          staffIds: this.selectedStaffIds,
          templateId: this.selectedTemplateId,
          locationId: this.selectedLocationId,
          dates: this.selectedDates,
        });
        this.conflicts = res.data.conflicts || [];
        if (res.data.inserted > 0) {
          this.$emit('assigned');
        }
      } catch (err) {
        this.error = err.response?.data?.msg || 'Failed to assign shifts';
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>

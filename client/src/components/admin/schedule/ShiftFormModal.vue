<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs px-4">
    <div class="relative w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl max-h-[90vh] overflow-y-auto">
      <button
        type="button"
        class="absolute right-4 top-4 text-gray-400 transition hover:text-gray-600"
        @click="$emit('close')"
      >
        ✕
      </button>

      <h2 class="mb-6 text-2xl font-semibold text-gray-800">
        {{ shift?.id ? 'Edit Shift' : 'Add Shift' }}
      </h2>

      <!-- PTO conflict warning -->
      <div
        v-if="conflict"
        class="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 font-medium"
      >
        🚫 This employee has approved time off on this date. Scheduling is blocked.
      </div>

      <!-- Location conflict warning -->
      <div
        v-if="locationConflict"
        class="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 font-medium"
      >
        🚫 {{ locationConflict }}
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Employee -->
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700">Employee</label>
          <select
            v-model="form.staffId"
            required
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            @change="checkConflict"
          >
            <option disabled value="">Select employee</option>
            <option
              v-for="emp in employees"
              :key="emp.id || emp._id"
              :value="emp.id || emp._id"
            >
              {{ emp.name }}
            </option>
          </select>
        </div>

        <!-- Location -->
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700">Location</label>
          <select
            v-model="form.locationId"
            required
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            @change="checkConflict"
          >
            <option disabled value="">Select location</option>
            <option v-for="loc in locations" :key="loc._id || loc.id" :value="loc._id || loc.id">
              {{ loc.name }}
            </option>
          </select>
        </div>

        <!-- Date -->
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700">Date</label>
          <input
            v-model="form.date"
            type="date"
            required
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            @change="checkConflict"
          />
        </div>

        <!-- Shift Templates -->
        <div v-if="templates.length">
          <label class="mb-2 block text-sm font-medium text-gray-700">Shift Template</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="tmpl in templates"
              :key="tmpl.id"
              type="button"
              :class="[
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition',
                form.templateId === tmpl.id
                  ? 'bg-purple-500 text-white border-purple-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-purple-50',
              ]"
              @click="applyTemplate(tmpl)"
            >
              {{ tmpl.name }} ({{ tmpl.startTime }}–{{ tmpl.endTime }})
            </button>
          </div>
        </div>

        <!-- Start / End Time -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">Start Time</label>
            <input
              v-model="form.startTime"
              type="time"
              required
              class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              @change="checkConflict"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">End Time</label>
            <input
              v-model="form.endTime"
              type="time"
              required
              class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              @change="checkConflict"
            />
          </div>
        </div>

        <!-- Notes -->
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700">Notes</label>
          <input
            v-model="form.notes"
            type="text"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Optional notes"
          />
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <div class="flex justify-between gap-3 pt-2">
          <button
            v-if="shift?.id"
            type="button"
            class="rounded-lg border border-red-300 text-red-600 px-4 py-2 text-sm font-medium hover:bg-red-50 transition"
            :disabled="saving"
            @click="handleDelete"
          >
            Delete
          </button>
          <div class="flex gap-3 ml-auto">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
              @click="$emit('close')"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="saving || conflict || !!locationConflict"
              class="rounded-lg bg-gradient-to-r from-purple-500 to-indigo-400 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ saving ? 'Saving...' : shift?.id ? 'Update' : 'Save' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import adminScheduleService from '@/services/admin/adminScheduleService';

const DEFAULT_FORM = {
  staffId: '',
  locationId: '',
  date: '',
  startTime: '',
  endTime: '',
  notes: '',
  templateId: null,
  shiftLabel: 'custom',
};

export default {
  name: 'ShiftFormModal',
  props: {
    shift: { type: Object, default: null },
    employees: { type: Array, required: true },
    locations: { type: Array, required: true },
    templates: { type: Array, default: () => [] },
    selectedLocationId: { type: String, default: '' },
  },
  emits: ['close', 'saved'],
  data() {
    return {
      form: { ...DEFAULT_FORM },
      conflict: false,
      locationConflict: '',
      saving: false,
      error: '',
    };
  },
  watch: {
    shift: {
      handler(val) {
        if (val) {
          this.form = {
            staffId: val.staffId || '',
            locationId: val.locationId || '',
            date: val.date || '',
            startTime: val.startTime || '',
            endTime: val.endTime || '',
            notes: val.notes || '',
            templateId: val.templateId || null,
            shiftLabel: val.shiftLabel || 'custom',
          };
        } else {
          this.form = { ...DEFAULT_FORM, locationId: this.selectedLocationId };
        }
        this.conflict = false;
        this.locationConflict = '';
        this.error = '';
      },
      immediate: true,
    },
  },
  methods: {
    applyTemplate(tmpl) {
      this.form.startTime = tmpl.startTime;
      this.form.endTime = tmpl.endTime;
      this.form.shiftLabel = tmpl.shiftLabel || 'custom';
      this.form.templateId = tmpl.id;
      this.checkConflict();
    },
    async checkConflict() {
      const { staffId, date, startTime, endTime, locationId } = this.form;

      // PTO check
      if (staffId && date) {
        try {
          const res = await adminScheduleService.checkConflicts(staffId, date);
          this.conflict = res.data.conflict;
        } catch {
          this.conflict = false;
        }
      }

      // Location / overlap / gap check
      if (staffId && date && startTime && endTime && locationId) {
        try {
          const excludeId = this.shift?.id || null;
          const res = await adminScheduleService.checkLocationConflicts(
            staffId, date, startTime, endTime, locationId, excludeId
          );
          this.locationConflict = res.data.conflict ? res.data.detail.msg : '';
        } catch {
          this.locationConflict = '';
        }
      } else {
        this.locationConflict = '';
      }
    },
    async handleSubmit() {
      this.saving = true;
      this.error = '';
      try {
        const payload = { ...this.form };
        if (this.shift?.id) {
          await adminScheduleService.updateShift(this.shift.id, payload);
        } else {
          await adminScheduleService.createShift(payload);
        }
        this.$emit('saved');
      } catch (err) {
        this.error = err.response?.data?.msg || 'Failed to save shift';
      } finally {
        this.saving = false;
      }
    },
    async handleDelete() {
      if (!this.shift) return;
      this.saving = true;
      this.error = '';
      try {
        await adminScheduleService.deleteShift(this.shift.id);
        this.$emit('saved');
      } catch (err) {
        this.error = err.response?.data?.msg || 'Failed to delete shift';
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>

<template>
  <div class="p-6 bg-white rounded-2xl shadow-md flex-1">
    <!-- Header -->
    <div class="flex flex-col items-start mb-3 gap-3">
      <h2 class="text-2xl font-semibold text-gray-800">Weekly Schedule</h2>
      <div class="flex flex-col sm:flex-row gap-3 w-full">
        <LocationSelector
          :locations="locations"
          v-model="selectedLocationId"
        />
        <WeekNavigator :weekStart="currentWeekStart" @change="handleWeekChange" />
      </div>
      <ScheduleToolbar
        @add-shift="openAddShift"
        @copy-week="showCopyWeekModal = true"
        @bulk-assign="showBulkAssignModal = true"
        @manage-templates="showTemplateManager = true"
      />
    </div>

    <p v-if="error" class="text-sm text-red-600 mb-3">{{ error }}</p>

    <!-- No location selected -->
    <div
      v-else-if="!selectedLocationId"
      class="flex flex-col items-center justify-center py-16 text-gray-400"
    >
      <p class="text-lg font-medium">Please select a location</p>
      <p class="text-sm mt-1">Choose a location above to view the weekly schedule.</p>
    </div>

    <!-- Grid -->
    <template v-else>
      <ScheduleGrid
        :employees="filteredEmployees"
        :shifts="shifts"
        :weekStart="currentWeekStart"
        @click-shift="openPopover"
        @click-empty="openAddShiftForCell"
      />
      <ScheduleStats :shifts="shifts" :employees="filteredEmployees" />
    </template>

    <!-- Shift popover -->
    <ShiftPopover
      v-if="popoverShift"
      :shift="popoverShift"
      :anchor="popoverAnchor"
      @close="popoverShift = null"
      @edit="handlePopoverEdit"
      @duplicate="handlePopoverDuplicate"
      @delete="handlePopoverDelete"
      @mark-status="handlePopoverMarkStatus"
    />

    <!-- Modals -->
    <ShiftFormModal
      v-if="showShiftForm"
      :shift="selectedShift"
      :employees="employees"
      :locations="locations"
      :templates="templates"
      :selectedLocationId="selectedLocationId"
      @close="closeShiftForm"
      @saved="handleShiftSaved"
    />

    <CopyWeekModal
      v-if="showCopyWeekModal"
      :currentWeekStart="currentWeekStart"
      @close="showCopyWeekModal = false"
      @copied="handleWeekCopied"
    />

    <BulkAssignModal
      v-if="showBulkAssignModal"
      :employees="employees"
      :locations="locations"
      :templates="templates"
      :weekStart="currentWeekStart"
      @close="showBulkAssignModal = false"
      @assigned="handleBulkAssigned"
    />

    <TemplateManager
      v-if="showTemplateManager"
      :templates="templates"
      @close="showTemplateManager = false"
      @updated="fetchTemplates"
    />
  </div>
</template>

<script>
import adminScheduleService from '@/services/admin/adminScheduleService';
import adminStaffService from '@/services/admin/adminStaffService';
import LocationSelector from './LocationSelector.vue';
import WeekNavigator from './WeekNavigator.vue';
import ScheduleToolbar from './ScheduleToolbar.vue';
import ScheduleGrid from './ScheduleGrid.vue';
import ScheduleStats from './ScheduleStats.vue';
import ShiftFormModal from './ShiftFormModal.vue';
import ShiftPopover from './ShiftPopover.vue';
import CopyWeekModal from './CopyWeekModal.vue';
import BulkAssignModal from './BulkAssignModal.vue';
import TemplateManager from './TemplateManager.vue';

function toLocalDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getCurrentMonday() {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  return toLocalDateStr(monday);
}

export default {
  name: 'ScheduleView',
  components: {
    LocationSelector,
    WeekNavigator,
    ScheduleToolbar,
    ScheduleGrid,
    ScheduleStats,
    ShiftFormModal,
    ShiftPopover,
    CopyWeekModal,
    BulkAssignModal,
    TemplateManager,
  },
  data() {
    return {
      locations: [],
      selectedLocationId: localStorage.getItem('schedule:locationId') || '',
      employees: [],
      shifts: [],
      templates: [],
      currentWeekStart: getCurrentMonday(),
      loading: false,
      error: '',
      // Modal states
      showShiftForm: false,
      showCopyWeekModal: false,
      showBulkAssignModal: false,
      showTemplateManager: false,
      selectedShift: null,
      popoverShift: null,
      popoverAnchor: null,
    };
  },
  computed: {
    filteredEmployees() {
      if (this.shifts.length === 0) return this.employees;
      const staffIds = new Set(this.shifts.map((s) => s.staffId));
      const filtered = this.employees.filter((e) => staffIds.has(e.id || e._id));
      return filtered.length > 0 ? filtered : this.employees;
    },
  },
  watch: {
    selectedLocationId(id) {
      localStorage.setItem('schedule:locationId', id);
      this.fetchSchedule();
    },
    currentWeekStart() {
      this.fetchSchedule();
    },
  },
  async mounted() {
    await Promise.all([this.fetchLocations(), this.fetchEmployees(), this.fetchTemplates()]);
    await this.fetchSchedule();
  },
  methods: {
    async fetchLocations() {
      try {
        const res = await adminScheduleService.getAllLocations();
        this.locations = Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.error('Failed to load locations:', err);
      }
    },
    async fetchEmployees() {
      try {
        const res = await adminStaffService.getAllStaff();
        this.employees = Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.error('Failed to load employees:', err);
      }
    },
    async fetchTemplates() {
      try {
        const res = await adminScheduleService.getTemplates();
        this.templates = Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.error('Failed to load templates:', err);
      }
    },
    async fetchSchedule() {
      this.loading = true;
      this.error = '';
      try {
        const res = await adminScheduleService.getWeekSchedule(
          this.currentWeekStart,
          this.selectedLocationId,
        );
        this.shifts = Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.error('Failed to load schedule:', err);
        this.error = err.response?.data?.msg || 'Failed to load schedule';
        this.shifts = [];
      } finally {
        this.loading = false;
      }
    },
    handleWeekChange(newWeekStart) {
      this.currentWeekStart = newWeekStart;
    },
    openAddShift() {
      this.selectedShift = null;
      this.showShiftForm = true;
    },
    openAddShiftForCell({ staffId, date }) {
      this.selectedShift = { staffId, date, locationId: this.selectedLocationId };
      this.showShiftForm = true;
    },
    openEditShift(shift) {
      this.selectedShift = shift;
      this.showShiftForm = true;
    },
    closeShiftForm() {
      this.showShiftForm = false;
      this.selectedShift = null;
    },
    async handleShiftSaved() {
      this.closeShiftForm();
      await this.fetchSchedule();
    },
    async handleWeekCopied() {
      this.showCopyWeekModal = false;
      await this.fetchSchedule();
    },
    async handleBulkAssigned() {
      this.showBulkAssignModal = false;
      await this.fetchSchedule();
    },
    openPopover(shift, event) {
      this.popoverShift = shift;
      this.popoverAnchor = { x: event.clientX, y: event.clientY };
    },
    handlePopoverEdit(shift) {
      this.popoverShift = null;
      this.openEditShift(shift);
    },
    handlePopoverDuplicate(shift) {
      this.popoverShift = null;
      const { staffId, locationId, date, startTime, endTime, shiftLabel, templateId, notes } = shift;
      this.selectedShift = { staffId, locationId, date, startTime, endTime, shiftLabel, templateId, notes };
      this.showShiftForm = true;
    },
    async handlePopoverDelete(shift) {
      this.popoverShift = null;
      try {
        await adminScheduleService.deleteShift(shift.id);
        await this.fetchSchedule();
      } catch (err) {
        console.error('Failed to delete shift', err);
      }
    },
    async handlePopoverMarkStatus(shift, status) {
      this.popoverShift = null;
      try {
        await adminScheduleService.updateShift(shift.id, { status });
        await this.fetchSchedule();
      } catch (err) {
        console.error('Failed to update shift status', err);
      }
    },
  },
};
</script>

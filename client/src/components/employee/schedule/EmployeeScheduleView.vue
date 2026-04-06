<template>
  <div class="p-6 bg-white rounded-2xl shadow-md flex-1">
    <div class="flex flex-col items-start mb-4 gap-3">
      <h2 class="text-2xl font-semibold text-gray-800">My Schedule</h2>
      <WeekNavigator :weekStart="currentWeekStart" @change="handleWeekChange" />
    </div>

    <p v-if="error" class="text-sm text-red-600 mb-3">{{ error }}</p>

    <!-- Empty state -->
    <div
      v-else-if="!loading && weekDays.every(d => getShiftsFor(d.date).length === 0)"
      class="flex flex-col items-center justify-center py-16 text-gray-400"
    >
      <p class="text-lg font-medium">No shifts this week</p>
      <p class="text-sm mt-1">Check back later or contact your manager.</p>
    </div>

    <!-- Week cards -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      <div
        v-for="day in weekDays"
        :key="day.date"
        :class="[
          'rounded-xl border p-4',
          day.isToday ? 'border-purple-300 bg-purple-50' : 'border-gray-200 bg-gray-50',
          getShiftsFor(day.date).length === 0 ? 'opacity-50' : '',
        ]"
      >
        <p
          :class="['text-xs font-semibold uppercase tracking-wide mb-2', day.isToday ? 'text-purple-600' : 'text-gray-500']"
        >
          {{ day.label }} <span class="font-normal normal-case">{{ day.shortDate }}</span>
        </p>

        <div v-if="getShiftsFor(day.date).length === 0" class="text-xs text-gray-400 italic">
          Day off
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="shift in getShiftsFor(day.date)"
            :key="shift.id"
            :class="[
              'rounded-lg px-3 py-2 text-sm',
              shiftCardClass(shift),
            ]"
          >
            <p class="font-semibold">{{ formatTime(shift.startTime) }} – {{ formatTime(shift.endTime) }}</p>
            <p class="text-xs mt-0.5 opacity-80">{{ shift.locationName }}</p>
            <p class="text-xs mt-0.5 opacity-70">{{ shift.scheduledHours }}h &middot; {{ shift.shiftLabel }}</p>
            <span
              v-if="shift.status !== 'scheduled'"
              class="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full"
              :class="statusBadgeClass(shift.status)"
            >
              {{ shift.status }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Weekly summary -->
    <div v-if="shifts.length" class="grid grid-cols-2 md:grid-cols-3 gap-3 mt-5">
      <div class="bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl px-4 py-4 text-center">
        <p class="text-2xl font-bold text-gray-800">{{ totalHours }}</p>
        <p class="text-gray-700 text-sm font-medium">Hours This Week</p>
      </div>
      <div class="bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl px-4 py-4 text-center">
        <p class="text-2xl font-bold text-gray-800">{{ shifts.length }}</p>
        <p class="text-gray-700 text-sm font-medium">Shifts</p>
      </div>
      <div class="bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl px-4 py-4 text-center">
        <p class="text-2xl font-bold text-gray-800">{{ uniqueLocations }}</p>
        <p class="text-gray-700 text-sm font-medium">Location(s)</p>
      </div>
    </div>
  </div>
</template>

<script>
import employeeScheduleService from '@/services/employee/employeeScheduleService';
import WeekNavigator from '@/components/admin/schedule/WeekNavigator.vue';

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
  name: 'EmployeeScheduleView',
  components: { WeekNavigator },
  data() {
    return {
      shifts: [],
      currentWeekStart: getCurrentMonday(),
      loading: false,
      error: '',
    };
  },
  computed: {
    weekDays() {
      const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const today = toLocalDateStr(new Date());
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(this.currentWeekStart + 'T00:00:00');
        d.setDate(d.getDate() + i);
        const dateStr = toLocalDateStr(d);
        return {
          label: labels[i],
          date: dateStr,
          shortDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          isToday: dateStr === today,
        };
      });
    },
    totalHours() {
      const total = this.shifts
        .filter(s => s.status !== 'cancelled')
        .reduce((sum, s) => sum + (s.scheduledHours || 0), 0);
      return total % 1 === 0 ? total : total.toFixed(2);
    },
    uniqueLocations() {
      return new Set(this.shifts.map(s => s.locationName)).size;
    },
  },
  watch: {
    currentWeekStart() {
      this.fetchSchedule();
    },
  },
  async mounted() {
    await this.fetchSchedule();
  },
  methods: {
    async fetchSchedule() {
      this.error = '';
      try {
        const res = await employeeScheduleService.getMySchedule(this.currentWeekStart);
        this.shifts = Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.error('Failed to load schedule:', err);
        this.error = err.response?.data?.msg || 'Failed to load schedule';
        this.shifts = [];
      }
    },
    handleWeekChange(weekStart) {
      this.currentWeekStart = weekStart;
    },
    getShiftsFor(date) {
      return this.shifts.filter(s => s.date === date);
    },
    formatTime(t) {
      if (!t) return '';
      const [h, m] = t.split(':');
      const hour = parseInt(h, 10);
      const suffix = hour >= 12 ? 'PM' : 'AM';
      const display = hour > 12 ? hour - 12 : hour || 12;
      return m === '00' ? `${display}${suffix}` : `${display}:${m}${suffix}`;
    },
    shiftCardClass(shift) {
      if (shift.status === 'cancelled') return 'bg-gray-100 text-gray-400';
      const map = {
        full: 'bg-purple-100 text-purple-900',
        early: 'bg-purple-100 text-purple-900',
        half: 'bg-amber-100 text-amber-900',
        custom: 'bg-blue-100 text-blue-900',
      };
      return map[shift.shiftLabel] || map.custom;
    },
    statusBadgeClass(status) {
      const map = {
        completed: 'bg-green-100 text-green-700',
        missed: 'bg-red-100 text-red-700',
        cancelled: 'bg-gray-100 text-gray-500',
      };
      return map[status] || '';
    },
  },
};
</script>

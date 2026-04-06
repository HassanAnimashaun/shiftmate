<template>
  <div class="border border-gray-200 rounded-xl overflow-x-auto">
    <table class="w-full text-sm">
      <thead>
        <tr class="bg-purple-50">
          <th class="text-left px-3 py-2 text-purple-800 font-semibold text-xs min-w-[140px]">
            Employee
          </th>
          <th
            v-for="day in weekDays"
            :key="day.date"
            :class="{ 'bg-purple-100': day.isToday }"
            class="text-center px-2 py-2 text-purple-800 font-semibold text-xs min-w-[100px]"
          >
            {{ day.label }}
            <span class="block text-gray-400 font-normal">{{ day.shortDate }}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="emp in employees" :key="emp.id || emp._id" class="border-t border-gray-100">
          <td class="px-3 py-2">
            <div class="flex items-center gap-2">
              <div
                class="w-7 h-7 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0"
              >
                {{ getInitials(emp.name) }}
              </div>
              <div>
                <div class="font-semibold text-gray-800 text-xs">{{ emp.name }}</div>
                <div class="text-gray-400 text-xs">{{ emp.position }}</div>
              </div>
            </div>
          </td>
          <td
            v-for="day in weekDays"
            :key="day.date"
            :class="{ 'bg-purple-50': day.isToday }"
            class="px-1 py-2 text-center align-top cursor-pointer hover:bg-gray-50 transition"
            @click="handleCellClick(emp, day)"
          >
            <div class="flex flex-col gap-1">
              <ShiftChip
                v-for="shift in getShiftsFor(emp.id || emp._id, day.date)"
                :key="shift.id"
                :shift="shift"
                @click="(e) => $emit('click-shift', shift, e)"
              />
            </div>
          </td>
        </tr>
        <tr v-if="employees.length === 0">
          <td :colspan="8" class="text-center py-8 text-gray-400 text-sm">
            No employees found for this location.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import ShiftChip from './ShiftChip.vue';

export default {
  name: 'ScheduleGrid',
  components: { ShiftChip },
  props: {
    employees: { type: Array, required: true },
    shifts: { type: Array, required: true },
    weekStart: { type: String, required: true },
  },
  emits: ['click-shift', 'click-empty'],
  computed: {
    weekDays() {
      const days = [];
      const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const today = this.toLocalDateStr(new Date());
      for (let i = 0; i < 7; i++) {
        const d = new Date(this.weekStart + 'T00:00:00');
        d.setDate(d.getDate() + i);
        const dateStr = this.toLocalDateStr(d);
        days.push({
          label: labels[i],
          date: dateStr,
          shortDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          isToday: dateStr === today,
        });
      }
      return days;
    },
  },
  methods: {
    toLocalDateStr(date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    },
    getShiftsFor(staffId, date) {
      return this.shifts.filter(
        (s) => s.staffId === staffId && s.date === date,
      );
    },
    getInitials(name) {
      if (!name) return '?';
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    },
    handleCellClick(emp, day) {
      this.$emit('click-empty', { staffId: emp.id || emp._id, date: day.date });
    },
  },
};
</script>

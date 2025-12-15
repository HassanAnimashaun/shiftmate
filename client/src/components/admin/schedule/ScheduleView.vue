<template>
  <div class="p-6 bg-white rounded-2xl shadow-md flex-1">
    <div class="flex flex-col items-start mb-3 gap-3">
      <h2 class="text-2xl font-semibold text-gray-800">Weekly Schedule</h2>
      <LocationSelector :locations="locations" v-model="selectedLocationId" :loading="loading" />
      <p v-if="error" class="text-sm text-red-600">
        {{ error }}
      </p>
    </div>

    <!-- SCHEDULE GRID HERE -->
  </div>
</template>

<script>
import adminScheduleSerice from '@/services/admin/adminScheduleService';
import LocationSelector from './LocationSelector.vue';
export default {
  name: 'ScheduleView',
  components: { LocationSelector },
  data() {
    return {
      locations: [],
      selectedLocationId: '',
      name: '',
      loading: false,
      error: '',
    };
  },

  // GRAB STAFF AND SCHEDULE OF CURRENT LOCATION
  // watch: {
  //   selectedLocationId(id) {
  //     if (!id) return;
  //     this.fetchStaff();
  //     this.fetchSchedule();
  //   },
  // },

  async mounted() {
    await this.fetchLocations();
  },

  methods: {
    async fetchLocations() {
      try {
        this.loading = true;
        this.error = '';
        const res = await adminScheduleSerice.getAllLocations();
        this.locations = Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.error('Failed to load locations:', err);
        this.error = err.response?.data?.msg || 'Failed to load locations';
        this.employees = [];
      }
      this.loading = false;
    },
    // async fetchStaff() {},
    // async fetchSchedule() {},
  },
};
</script>

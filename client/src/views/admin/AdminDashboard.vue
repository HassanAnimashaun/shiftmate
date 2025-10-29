<template>
  <div class="min-h-screen md:flex flex-col">
    <DashHeader />

    <!-- BODY -->
    <div class="mx-auto w-full max-w-7xl flex flex-col md:flex-row gap-6">
      <!-- SIDEBAR -->
      <aside class="">
        <DashSidebar :active-tab="activeTab" @changeTab="setTab" />
      </aside>

      <!-- MAIN -->
      <div class="w-full">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import DashHeader from '@/components/Header.vue';
import DashSidebar from '@/components/Sidebar.vue';

export default {
  name: 'AdminDashboard',
  components: {
    DashHeader,
    DashSidebar,
  },
  data() {
    return {
      activeTab: 'dashboard',
    };
  },
  methods: {
    setTab(tab) {
      this.activeTab = tab;
      if (tab === 'employees' && this.$route.name !== 'employees') {
        this.$router.push('/dashboard/employees');
      }
    },
  },
};
</script>

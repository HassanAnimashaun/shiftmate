<template>
  <div class="grid grid-rows-[auto_1fr] p-6 gap-5">
    <!-- HEADER -->
    <DashHeader />
    <!-- MAIN  -->
    <main class="sidebar grid grid-cols-[250px_1fr] gap-6">
      <DashSidebar />
    </main>
  </div>
</template>

<script>
import DashHeader from '@/components/Header.vue';
import DashSidebar from '@/components/Sidebar.vue';

export default {
  name: 'AdminDashboard-page',
  components: {
    DashHeader,
    DashSidebar,
  },
};
</script>

<template>
  <div class="min-h-screen md:flex flex-col">
    <!-- HEADER -->
    <DashHeader />

    <!-- BODY -->
    <div class="mx-auto w-full max-w-7xl flex flex-col md:flex-row gap-6">
      <!-- SIDEBAR -->
      <aside class="">
        <DashSidebar />
      </aside>
    </div>
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

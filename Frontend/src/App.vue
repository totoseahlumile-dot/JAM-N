<script setup>
import { RouterView } from "vue-router";
import AppNavbar from "@/components/common/AppNavbar.vue";
</script>

<template>
  <div id="app">
    <AppNavbar />

    <main class="main-content">
      <RouterView />
    </main>

    <footer class="app-footer">
      <div class="footer-content">
        <div class="brand-info">
          <span class="footer-brand">JAM'N</span>
          <p class="footer-tagline">
            Promoting local South African music talent.
          </p>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2026 JAM'N. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
}
</style>

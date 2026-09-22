<script setup>
import { onMounted } from "vue";
import { RouterView } from "vue-router";
import AppNavbar from "@/components/common/AppNavbar.vue";
import AppFooter from "@/components/common/AppFooter.vue";
import AuthModal from "@/components/AuthModal.vue";
import { useAuth } from "@/composables/useAuth";

const { isGuest, token } = useAuth();

onMounted(() => {
  if (!token.value && localStorage.getItem("isGuest") === null) {
    localStorage.setItem("isGuest", "true");
    isGuest.value = true;
  }
});
</script>

<template>
  <div id="app-layout">
    <AppNavbar />

    <main class="main-content">
      <RouterView />
    </main>

    <AppFooter />

    <!-- Global Auth Modal mounted at root level -->
    <AuthModal />
  </div>
</template>

<style>
#app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1 0 auto;
}
</style>

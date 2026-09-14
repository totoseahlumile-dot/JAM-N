<script setup>
import { RouterLink, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import logoImg from "@/assets/logo.png";

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.setGuestMode();
  router.push("/login");
};
</script>

<template>
  <header class="navbar">
    <RouterLink to="/" class="brand-container">
      <img :src="logoImg" alt="JAM'N Logo" class="navbar-logo" />
      <span class="brand-title">JAM'N</span>
    </RouterLink>

    <nav class="nav-links">
      <template v-if="authStore.isAuthenticated.value">
        <span class="user-greeting"
          >Hi, {{ authStore.user.value?.name || "User" }}</span
        >
        <button class="btn-nav btn-logout" @click="handleLogout">Logout</button>
      </template>

      <template v-else>
        <RouterLink to="/login" class="btn-nav btn-primary">Sign in</RouterLink>
      </template>
    </nav>
  </header>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 2rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e3e8;
}

.brand-container {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
}

.navbar-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.brand-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #6b52a1;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.user-greeting {
  font-size: 0.85rem;
  font-weight: 600;
  color: #6b52a1;
}

.btn-nav {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 2.5rem;
  border-radius: 24px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: none !important;
  transition: opacity 0.2s ease;
}

.btn-nav:hover {
  opacity: 0.9;
}

.btn-primary {
  background-color: #ba93dc;
  color: #1d1e18 !important;
  border: none;
}

.btn-logout {
  background-color: transparent;
  border: 1px solid #d0d0d8;
  color: #333 !important;
  padding: 0.45rem 1.2rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.85rem;
}
</style>

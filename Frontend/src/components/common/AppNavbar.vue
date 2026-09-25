<template>
  <header class="navbar">
    <div class="navbar-container">
      <RouterLink to="/" class="brand-logo">
        <img src="@/assets/logo.png" alt="JAM'N Logo" class="brand-logo-img" />
        <span>JAM'N</span>
      </RouterLink>

      <nav class="nav-links">
        <RouterLink to="/discover" class="nav-item">Discover</RouterLink>
        <RouterLink to="/feed" class="nav-item">Feed</RouterLink>
        <RouterLink to="/library" class="nav-item">Library</RouterLink>
        <RouterLink to="/beat-store" class="nav-item">Beat Store</RouterLink>
        <RouterLink to="/events" class="nav-item">Events</RouterLink>
      </nav>

      <div class="user-action">
        <!-- Dynamic Subscription Upgrade / Plan Badge -->
        <RouterLink
          to="/subscription"
          class="nav-upgrade-badge"
          :class="`${currentPlan.id}-nav-badge`"
          :title="isFreePlan ? 'Upgrade your plan' : 'Manage your subscription'"
        >
          <span v-if="isFreePlan" class="upgrade-text">✦ Upgrade</span>
          <span v-else class="plan-badge-text">{{ currentPlan.name }}</span>
        </RouterLink>

        <!-- Settings gear -->
        <RouterLink
          to="/settings"
          class="settings-icon-btn"
          aria-label="Settings"
        >
          <svg class="settings-icon" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.32-.02-.63-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.44.17-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.31-.09.63-.09.94s.02.63.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
            />
          </svg>
        </RouterLink>

        <!-- Not logged in: show Login -->
        <RouterLink v-if="!isLoggedIn" to="/login" class="nav-item">
          Login
        </RouterLink>

        <!-- Logged in: show profile icon -->
        <RouterLink
          v-else
          to="/account"
          class="profile-icon-btn"
          aria-label="Account"
        >
          <svg class="user-avatar-icon" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-3.8-1.04-4.83-2.61.03-1.6 3.23-2.49 4.83-2.49s4.8 1.89 4.83 2.49C15.8 18.96 14.03 20 12 20z"
            />
          </svg>
        </RouterLink>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { useStore } from "vuex";

const store = useStore();

const isLoggedIn = computed(() => store.getters["auth/isLoggedIn"]);
const currentPlan = computed(() => store.getters["subscription/plan"]);
const isFreePlan = computed(() => currentPlan.value.id === "free");
</script>

<style scoped>
.navbar {
  width: 100%;
  background-color: var(--bg-surface);
  border-bottom: 1px solid var(--border-subtle);
  padding: 0.85rem 2rem;
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1280px;
  margin: 0 auto;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-main);
  text-decoration: none;
  letter-spacing: 0.05em;
  -webkit-font-smoothing: antialiased;
}

.brand-logo-img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-item {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.15s ease;
}

.nav-item:hover,
.router-link-active {
  color: var(--text-main);
  font-weight: 600;
  border-bottom: 3px solid var(--primary-wisteria);
}

.user-action {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

/* Subscription Badge / Upgrade Pill */
.nav-upgrade-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  text-decoration: none;
  transition:
    transform 0.15s ease,
    opacity 0.15s ease;
}

.nav-upgrade-badge:hover {
  transform: translateY(-1px);
  opacity: 0.9;
}

/* Free plan: styled as a clean action button */
.free-nav-badge {
  background: rgba(186, 147, 220, 0.12);
  color: var(--primary-wisteria);
  border: 1px solid rgba(186, 147, 220, 0.3);
}

/* Plus plan pill style */
.plus-nav-badge {
  background: rgba(186, 147, 220, 0.2);
  color: var(--text-main);
  border: 1px solid var(--primary-wisteria);
}

/* Pro plan highlighted premium badge */
.pro-nav-badge {
  background: var(--primary-wisteria);
  color: var(--text-dark-btn, #fff);
  box-shadow: 0 2px 8px rgba(186, 147, 220, 0.3);
}

.settings-icon-btn,
.profile-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  transition: color 0.15s ease;
}

.settings-icon-btn:hover,
.profile-icon-btn:hover {
  color: var(--text-main);
}

.settings-icon {
  width: 22px;
  height: 22px;
}

.user-avatar-icon {
  width: 28px;
  height: 28px;
}
</style>

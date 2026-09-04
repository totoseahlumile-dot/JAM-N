<template>
  <header class="navbar">
    <div class="navbar-container">
      <!-- Bold JAM'N Logo -->
      <RouterLink to="/" class="brand-logo">
        JAM'N
      </RouterLink>

      <!-- Nav Links -->
      <nav class="nav-links">
        <RouterLink to="/discover" class="nav-item">Discover</RouterLink>
        <RouterLink to="/feed" class="nav-item">Feed</RouterLink>
        <RouterLink to="/library" class="nav-item">Library</RouterLink>
        <RouterLink to="/beat-store" class="nav-item">Beat Store</RouterLink>
        <RouterLink to="/events" class="nav-item">Events</RouterLink>
      </nav>

      <!-- Right User Icon -->
      <div class="user-action">
        <RouterLink to="/account" class="profile-icon-btn" aria-label="Account">
          <svg class="user-avatar-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-3.8-1.04-4.83-2.61.03-1.6 3.23-2.49 4.83-2.49s4.8 1.89 4.83 2.49C15.8 18.96 14.03 20 12 20z"/>
          </svg>
        </RouterLink>
      </div>
    </div>
  </header>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.navbar {
  width: 100%;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e5e5;
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
  font-size: 1.25rem;
  font-weight: 800 !important;
  color: #111111;
  text-decoration: none;
  letter-spacing: 0.05em;
  -webkit-font-smoothing: antialiased;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-item {
  font-size: 0.95rem;
  font-weight: 500;
  color: #333333;
  text-decoration: none;
  transition: color 0.15s ease;
}

.nav-item:hover,
.router-link-active {
  color: #000000;
  font-weight: 600;
}

.user-action {
  display: flex;
  align-items: center;
}

.profile-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #333333;
  transition: color 0.15s ease;
}

.profile-icon-btn:hover {
  color: #000000;
}

.user-avatar-icon {
  width: 28px;
  height: 28px;
}
</style>
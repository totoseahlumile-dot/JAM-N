<template>
  <div class="settings-page">
    <h1 class="settings-title">Settings</h1>

    <!-- General account settings - visible to everyone -->
    <section class="settings-section">
      <p class="section-label">Account</p>
      <RouterLink to="/account/settings/edit" class="settings-row">
        <span>Edit profile</span>
        <span class="chevron">›</span>
      </RouterLink>
      <RouterLink to="/account/privacy" class="settings-row">
        <span>Privacy &amp; security</span>
        <span class="chevron">›</span>
      </RouterLink>
    </section>

    <!-- Only shown for users with an artist or producer role -->
    <section v-if="isArtistOrProducer" class="settings-section">
      <p class="section-label">For producers &amp; artists</p>
      <RouterLink to="/account/subscriptions" class="settings-row">
        <span>Subscriptions</span>
        <span class="chevron">›</span>
      </RouterLink>
      <RouterLink to="/account/services" class="settings-row">
        <span>Services</span>
        <span class="chevron">›</span>
      </RouterLink>
      <RouterLink to="/beat-store/my-beats" class="settings-row">
        <span>My beats &amp; earnings</span>
        <span class="chevron">›</span>
      </RouterLink>
    </section>

    <section class="settings-section">
      <button class="logout-btn" @click="handleLogout">Log out</button>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useStore } from 'vuex'

const store = useStore()
const router = useRouter()

const isArtistOrProducer = computed(() => store.getters['auth/isArtistOrProducer'])

function handleLogout() {
  store.dispatch('auth/logout')
  router.push('/')
}
</script>

<style scoped>
.settings-page {
  max-width: 480px;
  margin: 0 auto;
  padding: 2rem;
}

.settings-title {
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
}

.settings-section {
  margin-bottom: 1.5rem;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 600;
  opacity: 0.6;
  margin-bottom: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.settings-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.7rem 0;
  text-decoration: none;
  color: inherit;
  font-size: 0.9rem;
  border-bottom: 1px solid #f5f5f5;
}

.settings-row:last-child {
  border-bottom: none;
}

.chevron {
  opacity: 0.4;
}

.logout-btn {
  border: none;
  background: transparent;
  color: #c0392b;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.5rem 0;
}
</style>
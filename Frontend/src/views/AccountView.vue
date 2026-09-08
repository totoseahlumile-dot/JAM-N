<template>
  <div class="account-page">
    <!-- Profile header -->
    <header class="account-header">
      <div class="account-avatar"></div>
      <div class="account-info">
        <p class="account-name">{{ user?.name ?? 'Guest' }}</p>
        <p class="account-meta">{{ roleLabel }}</p>
        <div class="account-stats">
          <span>{{ followers }} followers</span>
          <span>{{ following }} following</span>
        </div>
      </div>
      <button class="edit-profile-btn">Edit profile</button>
    </header>

    <!-- General account settings - visible to everyone -->
    <section class="account-section">
      <p class="section-label">Account</p>
      <RouterLink to="/account/settings" class="account-row">
        <span>Settings</span>
        <span class="chevron">›</span>
      </RouterLink>
      <RouterLink to="/account/privacy" class="account-row">
        <span>Privacy &amp; security</span>
        <span class="chevron">›</span>
      </RouterLink>
    </section>

    <!-- Only shown for users with an artist or producer role -->
    <section v-if="isArtistOrProducer" class="account-section">
      <p class="section-label">For producers &amp; artists</p>
      <RouterLink to="/account/subscriptions" class="account-row">
        <span>Subscriptions</span>
        <span class="chevron">›</span>
      </RouterLink>
      <RouterLink to="/account/services" class="account-row">
        <span>Services</span>
        <span class="chevron">›</span>
      </RouterLink>
      <RouterLink to="/beat-store/my-beats" class="account-row">
        <span>My beats &amp; earnings</span>
        <span class="chevron">›</span>
      </RouterLink>
    </section>

    <section class="account-section">
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

const user = computed(() => store.state.auth.user)

// TEMPORARY: followers/following aren't in the current user data shape yet.
// Hardcoded placeholders until the backend provides real counts.
const followers = computed(() => user.value?.followers ?? 0)
const following = computed(() => user.value?.following ?? 0)

// Roles is now an array (e.g. ["listener", "artist"]) - join for display
const roleLabel = computed(() => {
  const roles = user.value?.roles ?? []
  if (roles.length === 0) return ''
  return roles.map((r) => r.charAt(0).toUpperCase() + r.slice(1)).join(', ')
})

// Controls whether the "For producers & artists" section shows at all.
// Now reads directly from the auth store's isArtistOrProducer getter.
const isArtistOrProducer = computed(() => store.getters['auth/isArtistOrProducer'])

function handleLogout() {
  store.dispatch('auth/logout')
  router.push('/')
}
</script>

<style scoped>
.account-page {
  max-width: 640px;
  margin: 0 auto;
  padding: 2rem;
}

.account-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
  margin-bottom: 1.5rem;
}

.account-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #ddd;
  flex-shrink: 0;
}

.account-info {
  flex: 1;
}

.account-name {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
}

.account-meta {
  font-size: 0.85rem;
  opacity: 0.7;
  margin: 0.15rem 0;
}

.account-stats {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  opacity: 0.6;
}

.edit-profile-btn {
  border: 1px solid #ccc;
  background: transparent;
  padding: 0.4rem 0.9rem;
  border-radius: 8px;
  font-size: 0.8rem;
  cursor: pointer;
  white-space: nowrap;
}

.account-section {
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

.account-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.7rem 0;
  text-decoration: none;
  color: inherit;
  font-size: 0.9rem;
  border-bottom: 1px solid #f5f5f5;
}

.account-row:last-child {
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
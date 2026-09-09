<template>
  <div class="settings-page">
    <header class="settings-header">
      <h1>Settings</h1>
      <p class="subtitle">Manage your account preferences and music profile settings.</p>
    </header>

    <!-- Account & Profile Section -->
    <section class="settings-card">
      <h2 class="card-title">Account &amp; Profile</h2>

      <div class="settings-group">
        <div class="field-row">
          <div class="field-info">
            <label>Display Name</label>
            <span class="field-desc">Visible on your public profile and track uploads.</span>
          </div>
          <input v-model="profileForm.name" type="text" class="text-input" />
        </div>

        <div class="field-row">
          <div class="field-info">
            <label>Email Address</label>
            <span class="field-desc">Used for notifications and security alerts.</span>
          </div>
          <input v-model="profileForm.email" type="email" class="text-input" />
        </div>

        <div class="field-row">
          <div class="field-info">
            <label>Bio</label>
            <span class="field-desc">Brief description for your creator bio.</span>
          </div>
          <textarea v-model="profileForm.bio" rows="2" class="text-input textarea"></textarea>
        </div>

        <div class="action-row">
          <button class="save-btn" @click="saveProfile">Save Changes</button>
        </div>
      </div>
    </section>

    <!-- Producer & Creator Tools (Conditional) -->
    <section v-if="isArtistOrProducer" class="settings-card">
      <h2 class="card-title">Creator &amp; Store Preferences</h2>

      <div class="settings-group">
        <div class="toggle-row">
          <div class="field-info">
            <label>Accepting Custom Beat Requests</label>
            <span class="field-desc">Allow artists to message you directly for custom beat projects.</span>
          </div>
          <input type="checkbox" v-model="creatorSettings.customRequests" class="toggle-checkbox" />
        </div>

        <div class="toggle-row">
          <div class="field-info">
            <label>Mixing &amp; Mastering Availability</label>
            <span class="field-desc">Show your engineering services on your public profile.</span>
          </div>
          <input type="checkbox" v-model="creatorSettings.mixingServices" class="toggle-checkbox" />
        </div>

        <RouterLink to="/beat-store/my-beats" class="nav-row">
          <span>Manage Beats &amp; License Pricing</span>
          <span class="chevron">›</span>
        </RouterLink>
      </div>
    </section>

    <!-- Privacy & Preferences -->
    <section class="settings-card">
      <h2 class="card-title">Privacy &amp; Display</h2>

      <div class="settings-group">
        <div class="toggle-row">
          <div class="field-info">
            <label>Private Account</label>
            <span class="field-desc">Only approved followers can see your posts and activity.</span>
          </div>
          <input type="checkbox" v-model="privacySettings.isPrivate" class="toggle-checkbox" />
        </div>

        <div class="toggle-row">
          <div class="field-info">
            <label>Show Liked Tracks on Profile</label>
            <span class="field-desc">Display a Liked tab on your public profile.</span>
          </div>
          <input type="checkbox" v-model="privacySettings.showLikes" class="toggle-checkbox" />
        </div>
      </div>
    </section>

    <!-- Notifications -->
    <section class="settings-card">
      <h2 class="card-title">Notifications</h2>

      <div class="settings-group">
        <div class="toggle-row">
          <div class="field-info">
            <label>Email Updates</label>
            <span class="field-desc">Receive newsletters, feature updates, and activity summaries.</span>
          </div>
          <input type="checkbox" v-model="notificationSettings.emailAlerts" class="toggle-checkbox" />
        </div>

        <div class="toggle-row">
          <div class="field-info">
            <label>New Followers &amp; Likes</label>
            <span class="field-desc">Get notified when someone follows you or likes your uploads.</span>
          </div>
          <input type="checkbox" v-model="notificationSettings.activityAlerts" class="toggle-checkbox" />
        </div>
      </div>
    </section>

    <!-- Session Management -->
    <section class="settings-card danger-card">
      <div class="danger-row">
        <div>
          <h3 class="danger-title">Sign Out</h3>
          <p class="field-desc">Log out of your account on this device.</p>
        </div>
        <button class="logout-btn" @click="handleLogout">Log Out</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useStore } from 'vuex'

const store = useStore()
const router = useRouter()

const user = computed(() => store.state.auth?.user)
const isArtistOrProducer = computed(() => store.getters['auth/isArtistOrProducer'])

const profileForm = reactive({
  name: user.value?.name ?? '',
  email: user.value?.email ?? '',
  bio: user.value?.bio ?? '',
})

const creatorSettings = reactive({
  customRequests: true,
  mixingServices: false,
})

const privacySettings = reactive({
  isPrivate: false,
  showLikes: true,
})

const notificationSettings = reactive({
  emailAlerts: true,
  activityAlerts: true,
})

function saveProfile() {
  store.commit('auth/SET_USER', {
    ...user.value,
    name: profileForm.name,
    email: profileForm.email,
    bio: profileForm.bio,
  })
  alert('Settings saved successfully!')
}

function handleLogout() {
  store.dispatch('auth/logout')
  router.push('/')
}
</script>

<style scoped>
.settings-page {
  max-width: 640px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}

.settings-header {
  margin-bottom: 2rem;
}

.settings-header h1 {
  font-size: 1.6rem;
  font-weight: 800;
  margin: 0 0 0.25rem;
  letter-spacing: -0.01em;
}

.subtitle {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
}

.settings-card {
  background: #ffffff;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.card-title {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0 0 1.25rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #333;
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field-row,
.toggle-row,
.nav-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.field-row {
  flex-direction: column;
}

.field-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.field-info label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #222;
}

.field-desc {
  font-size: 0.75rem;
  color: #777;
}

.text-input {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0.6rem 0.75rem;
  font-size: 0.85rem;
  outline: none;
  background: #fafafa;
  box-sizing: border-box;
}

.text-input:focus {
  border-color: #5b5370;
  background: #fff;
}

.textarea {
  resize: vertical;
  font-family: inherit;
}

.toggle-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #5b5370;
  margin-top: 0.2rem;
}

.nav-row {
  align-items: center;
  padding: 0.5rem 0;
  color: #333;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  border-top: 1px solid #f5f5f5;
}

.chevron {
  opacity: 0.4;
  font-size: 1.1rem;
}

.action-row {
  display: flex;
  justify-content: flex-end;
  padding-top: 0.5rem;
}

.save-btn {
  background: #333;
  color: #fff;
  border: none;
  padding: 0.55rem 1.25rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.save-btn:hover {
  background: #111;
}

.danger-card {
  border-color: #fecaca;
  background-color: #fffafaf5;
}

.danger-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.danger-title {
  font-size: 0.9rem;
  font-weight: 700;
  margin: 0 0 0.2rem;
  color: #991b1b;
}

.logout-btn {
  background: #dc2626;
  color: #fff;
  border: none;
  padding: 0.55rem 1.1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.logout-btn:hover {
  background: #b91c1c;
}
</style>
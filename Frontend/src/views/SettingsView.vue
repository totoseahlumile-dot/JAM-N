<template>
  <div class="settings-page">
    <header class="settings-header">
      <h1>Settings</h1>
      <p class="subtitle">
        Manage your account preferences and music profile settings.
      </p>
    </header>

    <!-- Account & Profile Section -->
    <section class="settings-card">
      <h2 class="card-title">Account &amp; Profile</h2>

      <div class="settings-group">
        <div class="field-row summary-row">
          <div class="field-info">
            <label>{{ user?.name ?? "Guest" }}</label>
            <span class="field-desc">{{ user?.email ?? "" }}</span>
          </div>
          <button class="edit-btn" @click="showEditModal = true">Edit</button>
        </div>

        <!-- Subscription & Billing Link -->
        <RouterLink to="/subscription" class="nav-row">
          <span>Subscription Plan &amp; Limits</span>
          <span class="chevron">›</span>
        </RouterLink>
      </div>
    </section>

    <!-- Producer & Creator Tools (Conditional) -->
    <section v-if="isArtistOrProducer" class="settings-card">
      <h2 class="card-title">Creator &amp; Store Preferences</h2>

      <div class="settings-group">
        <div class="toggle-row">
          <div class="field-info">
            <label>Accepting Custom Beat Requests</label>
            <span class="field-desc"
              >Allow artists to message you directly for custom beat
              projects.</span
            >
          </div>
          <input
            type="checkbox"
            v-model="creatorSettings.customRequests"
            class="toggle-checkbox"
          />
        </div>

        <div class="toggle-row">
          <div class="field-info">
            <label>Mixing &amp; Mastering Availability</label>
            <span class="field-desc"
              >Show your engineering services on your public profile.</span
            >
          </div>
          <input
            type="checkbox"
            v-model="creatorSettings.mixingServices"
            class="toggle-checkbox"
          />
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
            <span class="field-desc"
              >Only approved followers can see your posts and activity.</span
            >
          </div>
          <input
            type="checkbox"
            v-model="privacySettings.isPrivate"
            class="toggle-checkbox"
          />
        </div>

        <div class="toggle-row">
          <div class="field-info">
            <label>Show Liked Tracks on Profile</label>
            <span class="field-desc"
              >Display a Liked tab on your public profile.</span
            >
          </div>
          <input
            type="checkbox"
            v-model="privacySettings.showLikes"
            class="toggle-checkbox"
          />
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
            <span class="field-desc"
              >Receive newsletters, feature updates, and activity
              summaries.</span
            >
          </div>
          <input
            type="checkbox"
            v-model="notificationSettings.emailAlerts"
            class="toggle-checkbox"
          />
        </div>

        <div class="toggle-row">
          <div class="field-info">
            <label>New Followers &amp; Likes</label>
            <span class="field-desc"
              >Get notified when someone follows you or likes your
              uploads.</span
            >
          </div>
          <input
            type="checkbox"
            v-model="notificationSettings.activityAlerts"
            class="toggle-checkbox"
          />
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

    <!-- Edit profile modal -->
    <EditProfileModal v-model="showEditModal" />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useStore } from "vuex";
import EditProfileModal from "@/components/common/EditProfileModal.vue";

const store = useStore();
const router = useRouter();

const user = computed(() => store.state.auth?.user);
const isArtistOrProducer = computed(
  () => store.getters["auth/isArtistOrProducer"],
);

const showEditModal = ref(false);

const creatorSettings = reactive({
  customRequests: true,
  mixingServices: false,
});

const privacySettings = reactive({
  isPrivate: false,
  showLikes: true,
});

const notificationSettings = reactive({
  emailAlerts: true,
  activityAlerts: true,
});

async function handleLogout() {
  await store.dispatch("auth/logout");
  router.replace("/");
}
</script>

<style scoped>
.settings-page {
  max-width: 640px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 4rem;
}

.settings-header {
  margin-bottom: 2rem;
}

.settings-header h1 {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0 0 0.25rem;
  color: var(--text-main);
  letter-spacing: -0.01em;
}

.subtitle {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin: 0;
}

.settings-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 20px;
  padding: 1.5rem 1.75rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.card-title {
  font-size: 0.9rem;
  font-weight: 800;
  margin: 0 0 1.25rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
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

.summary-row {
  flex-direction: row;
  align-items: center;
}

.field-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.field-info label {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-main);
}

.field-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.edit-btn {
  border: 1px solid var(--border-subtle);
  background: transparent;
  color: var(--text-main);
  padding: 0.5rem 1.25rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 0.2s ease;
}

.edit-btn:hover {
  border-color: var(--primary-wisteria);
}

.toggle-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--primary-wisteria);
  margin-top: 0.2rem;
}

.nav-row {
  align-items: center;
  padding: 0.75rem 0 0.25rem;
  color: var(--text-main);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 700;
  border-top: 1px solid var(--border-subtle);
}

.nav-row:hover {
  opacity: 0.75;
}

.chevron {
  opacity: 0.5;
  font-size: 1.25rem;
  font-weight: 800;
}

.danger-card {
  border-color: rgba(220, 38, 38, 0.2);
  background-color: rgba(220, 38, 38, 0.02);
}

.danger-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.danger-title {
  font-size: 0.95rem;
  font-weight: 800;
  margin: 0 0 0.2rem;
  color: #dc2626;
}

.logout-btn {
  background: #dc2626;
  color: #fff;
  border: none;
  padding: 0.6rem 1.25rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.logout-btn:hover {
  opacity: 0.9;
}
</style>

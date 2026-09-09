<template>
  <div class="profile-page">
    <!-- Profile header -->
    <header class="profile-header">
      <div class="profile-avatar-large"></div>

      <div class="profile-details">
        <p class="profile-name">{{ user?.name ?? 'Guest' }}</p>

        <div class="profile-stats">
          <div class="stat">
            <span class="stat-count">{{ uploads.length }}</span>
            <span class="stat-label">Uploads</span>
          </div>
          <div class="stat">
            <span class="stat-count">{{ followers }}</span>
            <span class="stat-label">followers</span>
          </div>
          <div class="stat">
            <span class="stat-count">{{ following }}</span>
            <span class="stat-label">following</span>
          </div>
        </div>

        <p class="profile-bio">{{ roleLabel }}</p>

        <button class="edit-profile-btn" @click="openEditModal">Edit profile</button>
      </div>
    </header>

    <!-- Tabs: Uploads, Reposts, Liked Songs -->
    <section class="profile-content">
      <div class="content-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="content-tab"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <div v-if="activeItems.length > 0" class="content-grid">
        <div
          v-for="item in activeItems"
          :key="item.id"
          class="content-tile"
          @click="openItem(item)"
        >
          <div class="tile-placeholder">
            <span class="play-icon">▶</span>
          </div>
          <p class="tile-title">{{ item.title }}</p>
        </div>
      </div>

      <p v-else class="empty-state">{{ emptyMessage }}</p>
    </section>

    <!-- Floating upload button -->
    <button
      v-if="isArtistOrProducer && activeTab === 'uploads'"
      class="upload-fab"
      @click="showUploadModal = true"
      aria-label="Upload"
    >
      +
    </button>

    <!-- Edit profile modal -->
    <BaseModal v-model="showEditModal" title="Edit profile">
      <form class="edit-form" @submit.prevent="saveProfile">
        <label class="form-field">
          <span>Name</span>
          <input v-model="editForm.name" type="text" />
        </label>
        <label class="form-field">
          <span>Bio</span>
          <textarea v-model="editForm.bio" rows="3" />
        </label>
        <button type="submit" class="form-submit-btn">Save changes</button>
      </form>
    </BaseModal>

    <!-- Upload modal -->
    <BaseModal v-model="showUploadModal" title="Upload">
      <form class="upload-form" @submit.prevent="submitUpload">
        <label class="form-field">
          <span>Title</span>
          <input v-model="uploadForm.title" type="text" required />
        </label>

        <label class="form-field">
          <span>File</span>
          <input type="file" accept="audio/*,image/*" @change="handleFileSelect" required />
        </label>

        <p v-if="uploadForm.file" class="file-selected">Selected: {{ uploadForm.file.name }}</p>

        <button type="submit" class="form-submit-btn">Upload</button>
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useStore } from 'vuex'
import BaseModal from '@/components/common/BaseModal.vue'

const store = useStore()

const user = computed(() => store.state.auth?.user)
const isArtistOrProducer = computed(() => store.getters['auth/isArtistOrProducer'])

const followers = computed(() => user.value?.followers ?? 0)
const following = computed(() => user.value?.following ?? 0)

const roleLabel = computed(() => {
  const roles = user.value?.roles ?? []
  if (roles.length === 0) return ''
  return roles.map((r) => r.charAt(0).toUpperCase() + r.slice(1)).join(' · ')
})

const tabs = [
  { key: 'uploads', label: 'Uploads' },
  { key: 'reposts', label: 'Reposts' },
  { key: 'liked', label: 'Liked' },
]
const activeTab = ref('uploads')

const uploads = ref([])
const reposts = ref([])

// Dynamic reactive computed property reading directly from store state
const liked = computed(() => {
  const likedIds = store.state.auth?.likedTrackIds ?? []
  const allArtists = store.getters['artists/allArtists'] ?? []
  
  return allArtists
    .filter((artist) => likedIds.includes(artist.id))
    .map((artist) => ({
      id: artist.id,
      title: artist.name, // Adapts name to tile title display
    }))
})

const activeItems = computed(() => {
  if (activeTab.value === 'uploads') return uploads.value
  if (activeTab.value === 'reposts') return reposts.value
  return liked.value
})

const emptyMessage = computed(() => {
  const messages = {
    uploads: 'No uploads yet.',
    reposts: 'No reposts yet.',
    liked: 'No liked items yet.',
  }
  return messages[activeTab.value]
})

function openItem(item) {
  console.log('Open detail for:', item)
}

// --- Edit Profile modal ---
const showEditModal = ref(false)
const editForm = reactive({
  name: '',
  bio: '',
})

function openEditModal() {
  editForm.name = user.value?.name ?? ''
  showEditModal.value = true
}

function saveProfile() {
  store.commit('auth/SET_USER', {
    ...user.value,
    name: editForm.name,
  })
  showEditModal.value = false
}

// --- Upload modal ---
const showUploadModal = ref(false)
const uploadForm = reactive({
  title: '',
  file: null,
})

function handleFileSelect(event) {
  uploadForm.file = event.target.files[0] ?? null
}

function submitUpload() {
  uploads.value.push({
    id: `local-${Date.now()}`,
    title: uploadForm.title,
    file: uploadForm.file,
  })

  uploadForm.title = ''
  uploadForm.file = null
  showUploadModal.value = false
}
</script>

<style scoped>
.profile-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
}

.profile-header {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
  margin-bottom: 1.5rem;
}

.profile-avatar-large {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: #ddd;
  flex-shrink: 0;
}

.profile-details {
  flex: 1;
}

.profile-name {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
}

.profile-stats {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 0.75rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.85rem;
}

.stat-count {
  font-weight: 700;
}

.stat-label {
  opacity: 0.6;
  font-size: 0.75rem;
}

.profile-bio {
  font-size: 0.85rem;
  opacity: 0.75;
  margin: 0 0 0.75rem;
}

.edit-profile-btn {
  border: 1px solid #ccc;
  background: transparent;
  padding: 0.4rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  cursor: pointer;
}

.content-tabs {
  display: flex;
  gap: 1.5rem;
  border-top: 1px solid #eee;
  padding-top: 0.75rem;
  margin-bottom: 1rem;
}

.content-tab {
  border: none;
  background: transparent;
  font-size: 0.8rem;
  font-weight: 600;
  opacity: 0.5;
  cursor: pointer;
  padding: 0.3rem 0;
}

.content-tab.active {
  opacity: 1;
  border-bottom: 2px solid #333;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
}

.content-tile {
  cursor: pointer;
}

.tile-placeholder {
  width: 100%;
  aspect-ratio: 1;
  background: #eee;
  border-radius: 6px;
  margin-bottom: 0.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-icon {
  font-size: 1.25rem;
  opacity: 0.4;
}

.tile-title {
  font-size: 0.8rem;
  margin: 0;
}

.empty-state {
  opacity: 0.6;
  font-size: 0.85rem;
  text-align: center;
  padding: 2rem 0;
}

.upload-fab {
  position: fixed;
  bottom: 100px;
  right: 2rem;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: #333;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
}

.form-field input,
.form-field textarea {
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 0.5rem;
  font-size: 0.85rem;
  font-family: inherit;
}

.file-selected {
  font-size: 0.75rem;
  opacity: 0.7;
  margin-bottom: 1rem;
}

.form-submit-btn {
  width: 100%;
  border: none;
  background: #333;
  color: #fff;
  padding: 0.6rem;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
}
</style>
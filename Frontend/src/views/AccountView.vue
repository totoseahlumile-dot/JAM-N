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

          <!-- Clickable Followers Stat -->
          <div class="stat clickable" @click="openUserList('followers')">
            <span class="stat-count">{{ followers.length }}</span>
            <span class="stat-label">followers</span>
          </div>

          <!-- Clickable Following Stat -->
          <div class="stat clickable" @click="openUserList('following')">
            <span class="stat-count">{{ following.length }}</span>
            <span class="stat-label">following</span>
          </div>
        </div>

        <p class="profile-bio">{{ roleLabel }}</p>

        <button class="edit-profile-btn" @click="showEditModal = true">Edit profile</button>
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
            <img v-if="item.image" :src="item.image" class="tile-img" :alt="item.title" />
            <span v-else class="play-icon">▶</span>
          </div>
          <p class="tile-title">{{ item.title }}</p>
          <p v-if="item.artist" class="tile-subtitle">{{ item.artist }}</p>
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

    <!-- Track/Liked Item Card Modal (With Audio Player) -->
    <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
      <div class="modal-card detail-card">
        <div class="modal-cover">
          <img v-if="selectedItem?.image" :src="selectedItem.image" class="modal-cover-img" />
          <div v-else class="modal-cover-placeholder">▶</div>
        </div>

        <h3>{{ selectedItem?.title }}</h3>
        <p v-if="selectedItem?.artist" class="modal-subtitle">{{ selectedItem.artist }}</p>

        <!-- Player Controls -->
        <div class="player-controls">
          <button class="play-btn" @click="togglePlay">
            {{ isPlaying ? '⏸ Pause' : '▶ Play Track' }}
          </button>
        </div>

        <div class="modal-actions">
          <button class="form-submit-btn" @click="navigateToArtist">
            View Artist Profile
          </button>
          <button type="button" class="close-btn-secondary" @click="showDetailModal = false">
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Followers / Following List Modal -->
    <div v-if="showUserListModal" class="modal-overlay" @click.self="showUserListModal = false">
      <div class="modal-card">
        <h3>{{ userListTitle }}</h3>
        <div v-if="activeUserList.length > 0" class="user-list">
          <div 
            v-for="person in activeUserList" 
            :key="person.id" 
            class="user-row clickable"
            @click="goToArtist(person.id)"
          >
            <div class="user-avatar"></div>
            <div class="user-info">
              <p class="user-name">{{ person.name }}</p>
              <p v-if="person.handle" class="user-handle">@{{ person.handle }}</p>
            </div>
          </div>
        </div>
        <p v-else class="empty-state">No {{ userListType }} yet.</p>
        <button class="close-btn" @click="showUserListModal = false">Close</button>
      </div>
    </div>

    <!-- Upload Track Modal -->
    <div v-if="showUploadModal" class="modal-overlay" @click.self="showUploadModal = false">
      <div class="modal-card">
        <h3>Upload Track</h3>
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
          <div class="modal-actions">
            <button type="button" class="close-btn-secondary" @click="showUploadModal = false">Cancel</button>
            <button type="submit" class="form-submit-btn">Upload</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Profile Modal Shared Component -->
    <EditProfileModal v-model="showEditModal" />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import EditProfileModal from '@/components/common/EditProfileModal.vue'

const store = useStore()
const router = useRouter()

// Modal states
const showEditModal = ref(false)

// Safe access to store state & getters
const user = computed(() => store?.state?.auth?.user ?? null)

const isArtistOrProducer = computed(() => {
  if (store?.getters?.['auth/isArtistOrProducer'] !== undefined) {
    return store.getters['auth/isArtistOrProducer']
  }
  return true
})

const followers = computed(() => user.value?.followersList ?? [])
const following = computed(() => user.value?.followingList ?? [])

const roleLabel = computed(() => {
  const roles = user.value?.roles ?? []
  if (roles.length === 0) return 'Artist / Producer'
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

const liked = computed(() => {
  const likedIds = store?.state?.auth?.likedTrackIds ?? []
  const allArtists = store?.getters?.['artists/allArtists'] ?? []

  return allArtists
    .filter((artist) => likedIds.includes(artist.id))
    .map((artist) => ({
      id: artist.id,
      title: artist.name,
      artist: artist.genre ? `${artist.genre} Artist` : 'Artist',
      image: artist.image ?? null,
      audioUrl: artist.audioUrl ?? null,
      type: 'artist',
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

// --- Followers / Following Modal ---
const showUserListModal = ref(false)
const userListType = ref('followers')

const userListTitle = computed(() => {
  return userListType.value === 'followers' ? 'Followers' : 'Following'
})

const activeUserList = computed(() => {
  return userListType.value === 'followers' ? followers.value : following.value
})

function openUserList(type) {
  userListType.value = type
  showUserListModal.value = true
}

function goToArtist(personId) {
  showUserListModal.value = false
  router.push(`/artists/${personId}`)
}

// --- Detail Card & Playback Handler ---
const showDetailModal = ref(false)
const selectedItem = ref(null)
const isPlaying = ref(false)

function openItem(item) {
  selectedItem.value = item
  isPlaying.value = false
  showDetailModal.value = true
}

function togglePlay() {
  isPlaying.value = !isPlaying.value
  if (store) {
    store.dispatch('player/playTrack', selectedItem.value)
  }
}

function navigateToArtist() {
  if (!selectedItem.value) return
  showDetailModal.value = false
  router.push(`/artists/${selectedItem.value.id}`)
}

// --- Upload Modal ---
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
    type: 'upload',
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

.stat.clickable {
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  border-radius: 6px;
  transition: background-color 0.15s ease;
}

.stat.clickable:hover {
  background-color: #f5f5f5;
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

.edit-profile-btn:hover {
  background: #f5f5f5;
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
  overflow: hidden;
}

.tile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-icon {
  font-size: 1.25rem;
  opacity: 0.4;
}

.tile-title {
  font-size: 0.8rem;
  font-weight: 600;
  margin: 0;
}

.tile-subtitle {
  font-size: 0.75rem;
  color: #666;
  margin: 0.2rem 0 0;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-card {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  width: 90%;
  max-width: 360px;
  text-align: center;
}

.modal-cover {
  width: 120px;
  height: 120px;
  margin: 0 auto 1rem;
  border-radius: 8px;
  overflow: hidden;
  background: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-cover-placeholder {
  font-size: 2rem;
  color: #888;
}

.modal-card h3 {
  margin: 0 0 0.25rem;
  font-size: 1.1rem;
}

.modal-subtitle {
  font-size: 0.85rem;
  color: #666;
  margin: 0 0 1rem;
}

.player-controls {
  margin-bottom: 1.25rem;
}

.play-btn {
  background: #1db954;
  color: white;
  border: none;
  padding: 0.6rem 1.25rem;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  text-align: left;
}

.form-field input {
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 0.5rem;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.form-submit-btn {
  background: #333;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}

.close-btn-secondary {
  border: 1px solid #ccc;
  background: transparent;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}

.close-btn {
  margin-top: 1rem;
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
}

.user-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.user-row.clickable {
  cursor: pointer;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #eee;
}

.user-name {
  font-size: 0.85rem;
  font-weight: 600;
  margin: 0;
  text-align: left;
}

.user-handle {
  font-size: 0.75rem;
  color: #777;
  margin: 0;
  text-align: left;
}
</style>
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

    <!-- Tabs: Uploads, Posts, Reposts, Liked -->
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

      <!-- VIEW FOR UPLOADS & LIKED (Grid Format) -->
      <div v-if="(activeTab === 'uploads' || activeTab === 'liked') && activeItems.length > 0" class="content-grid">
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

      <!-- VIEW FOR POSTS (Vertical Feed Format) -->
      <div v-else-if="activeTab === 'posts' && textPosts.length > 0" class="posts-feed">
        <div
          v-for="post in textPosts"
          :key="post.id"
          class="post-card"
          @click="openItem(post)"
        >
          <div class="post-header">
            <div class="user-avatar-small"></div>
            <span class="post-author">{{ user?.name }}</span>
          </div>
          <p class="post-text">{{ post.caption || post.title }}</p>
          <div class="post-footer">
            <span class="post-stat">❤️ {{ post.likesCount || 0 }}</span>
            <span class="post-stat">💬 {{ (post.comments || []).length }}</span>
          </div>
        </div>
      </div>

      <!-- EMPTY STATE -->
      <p v-else class="empty-state">{{ emptyMessage }}</p>
    </section>

    <!-- Floating upload button -->
    <button
      v-if="isArtistOrProducer && (activeTab === 'uploads' || activeTab === 'posts')"
      class="upload-fab"
      @click="showUploadModal = true"
      aria-label="Upload"
    >
      +
    </button>

    <!-- Detail Modal (With Audio Player/Interactions) -->
    <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
      <div class="modal-card detail-card">
        <div v-if="selectedItem?.type !== 'text'" class="modal-cover">
          <img v-if="selectedItem?.image" :src="selectedItem.image" class="modal-cover-img" />
          <div v-else class="modal-cover-placeholder">▶</div>
        </div>

        <h3 v-if="selectedItem?.type !== 'text'">{{ selectedItem?.title }}</h3>
        <p v-if="selectedItem?.artist && selectedItem?.type !== 'text'" class="modal-subtitle">{{ selectedItem.artist }}</p>
        <p v-if="selectedItem?.caption && selectedItem?.type === 'text'" class="post-modal-text">"{{ selectedItem.caption }}"</p>

        <!-- Player Controls & Likes (Hidden for text posts) -->
        <div class="interaction-bar">
          <button v-if="selectedItem?.type !== 'text' && selectedItem?.audioUrl" class="play-btn" @click="togglePlay">
            {{ isPlaying ? '⏸ Pause' : '▶ Play Track' }}
          </button>
          <span v-else class="text-post-badge">💬 Text Update</span>
          
          <button class="like-btn" @click="toggleLike(selectedItem.id)">
            ❤️ {{ selectedItem?.likesCount || 0 }}
          </button>
        </div>

        <!-- Comments Section -->
        <div class="comments-section">
          <h4>Comments</h4>
          <div class="comments-list">
            <div v-for="comment in selectedItem?.comments || []" :key="comment.id" class="comment-item">
              <span class="comment-text">{{ comment.text }}</span>
              <span class="comment-time">{{ comment.createdAt }}</span>
            </div>
            <p v-if="!selectedItem?.comments || selectedItem.comments.length === 0" class="no-comments">No comments yet.</p>
          </div>
          
          <div class="comment-input-row">
            <input 
              v-model="newCommentText" 
              type="text" 
              placeholder="Add a comment..." 
              @keyup.enter="submitComment(selectedItem.id)"
            />
            <button @click="submitComment(selectedItem.id)">Send</button>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-delete" @click="deletePost(selectedItem.id)">
            Delete
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

    <!-- Shared Modals -->
    <EditProfileModal v-model="showEditModal" />
    <CreatePostModal v-model="showUploadModal" @post-created="handlePostCreated" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import EditProfileModal from '@/components/common/EditProfileModal.vue'
import CreatePostModal from '@/components/common/CreatePostModal.vue'

const store = useStore()
const router = useRouter()

const showEditModal = ref(false)
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
  { key: 'posts', label: 'Posts' },
  { key: 'reposts', label: 'Reposts' },
  { key: 'liked', label: 'Liked' },
]
const activeTab = ref('uploads')

// Split all user submissions into Audio/Media Uploads vs. Text Posts
const allUserUploads = computed(() => store.getters['auth/userUploads'] ?? [])

const uploads = computed(() => allUserUploads.value.filter(item => item.type !== 'text'))
const textPosts = computed(() => allUserUploads.value.filter(item => item.type === 'text'))
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
  if (activeTab.value === 'liked') return liked.value
  return []
})

const emptyMessage = computed(() => {
  const messages = {
    uploads: 'No music uploads yet.',
    posts: 'No text posts yet.',
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
const newCommentText = ref('')

function openItem(item) {
  selectedItem.value = item
  isPlaying.value = false
  newCommentText.value = ''
  showDetailModal.value = true
}

function togglePlay() {
  isPlaying.value = !isPlaying.value
  if (store && selectedItem.value) {
    store.dispatch('player/playTrack', selectedItem.value)
  }
}

function toggleLike(postId) {
  store.dispatch('auth/togglePostLike', postId)
}

function submitComment(postId) {
  if (!newCommentText.value.trim()) return
  store.dispatch('auth/addPostComment', {
    postId,
    text: newCommentText.value.trim()
  })
  newCommentText.value = ''
}

function deletePost(postId) {
  if (confirm('Are you sure you want to delete this item?')) {
    store.dispatch('auth/deleteUpload', postId)
    showDetailModal.value = false
  }
}

// --- Create Post Handler ---
const showUploadModal = ref(false)

function handlePostCreated(postData) {
  store.dispatch('auth/createPost', postData)
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

/* Posts Feed Styles */
.posts-feed {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-card {
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: background 0.15s ease;
}

.post-card:hover {
  background: #f5f5f5;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.user-avatar-small {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ccc;
}

.post-author {
  font-size: 0.8rem;
  font-weight: 600;
}

.post-text {
  font-size: 0.9rem;
  color: #333;
  margin: 0 0 0.75rem;
  line-height: 1.4;
}

.post-footer {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #666;
}

.post-modal-text {
  font-size: 0.95rem;
  font-style: italic;
  color: #333;
  margin: 0 0 1rem;
  line-height: 1.4;
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
  max-width: 380px;
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
  margin: 0 0 0.5rem;
}

.interaction-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  gap: 0.5rem;
}

.play-btn {
  background: #1db954;
  color: white;
  border: none;
  padding: 0.6rem 1.25rem;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  flex: 1;
}

.text-post-badge {
  font-size: 0.8rem;
  font-weight: 600;
  color: #666;
  background: #f0f2f5;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
}

.like-btn {
  background: #f5f5f5;
  border: 1px solid #ddd;
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.85rem;
}

.comments-section {
  text-align: left;
  border-top: 1px solid #eee;
  padding-top: 0.75rem;
  margin-bottom: 1rem;
}

.comments-section h4 {
  font-size: 0.85rem;
  margin: 0 0 0.5rem;
  color: #444;
}

.comments-list {
  max-height: 100px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.5rem;
}

.comment-item {
  font-size: 0.75rem;
  background: #f9f9f9;
  padding: 0.35rem 0.5rem;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-time {
  opacity: 0.5;
  font-size: 0.65rem;
  margin-left: 0.5rem;
}

.no-comments {
  font-size: 0.75rem;
  opacity: 0.5;
  margin: 0;
}

.comment-input-row {
  display: flex;
  gap: 0.35rem;
}

.comment-input-row input {
  flex: 1;
  padding: 0.4rem;
  font-size: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.comment-input-row button {
  padding: 0.4rem 0.75rem;
  font-size: 0.75rem;
  background: #333;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn-delete {
  background: #ff4d4d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
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
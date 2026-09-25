<template>
  <div class="profile-page">
    <!-- Profile header -->
    <header class="page-header">
      <div class="header-inner">
        <div class="profile-header">
          <div class="profile-avatar-large">
            <img
              v-if="user?.image"
              :src="user.image"
              :alt="user?.name"
              class="avatar-img"
            />
            <span v-else class="avatar-fallback">🎵</span>
          </div>

          <div class="profile-details">
            <p class="profile-name">{{ user?.name ?? "Guest" }}</p>

            <div class="profile-stats">
              <div class="stat">
                <span class="stat-count">{{ uploads.length }}</span>
                <span class="stat-label">Uploads</span>
              </div>

              <!-- Clickable Followers Stat -->
              <div class="stat clickable" @click="openUserList('followers')">
                <span class="stat-count">{{ followers.length }}</span>
                <span class="stat-label">Followers</span>
              </div>

              <!-- Clickable Following Stat -->
              <div class="stat clickable" @click="openUserList('following')">
                <span class="stat-count">{{ following.length }}</span>
                <span class="stat-label">Following</span>
              </div>
            </div>

            <p class="profile-bio">{{ roleLabel }}</p>

            <button
              class="btn-primary edit-profile-btn"
              @click="showEditModal = true"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="profile-container">
      <!-- Tabs: Uploads, Posts, Reposts, Liked, Following -->
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
        <div
          v-if="
            (activeTab === 'uploads' || activeTab === 'liked') &&
            activeItems.length > 0
          "
          class="content-grid"
        >
          <div
            v-for="item in activeItems"
            :key="item.id"
            class="content-tile clickable"
            @click="openItem(item)"
          >
            <div class="tile-placeholder">
              <img
                v-if="item.image || item.coverArt"
                :src="item.image || item.coverArt"
                class="tile-img"
                :alt="item.title"
              />
              <span v-else class="play-icon">▶</span>
            </div>
            <p class="tile-title">{{ item.title }}</p>
            <p v-if="item.artist" class="tile-subtitle">{{ item.artist }}</p>
          </div>
        </div>

        <!-- VIEW FOR POSTS (Vertical Feed Format) -->
        <div
          v-else-if="activeTab === 'posts' && textPosts.length > 0"
          class="posts-feed"
        >
          <div
            v-for="post in textPosts"
            :key="post.id"
            class="post-card clickable"
            @click="openItem(post)"
          >
            <div class="post-header">
              <div class="user-avatar-small"></div>
              <span class="post-author">{{ user?.name }}</span>
            </div>
            <p class="post-text">{{ post.caption || post.title }}</p>
            <div class="post-footer">
              <span class="post-stat">❤️ {{ post.likesCount || 0 }}</span>
              <span class="post-stat"
                >💬 {{ (post.comments || []).length }}</span
              >
            </div>
          </div>
        </div>

        <!-- VIEW FOR FOLLOWING TAB -->
        <div v-else-if="activeTab === 'following'" class="following-section">
          <div v-if="following.length > 0" class="following-grid">
            <div
              v-for="artist in following"
              :key="artist.id"
              class="followed-artist-card clickable"
              @click="goToArtist(artist.id)"
            >
              <div class="artist-avatar-sm">
                <img
                  v-if="artist.image"
                  :src="artist.image"
                  :alt="artist.name"
                />
                <span v-else>🎵</span>
              </div>
              <div class="followed-info">
                <h4>{{ artist.name }}</h4>
                <p>
                  @{{
                    artist.handle ||
                    artist.name.toLowerCase().replace(/\s+/g, "")
                  }}
                </p>
              </div>
              <button
                class="btn-primary following-state"
                @click.stop="unfollowArtist(artist)"
              >
                Following
              </button>
            </div>
          </div>
          <p v-else class="empty-state">
            You aren't following any artists yet. Discover independent talent in
            the Discover tab!
          </p>
        </div>

        <!-- EMPTY STATE (For general tabs) -->
        <p v-else-if="activeTab !== 'following'" class="empty-state">
          {{ emptyMessage }}
        </p>
      </section>

      <!-- Floating upload button -->
      <button
        v-if="
          isArtistOrProducer &&
          (activeTab === 'uploads' || activeTab === 'posts')
        "
        class="upload-fab"
        @click="showUploadModal = true"
        aria-label="Upload"
      ></button>

      <!-- Detail Modal (Connected to player.js) -->
      <div
        v-if="showDetailModal"
        class="modal-overlay"
        @click.self="showDetailModal = false"
      >
        <div class="modal-card detail-card modal-container">
          <div v-if="selectedItem?.type !== 'text'" class="modal-cover">
            <img
              v-if="selectedItem?.image || selectedItem?.coverArt"
              :src="selectedItem.image || selectedItem.coverArt"
              class="modal-cover-img"
            />
            <div v-else class="modal-cover-placeholder">▶</div>
          </div>

          <h3 v-if="selectedItem?.type !== 'text'">
            {{ selectedItem?.title }}
          </h3>
          <p
            v-if="selectedItem?.artist && selectedItem?.type !== 'text'"
            class="modal-subtitle"
          >
            {{ selectedItem.artist }}
          </p>
          <p
            v-if="selectedItem?.caption && selectedItem?.type === 'text'"
            class="post-modal-text"
          >
            "{{ selectedItem.caption }}"
          </p>

          <!-- Player Controls & Interactions -->
          <div class="interaction-bar">
            <button
              v-if="selectedItem?.type !== 'text' && selectedItem?.audioUrl"
              class="btn-primary play-track-btn"
              @click="handlePlayTrack"
            >
              {{ isCurrentTrackPlaying ? "⏸ Pause Track" : "▶ Play Track" }}
            </button>
            <span v-else class="text-post-badge">💬 Text Update</span>

            <button class="like-btn" @click="toggleLike(selectedItem)">
              ❤️ {{ isItemLiked(selectedItem?.id) ? "Liked" : "Like" }}
            </button>
          </div>

          <!-- Comments Section -->
          <div class="comments-section">
            <h4>Comments</h4>
            <div class="comments-list">
              <div
                v-for="comment in selectedItem?.comments || []"
                :key="comment.id"
                class="comment-item"
              >
                <span class="comment-text">{{ comment.text }}</span>
                <span class="comment-time">{{ comment.createdAt }}</span>
              </div>
              <p
                v-if="
                  !selectedItem?.comments || selectedItem.comments.length === 0
                "
                class="no-comments"
              >
                No comments yet.
              </p>
            </div>

            <div class="comment-input-row">
              <input
                v-model="newCommentText"
                type="text"
                placeholder="Add a comment..."
                @keyup.enter="submitComment(selectedItem.id)"
              />
              <button
                class="btn-primary comment-send-btn"
                @click="submitComment(selectedItem.id)"
              >
                Send
              </button>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn-delete" @click="deletePost(selectedItem.id)">
              Delete
            </button>
            <button
              type="button"
              class="close-btn-secondary"
              @click="showDetailModal = false"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <!-- Followers / Following List Modal -->
      <div
        v-if="showUserListModal"
        class="modal-overlay"
        @click.self="showUserListModal = false"
      >
        <div class="modal-card modal-container">
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
                <p v-if="person.handle" class="user-handle">
                  @{{ person.handle }}
                </p>
              </div>
            </div>
          </div>
          <p v-else class="empty-state">No {{ userListType }} yet.</p>
          <button
            class="btn-outline close-btn"
            @click="showUserListModal = false"
          >
            Close
          </button>
        </div>
      </div>

      <!-- Shared Modals -->
      <EditProfileModal v-model="showEditModal" />
      <CreatePostModal
        v-model="showUploadModal"
        @post-created="handlePostCreated"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import EditProfileModal from "@/components/common/EditProfileModal.vue";
import CreatePostModal from "@/components/common/CreatePostModal.vue";

const store = useStore();
const router = useRouter();

const showEditModal = ref(false);
const user = computed(() => store?.state?.auth?.user ?? null);

const isArtistOrProducer = computed(() => {
  if (store?.getters?.["auth/isArtistOrProducer"] !== undefined) {
    return store.getters["auth/isArtistOrProducer"];
  }
  return true;
});

const followers = computed(() => user.value?.followersList ?? []);
const following = computed(() => user.value?.followingList ?? []);

const roleLabel = computed(() => {
  const roles = user.value?.roles ?? [];
  if (roles.length === 0) return "Artist / Producer";
  return roles.map((r) => r.charAt(0).toUpperCase() + r.slice(1)).join(" · ");
});

const tabs = [
  { key: "uploads", label: "Uploads" },
  { key: "posts", label: "Posts" },
  { key: "reposts", label: "Reposts" },
  { key: "liked", label: "Liked" },
  { key: "following", label: "Following" },
];
const activeTab = ref("uploads");

const allUserUploads = computed(() => store.getters["auth/userUploads"] ?? []);

const uploads = computed(() =>
  allUserUploads.value.filter((item) => item.type !== "text"),
);
const textPosts = computed(() =>
  allUserUploads.value.filter((item) => item.type === "text"),
);
const reposts = ref([]);

// Pulling directly from the registered beats module with debug logs
const liked = computed(() => {
  const result = store.getters["beats/likedBeats"] || [];
  return result;
});

const activeItems = computed(() => {
  if (activeTab.value === "uploads") return uploads.value;
  if (activeTab.value === "liked") return liked.value;
  return [];
});

const emptyMessage = computed(() => {
  const messages = {
    uploads: "No music uploads yet.",
    posts: "No text posts yet.",
    reposts: "No reposts yet.",
    liked: "No liked songs yet.",
    following: "No followed artists yet.",
  };
  return messages[activeTab.value];
});

// --- Followers / Following Modal ---
const showUserListModal = ref(false);
const userListType = ref("followers");

const userListTitle = computed(() => {
  return userListType.value === "followers" ? "Followers" : "Following";
});

const activeUserList = computed(() => {
  return userListType.value === "followers" ? followers.value : following.value;
});

function openUserList(type) {
  if (type === "following") {
    activeTab.value = "following";
    return;
  }
  userListType.value = type;
  showUserListModal.value = true;
}

function goToArtist(personId) {
  showUserListModal.value = false;
  router.push(`/artists/${personId}`);
}

function unfollowArtist(artist) {
  store.commit("auth/TOGGLE_FOLLOW", artist);
}

// --- Detail Card & Playback Handler (Connected to player.js) ---
const showDetailModal = ref(false);
const selectedItem = ref(null);
const newCommentText = ref("");

const currentPlayingTrack = computed(
  () => store?.state?.player?.currentTrack || null,
);
const isPlayingState = computed(() => store?.state?.player?.isPlaying || false);

const isCurrentTrackPlaying = computed(() => {
  if (!selectedItem.value || !currentPlayingTrack.value) return false;
  return (
    currentPlayingTrack.value.id === selectedItem.value.id &&
    isPlayingState.value
  );
});

function openItem(item) {
  selectedItem.value = item;
  newCommentText.value = "";
  showDetailModal.value = true;
}

function handlePlayTrack() {
  if (!selectedItem.value) return;
  if (selectedItem.value.audioUrl) {
    if (isCurrentTrackPlaying.value) {
      store.dispatch("player/togglePlay");
    } else {
      store.dispatch("player/playTrack", selectedItem.value);
    }
  } else {
    alert("Audio stream not available.");
  }
}

function isItemLiked(itemId) {
  const likedBeatsList = store.getters["beats/likedBeats"] || [];
  return likedBeatsList.some((beat) => String(beat.id) === String(itemId));
}

function toggleLike(item) {
  if (!item) return;
  // Pass the full object so the store caches custom profile uploads
  store.dispatch("beats/toggleLikeBeat", item);
}

function submitComment(postId) {
  if (!newCommentText.value.trim()) return;
  store.dispatch("auth/addPostComment", {
    postId,
    text: newCommentText.value.trim(),
  });
  newCommentText.value = "";
}

function deletePost(postId) {
  if (confirm("Are you sure you want to delete this item?")) {
    store.dispatch("auth/deleteUpload", postId);
    showDetailModal.value = false;
  }
}

// --- Create Post Handler ---
const showUploadModal = ref(false);

function handlePostCreated(postData) {
  store.dispatch("auth/createPost", postData);
}
</script>

<style scoped>
.profile-page {
  background-color: var(--bg-main, #f7f7f9);
  color: var(--text-main, #1d1e18);
  min-height: 100vh;
}

/* Full width white header spanning edge-to-edge, matching Discover/Library/Beat Store */
.page-header {
  background-color: var(--bg-surface, #ffffff);
  border-bottom: 1px solid var(--border-subtle, #e2e2e8);
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  margin-bottom: 1.5rem;
  padding: 2rem 0;
}

.header-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  width: 100%;
}

/* Container for content below header, widened to match the other pages */
.profile-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem 4rem;
  position: relative;
}

.profile-header {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.profile-avatar-large {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: var(--border-subtle, #e2e2e8);
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  font-size: 2rem;
}

.profile-details {
  flex: 1;
}

.profile-name {
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0 0 0.75rem;
  color: var(--text-main, #1d1e18);
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
  border-radius: 8px;
  transition: background-color 0.15s ease;
}

.stat.clickable:hover {
  background-color: rgba(173, 235, 255, 0.25);
}

.stat-count {
  font-weight: 800;
  color: var(--text-main, #1d1e18);
}

.stat-label {
  color: var(--text-muted, #66666e);
  font-size: 0.75rem;
}

.profile-bio {
  font-size: 0.85rem;
  color: var(--text-muted, #66666e);
  margin: 0 0 0.75rem;
}

.edit-profile-btn {
  padding: 0.5rem 1.25rem;
  font-size: 0.8rem;
  border-radius: 12px;
}

.content-tabs {
  display: flex;
  gap: 1.5rem;
  border-top: 1px solid var(--border-subtle, #e2e2e8);
  padding-top: 0.75rem;
  margin-bottom: 1rem;
}

.content-tab {
  border: none;
  background: transparent;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-muted, #66666e);
  cursor: pointer;
  padding: 0.3rem 0;
  transition: color 0.2s ease;
}

.content-tab.active {
  color: var(--text-main, #1d1e18);
  border-bottom: 3px solid var(--primary-wisteria, #ba93dc);
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
  background: var(--border-subtle, #e2e2e8);
  border-radius: 12px;
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
  color: var(--text-muted, #66666e);
}

.tile-title {
  font-size: 0.85rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-main, #1d1e18);
}

.tile-subtitle {
  font-size: 0.75rem;
  color: var(--text-muted, #66666e);
  margin: 0.2rem 0 0;
}

/* Following Section Styles */
.following-section {
  margin-top: 1.5rem;
}

.following-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.followed-artist-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--bg-surface, #ffffff);
  border: 1px solid var(--border-subtle, #e2e2e8);
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.followed-artist-card:hover {
  background: rgba(173, 235, 255, 0.25);
}

.artist-avatar-sm {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: var(--border-subtle, #e2e2e8);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  margin-right: 1rem;
}

.artist-avatar-sm img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.followed-info {
  flex: 1;
  text-align: left;
}

.followed-info h4 {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0 0 0.1rem;
  color: var(--text-main, #1d1e18);
}

.followed-info p {
  font-size: 0.75rem;
  color: var(--text-muted, #66666e);
  margin: 0;
}

.following-state {
  background: var(--accent-yellow, #f7e88a);
  color: var(--text-dark-btn, #1d1e18);
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

.following-state:hover {
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
}

/* Posts Feed Styles */
.posts-feed {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-card {
  background: var(--bg-surface, #ffffff);
  border: 1px solid var(--border-subtle, #e2e2e8);
  border-radius: 12px;
  padding: 1.25rem;
  cursor: pointer;
  transition: background 0.15s ease;
}

.post-card:hover {
  background: rgba(173, 235, 255, 0.25);
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
  background: var(--border-subtle, #e2e2e8);
}

.post-author {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-main, #1d1e18);
}

.post-text {
  font-size: 0.9rem;
  color: var(--text-main, #1d1e18);
  margin: 0 0 0.75rem;
  line-height: 1.4;
  text-align: left;
}

.post-footer {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--text-muted, #66666e);
}

.post-modal-text {
  font-size: 0.95rem;
  font-style: italic;
  color: var(--text-light, #fafafd);
  margin: 0 0 1rem;
  line-height: 1.4;
}

.empty-state {
  color: var(--text-muted, #66666e);
  font-size: 0.85rem;
  text-align: center;
  padding: 2rem 0;
}

/* Floating Action Button */
.upload-fab {
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  background: var(--primary-wisteria, #ba93dc);
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  transition: transform 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.upload-fab::before {
  content: "";
  position: absolute;
  width: 3px;
  height: 22px;
  background-color: var(--text-dark-btn, #1d1e18);
  border-radius: 2px;
}

.upload-fab::after {
  content: "";
  position: absolute;
  width: 22px;
  height: 3px;
  background-color: var(--text-dark-btn, #1d1e18);
  border-radius: 2px;
}

.upload-fab:hover {
  transform: translateY(-2px);
}

/* Modal Overlay Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-card {
  padding: 1.75rem;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  background-color: var(--bg-dark-overlay, #0a0908);
  color: var(--text-light, #fafafd);
}

.modal-cover {
  width: 120px;
  height: 120px;
  margin: 0 auto 1rem;
  border-radius: 12px;
  overflow: hidden;
  background: var(--border-subtle, #e2e2e8);
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
  color: var(--text-muted, #66666e);
}

.modal-card h3 {
  margin: 0 0 0.25rem;
  font-size: 1.15rem;
  color: var(--text-light, #fafafd);
}

.modal-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted, #66666e);
  margin: 0 0 0.75rem;
}

.interaction-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  gap: 0.5rem;
}

.play-track-btn {
  flex: 1;
  padding: 0.6rem 1.25rem;
  border-radius: 20px;
}

.text-post-badge {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-light, #fafafd);
  background: rgba(255, 255, 255, 0.1);
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
}

.like-btn {
  background: transparent;
  border: 1px solid var(--border-subtle, #e2e2e8);
  color: var(--text-light, #fafafd);
  padding: 0.5rem 0.85rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.85rem;
}

.comments-section {
  text-align: left;
  border-top: 1px solid var(--border-subtle, #e2e2e8);
  padding-top: 1rem;
  margin-bottom: 1rem;
}

.comments-section h4 {
  font-size: 0.85rem;
  margin: 0 0 0.5rem;
  color: var(--text-light, #fafafd);
}

.comments-list {
  max-height: 120px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.75rem;
}

.comment-item {
  font-size: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-light, #fafafd);
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-time {
  color: var(--text-muted, #66666e);
  font-size: 0.65rem;
  margin-left: 0.5rem;
}

.no-comments {
  font-size: 0.75rem;
  color: var(--text-muted, #66666e);
  margin: 0;
}

.comment-input-row {
  display: flex;
  gap: 0.5rem;
}

.comment-input-row input {
  flex: 1;
  padding: 0.5rem;
  font-size: 0.8rem;
  background: transparent;
  border: 1px solid var(--border-subtle, #e2e2e8);
  border-radius: 8px;
  color: var(--text-light, #fafafd);
}

.comment-input-row input:focus {
  outline: none;
  border-color: var(--primary-wisteria, #ba93dc);
}

.comment-send-btn {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  border-radius: 8px;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1rem;
}

.btn-delete {
  background: #dc2626;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 700;
}

.close-btn-secondary {
  border: 1px solid var(--border-subtle, #e2e2e8);
  background: transparent;
  color: var(--text-light, #fafafd);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 700;
}

.close-btn {
  margin-top: 1rem;
  width: 100%;
  padding: 0.6rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
}

.user-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--border-subtle, #e2e2e8);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--border-subtle, #e2e2e8);
}

.user-name {
  font-size: 0.85rem;
  font-weight: 700;
  margin: 0;
  text-align: left;
  color: var(--text-light, #fafafd);
}

.user-handle {
  font-size: 0.75rem;
  color: var(--text-muted, #66666e);
  margin: 0;
  text-align: left;
}
</style>

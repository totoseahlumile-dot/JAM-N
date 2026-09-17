<script setup>
import { ref, computed } from "vue";
import { useAuth } from "@/composables/useAuth";

// Access global auth guard helper
const { requireAuth } = useAuth();

const showConnections = ref(true);
const toggleConnections = () => {
  showConnections.value = !showConnections.value;
};

const activeFilter = ref("All");
const filters = ["All", "Songs", "Beats", "Posts"];
const searchQuery = ref("");

// Modals State
const showUploadModal = ref(false);
const showSeeAllModal = ref(false);
const seeAllType = ref(""); // 'connections' or 'suggestions'

const posts = ref([
  {
    id: 1,
    artist: "Jamali",
    genre: "R&B, Afropop, and Pop",
    title: "Ohema",
    subtitle: "Single Release",
    content:
      "Hey listeners! Our new single 'Ohema' is coming to JAM'N really SOON! Get ready to vibe with us.",
    type: "Songs",
    badge: "TRENDING",
    liked: false,
  },
  {
    id: 2,
    artist: "Ketsa",
    genre: "Lo-Fi & R&B, Soul",
    title: "Driving Soul",
    subtitle: "Free License Beat",
    content:
      "Purchase this beat on the JAM'N Beat Store for your next project!",
    type: "Beats",
    badge: "EXCLUSIVE",
    liked: false,
  },
  {
    id: 3,
    artist: "Studio Session Updates",
    genre: "Behind The Scenes",
    title: "Album Production Progress",
    subtitle: "Update #4",
    content: "Just finished mixing vocals for the final track on the EP!",
    type: "Posts",
    badge: null,
    liked: false,
  },
]);

const connections = ref([
  { id: 1, name: "James Johnston", role: "JAM'N Developer" },
  { id: 2, name: "Ahlumile Totose", role: "JAM'N Developer" },
  { id: 3, name: "Maiesha Moohan", role: "JAM'N Developer" },
  { id: 4, name: "Nuriyah Davids", role: "JAM'N Developer" },
]);

const suggestions = ref([
  { id: 101, name: "Bustsha Tengwa", role: "Guitarist", followed: false },
  { id: 102, name: "K-lo", role: "Songwriter", followed: false },
  { id: 103, name: "Couture--Beats", role: "Beatmaker", followed: false },
]);

const filteredPosts = computed(() => {
  return posts.value.filter((post) => {
    const matchesFilter =
      activeFilter.value === "All" || post.type === activeFilter.value;
    const query = searchQuery.value.toLowerCase().trim();
    const matchesSearch =
      !query ||
      post.title.toLowerCase().includes(query) ||
      post.artist.toLowerCase().includes(query) ||
      post.genre.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });
});

// Gated Action: Toggle Like
const toggleLike = (post) => {
  requireAuth(() => {
    post.liked = !post.liked;
  });
};

// Gated Action: Toggle Follow
const toggleFollow = (suggestion) => {
  requireAuth(() => {
    suggestion.followed = !suggestion.followed;

    if (suggestion.followed) {
      connections.value.push({
        id: suggestion.id,
        name: suggestion.name,
        role: suggestion.role,
      });
    } else {
      connections.value = connections.value.filter(
        (item) => item.id !== suggestion.id,
      );
    }
  });
};

// Gated Action: Open Upload Modal
const handleOpenUpload = () => {
  requireAuth(() => {
    showUploadModal.value = true;
  });
};

const openSeeAll = (type) => {
  seeAllType.value = type;
  showSeeAllModal.value = true;
};

const newPost = ref({
  artist: "",
  title: "",
  genre: "",
  type: "Songs",
  content: "",
  badge: "",
});

// Gated Action: Uploading new content
const handleUploadPost = () => {
  requireAuth(() => {
    if (!newPost.value.title || !newPost.value.artist) {
      alert("Please enter an Artist name and Title.");
      return;
    }

    posts.value.unshift({
      id: Date.now(),
      artist: newPost.value.artist,
      genre: newPost.value.genre || "General",
      title: newPost.value.title,
      subtitle: `${newPost.value.type}`,
      content: newPost.value.content || "New uploaded item content.",
      type: newPost.value.type,
      badge: newPost.value.badge ? newPost.value.badge.toUpperCase() : null,
      liked: false,
    });

    newPost.value = {
      artist: "",
      title: "",
      genre: "",
      type: "Songs",
      content: "",
      badge: "",
    };
    showUploadModal.value = false;
  });
};

const handlePostOptions = (post) => {
  alert(`Options menu for post by ${post.artist}`);
};
</script>

<template>
  <div class="feed-page">
    <!-- Sub-header Controls Bar -->
    <section class="feed-controls-bar">
      <div class="controls-container">
        <h1 class="page-title">FEED</h1>

        <!-- Genre & Filter Chips -->
        <div class="filter-group">
          <button
            v-for="filter in filters"
            :key="filter"
            class="filter-chip-btn"
            :class="{ active: activeFilter === filter }"
            @click="activeFilter = filter"
          >
            <span v-if="activeFilter === filter" class="check-icon">✓</span>
            {{ filter }}
          </button>
        </div>

        <!-- Search Input -->
        <div class="search-wrapper">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Finding something new?"
            class="search-input"
          />
          <span class="search-icon">🔍︎</span>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button
            class="btn-secondary-container"
            :class="{ active: showConnections }"
            @click="toggleConnections"
          >
            Connections
          </button>
          <button class="btn-primary-brand" @click="handleOpenUpload">
            + Upload
          </button>
        </div>
      </div>
    </section>

    <!-- Main Feed Layout Grid -->
    <main class="feed-layout" :class="{ 'sidebar-open': showConnections }">
      <!-- Main Content Feed -->
      <div class="feed-content">
        <div v-if="filteredPosts.length === 0" class="empty-state">
          <p>No matching feed posts found.</p>
        </div>

        <article v-for="post in filteredPosts" :key="post.id" class="post-card">
          <div class="post-header">
            <div class="artist-info">
              <div class="avatar-placeholder">{{ post.artist.charAt(0) }}</div>
              <div>
                <h3 class="artist-name">{{ post.artist }}</h3>
                <p class="artist-genre">{{ post.genre }}</p>
              </div>
            </div>

            <div class="header-right">
              <span v-if="post.badge" class="badge-gold">{{ post.badge }}</span>
              <button class="btn-more" @click="handlePostOptions(post)">
                ⋮
              </button>
            </div>
          </div>

          <div class="media-container">
            <div class="placeholder-graphic">
              <span>:p</span>
            </div>
          </div>

          <div class="post-body">
            <div class="post-title-row">
              <div>
                <h2 class="post-title">{{ post.title }}</h2>
                <h4 class="post-subtitle">{{ post.subtitle }}</h4>
              </div>

              <button
                class="btn-like"
                :class="{ liked: post.liked }"
                @click="toggleLike(post)"
              >
                {{ post.liked ? "💗" : "🤍" }}
              </button>
            </div>

            <p class="post-text">{{ post.content }}</p>
          </div>
        </article>
      </div>

      <aside v-if="showConnections" class="connections-sidebar">
        <div class="sidebar-section">
          <div class="section-header">
            <h3>Your Connections ({{ connections.length }})</h3>
            <button class="btn-see-all" @click="openSeeAll('connections')">
              See All
            </button>
          </div>
          <div class="connection-cards">
            <div
              v-for="item in connections"
              :key="item.id"
              class="sidebar-card"
            >
              <div class="avatar-placeholder">{{ item.name.charAt(0) }}</div>
              <div>
                <h4 class="card-title">{{ item.name }}</h4>
                <p class="card-sub">{{ item.role }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="sidebar-section">
          <div class="section-header">
            <h3>Follow Suggestions</h3>
            <button class="btn-see-all" @click="openSeeAll('suggestions')">
              See All
            </button>
          </div>
          <div class="connection-cards">
            <div
              v-for="item in suggestions"
              :key="item.id"
              class="sidebar-card suggestion-card"
            >
              <div class="card-left">
                <div class="avatar-placeholder">{{ item.name.charAt(0) }}</div>
                <div>
                  <h4 class="card-title">{{ item.name }}</h4>
                  <p class="card-sub">{{ item.role }}</p>
                </div>
              </div>
              <button
                class="btn-follow-brand"
                :class="{ followed: item.followed }"
                @click="toggleFollow(item)"
              >
                {{ item.followed ? "✓ Followed" : "+ Follow" }}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </main>

    <!-- Upload Modal -->
    <div
      v-if="showUploadModal"
      class="modal-overlay"
      @click.self="showUploadModal = false"
    >
      <div class="modal-card">
        <h2 class="modal-title">Create A New Post</h2>

        <div class="form-group">
          <label>Artist Name</label>
          <input
            v-model="newPost.artist"
            type="text"
            placeholder="Enter Your Name"
          />
        </div>

        <div class="form-group">
          <label>Title</label>
          <input
            v-model="newPost.title"
            type="text"
            placeholder="Track or Post Title"
          />
        </div>

        <div class="form-group">
          <label>Type</label>
          <select v-model="newPost.type">
            <option value="Songs">Songs</option>
            <option value="Beats">Beats</option>
            <option value="Posts">Posts</option>
          </select>
        </div>

        <div class="form-group">
          <label>Badge Callout (Optional)</label>
          <select v-model="newPost.badge">
            <option value="">None</option>
            <option value="TRENDING">TRENDING</option>
            <option value="EXCLUSIVE">EXCLUSIVE</option>
          </select>
        </div>

        <div class="form-group">
          <label>Genre (Optional)</label>
          <input v-model="newPost.genre" type="text" placeholder="e.g. R&B" />
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea
            v-model="newPost.content"
            rows="3"
            placeholder="Write your details..."
          ></textarea>
        </div>

        <div class="modal-actions">
          <button
            class="btn-secondary-container"
            @click="showUploadModal = false"
          >
            Cancel
          </button>
          <button class="btn-primary-brand" @click="handleUploadPost">
            Publish
          </button>
        </div>
      </div>
    </div>

    <!-- See All Modal -->
    <div
      v-if="showSeeAllModal"
      class="modal-overlay"
      @click.self="showSeeAllModal = false"
    >
      <div class="modal-card">
        <h2 class="modal-title">
          {{
            seeAllType === "connections" ? "All Connections" : "All Suggestions"
          }}
        </h2>

        <div class="connection-cards overflow-list">
          <template v-if="seeAllType === 'connections'">
            <div
              v-for="item in connections"
              :key="item.id"
              class="sidebar-card"
            >
              <div class="avatar-placeholder">{{ item.name.charAt(0) }}</div>
              <div>
                <h4 class="card-title">{{ item.name }}</h4>
                <p class="card-sub">{{ item.role }}</p>
              </div>
            </div>
          </template>

          <template v-else>
            <div
              v-for="item in suggestions"
              :key="item.id"
              class="sidebar-card suggestion-card"
            >
              <div class="card-left">
                <div class="avatar-placeholder">{{ item.name.charAt(0) }}</div>
                <div>
                  <h4 class="card-title">{{ item.name }}</h4>
                  <p class="card-sub">{{ item.role }}</p>
                </div>
              </div>
              <button
                class="btn-follow-brand"
                :class="{ followed: item.followed }"
                @click="toggleFollow(item)"
              >
                {{ item.followed ? "✓ Followed" : "+ Follow" }}
              </button>
            </div>
          </template>
        </div>

        <div class="modal-actions">
          <button
            class="btn-secondary-container"
            @click="showSeeAllModal = false"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.feed-page {
  background-color: var(--bg-main);
  color: var(--text-main);
  min-height: 100vh;
}

/* Sub-header Controls Bar */
.feed-controls-bar {
  background-color: var(--bg-surface);
  padding: 1.25rem 2rem;
  border-bottom: 1px solid var(--border-subtle);
}

.controls-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.page-title {
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--text-main);
  margin-right: 1rem;
}

.check-icon {
  margin-right: 0.25rem;
}

/* Search Input */
.search-wrapper {
  flex: 1;
  position: relative;
  min-width: 260px;
}

.search-input {
  width: 100%;
  background-color: #f0f0f5;
  border: none;
  padding: 0.6rem 2.5rem 0.6rem 1rem;
  border-radius: 20px;
  font-size: 0.88rem;
  color: var(--text-main);
  outline: none;
}

.search-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

/* Layout Grid */
.feed-layout {
  max-width: 1400px;
  margin: 2rem auto;
  padding: 0 2rem;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.feed-layout.sidebar-open {
  grid-template-columns: 1fr 320px;
}

.feed-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-main);
  background: var(--bg-surface);
  border-radius: 12px;
  border: 1px dashed #d0d0d8;
}

.post-card {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-card);
  border-radius: 16px;
  overflow: hidden;
  transition: background-color 0.2s ease;
}

.post-card:hover {
  background-color: var(--bg-card-hover);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
}

.artist-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar-placeholder {
  width: 38px;
  height: 38px;
  background-color: var(--primary-wisteria);
  color: var(--text-dark-btn);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.artist-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-main);
}

.artist-genre {
  font-size: 0.78rem;
  color: var(--text-muted);
  font-weight: 400;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-more {
  font-size: 1.2rem;
  color: var(--text-main);
  background: none;
  border: none;
  cursor: pointer;
}

.media-container {
  height: 200px;
  background-color: var(--secondary-frosted);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-graphic span {
  font-size: 3rem;
  opacity: 0.6;
}

.post-body {
  padding: 1.25rem;
}

.post-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.post-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-main);
}

.post-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 400;
  margin-bottom: 0.75rem;
}

.btn-like {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.2rem;
  transition: transform 0.15s ease;
}

.btn-like:hover {
  transform: scale(1.15);
}

.post-text {
  font-size: 0.9rem;
  font-weight: 400;
  color: var(--text-main);
}

/* Sidebar Specifics */
.connections-sidebar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  border-left: 1px solid var(--border-card);
  padding-left: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h3 {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-main);
}

.btn-see-all {
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--text-main);
  opacity: 0.7;
  background: none;
  border: none;
  cursor: pointer;
}

.connection-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sidebar-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-card);
  padding: 0.75rem;
  border-radius: 12px;
  transition: background-color 0.2s ease;
}

.sidebar-card:hover {
  background-color: var(--bg-card-hover);
}

.suggestion-card {
  justify-content: space-between;
}

.card-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.card-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-main);
}

.card-sub {
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--text-muted);
}

.overflow-list {
  max-height: 300px;
  overflow-y: auto;
}
</style>

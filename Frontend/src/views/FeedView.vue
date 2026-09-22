<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuth } from "@/composables/useAuth";
import api from "@/services/api";
import PostCard from "@/components/posts/PostCard.vue";
import AuthModal from "@/components/AuthModal.vue";
import CreatePostModal from "@/components/posts/CreatePost.vue";

const { requireAuth, isGuest } = useAuth();

const showConnections = ref(true);

const toggleConnections = () => {
  showConnections.value = !showConnections.value;
};

const activeFilter = ref("All");
const filters = ["All", "Songs", "Beats", "Posts"];
const searchQuery = ref("");

const showUploadModal = ref(false);
const showSeeAllModal = ref(false);
const seeAllType = ref("");

const posts = ref([]);
const loading = ref(true);

const fetchPosts = async () => {
  try {
    loading.value = true;
    const response = await api.get("/posts");
    posts.value = response.data || [];
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    posts.value = [
      {
        id: 1,
        artist: "Jamali",
        genre: "R&B, Afropop, and Pop",
        title: "Ohema",
        type: "Single Release",
        description: "Hey listeners! Our new single 'Ohema' is coming to JAM'N really SOON!",
        category: "Songs",
        status: "TRENDING",
        isTrending: true,
        liked: false,
        image: "/images/Ohema.jpg",
      }
    ];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchPosts();
});

const connections = ref([
  { id: 1, name: "James Johnston", role: "JAM'N Developer" },
  { id: 2, name: "Ahlumile Totose", role: "JAM'N Developer"},
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
      activeFilter.value === "All" || post.category === activeFilter.value;
    const query = searchQuery.value.toLowerCase().trim();
    const matchesSearch =
      !query ||
      post.title?.toLowerCase().includes(query) ||
      post.artist?.toLowerCase().includes(query) ||
      post.genre?.toLowerCase().includes(query) ||
      (post.description && post.description.toLowerCase().includes(query));

    return matchesFilter && matchesSearch;
  });
});

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

const handleToggleLike = async (postId) => {
  requireAuth(async () => {
    const targetPost = posts.value.find((p) => p.id === postId);
    if (targetPost) {
      targetPost.liked = !targetPost.liked;
      try {
        await api.post(`/posts/${postId}/like`);
      } catch (err) {
        console.error("Failed to sync like state:", err);
      }
    }
  });
};

const handleOpenUpload = () => {
  requireAuth(() => {
    showUploadModal.value = true;
  });
};

const openSeeAll = (type) => {
  requireAuth(() => {
    seeAllType.value = type;
    showSeeAllModal.value = true;
  });
};

const handleCreatePost = async (postData) => {
  try {
    const formData = new FormData();
    formData.append("title", postData.title);
    formData.append("artist", postData.artistName || "Anonymous Artist");
    formData.append("genre", postData.genre || "General");
    formData.append("type", postData.type);
    formData.append("category", postData.type);
    formData.append("description", postData.description || "");
    if (postData.badge && postData.badge !== "None") {
      formData.append("status", postData.badge.toUpperCase());
    }
    if (postData.coverFile) {
      formData.append("image", postData.coverFile);
    }

    const response = await api.post("/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    posts.value.unshift(response.data);
    showUploadModal.value = false;
  } catch (error) {
    console.error("Failed to create post:", error);
    alert(error.response?.data?.message || "Failed to create post. Please check backend.");
  }
};
</script>

<template>
  <div class="feed-page">
    <section class="feed-controls-bar">
      <div class="controls-container">
        <h1 class="page-title">FEED</h1>

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

        <div class="search-wrapper">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Finding something new?"
            class="search-input"
          />
          <span class="search-icon">🔍︎</span>
        </div>

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

    <main class="feed-layout" :class="{ 'sidebar-open' : showConnections }">
      <div class="feed-content">
        <div v-if="loading" class="empty-state">
          <p>Loading feed...</p>
        </div>
        <div v-else-if="filteredPosts.length === 0" class="empty-state">
          <p>No matching feed posts found.</p>
        </div>

        <PostCard
          v-for="post in filteredPosts"
          :key="post.id"
          :post="post"
          @toggle-like="handleToggleLike"
        />
      </div>

      <aside v-if="showConnections" class="connections-sidebar">
        <div v-if="!isGuest" class="sidebar-section">
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

    <CreatePostModal
      v-if="showUploadModal"
      @close="showUploadModal = false"
      @submit="handleCreatePost"
    />

    <div
      v-if="showSeeAllModal"
      class="modal-overlay"
      @click.self="showSeeAllModal = false"
    >
      <div class="modal-card">
        <h2 class="modal-title">
          {{
            seeAllType === 'connections' ? "All Connections" : "All Suggestions"
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

    <AuthModal />
  </div>
</template>

<style scoped>
.feed-page {
  background-color: var(--bg-main);
  color: var(--text-main);
  min-height: 100vh;
}
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
.action-buttons {
  display: flex;
  gap: 0.75rem;
}
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
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal-card {
  background: var(--bg-surface);
  padding: 1.5rem;
  border-radius: 16px;
  width: 100%;
  max-width: 440px;
}
.overflow-list {
  max-height: 300px;
  overflow-y: auto;
}
</style>
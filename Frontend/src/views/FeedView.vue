<script setup>
import { ref } from "vue";

const activeFilter = ref("All");
const filters = ["All", "Songs", "Beats", "Music"];
</script>

<template>
  <div class="feed-page">
    <div class="feed-header">
      <h2>FEED</h2>

      <div class="filter-pills">
        <button
          v-for="filter in filters"
          :key="filter"
          :class="['pill-btn', { active: activeFilter === filter }]"
          @click="activeFilter = filter"
        >
          {{ filter }}
        </button>
      </div>

      <div class="feed-actions">
        <input
          type="text"
          placeholder="Search artists, bands, genres..."
          class="search-input"
        />
        <button class="btn-secondary">Connections</button>
        <button class="btn-primary">+ Upload</button>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="feed-content">
      <!-- Left Column: Posts Stream -->
      <main class="posts-stream">
        <div class="post-card">
          <div class="post-header">
            <div class="avatar">A</div>
            <div class="artist-info">
              <span class="artist-name">Artist Name</span>
              <span class="genre">Genre</span>
            </div>
          </div>
          <div class="post-media-placeholder">
            <!-- Media content goes here -->
          </div>
          <div class="post-body">
            <h3>Title</h3>
            <p>Description / Post Content</p>
          </div>
        </div>
      </main>

      <!-- Right Column: Sidebar -->
      <aside class="feed-sidebar">
        <div class="sidebar-card">
          <h3>Your Connections</h3>
          <!-- Connections list -->
        </div>

        <div class="sidebar-card">
          <h3>Follow Suggestions</h3>
          <!-- Suggestions list -->
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.feed-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feed-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.filter-pills {
  display: flex;
  gap: 0.5rem;
  background-color: #e0e0e0;
  padding: 4px;
  border-radius: 20px;
}

.pill-btn {
  border: none;
  background: transparent;
  padding: 0.4rem 1rem;
  border-radius: 16px;
  font-weight: 600;
  cursor: pointer;
}

.pill-btn.active {
  background-color: #6c52a1;
  color: #ffffff;
}

.feed-actions {
  display: flex;
  gap: 0.75rem;
  margin-left: auto;
}

.search-input {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid #ccc;
  width: 250px;
}

.btn-primary {
  background-color: #6c52a1;
  color: white;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 700;
}

.btn-secondary {
  background-color: #e8dcfc;
  color: #453472;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 700;
}

.feed-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
}

.post-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.post-media-placeholder {
  width: 100%;
  height: 200px;
  background-color: #eaeaea;
  border-radius: 8px;
  margin: 1rem 0;
}

.sidebar-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}
</style>

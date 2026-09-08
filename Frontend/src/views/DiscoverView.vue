<template>
  <div class="discover-page">
    <header class="page-header">
      <h1>DISCOVER MUSIC</h1>
      <div class="search-bar">
        <input
          type="text"
          placeholder="Search artists, bands, genres, or cities..."
          v-model="searchQuery"
        />
        <svg class="search-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
      </div>

      <!-- Filter Tags - now built dynamically from real artist genres -->
      <div class="filter-tags">
        <button
          v-for="genre in genreOptions"
          :key="genre"
          class="tag"
          :class="{ active: activeGenre === genre }"
          @click="activeGenre = genre"
        >
          {{ genre }}
        </button>
      </div>
    </header>

    <!-- Trending Artists Section - real data, first 5 artists -->
    <section class="section">
      <div class="section-header">
        <h2>Trending Artists</h2>
        <a href="#" class="see-all">See All</a>
      </div>
      <div class="card-grid">
        <div v-for="artist in trendingArtists" :key="artist.id" class="artist-card">
          <img :src="artist.image" :alt="artist.name" class="placeholder-img" />
          <p class="artist-name">{{ artist.name }}</p>
          <p class="artist-genre">{{ artist.genre }}</p>
          <div class="card-actions">
            <RouterLink :to="`/artists/${artist.id}`" class="btn-outline">View Profile</RouterLink>
            <button class="btn-primary">Follow Artist</button>
          </div>
        </div>
      </div>
      <p v-if="trendingArtists.length === 0" class="empty-state">No artists match this filter yet.</p>
    </section>

    <!-- Recommended Artists Section - real data, remaining artists -->
    <section class="section">
      <div class="section-header">
        <h2>Recommended Artists</h2>
        <a href="#" class="see-all">See All</a>
      </div>
      <div class="card-grid">
        <div v-for="artist in recommendedArtists" :key="artist.id" class="artist-card compact">
          <img :src="artist.image" :alt="artist.name" class="placeholder-img-sm" />
          <div class="artist-info">
            <p class="artist-name">{{ artist.name }}</p>
            <p class="artist-genre">{{ artist.genre }}</p>
          </div>
        </div>
      </div>
      <p v-if="recommendedArtists.length === 0" class="empty-state">No more artists to show.</p>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useStore } from 'vuex'

const store = useStore()

const searchQuery = ref('')
const activeGenre = ref('All Genres')

// Pull real artists from the shared artists store
const allArtists = computed(() => store.getters['artists/allArtists'])

// Genre pills built dynamically from actual artist data, same pattern as Beat Store
const genreOptions = computed(() => {
  const genres = allArtists.value.map((a) => a.genre)
  return ['All Genres', ...new Set(genres)]
})

// Applies both the genre filter and the search query together
const filteredArtists = computed(() => {
  let result = allArtists.value

  if (activeGenre.value !== 'All Genres') {
    result = result.filter((a) => a.genre === activeGenre.value)
  }

  if (searchQuery.value.trim() !== '') {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (a) =>
        a.name.toLowerCase().includes(query) ||
        a.genre.toLowerCase().includes(query)
    )
  }

  return result
})

// Simple split: first 5 filtered artists as "Trending", rest as "Recommended"
// TEMPORARY approach - once there's a real "trending" metric (plays, follows, etc.)
// this should be based on actual popularity data rather than array order.
const trendingArtists = computed(() => filteredArtists.value.slice(0, 5))
const recommendedArtists = computed(() => filteredArtists.value.slice(5))
</script>

<style scoped>
.discover-page {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
}
.page-header h1 {
  font-size: 1.75rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  letter-spacing: 0.03em;
}
.search-bar {
  position: relative;
  max-width: 100%;
  margin-bottom: 1.25rem;
}
.search-bar input {
  width: 100%;
  padding: 0.85rem 1rem 0.85rem 2.75rem;
  background-color: #f2f2f2;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
}
.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #888888;
}
.filter-tags {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
}
.tag {
  border: none;
  background-color: #e8e8f0;
  color: #333333;
  padding: 0.4rem 1.25rem;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  font-weight: 500;
}
.tag.active {
  background-color: #5b5370;
  color: #ffffff;
}
.section {
  margin-bottom: 3rem;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}
.section-header h2 {
  font-size: 1.2rem;
  font-weight: 700;
}
.see-all {
  font-size: 0.85rem;
  color: #666666;
  text-decoration: none;
}
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.25rem;
}
.artist-card {
  background: #f9f9f9;
  border: 1px solid #eeeeee;
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}
.placeholder-img {
  width: 100%;
  height: 160px;
  background-color: #e5e5e5;
  border-radius: 6px;
  margin-bottom: 0.85rem;
  object-fit: cover;
}
.artist-name {
  font-weight: 700;
  font-size: 0.9rem;
  margin: 0;
}
.artist-genre {
  font-size: 0.8rem;
  color: #777777;
  margin: 0 0 1rem 0;
}
.card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}
.card-actions .btn-outline,
.card-actions .btn-primary {
  flex: 1;
  padding: 0.4rem 0.2rem;
  font-size: 0.725rem;
  border-radius: 15px;
  cursor: pointer;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
}
.btn-outline {
  border: 1px solid #ccc;
  background: transparent;
  color: #333;
}
.btn-primary {
  border: none;
  background: #6a5acd;
  color: white;
}
.artist-card.compact {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
}
.placeholder-img-sm {
  width: 48px;
  height: 48px;
  background-color: #e5e5e5;
  border-radius: 6px;
  flex-shrink: 0;
  object-fit: cover;
}
.empty-state {
  opacity: 0.6;
  font-size: 0.85rem;
}
</style>
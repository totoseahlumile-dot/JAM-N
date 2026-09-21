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

      <!-- Filter Tags -->
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

    <!-- Trending Artists Section -->
    <section class="section">
      <div class="section-header">
        <h2>Trending Artists</h2>
        <a href="#" class="see-all">See All</a>
      </div>
      <div class="card-grid">
        <div 
          v-for="artist in trendingArtists" 
          :key="artist.id" 
          class="artist-card clickable"
          @click="goToArtistProfile(artist.id)"
        >
          <div class="image-wrapper">
            <img :src="artist.image" :alt="artist.name" class="placeholder-img" />
            <button
              class="like-btn"
              :class="{ liked: isLiked(artist.id) }"
              @click.stop="toggleLike(artist.id)"
              aria-label="Like artist"
            >
              <svg class="heart-icon" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>
          </div>
          <p class="artist-name">{{ artist.name }}</p>
          <p class="artist-genre">{{ artist.genre }}</p>
          <div class="card-actions" @click.stop>
            <button class="btn-outline" @click="goToArtistProfile(artist.id)">View Profile</button>
            <button
              class="btn-primary"
              :class="{ following: isFollowing(artist.id) }"
              @click="toggleFollow(artist)"
            >
              {{ isFollowing(artist.id) ? 'Following' : 'Follow Artist' }}
            </button>
          </div>
        </div>
      </div>
      <p v-if="trendingArtists.length === 0" class="empty-state">No artists match this filter yet.</p>
    </section>

    <!-- Recommended Artists Section -->
    <section class="section">
      <div class="section-header">
        <h2>Recommended Artists</h2>
        <a href="#" class="see-all">See All</a>
      </div>
      <div class="card-grid">
        <div 
          v-for="artist in recommendedArtists" 
          :key="artist.id" 
          class="artist-card compact clickable"
          @click="goToArtistProfile(artist.id)"
        >
          <img :src="artist.image" :alt="artist.name" class="placeholder-img-sm" />
          <div class="artist-info">
            <p class="artist-name">{{ artist.name }}</p>
            <p class="artist-genre">{{ artist.genre }}</p>
          </div>
          <button
            class="like-btn compact-like"
            :class="{ liked: isLiked(artist.id) }"
            @click.stop="toggleLike(artist.id)"
            aria-label="Like artist"
          >
            <svg class="heart-icon" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>
        </div>
      </div>
      <p v-if="recommendedArtists.length === 0" class="empty-state">No more artists to show.</p>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const store = useStore()
const router = useRouter()

const searchQuery = ref('')
const activeGenre = ref('All Genres')

const allArtists = computed(() => store.getters['artists/allArtists'] ?? [])

const genreOptions = computed(() => {
  const genres = allArtists.value.map((a) => a.genre)
  return ['All Genres', ...new Set(genres)]
})

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

const trendingArtists = computed(() => filteredArtists.value.slice(0, 5))
const recommendedArtists = computed(() => filteredArtists.value.slice(5))

// Programmatic Router Navigation
function goToArtistProfile(artistId) {
  router.push(`/artists/${artistId}`)
}

// --- Like Functionality ---
function isLiked(id) {
  return store.getters['auth/isLiked']?.(id) ?? false
}

function toggleLike(id) {
  store.commit('auth/TOGGLE_LIKE', id)
}

// --- Follow Functionality ---
function isFollowing(artistId) {
  return store.getters['auth/isFollowing']?.(artistId) ?? false
}

async function toggleFollow(artist) {
  if (!store.getters['auth/isLoggedIn']) { router.push('/login'); return }
  try { await store.dispatch('auth/toggleFollowArtist', artist.id) }
  catch (error) { alert(error.message) }
}
</script>

<style scoped>
.item-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  text-align: center;
  padding: 0.5rem 0;
}

.cover-art {
  width: 180px;
  height: 180px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: #eee;
}

.cover-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.art-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e8e8f0;
}

.music-note {
  font-size: 3rem;
  opacity: 0.5;
}

.item-info {
  width: 100%;
}

.item-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
  color: #222;
}

.item-subtitle {
  font-size: 0.85rem;
  color: #666;
  margin: 0 0 1.25rem;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.25rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: transform 0.15s ease, background-color 0.15s ease;
}

.action-btn:active {
  transform: scale(0.96);
}

.action-btn.primary {
  background: #333;
  color: #fff;
}

.action-btn.primary:hover {
  background: #111;
}

.action-btn.secondary {
  background: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
}

.action-btn.secondary.active {
  color: #e63946;
  border-color: #e63946;
  background: #fff0f1;
}

.btn-icon {
  font-size: 0.95rem;
}
</style>

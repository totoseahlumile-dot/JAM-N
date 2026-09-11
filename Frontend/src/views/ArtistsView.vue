<template>
  <div class="artists-discovery-page">
    <!-- Header & Search -->
    <header class="discovery-header">
      <h2>Discover Local Artists</h2>
      <p class="subtitle">Explore independent talent, beats, and sounds from your scene.</p>
      
      <div class="search-filter-bar">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search artists by name or genre..." 
          class="search-input"
        />
        
        <div class="genre-filters">
          <button 
            v-for="genre in genres" 
            :key="genre"
            class="genre-chip"
            :class="{ active: selectedGenre === genre }"
            @click="selectedGenre = genre"
          >
            {{ genre }}
          </button>
        </div>
      </div>
    </header>

    <!-- Artists Grid -->
    <section v-if="filteredArtists.length > 0" class="artists-grid">
      <div 
        v-for="artist in filteredArtists" 
        :key="artist.id" 
        class="artist-card"
        @click="goToArtist(artist.id)"
      >
        <div class="artist-avatar-container">
          <img v-if="artist.image" :src="artist.image" :alt="artist.name" class="artist-img" />
          <div v-else class="artist-placeholder">🎵</div>
        </div>
        
        <div class="artist-info">
          <h3 class="artist-name">{{ artist.name }}</h3>
          <p class="artist-genre">{{ artist.genre || 'Independent Artist' }}</p>
          <span v-if="artist.location" class="artist-location">📍 {{ artist.location }}</span>
        </div>
      </div>
    </section>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <p>No artists found matching your search.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

const searchQuery = ref('')
const selectedGenre = ref('All')

// Mock genres list + 'All' option
const genres = ['All', 'Hip Hop', 'Amapiano', 'R&B', 'Electronic', 'Soul', 'Indie']

// Pull artists from Vuex store (with a safe fallback array if store module isn't populated yet)
const artists = computed(() => {
  return store?.getters?.['artists/allArtists'] ?? [
    { id: 'art_1', name: 'Zola Sounds', genre: 'Amapiano', location: 'Cape Town', image: null },
    { id: 'art_2', name: 'Kloof Street Collective', genre: 'Indie', location: 'Cape Town', image: null },
    { id: 'art_3', name: 'Buntu Beats', genre: 'Hip Hop', location: 'Johannesburg', image: null },
    { id: 'art_4', name: 'Nala Soul', genre: 'R&B', location: 'Durban', image: null },
  ]
})

// Filter artists based on search query and genre chip
const filteredArtists = computed(() => {
  return artists.value.filter((artist) => {
    const matchesSearch = 
      artist.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (artist.genre && artist.genre.toLowerCase().includes(searchQuery.value.toLowerCase()))
    
    const matchesGenre = selectedGenre.value === 'All' || artist.genre === selectedGenre.value

    return matchesSearch && matchesGenre
  })
})

function goToArtist(artistId) {
  router.push(`/artists/${artistId}`)
}
</script>

<style scoped>
.artists-discovery-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.discovery-header {
  margin-bottom: 2rem;
}

.discovery-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
}

.subtitle {
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 1.25rem;
}

.search-filter-bar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  outline: none;
}

.search-input:focus {
  border-color: #333;
}

.genre-filters {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
}

.genre-chip {
  background: #f0f2f5;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #555;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease, color 0.15s ease;
}

.genre-chip:hover {
  background: #e4e6eb;
}

.genre-chip.active {
  background: #333;
  color: #fff;
}

.artists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.25rem;
}

.artist-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.artist-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.artist-avatar-container {
  width: 90px;
  height: 90px;
  margin: 0 auto 0.75rem;
  border-radius: 50%;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.artist-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.artist-placeholder {
  font-size: 1.75rem;
}

.artist-name {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 0.2rem;
  color: #222;
}

.artist-genre {
  font-size: 0.8rem;
  color: #666;
  margin: 0 0 0.4rem;
}

.artist-location {
  font-size: 0.75rem;
  color: #888;
}

.empty-state {
  text-align: center;
  padding: 3rem 0;
  color: #777;
  font-size: 0.9rem;
}
</style>
<template>
  <div class="library-view">
    <header class="library-header">
      <h1>Your Library</h1>
      <div class="library-tabs">
        <button
          v-for="tab in tabs"
          :key="tab"
          class="library-tab"
          :class="{ active: activeTab === tab }"
          @click="activeTab = tab"
        >
          {{ tab }}
        </button>
      </div>
    </header>

    <!-- Liked Songs -->
    <section v-if="activeTab === 'Songs'" class="library-section">
      <h2>Liked Songs</h2>
      <div class="track-grid">
        <div v-for="track in likedSongs" :key="track.id" class="track-card">
          <div class="track-cover-placeholder"></div>
          <p class="track-title">{{ track.title }}</p>
          <p class="track-artist">{{ track.artist }}</p>
        </div>
      </div>
    </section>

    <!-- Playlists (placeholder structure - no playlists created yet) -->
    <section v-if="activeTab === 'Playlists'" class="library-section">
      <h2>Your Playlists</h2>
      <p class="empty-state">No playlists yet.</p>
    </section>

    <!-- Followed Artists -->
    <section v-if="activeTab === 'Artists'" class="library-section">
      <h2>Followed Artists</h2>
      <div class="artist-grid">
        <div v-for="artist in allArtists" :key="artist.id" class="artist-card">
          <img :src="artist.image" :alt="artist.name" class="artist-avatar" />
          <p class="artist-name">{{ artist.name }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const tabs = ['Songs', 'Playlists', 'Artists']
const activeTab = ref('Songs')

// Pull artists from the shared artists store (same source Discover/Library both use)
const allArtists = computed(() => store.getters['artists/allArtists'])

// TEMPORARY: liked songs built from real artist track data, since there's
// no "liked songs" concept in the backend yet. Pulls the first track from
// each artist as a stand-in. Replace once a real liked-songs feature exists.
const likedSongs = computed(() => {
  return allArtists.value
    .filter((artist) => artist.tracks && artist.tracks.length > 0)
    .map((artist) => ({
      id: artist.tracks[0].id,
      title: artist.tracks[0].title,
      artist: artist.name,
    }))
})
</script>

<style scoped>
.library-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.library-header h1 {
  margin-bottom: 1rem;
}

.library-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.library-tab {
  border: 1px solid #ccc;
  background: transparent;
  padding: 0.4rem 1rem;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.85rem;
}

.library-tab.active {
  border-color: #333;
  font-weight: 600;
}

.library-section h2 {
  font-size: 1rem;
  margin-bottom: 1rem;
}

.track-grid,
.artist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
}

.track-cover-placeholder {
  width: 100%;
  aspect-ratio: 1;
  background: #eee;
  border-radius: 6px;
  margin-bottom: 0.5rem;
}

.track-title,
.artist-name {
  font-size: 0.85rem;
  font-weight: 600;
  margin: 0;
}

.track-artist {
  font-size: 0.75rem;
  opacity: 0.7;
  margin: 0;
}

.artist-card {
  text-align: center;
}

.artist-avatar {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 0.5rem;
}

.empty-state {
  opacity: 0.6;
  font-size: 0.9rem;
}
</style>
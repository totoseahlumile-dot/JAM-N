<template>
  <div class="playlist-detail-page">
    <button class="back-btn" @click="$router.push('/library')">← Back to Library</button>
    
    <div v-if="playlist" class="playlist-hero">
      <div class="playlist-hero-cover"><span>🎵</span></div>
      <div class="playlist-hero-info">
        <span class="playlist-tag">Playlist</span>
        <h2>{{ playlist.title }}</h2>
        <p class="playlist-meta">{{ (playlist.tracks || []).length }} songs</p>
      </div>
    </div>

    <!-- Tracks Table -->
    <div v-if="playlist" class="playlist-table">
      <div class="table-header">
        <span>#</span>
        <span>Title</span>
        <span>Artist</span>
        <span></span>
      </div>
      <div 
        v-for="(song, index) in (playlist.tracks || [])" 
        :key="song.id" 
        class="table-row"
      >
        <span class="track-index">{{ index + 1 }}</span>
        <span class="track-col-title" @click="playTrack(song)">{{ song.title }}</span>
        <span class="track-col-artist">{{ song.artist }}</span>
        <button class="remove-btn" @click="removeTrack(song.id)">✕</button>
      </div>
      <p v-if="!playlist.tracks || playlist.tracks.length === 0" class="empty-state">
        This playlist is empty. Add songs from your Liked Songs!
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

const route = useRoute()
const store = useStore()

const playlistId = route.params.id
const playlist = computed(() => {
  const playlists = store.getters['auth/userPlaylists'] || []
  return playlists.find(p => p.id === playlistId)
})

function playTrack(track) {
  if (track.audioUrl) {
    store.dispatch('player/playTrack', track)
  } else {
    alert('Audio stream not available.')
  }
}

function removeTrack(trackId) {
  store.dispatch('auth/removeTrackFromPlaylist', {
    playlistId,
    trackId
  })
}
</script>

<style scoped>
/* Add your preferred layout styles here */
.playlist-detail-page { padding: 2rem; max-width: 1000px; margin: 0 auto; }
.back-btn { background: transparent; border: none; font-weight: 600; cursor: pointer; margin-bottom: 1.5rem; }
.playlist-hero { display: flex; align-items: flex-end; gap: 1.5rem; margin-bottom: 2rem; border-bottom: 1px solid #eee; padding-bottom: 1.5rem; }
.playlist-hero-cover { width: 140px; height: 140px; background: #e4e6eb; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 3rem; }
.table-header, .table-row { display: grid; grid-template-columns: 40px 2fr 1fr 40px; padding: 0.6rem 0.5rem; align-items: center; border-bottom: 1px solid #f2f2f2; font-size: 0.85rem; }
.table-header { font-weight: 600; opacity: 0.6; }
.track-col-title { font-weight: 600; cursor: pointer; }
.remove-btn { background: transparent; border: none; color: #ff4d4d; cursor: pointer; }
</style>
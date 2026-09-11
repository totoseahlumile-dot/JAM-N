<template>
  <div class="artist-profile-page" v-if="artist">
    <!-- Artist Header -->
    <header class="artist-header">
      <div class="artist-avatar-large">
        <img v-if="artist.image" :src="artist.image" :alt="artist.name" class="avatar-img" />
        <span v-else class="avatar-placeholder">🎵</span>
      </div>

      <div class="artist-details">
        <div class="title-row">
          <h2 class="artist-name">{{ artist.name }}</h2>
          <button 
            class="follow-btn" 
            :class="{ following: isFollowing }"
            @click="toggleFollow"
          >
            {{ isFollowing ? 'Following' : 'Follow' }}
          </button>
        </div>

        <p class="artist-meta">
          <span v-if="artist.genre" class="badge">{{ artist.genre }}</span>
          <span v-if="artist.location" class="location">📍 {{ artist.location }}</span>
        </p>

        <p class="artist-bio">{{ artist.bio || 'Independent artist sharing sounds, beats, and culture on JAM-N.' }}</p>
      </div>
    </header>

    <!-- Artist Tracks Section -->
    <section class="artist-tracks-section">
      <h3>Tracks & Beats</h3>
      
      <div v-if="formattedTracks.length > 0" class="tracks-list">
        <div 
          v-for="track in formattedTracks" 
          :key="track.id" 
          class="track-row"
        >
          <div class="track-info" @click="playTrack(track)">
            <span class="play-indicator">▶</span>
            <div>
              <p class="track-title">{{ track.title }}</p>
              <p class="track-genre">{{ artist.name }}</p>
            </div>
          </div>

          <button 
            class="like-track-btn" 
            :class="{ liked: isTrackLiked(track.id) }"
            @click="toggleLike(track.id)"
          >
            ❤️
          </button>
        </div>
      </div>

      <p v-else class="empty-state">No tracks uploaded by this artist yet.</p>
    </section>
  </div>

  <div v-else class="artist-profile-page empty-state">
    <p>Artist not found.</p>
    <button class="back-btn" @click="router.push('/artists')">Back to Artists</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'

const store = useStore()
const route = useRoute()
const router = useRouter()

const artistId = route.params.id

// Get artist details from store or mock list
const artist = computed(() => {
  const allArtists = store?.getters?.['artists/allArtists'] ?? [
    { id: 'art_1', name: 'Zola Sounds', genre: 'Amapiano', location: 'Cape Town', image: null, bio: 'Pioneering new wave Amapiano rhythms.' },
    { id: 'art_2', name: 'Kloof Street Collective', genre: 'Indie', location: 'Cape Town', image: null, bio: 'Alternative indie band from the Mother City.' },
    { id: 'art_3', name: 'Buntu Beats', genre: 'Hip Hop', location: 'Johannesburg', image: null, bio: 'Gritty underground hip hop producer.' },
    { id: 'art_4', name: 'Nala Soul', genre: 'R&B', location: 'Durban', image: null, bio: 'Smooth neo-soul vocals and melodies.' },
  ]
  return allArtists.find(a => a.id === artistId)
})

// Check if current user is following this artist using your existing Vuex getter
const isFollowing = computed(() => {
  if (!artist.value) return false
  return store?.getters?.['auth/isFollowing']?.(artist.value.id) ?? false
})

function toggleFollow() {
  if (!artist.value) return
  store.commit('auth/TOGGLE_FOLLOW', {
    id: artist.value.id,
    name: artist.value.name,
    handle: artist.value.name.toLowerCase().replace(/\s+/g, '')
  })
}

// Safely normalize tracks whether they are stored as strings or objects
const formattedTracks = computed(() => {
  if (!artist.value) return []
  
  const rawTracks = artist.value.tracks || [
    `${artist.value.name} - Live Session`,
    `${artist.value.name} - Studio Demo`
  ]

  return rawTracks.map((track, index) => {
    if (typeof track === 'string') {
      return {
        id: `${artistId}_t_${index}`,
        title: track,
        audioUrl: null
      }
    }
    return {
      id: track.id || `${artistId}_t_${index}`,
      title: track.title || 'Untitled Track',
      audioUrl: track.audioUrl || null
    }
  })
})

function isTrackLiked(trackId) {
  return store?.getters?.['auth/isLiked']?.(trackId) ?? false
}

function toggleLike(trackId) {
  store.commit('auth/TOGGLE_LIKE', trackId)
}

function playTrack(track) {
  if (store) {
    store.dispatch('player/playTrack', {
      id: track.id,
      title: track.title,
      artist: artist.value?.name,
      image: artist.value?.image,
      audioUrl: track.audioUrl
    })
  }
}
</script>

<style scoped>
.artist-profile-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem;
}

.artist-header {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  padding-bottom: 2rem;
  border-bottom: 1px solid #eee;
  margin-bottom: 2rem;
}

.artist-avatar-large {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  text-align: center;
  font-size: 0.75rem;
  color: #666;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 2.5rem;
}

.artist-details {
  flex: 1;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.artist-name {
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0;
}

.follow-btn {
  background: #333;
  color: white;
  border: none;
  padding: 0.4rem 1.2rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}

.follow-btn.following {
  background: #f0f2f5;
  color: #333;
  border: 1px solid #ccc;
}

.artist-meta {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  font-size: 0.85rem;
  color: #666;
  margin: 0 0 0.75rem;
}

.badge {
  background: #f0f2f5;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.75rem;
  color: #444;
}

.artist-bio {
  font-size: 0.85rem;
  color: #555;
  margin: 0;
  line-height: 1.4;
}

.artist-tracks-section h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem;
}

.tracks-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.track-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 8px;
  transition: background 0.15s ease;
}

.track-row:hover {
  background: #f5f5f5;
}

.track-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  flex: 1;
}

.play-indicator {
  font-size: 0.9rem;
  opacity: 0.6;
}

.track-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.1rem;
  color: #222;
}

.track-genre {
  font-size: 0.75rem;
  color: #777;
  margin: 0;
}

.like-track-btn {
  background: transparent;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  opacity: 0.4;
  transition: opacity 0.15s ease;
}

.like-track-btn.liked {
  opacity: 1;
}

.empty-state {
  text-align: center;
  padding: 2rem 0;
  color: #777;
  font-size: 0.9rem;
}

.back-btn {
  margin-top: 1rem;
  background: #333;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}
</style>
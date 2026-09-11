<template>
  <div class="public-profile-page" v-if="artist">
    <header class="profile-header">
      <img :src="artist.image" :alt="artist.name" class="profile-avatar" />
      <div class="profile-details">
        <h1>{{ artist.name }}</h1>
        <p class="handle">@{{ artistHandle }}</p>
        <p class="genre-tag">{{ artist.genre }}</p>
        
        <div class="action-buttons">
          <button 
            class="btn-primary" 
            :class="{ following: isFollowing }"
            @click="toggleFollow"
          >
            {{ isFollowing ? 'Following' : 'Follow Artist' }}
          </button>
          
          <button 
            class="like-btn" 
            :class="{ liked: isLiked }"
            @click="toggleLike"
          >
            <svg class="heart-icon" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Content Tabs / Track List -->
    <section class="artist-content">
      <h2>Tracks & Beats</h2>
      <div v-if="artist.tracks && artist.tracks.length" class="track-list">
        <div v-for="track in artist.tracks" :key="track.id" class="track-card">
          <p class="track-title">{{ track.title }}</p>
        </div>
      </div>
      <p v-else class="empty-msg">No tracks uploaded yet.</p>
    </section>
  </div>

  <div v-else class="not-found">
    <h2>Artist Not Found</h2>
    <RouterLink to="/discover" class="btn-outline">Back to Discover</RouterLink>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useStore } from 'vuex'

const route = useRoute()
const store = useStore()

const artistId = computed(() => route.params.id)

// Fetch target artist from the artists Vuex module
const artist = computed(() => {
  const all = store.getters['artists/allArtists'] ?? []
  return all.find((a) => String(a.id) === String(artistId.value))
})

const artistHandle = computed(() => {
  return artist.value?.name ? artist.value.name.toLowerCase().replace(/\s+/g, '_') : ''
})

// Social status getters from auth module
const isLiked = computed(() => store.getters['auth/isLiked']?.(artistId.value) ?? false)
const isFollowing = computed(() => store.getters['auth/isFollowing']?.(artistId.value) ?? false)

function toggleLike() {
  if (artist.value) {
    store.commit('auth/TOGGLE_LIKE', artist.value.id)
  }
}

function toggleFollow() {
  if (artist.value) {
    store.commit('auth/TOGGLE_FOLLOW', {
      id: artist.value.id,
      name: artist.value.name,
      handle: artistHandle.value,
      image: artist.value.image ?? null
    })
  }
}
</script>

<style scoped>
.public-profile-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}
.profile-header {
  display: flex;
  gap: 2rem;
  align-items: center;
  margin-bottom: 3rem;
}
.profile-avatar {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  background-color: #e5e5e5;
}
.handle {
  color: #777;
  margin-bottom: 0.5rem;
}
.genre-tag {
  display: inline-block;
  background: #e8e8f0;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}
.action-buttons {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.btn-primary {
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  border: none;
  background: #6a5acd;
  color: #fff;
  cursor: pointer;
  font-weight: 600;
}
.btn-primary.following {
  background: #e8e8f0;
  color: #333;
}
.like-btn {
  background: transparent;
  border: 1px solid #ccc;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.like-btn.liked .heart-icon {
  fill: #e63946;
  stroke: #e63946;
}
.heart-icon {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: #333;
  stroke-width: 2;
}
.not-found {
  text-align: center;
  padding: 4rem;
}
</style>
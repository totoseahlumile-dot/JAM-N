<template>
  <footer class="audio-player" v-if="currentTrack">
    <div class="player-track-info">
      <img :src="currentTrack.coverArt" :alt="currentTrack.title" class="player-cover" />
      <div class="player-text">
        <p class="player-title">{{ currentTrack.title }}</p>
        <p class="player-artist">{{ currentTrack.artist }}</p>
      </div>
    </div>
    <div class="player-controls">
      <button class="player-play-btn" @click="togglePlay">
        {{ isPlaying ? 'Pause' : 'Play' }}
      </button>
    </div>
    <div class="player-progress">
      <span class="player-time">{{ formattedTime }}</span>
      <div class="player-progress-track">
        <div class="player-progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
      <span class="player-time" v-if="duration > 0">{{ formattedDuration }}</span>
    </div>

    <!-- Hidden native HTML5 audio element powering the playback -->
    <audio
      ref="audioElement"
      :src="currentTrack.audioUrl"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @ended="onEnded"
    ></audio>
  </footer>

  <footer class="audio-player audio-player-empty" v-else>
    <p class="player-empty-text">Nothing playing</p>
  </footer>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const audioElement = ref(null)

const currentTrack = computed(() => store.state.player.currentTrack)
const isPlaying = computed(() => store.state.player.isPlaying)
const currentTime = computed(() => store.state.player.currentTime || 0)
const duration = ref(0)

function togglePlay() {
  store.dispatch('player/togglePlay')
}

// Watch track changes, reload source, and automatically play if isPlaying is true
watch(currentTrack, async (newTrack) => {
  if (!newTrack) return
  duration.value = newTrack.duration || 0

  await nextTick()
  if (audioElement.value) {
    audioElement.value.load()
    if (isPlaying.value) {
      audioElement.value.play().catch((err) => {
        console.error("Browser playback prevented:", err)
      })
    }
  }
})

// Watch play/pause toggles
watch(isPlaying, (newVal) => {
  if (!audioElement.value) return
  if (newVal) {
    audioElement.value.play().catch((err) => {
      console.error("Browser playback prevented:", err)
    })
  } else {
    audioElement.value.pause()
  }
})

function onTimeUpdate() {
  if (!audioElement.value) return
  store.commit('player/SET_CURRENT_TIME', audioElement.value.currentTime)
}

function onLoadedMetadata() {
  if (!audioElement.value) return
  duration.value = audioElement.value.duration
}

function onEnded() {
  store.dispatch('player/togglePlay')
}

// Real formatting based on actual playback time
const formattedTime = computed(() => {
  const totalSeconds = Math.floor(currentTime.value)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

const formattedDuration = computed(() => {
  const totalSeconds = Math.floor(duration.value)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

// Real progress calculation based on live duration
const progressPercent = computed(() => {
  if (!duration.value || duration.value === 0) return 0
  return Math.min((currentTime.value / duration.value) * 100, 100)
})
</script>

<style scoped>
.audio-player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  border-top: 1px solid var(--border-subtle, #ccc);
  background-color: var(--bg-surface, #fff);
  z-index: 1000;
}
.audio-player-empty {
  justify-content: center;
}
.player-empty-text {
  font-size: 0.85rem;
  color: var(--text-muted, #666);
  opacity: 0.8;
}
.player-track-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 200px;
}
.player-cover {
  width: 44px;
  height: 44px;
  border-radius: 4px;
  object-fit: cover;
}
.player-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-main, #111);
  margin: 0;
}
.player-artist {
  font-size: 0.75rem;
  color: var(--text-muted, #666);
  margin: 0;
}
.player-controls {
  display: flex;
  align-items: center;
}
.player-play-btn {
  border: none;
  background: var(--text-main, #333);
  color: #fff;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  transition: opacity 0.15s ease;
}
.player-play-btn:hover {
  opacity: 0.9;
}
.player-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  max-width: 320px;
}
.player-time {
  font-size: 0.7rem;
  color: var(--text-muted, #666);
  min-width: 32px;
}
.player-progress-track {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: var(--border-subtle, #ddd);
  overflow: hidden;
}
.player-progress-fill {
  height: 100%;
  background: var(--primary-wisteria, #999);
}
</style>
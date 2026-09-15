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
    </div>
  </footer>
  <footer class="audio-player audio-player-empty" v-else>
    <p class="player-empty-text">Nothing playing</p>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const currentTrack = computed(() => store.state.player.currentTrack)
const isPlaying = computed(() => store.state.player.isPlaying)
const currentTime = computed(() => store.state.player.currentTime)

function togglePlay() {
  store.dispatch('player/togglePlay')
}

// Real formatting based on actual playback time, not hardcoded
const formattedTime = computed(() => {
  const totalSeconds = Math.floor(currentTime.value)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

// Real progress calculation based on currentTrack.duration
// NOTE: assumes currentTrack has a numeric "duration" field (seconds).
// If tracks don't have this yet, progress will just stay at 0 - that's expected until real audio data exists.
const progressPercent = computed(() => {
  const duration = currentTrack.value?.duration
  if (!duration) return 0
  return Math.min((currentTime.value / duration) * 100, 100)
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
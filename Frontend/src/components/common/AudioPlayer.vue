<template>
  <div v-if="currentTrack" class="audio-player" role="region" aria-label="Audio player">
    <div class="player-controls">
      <button class="icon-button" type="button" aria-label="Restart track" title="Restart track" @click="restartTrack">⏮</button>
      <button class="play-button" type="button" :aria-label="isPlaying ? 'Pause' : 'Play'" @click="togglePlay">{{ isPlaying ? '❚❚' : '▶' }}</button>
      <button class="icon-button" type="button" aria-label="Next track" title="Next track" :disabled="!queue.length" @click="store.dispatch('player/playNext')">⏭</button>
      <button class="icon-button secondary" type="button" :class="{ active: shuffle }" :aria-pressed="shuffle" aria-label="Shuffle queue" @click="shuffle = !shuffle">⤨</button>
      <button class="icon-button secondary" type="button" :class="{ active: repeat }" :aria-pressed="repeat" aria-label="Repeat track" @click="repeat = !repeat">↻</button>
    </div>

    <div class="player-progress">
      <span class="player-time">{{ formattedTime }}</span>
      <input class="seek-range" type="range" min="0" :max="duration || 0" step="1" :value="currentTime" :style="{ '--progress': progressPercent + '%' }" aria-label="Seek through track" @input="seekTrack" />
      <span class="player-time">{{ formattedDuration }}</span>
    </div>

    <div class="volume-control">
      <button class="icon-button" type="button" :aria-label="volume ? 'Mute' : 'Unmute'" @click="toggleMute">{{ volume ? '◖))' : '◖' }}</button>
      <input type="range" min="0" max="1" step="0.01" :value="volume" aria-label="Volume" @input="setVolume" />
    </div>

    <button class="player-track-info" type="button" aria-label="Open player details" @click="openExpandedPlayer">
      <img v-if="currentTrack.coverArt" :src="currentTrack.coverArt" :alt="`${currentTrack.title} cover art`" class="player-cover" />
      <span v-else class="player-cover cover-fallback">♪</span>
      <span class="player-text"><span class="player-title">{{ currentTrack.title }}</span><span class="player-artist">{{ currentTrack.artist }}</span></span>
    </button>
    <div class="player-actions">
      <button class="icon-button" type="button" :class="{ active: isLiked }" :aria-label="isLiked ? 'Unlike track' : 'Like track'" :aria-pressed="isLiked" @click="likeTrack">{{ isLiked ? '♥' : '♡' }}</button>
      <button class="icon-button" type="button" aria-label="Open player details" @click="openExpandedPlayer">☷</button>
    </div>

    <audio ref="audioElement" :src="currentTrack.audioUrl" @timeupdate="onTimeUpdate" @loadedmetadata="onLoadedMetadata" @ended="onEnded" @playing="onPlaying" @pause="cancelPlayReport" @error="cancelPlayReport"></audio>
  </div>
  <div v-else class="audio-player audio-player-empty" role="region" aria-label="Audio player">Nothing playing</div>

  <div v-if="isExpanded && currentTrack" class="expanded-player-overlay">
    <div class="expanded-player-content">
      <button class="close-expanded-btn" aria-label="Close player details" @click="closeExpandedPlayer">×</button>
      <img v-if="currentTrack.coverArt" :src="currentTrack.coverArt" :alt="`${currentTrack.title} cover art`" class="expanded-cover" />
      <div v-else class="expanded-cover cover-fallback">♪</div>
      <h2>{{ currentTrack.title }}</h2>
      <p>{{ currentTrack.artist }}</p>
      <div class="expanded-progress"><span>{{ formattedTime }}</span><div class="progress-track"><div class="progress-fill" :style="{ width: progressPercent + '%' }"></div></div><span>{{ formattedDuration }}</span></div>
      <button class="play-button expanded-play" :aria-label="isPlaying ? 'Pause' : 'Play'" @click="togglePlay">{{ isPlaying ? '❚❚' : '▶' }}</button>
      <RouterLink v-if="hasCatalogTrack" :to="`/track/${currentTrack.id}`" class="discussion-link" @click="closeExpandedPlayer">View comments</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { apiRequest } from '@/services/api'

const store = useStore()
const router = useRouter()
const audioElement = ref(null)
const currentTrack = computed(() => store.state.player.currentTrack)
const hasCatalogTrack = computed(() => /^[1-9]\d*$/.test(String(currentTrack.value?.id)))
const isPlaying = computed(() => store.state.player.isPlaying)
const currentTime = computed(() => store.state.player.currentTime || 0)
const isExpanded = computed(() => store.state.player.isExpanded)
const queue = computed(() => store.state.player.queue || [])
// The existing Vuex store uses a 0–100 volume scale; the audio element uses 0–1.
const volume = computed(() => (store.state.player.volume ?? 100) / 100)
const isLiked = computed(() => store.getters['auth/isLiked']?.(currentTrack.value?.id) ?? false)
const duration = ref(0)
const repeat = ref(false)
const shuffle = ref(false)
let previousVolume = 1
let playbackId = null
let reportTimer = null
let playReported = false

function togglePlay() { store.dispatch('player/togglePlay') }
function openExpandedPlayer() { store.commit('player/SET_EXPANDED', true) }
function closeExpandedPlayer() { store.commit('player/SET_EXPANDED', false) }
function restartTrack() {
  if (!audioElement.value) return
  audioElement.value.currentTime = 0
  store.commit('player/SET_CURRENT_TIME', 0)
}
function seekTrack(event) {
  if (!audioElement.value || !Number.isFinite(duration.value)) return
  const seconds = Number(event.target.value)
  audioElement.value.currentTime = seconds
  store.commit('player/SET_CURRENT_TIME', seconds)
}
function setVolume(event) { store.dispatch('player/updateVolume', Number(event.target.value) * 100) }
function toggleMute() {
  if (volume.value) { previousVolume = volume.value; store.dispatch('player/updateVolume', 0) }
  else store.dispatch('player/updateVolume', (previousVolume || 1) * 100)
}
function likeTrack() {
  if (!store.getters['auth/isLoggedIn']) { router.push('/login'); return }
  store.dispatch('auth/toggleLike', currentTrack.value.id)
}

watch(currentTrack, async (newTrack) => {
  cancelPlayReport()
  playbackId = crypto.randomUUID()
  playReported = false
  if (!newTrack) return
  duration.value = newTrack.duration || 0
  await nextTick()
  if (audioElement.value) {
    audioElement.value.volume = volume.value
    audioElement.value.load()
    if (isPlaying.value) audioElement.value.play().catch((error) => console.error('Browser playback prevented:', error))
  }
})
watch(isPlaying, (playing) => {
  if (!audioElement.value) return
  if (playing) audioElement.value.play().catch((error) => console.error('Browser playback prevented:', error))
  else audioElement.value.pause()
})
watch(volume, (value) => { if (audioElement.value) audioElement.value.volume = value })

function cancelPlayReport() { if (reportTimer) clearTimeout(reportTimer); reportTimer = null }
function onPlaying() {
  cancelPlayReport()
  if (!hasCatalogTrack.value || playReported) return
  // Report a genuine media play after listening, not merely a card click.
  const seconds = Number.isFinite(duration.value) && duration.value > 0 ? Math.min(10, duration.value / 2) : 10
  reportTimer = setTimeout(async () => {
    reportTimer = null
    if (audioElement.value?.paused || playReported || !hasCatalogTrack.value) return
    const id = currentTrack.value.id
    try {
      const result = await apiRequest(`/api/tracks/${id}/plays`, { method: 'POST', body: { playbackId } })
      if (String(currentTrack.value?.id) === String(id)) {
        playReported = true
        store.commit('content/SET_TRACK_STREAM_COUNT', { id, streamCount: result.streamCount })
      }
    } catch (error) { console.warn('Could not record track play:', error) }
  }, Math.max(1000, seconds * 1000))
}

watch(() => store.state.player.seekRequest, async (request) => {
  if (!request) return
  await nextTick()
  if (!audioElement.value) return
  const seek = () => { audioElement.value.currentTime = request.seconds; store.commit('player/SET_CURRENT_TIME', request.seconds) }
  if (audioElement.value.readyState < 1) audioElement.value.addEventListener('loadedmetadata', seek, { once: true })
  else seek()
})
function onTimeUpdate() { if (audioElement.value) store.commit('player/SET_CURRENT_TIME', audioElement.value.currentTime) }
function onLoadedMetadata() { if (audioElement.value) duration.value = audioElement.value.duration }
function onEnded() {
  cancelPlayReport()
  if (repeat.value && audioElement.value) { audioElement.value.currentTime = 0; audioElement.value.play(); return }
  if (shuffle.value && queue.value.length > 1) {
    store.dispatch('player/playTrack', queue.value[Math.floor(Math.random() * queue.value.length)])
    return
  }
  store.dispatch('player/playNext')
}
const formatTime = (value) => { const seconds = Number.isFinite(value) ? Math.floor(value) : 0; return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` }
const formattedTime = computed(() => formatTime(currentTime.value))
const formattedDuration = computed(() => formatTime(duration.value))
const progressPercent = computed(() => duration.value > 0 ? Math.min(currentTime.value / duration.value * 100, 100) : 0)
</script>

<style scoped>
.audio-player { position: fixed; bottom: 0; left: 0; right: 0; z-index: 1000; height: 78px; display: flex; align-items: center; gap: 22px; padding: 0 24px; border-top: 1px solid #e5e1e9; background: #fff; color: #191919; }
.audio-player-empty { justify-content: center; color: #777; font-size: .85rem; }
.player-controls, .player-actions, .volume-control, .player-progress { display: flex; align-items: center; }
.player-controls { flex: 0 0 auto; gap: 8px; }
.icon-button { display: grid; place-items: center; width: 34px; height: 34px; border: 0; background: transparent; color: #202020; font-size: 21px; cursor: pointer; }
.icon-button:hover, .icon-button.active { color: #a36bc9; }
.icon-button:disabled { opacity: .35; cursor: not-allowed; }
.play-button { display: grid; place-items: center; width: 40px; height: 40px; border: 0; border-radius: 50%; background: #1a1a1a; color: white; font-size: 18px; cursor: pointer; }
.player-progress { flex: 1; min-width: 120px; gap: 10px; }
.player-time { min-width: 38px; color: #262626; font-size: .78rem; font-weight: 600; font-variant-numeric: tabular-nums; }
.seek-range { width: 100%; height: 5px; appearance: none; background: linear-gradient(to right, #a36bc9 var(--progress), #d7d7d7 var(--progress)); border-radius: 10px; cursor: pointer; }
.seek-range::-webkit-slider-thumb { appearance: none; width: 13px; height: 13px; background: #a36bc9; border-radius: 50%; }
.seek-range::-moz-range-thumb { width: 13px; height: 13px; background: #a36bc9; border: none; border-radius: 50%; }
.volume-control { gap: 2px; flex: 0 0 110px; }
.volume-control input { width: 70px; accent-color: #a36bc9; cursor: pointer; }
.player-track-info { display: flex; align-items: center; gap: 10px; flex: 0 1 220px; min-width: 130px; padding: 0; border: 0; background: none; text-align: left; cursor: pointer; }
.player-cover { width: 44px; height: 44px; flex: 0 0 44px; object-fit: cover; border-radius: 4px; }
.cover-fallback { display: grid; place-items: center; background: #29232d; color: #fff; font-size: 22px; }
.player-text { display: flex; flex-direction: column; min-width: 0; }
.player-title, .player-artist { display: block; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.player-title { font-size: .85rem; font-weight: 700; }.player-artist { font-size: .75rem; color: #666; }
.player-actions { flex: 0 0 auto; gap: 4px; }
.expanded-player-overlay { position: fixed; top: 0; right: 0; bottom: 0; width: min(380px, 100vw); z-index: 2000; display: grid; place-items: center; padding: 2rem; background: #fff; box-shadow: -5px 0 25px #0002; }
.expanded-player-content { width: 100%; display: flex; flex-direction: column; align-items: center; gap: .5rem; text-align: center; position: relative; }
.close-expanded-btn { position: absolute; top: -60px; right: 0; border: 0; background: none; font-size: 28px; cursor: pointer; }
.expanded-cover { width: 240px; height: 240px; object-fit: cover; border-radius: 10px; box-shadow: 0 8px 20px #0002; }
.expanded-progress { display: flex; align-items: center; gap: 10px; width: 100%; margin: 1rem 0; font-size: .8rem; }
.progress-track { flex: 1; height: 4px; background: #ddd; border-radius: 4px; }.progress-fill { height: 100%; background: #a36bc9; }
.discussion-link { margin-top: .8rem; color: #8e5bb4; font-weight: 700; text-decoration: none; }
@media (max-width: 1050px) { .secondary, .volume-control { display: none; } .audio-player { gap: 12px; padding: 0 14px; } }
@media (max-width: 650px) {
  .audio-player { height: 88px; display: grid; grid-template-columns: minmax(0, 1fr) 40px 34px; grid-template-rows: 44px 22px; align-content: center; column-gap: 10px; row-gap: 3px; padding: 4px 12px; }
  .audio-player-empty { display: flex; }
  .player-track-info { grid-column: 1; grid-row: 1; width: 100%; min-width: 0; }
  .player-cover { width: 40px; height: 40px; flex-basis: 40px; }
  .player-controls { grid-column: 2; grid-row: 1; }
  .player-controls .icon-button, .player-actions .icon-button:last-child { display: none; }
  .player-actions { grid-column: 3; grid-row: 1; }
  .player-progress { grid-column: 1 / -1; grid-row: 2; width: 100%; min-width: 0; gap: 7px; }
  .player-time { min-width: 31px; font-size: .7rem; }
}
</style>

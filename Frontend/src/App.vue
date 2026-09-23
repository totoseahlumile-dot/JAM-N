<template>
  <div id="app">
    <AppNavbar v-if="showChrome" />
    <main class="main-content" :class="{ 'main-content--guest': !showChrome }">
      <RouterView />
    </main>
    <AudioPlayer v-if="showChrome" ref="globalAudioPlayer" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { RouterView, useRoute, useRouter } from 'vue-router'
import AppNavbar from './components/common/AppNavbar.vue'
import AudioPlayer from './components/common/AudioPlayer.vue'

const store = useStore()
const router = useRouter()
const route = useRoute()
const globalAudioPlayer = ref(null)
const isLoggedIn = computed(() => store.getters['auth/isLoggedIn'])
const showChrome = computed(() => isLoggedIn.value || route.name === 'discover')

watch(isLoggedIn, (loggedIn, wasLoggedIn) => {
  if (wasLoggedIn && !loggedIn) router.replace('/')
})

const currentTrack = computed(() => store.getters['player/activeTrack'])
const isPlaying = computed(() => store.getters['player/isPlaying'])

// Watch when playback state toggles from the store
watch(isPlaying, (playing) => {
  // If your AudioPlayer component encapsulates its own HTML5 audio element, 
  // it should track this getter. Otherwise, standard audio syncing happens here.
})

// Watch when a track is clicked/changed to ensure it triggers playback
watch(currentTrack, (track) => {
  if (track && track.audioUrl) {
    console.log("Active track updated in store:", track.title)
  }
})
</script>

<style>
/* Basic layout reset and spacing */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #333;
  background-color: #f9f9f9;
}

.main-content {
  padding-bottom: 80px; /* Leaves space for fixed audio player at the bottom */
}
.main-content--guest { padding-bottom: 0; }
@media (max-width: 650px) {
  .main-content { padding-bottom: 104px; }
  .main-content--guest { padding-bottom: 0; }
}
</style>

<template>
  <div id="app">
    <AppNavbar />
    <main class="main-content">
      <RouterView />
    </main>
    <AudioPlayer ref="globalAudioPlayer" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { RouterView } from 'vue-router'
import AppNavbar from './components/common/AppNavbar.vue'
import AudioPlayer from './components/common/AudioPlayer.vue'

const store = useStore()
const globalAudioPlayer = ref(null)

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
</style>
<template>
  <div id="app">
    <AppNavbar />
    <main class="main-content">
      <RouterView />
    </main>
    <AudioPlayer />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import AppNavbar from './components/common/AppNavbar.vue'
import AudioPlayer from './components/common/AudioPlayer.vue'
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
<template>
  <div class="playlist-detail-page">
    <button class="back-btn" @click="$router.push('/library')">
      ← Back to Library
    </button>

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
        v-for="(song, index) in playlist.tracks || []"
        :key="song.id"
        class="table-row"
      >
        <span class="track-index">{{ index + 1 }}</span>
        <span class="track-col-title" @click="playTrack(song)">{{
          song.title
        }}</span>
        <span class="track-col-artist">{{ song.artist }}</span>

        <!-- 3-dot menu, replaces the standalone remove button -->
        <div class="track-menu-wrapper">
          <button
            class="menu-btn"
            @click.stop="toggleMenu(song.id)"
            aria-label="More options"
          >
            ⋮
          </button>

          <div v-if="openMenuId === song.id" class="track-menu" @click.stop>
            <button class="menu-item" @click="handleLike(song)">
              {{ isLiked(song.id) ? "♥ Unlike" : "♡ Like" }}
            </button>
            <button class="menu-item" @click="handleAddToPlaylist(song)">
              + Add to another playlist
            </button>
            <button class="menu-item danger" @click="removeTrack(song.id)">
              ✕ Remove from this playlist
            </button>
          </div>
        </div>
      </div>
      <p
        v-if="!playlist.tracks || playlist.tracks.length === 0"
        class="empty-state"
      >
        This playlist is empty. Add songs from your Liked Songs!
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";

const route = useRoute();
const store = useStore();

const playlistId = route.params.id;
const playlist = computed(() => {
  const playlists = store.getters["auth/userPlaylists"] || [];
  return playlists.find((p) => p.id === playlistId);
});

function playTrack(track) {
  if (track.audioUrl) {
    store.dispatch("player/playTrack", track);
  } else {
    alert("Audio stream not available.");
  }
}

function removeTrack(trackId) {
  store.dispatch("auth/removeTrackFromPlaylist", {
    playlistId,
    trackId,
  });
  openMenuId.value = null;
}

// --- 3-dot menu ---
const openMenuId = ref(null);

function toggleMenu(songId) {
  openMenuId.value = openMenuId.value === songId ? null : songId;
}

function isLiked(trackId) {
  return store.getters["auth/isLiked"]?.(trackId) ?? false;
}

function handleLike(song) {
  store.commit("auth/TOGGLE_LIKE", song.id);
  openMenuId.value = null;
}

function handleAddToPlaylist(song) {
  // TODO: wire this up to whichever playlist-picker UI already exists
  // for the "create playlist" flow, so a song can be added to a
  // *different* playlist from here too.
  console.log("Add to another playlist:", song);
  openMenuId.value = null;
}
</script>

<style scoped>
.playlist-detail-page {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}
.back-btn {
  background: transparent;
  border: none;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 1.5rem;
}
.playlist-hero {
  display: flex;
  align-items: flex-end;
  gap: 1.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 1.5rem;
}
.playlist-hero-cover {
  width: 140px;
  height: 140px;
  background: #e4e6eb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
}
.table-header,
.table-row {
  display: grid;
  grid-template-columns: 40px 2fr 1fr 40px;
  padding: 0.6rem 0.5rem;
  align-items: center;
  border-bottom: 1px solid #f2f2f2;
  font-size: 0.85rem;
}
.table-header {
  font-weight: 600;
  opacity: 0.6;
}
.track-col-title {
  font-weight: 600;
  cursor: pointer;
}

.track-menu-wrapper {
  position: relative;
}

.menu-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  opacity: 0.6;
}

.menu-btn:hover {
  opacity: 1;
}

.track-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  min-width: 180px;
  overflow: hidden;
}

.menu-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.6rem 0.9rem;
  border: none;
  background: transparent;
  font-size: 0.8rem;
  cursor: pointer;
}

.menu-item:hover {
  background: #f5f5f5;
}

.menu-item.danger {
  color: #c0392b;
}

.empty-state {
  opacity: 0.6;
  font-size: 0.85rem;
  text-align: center;
  padding: 2rem 0;
}
</style>

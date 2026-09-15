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
        <span class="track-col-artist" @click="goToArtistByTrack(song)">{{
          song.artist
        }}</span>

        <!-- 3-dot menu -->
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
              {{ isLiked(song.id) ? "Remove from Liked Songs" : "Save to Liked Songs" }}
            </button>
            <button class="menu-item" @click="handleAddToPlaylist(song)">
              Add to playlist
            </button>
            <button class="menu-item danger" @click="removeTrack(song.id)">
              Remove from playlist
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
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";

const route = useRoute();
const router = useRouter();
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

function handleClickOutside(e) {
  if (!e.target.closest(".track-menu-wrapper")) {
    openMenuId.value = null;
  }
}

onMounted(() => window.addEventListener("click", handleClickOutside));
onUnmounted(() => window.removeEventListener("click", handleClickOutside));

function isLiked(trackId) {
  const likedIds = store.getters["auth/likedSongIds"] || [];
  return likedIds.includes(trackId);
}

function handleLike(song) {
  store.dispatch("auth/toggleLike", song.id);
  openMenuId.value = null;
}

function handleAddToPlaylist(song) {
  console.log("Add to playlist:", song);
  openMenuId.value = null;
}

function goToArtistByTrack(track) {
  if (track.artistId) {
    router.push(`/artists/${track.artistId}`);
  }
}
</script>

<style scoped>
.playlist-detail-page {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
  background-color: var(--bg-main, #ffffff);
  color: var(--text-main, #111111);
}

.back-btn {
  background: transparent;
  border: none;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 1.5rem;
  color: var(--text-main, #333);
}

.playlist-hero {
  display: flex;
  align-items: flex-end;
  gap: 1.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border-subtle, #eee);
  padding-bottom: 1.5rem;
}

/* Yellow background removed — replaced with clean surface background & border */
.playlist-hero-cover {
  width: 140px;
  height: 140px;
  background-color: var(--bg-surface, #ffffff);
  border: 1px solid var(--border-subtle, #e5e5e5);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
}

.playlist-tag {
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--text-muted, #666);
  opacity: 0.8;
}

.playlist-hero-info h2 {
  margin: 0.25rem 0;
  font-size: 1.8rem;
  color: var(--text-main, #111);
}

.playlist-meta {
  font-size: 0.85rem;
  color: var(--text-muted, #666);
  opacity: 0.8;
  margin: 0;
}

.playlist-table {
  display: flex;
  flex-direction: column;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 40px 2fr 1fr 40px;
  padding: 0.6rem 0.5rem;
  align-items: center;
  border-bottom: 1px solid var(--border-subtle, #f2f2f2);
  font-size: 0.85rem;
}

.table-header {
  font-weight: 600;
  color: var(--text-muted, #666);
  opacity: 0.8;
  border-bottom: 2px solid var(--border-subtle, #eee);
}

.table-row:hover {
  background: var(--accent-yellow, rgba(250, 225, 132, 0.2));
  border-radius: 4px;
}

.track-col-title {
  font-weight: 600;
  cursor: pointer;
  color: var(--text-main, #111);
}

.track-col-title:hover {
  text-decoration: underline;
}

.track-col-artist {
  cursor: pointer;
  color: var(--text-muted, #666);
}

.track-col-artist:hover {
  text-decoration: underline;
}

.track-menu-wrapper {
  position: relative;
  display: flex;
  justify-content: flex-end;
}

.menu-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  color: var(--text-muted, #666);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.menu-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--text-main, #000);
}

.track-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background: var(--bg-surface, #fff);
  border: 1px solid var(--border-subtle, #eee);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 20;
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
  color: var(--text-main, #111);
}

.menu-item:hover {
  background: var(--accent-yellow, #fae184);
}

.menu-item.danger {
  color: #ff4d4d;
}

.empty-state {
  color: var(--text-muted, #666);
  opacity: 0.7;
  font-size: 0.9rem;
  text-align: center;
  padding: 2rem 0;
}
</style>
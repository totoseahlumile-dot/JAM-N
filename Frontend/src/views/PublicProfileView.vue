<template>
  <div class="public-profile-page" v-if="artist">
    <header class="profile-header">
      <img :src="artist.image" :alt="artist.name" class="profile-avatar" />
      <div class="profile-details">
        <h1>{{ artist.name }}</h1>
        <p class="handle">@{{ artistHandle }}</p>
        <p class="genre-tag">
          {{
            Array.isArray(artist.genre) ? artist.genre.join(", ") : artist.genre
          }}
        </p>

        <div class="action-buttons">
          <button
            class="btn-primary"
            :class="{ following: isFollowing }"
            @click="toggleFollow"
          >
            {{ isFollowing ? "Following" : "Follow Artist" }}
          </button>
        </div>
      </div>
    </header>

    <!-- Track List Styled Like Trending Beats -->
    <section class="artist-content">
      <h2>Tracks & Beats</h2>
      <div v-if="formattedTracks.length > 0" class="track-list">
        <div
          v-for="track in formattedTracks"
          :key="track.id"
          class="trending-track-card"
          @click="playTrack(track)"
        >
          <div class="track-cover-wrapper">
            <img
              v-if="artist.image"
              :src="artist.image"
              :alt="track.title"
              class="track-cover-img"
            />
            <span v-else class="track-cover-icon">🎵</span>
            <div class="play-overlay">
              <span class="play-icon">▶</span>
            </div>
          </div>

          <div class="track-info">
            <p class="track-title">{{ track.title }}</p>
            <p class="track-artist">{{ artist.name }}</p>
          </div>

          <!-- Like Button -->
          <button
            class="like-btn"
            @click.stop="handleLike(track)"
            :title="
              isLiked(track.id)
                ? 'Remove from Liked Songs'
                : 'Save to Liked Songs'
            "
          >
            {{ isLiked(track.id) ? "♥" : "♡" }}
          </button>

          <!-- Three Dots Menu -->
          <div class="track-menu-wrapper" @click.stop>
            <button
              class="menu-btn"
              @click="toggleMenu(track.id)"
              aria-label="More options"
            >
              ⋮
            </button>

            <div v-if="openMenuId === track.id" class="track-menu">
              <button class="menu-item" @click="handleLike(track)">
                {{
                  isLiked(track.id)
                    ? "Remove from Liked Songs"
                    : "Save to Liked Songs"
                }}
              </button>

              <!-- Add to Playlist dropdown trigger -->
              <div class="submenu-container">
                <button
                  class="menu-item has-submenu"
                  @click="togglePlaylistSubmenu(track.id)"
                >
                  Add to playlist ▶
                </button>

                <!-- Nested list of user playlists -->
                <div
                  v-if="activePlaylistSubmenuId === track.id"
                  class="playlist-submenu"
                >
                  <div v-if="userPlaylists.length > 0">
                    <button
                      v-for="playlist in userPlaylists"
                      :key="playlist.id"
                      class="menu-item playlist-option"
                      @click="addSongToPlaylist(track, playlist.id)"
                    >
                      {{ playlist.title }}
                    </button>
                  </div>
                  <div v-else class="menu-item empty-playlists" disabled>
                    No playlists created yet
                  </div>
                </div>
              </div>
            </div>
          </div>
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
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { useStore } from "vuex";

const route = useRoute();
const store = useStore();

const artistId = computed(() => route.params.id);
const openMenuId = ref(null);
const activePlaylistSubmenuId = ref(null);

// Fetch target artist from the artists Vuex module
const artist = computed(() => {
  const all = store.getters["artists/allArtists"] ?? [];
  return all.find((a) => String(a.id) === String(artistId.value));
});

const artistHandle = computed(() => {
  return (
    artist.value?.handle ||
    (artist.value?.name
      ? artist.value.name.toLowerCase().replace(/\s+/g, "_")
      : "")
  );
});

// Social status getter from auth module
const isFollowing = computed(
  () => store.getters["auth/isFollowing"]?.(artistId.value) ?? false,
);

const likedSongIds = computed(() => store.getters["auth/likedSongIds"] || []);

const userPlaylists = computed(() => store.getters["auth/userPlaylists"] || []);

// Safely normalize tracks and provide a fallback audio stream if missing
const formattedTracks = computed(() => {
  if (!artist.value) return [];

  const rawTracks = artist.value.tracks || [
    { title: `${artist.value.name} - Live Session` },
    { title: `${artist.value.name} - Studio Demo` },
  ];

  const defaultSampleUrl =
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

  return rawTracks.map((track, index) => {
    const rawTrackId = track.id || `${artistId.value}_t_${index}`;
    const formattedId = `${artist.value.id}-${rawTrackId}`;

    if (typeof track === "string") {
      return {
        id: formattedId,
        rawId: rawTrackId,
        title: track,
        audioUrl: defaultSampleUrl,
      };
    }
    return {
      id: formattedId,
      rawId: rawTrackId,
      title: track.title || "Untitled Track",
      audioUrl: track.audioUrl || defaultSampleUrl,
    };
  });
});

function formatSongId(trackId) {
  return `${artist.value.id}-${trackId}`;
}

function isLiked(trackId) {
  const formattedId = formatSongId(trackId);
  return likedSongIds.value.includes(formattedId);
}

function handleLike(track) {
  const formattedId = track.id;
  store.dispatch("auth/toggleLike", formattedId);
  openMenuId.value = null;
  activePlaylistSubmenuId.value = null;
}

function toggleFollow() {
  if (artist.value) {
    store.commit("auth/TOGGLE_FOLLOW", {
      id: artist.value.id,
      name: artist.value.name,
      handle: artistHandle.value,
      image: artist.value.image ?? null,
    });
  }
}

function playTrack(track) {
  console.log("Attempting to play track:", track);

  const trackPayload = {
    id: track.id,
    artistId: artist.value.id,
    title: track.title,
    artist: artist.value.name,
    audioUrl: track.audioUrl,
    image: artist.value.image || null,
  };

  if (store) {
    try {
      store.dispatch("player/playTrack", trackPayload);
    } catch (err) {
      console.warn("Vuex player action failed, fallback audio triggered:", err);
      const audio = new Audio(track.audioUrl);
      audio.play();
    }
  }
}

function toggleMenu(trackId) {
  if (openMenuId.value === trackId) {
    openMenuId.value = null;
    activePlaylistSubmenuId.value = null;
  } else {
    openMenuId.value = trackId;
    activePlaylistSubmenuId.value = null;
  }
}

function togglePlaylistSubmenu(trackId) {
  activePlaylistSubmenuId.value =
    activePlaylistSubmenuId.value === trackId ? null : trackId;
}

function addSongToPlaylist(track, playlistId) {
  const songPayload = {
    id: track.id,
    title: track.title,
    artist: artist.value.name,
    artistId: artist.value.id,
    audioUrl: track.audioUrl,
  };

  store.dispatch("auth/addTrackToPlaylist", {
    playlistId,
    track: songPayload,
  });

  alert(`Added "${track.title}" to playlist!`);
  openMenuId.value = null;
  activePlaylistSubmenuId.value = null;
}

// Close dropdown if clicking anywhere outside
function handleClickOutside(e) {
  if (!e.target.closest(".track-menu-wrapper")) {
    openMenuId.value = null;
    activePlaylistSubmenuId.value = null;
  }
}

onMounted(() => {
  window.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.public-profile-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  background-color: var(--bg-main, #ffffff);
  color: var(--text-main, #111111);
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
  background-color: var(--bg-surface, #fff);
  border: 1px solid var(--border-subtle, #e0e0e0);
}

.profile-details h1 {
  font-size: 1.75rem;
  font-weight: 800;
  margin: 0 0 0.2rem;
  color: var(--text-main, #111);
}

.handle {
  color: var(--text-muted, #666);
  font-size: 0.9rem;
  margin: 0 0 0.5rem;
}

.genre-tag {
  display: inline-block;
  background-color: var(--accent-plum, #d4bcf0);
  color: var(--text-dark-btn, #111);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
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
  background-color: var(--accent-blue, #b8e5ff);
  color: var(--text-dark-btn, #111);
  cursor: pointer;
  font-weight: 700;
  font-size: 0.9rem;
  transition:
    opacity 0.2s ease,
    transform 0.15s ease;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-primary.following {
  background-color: var(--accent-gold, #fae184);
  color: var(--text-dark-btn, #111);
}

.artist-content h2 {
  font-size: 1.25rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: var(--text-main, #111);
}

/* Trending Beat-style Track Cards */
.track-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.trending-track-card {
  display: flex;
  align-items: center;
  background-color: var(--bg-surface, #fff);
  border: 1px solid var(--border-subtle, #e0e0e0);
  padding: 0.6rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  position: relative;
  transition: background-color 0.15s ease;
}

.trending-track-card:hover {
  background-color: var(--accent-yellow, rgba(250, 225, 132, 0.15));
}

.track-cover-wrapper {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 6px;
  overflow: hidden;
  background-color: var(--border-subtle, #eee);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
}

.track-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.track-cover-icon {
  font-size: 1.2rem;
}

.play-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.trending-track-card:hover .play-overlay {
  opacity: 1;
}

.play-icon {
  color: white;
  font-size: 0.9rem;
}

.track-info {
  flex-grow: 1;
}

.track-title {
  margin: 0 0 0.15rem 0;
  font-weight: 700;
  color: var(--text-main, #111);
  font-size: 0.95rem;
}

.track-artist {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-muted, #666);
}

.like-btn {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--text-muted, #888);
  padding: 0.5rem;
  margin-right: 0.25rem;
  transition: transform 0.1s ease;
}

.like-btn:hover {
  transform: scale(1.15);
  color: #ff4d4d;
}

/* Three Dots Menu & Playlist Submenu */
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
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.menu-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--text-main, #111);
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
  overflow: visible;
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

.submenu-container {
  position: relative;
}

.playlist-submenu {
  position: absolute;
  right: 100%;
  top: 0;
  background: var(--bg-surface, #fff);
  border: 1px solid var(--border-subtle, #eee);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 150px;
  z-index: 25;
}

.playlist-option {
  font-size: 0.78rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-playlists {
  color: var(--text-muted, #888);
  font-style: italic;
  cursor: default;
}

.empty-playlists:hover {
  background: transparent;
}

.empty-msg,
.not-found {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted, #666);
}
</style>

<template>
  <div class="library-page">
    <header class="page-header" v-if="!selectedPlaylist">
      <div class="header-inner">
        <div class="header-top">
          <h1>Your Library</h1>
          <button class="create-playlist-btn" @click="openCreateModal">
            + New Playlist
          </button>
        </div>

        <!-- Search bar: search across your favourites (songs, beats, playlists, artists) -->
        <div class="search-box">
          <input
            v-model="librarySearchQuery"
            type="text"
            placeholder="Search for favourites..."
            class="search-input"
          />
          <span class="search-icon" aria-hidden="true">🔍︎</span>
        </div>

        <!-- Filter pills with dynamic multi-color rotation -->
        <div class="library-tabs">
          <button
            v-for="(tab, index) in tabs"
            :key="tab"
            class="library-tab"
            :class="{ active: activeTab === tab }"
            :style="getFilterStyle(index, activeTab === tab)"
            @click="activeTab = tab"
          >
            {{ tab }}
          </button>
        </div>
      </div>
    </header>

    <div class="library-container">
      <!-- ==================== VIEW 5: PLAYLIST DETAIL PAGE ==================== -->
      <div v-if="selectedPlaylist" class="playlist-detail-page">
        <button class="back-btn" @click="selectedPlaylist = null">
          ← Back to Library
        </button>

        <div class="playlist-hero">
          <div class="playlist-hero-cover"><span>🎵</span></div>
          <div class="playlist-hero-info">
            <span class="playlist-tag">Playlist</span>

            <div v-if="!isEditingName" class="title-row">
              <h2>{{ selectedPlaylist.title }}</h2>
              <button
                class="text-action-btn"
                @click="
                  isEditingName = true;
                  editedPlaylistName = selectedPlaylist.title;
                "
              >
                Edit
              </button>
            </div>
            <div v-else class="edit-title-row">
              <input
                v-model="editedPlaylistName"
                class="inline-input"
                @keyup.enter="savePlaylistName"
              />
              <button class="btn-sm" @click="savePlaylistName">Save</button>
              <button class="btn-sm-cancel" @click="isEditingName = false">
                Cancel
              </button>
            </div>

            <p class="playlist-meta">
              {{ (selectedPlaylist.tracks || []).length }} songs
            </p>
          </div>
        </div>

        <div class="playlist-table">
          <div class="table-header">
            <span>#</span>
            <span>Title</span>
            <span>Artist</span>
            <span></span>
          </div>
          <div
            v-for="(song, index) in selectedPlaylist.tracks || []"
            :key="song.id"
            class="table-row playlist-track-row"
          >
            <span class="track-index">{{ index + 1 }}</span>
            <span
              class="track-col-title"
              @click="playTrackFromPlaylist(song)"
              >{{ song.title }}</span
            >
            <span class="track-col-artist" @click="goToArtistByTrack(song)">{{
              song.artist
            }}</span>

            <div class="song-menu-wrapper">
              <button
                class="options-dots-btn-inline"
                @click.stop="toggleSongMenu(song.id, $event)"
                title="Song Options"
              >
                ⋮
              </button>

              <div
                v-if="activeSongMenuId === song.id"
                class="dropdown-menu song-dropdown"
              >
                <button @click="toggleLikeFromMenu(song)">
                  {{
                    isLiked(song.id)
                      ? "Remove from Liked Songs"
                      : "Save to Liked Songs"
                  }}
                </button>
                <button @click="openAddToPlaylistModal(song)">
                  Add to playlist
                </button>
                <button
                  class="text-danger"
                  @click="removeTrackFromPlaylist(song.id)"
                >
                  Remove from playlist
                </button>
              </div>
            </div>
          </div>

          <p
            v-if="
              !selectedPlaylist.tracks || selectedPlaylist.tracks.length === 0
            "
            class="empty-state"
          >
            This playlist is empty. Add songs from your Liked Songs or Discover
            feed!
          </p>
        </div>
      </div>

      <!-- ==================== MAIN TABS CONTAINER ==================== -->
      <div v-else>
        <!-- ==================== VIEW 1: "ALL" DASHBOARD ==================== -->
        <div v-if="activeTab === 'All'" class="library-dashboard">
          <!-- Pinned Section -->
          <section v-if="pinnedItems.length > 0" class="library-section">
            <h2>Pinned</h2>
            <div class="track-grid">
              <div
                v-for="item in pinnedItems"
                :key="'pinned-' + item.id"
                class="playlist-card-wrapper"
              >
                <div
                  class="track-card clickable"
                  @click="handleCardClick(item)"
                >
                  <div class="track-cover-placeholder">
                    <img
                      v-if="item.image"
                      :src="item.image"
                      class="track-cover-img"
                    />
                    <span v-else>📌</span>
                  </div>
                  <p class="track-title">{{ item.title || item.name }}</p>
                  <p class="track-artist">
                    {{ item.subtitle || "Pinned Item" }}
                  </p>
                </div>
                <button
                  class="options-dots-btn"
                  @click.stop="togglePin(item)"
                  title="Unpin"
                >
                  ★
                </button>
              </div>
            </div>
          </section>

          <!-- Liked Songs Section -->
          <section v-if="filteredLikedSongs.length > 0" class="library-section">
            <div class="section-header-row">
              <h2>Liked Songs</h2>
              <button class="text-action-btn" @click="activeTab = 'Songs'">
                View All
              </button>
            </div>
            <div class="track-grid">
              <div
                v-for="track in filteredLikedSongs.slice(0, 4)"
                :key="'all-liked-' + track.id"
                class="playlist-card-wrapper"
              >
                <div
                  class="track-card clickable"
                  @click="playSongDirectly(track)"
                >
                  <div class="track-cover-placeholder">
                    <img
                      v-if="track.image"
                      :src="track.image"
                      :alt="track.title"
                      class="track-cover-img"
                    />
                    <span v-else class="play-indicator">▶</span>
                  </div>
                  <p class="track-title">{{ track.title }}</p>
                  <p class="track-artist">{{ track.artist }}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Liked Beats Section -->
          <section v-if="filteredLikedBeats.length > 0" class="library-section">
            <div class="section-header-row">
              <h2>Liked Beats</h2>
              <button class="text-action-btn" @click="activeTab = 'Beats'">
                View All
              </button>
            </div>
            <div class="track-grid">
              <div
                v-for="beat in filteredLikedBeats.slice(0, 4)"
                :key="'all-beat-' + beat.id"
                class="playlist-card-wrapper"
              >
                <div
                  class="track-card clickable"
                  @click="playBeatDirectly(beat)"
                >
                  <div class="track-cover-placeholder">
                    <img
                      v-if="beat.coverArt"
                      :src="beat.coverArt"
                      :alt="beat.title"
                      class="track-cover-img"
                    />
                    <span v-else class="play-indicator">▶</span>
                  </div>
                  <p class="track-title">{{ beat.title }}</p>
                  <p class="track-artist">{{ beat.producer || beat.artist }}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Playlists Overview Row -->
          <section class="library-section">
            <div class="section-header-row">
              <h2>Playlists</h2>
              <button class="text-action-btn" @click="activeTab = 'Playlists'">
                View All
              </button>
            </div>
            <div v-if="filteredPlaylists.length > 0" class="track-grid">
              <div
                v-for="playlist in filteredPlaylists.slice(0, 4)"
                :key="playlist.id"
                class="playlist-card-wrapper"
              >
                <div
                  class="track-card clickable"
                  @click="openPlaylistDetail(playlist)"
                >
                  <div class="track-cover-placeholder playlist-placeholder">
                    <span>🎵</span>
                  </div>
                  <p class="track-title">{{ playlist.title }}</p>
                  <p class="track-artist">
                    {{ (playlist.tracks || []).length }} songs
                  </p>
                </div>

                <button
                  class="options-dots-btn"
                  @click.stop="toggleMenu(playlist.id, $event)"
                  title="Playlist Options"
                >
                  ⋮
                </button>

                <button
                  class="pin-badge-btn"
                  @click.stop="
                    togglePin({
                      id: playlist.id,
                      title: playlist.title,
                      type: 'playlist',
                      image: null,
                    })
                  "
                  :title="isPinned(playlist.id) ? 'Unpin' : 'Pin to top'"
                >
                  {{ isPinned(playlist.id) ? "★" : "☆" }}
                </button>

                <div v-if="activeMenuId === playlist.id" class="dropdown-menu">
                  <button @click="startEditing(playlist)">Rename</button>
                  <button @click="openAddSongsToPlaylistModal(playlist)">
                    Add songs
                  </button>
                  <button
                    @click="
                      togglePin({
                        id: playlist.id,
                        title: playlist.title,
                        type: 'playlist',
                      })
                    "
                  >
                    {{
                      isPinned(playlist.id) ? "Unpin from top" : "Pin playlist"
                    }}
                  </button>
                  <button class="text-danger" @click="deletePlaylist(playlist)">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- Followed Artists Row -->
          <section
            v-if="filteredFollowedArtists.length > 0"
            class="library-section"
          >
            <div class="section-header-row">
              <h2>Followed Artists</h2>
              <button class="text-action-btn" @click="activeTab = 'Artists'">
                View All
              </button>
            </div>
            <div class="artist-grid">
              <div
                v-for="artist in filteredFollowedArtists.slice(0, 4)"
                :key="artist.id"
                class="artist-card clickable"
                @click="goToArtist(artist.id)"
              >
                <div class="artist-avatar-wrap">
                  <img
                    :src="artist.image"
                    :alt="artist.name"
                    class="artist-avatar"
                  />
                </div>
                <p class="artist-name">{{ artist.name }}</p>
              </div>
            </div>
          </section>

          <!-- Global Empty State if completely blank -->
          <div v-if="isLibraryTotalEmpty" class="global-empty-state">
            <div class="empty-hero-icon">🎧</div>
            <h3>Your library is feeling a bit quiet</h3>
            <p>
              Explore new music on the Discover feed or save tracks to your
              library.
            </p>
            <button class="modal-btn-submit" @click="router.push('/discover')">
              Explore Discover
            </button>
          </div>
        </div>

        <!-- ==================== VIEW 2: SONGS / LIKED SONGS ==================== -->
        <div v-if="activeTab === 'Songs'" class="library-section">
          <div class="section-header-row">
            <h2>Liked Songs</h2>
          </div>

          <div v-if="filteredLikedSongs.length > 0" class="track-grid">
            <div
              v-for="track in filteredLikedSongs"
              :key="track.id"
              class="playlist-card-wrapper"
            >
              <div
                class="track-card clickable"
                @click="playSongDirectly(track)"
              >
                <div class="track-cover-placeholder">
                  <img
                    v-if="track.image"
                    :src="track.image"
                    :alt="track.title"
                    class="track-cover-img"
                  />
                  <span v-else class="play-indicator">▶</span>
                </div>
                <p class="track-title" @click.stop="goToTrackDetail(track)">
                  {{ track.title }}
                </p>
                <p class="track-artist" @click.stop="goToArtistByTrack(track)">
                  {{ track.artist }}
                </p>
              </div>

              <button
                class="options-dots-btn"
                @click.stop="toggleLikedSongMenu(track.id, $event)"
                title="Song Options"
              >
                ⋮
              </button>

              <div
                v-if="activeLikedSongMenuId === track.id"
                class="dropdown-menu"
              >
                <button @click="toggleLikeFromLibrary(track)">
                  Remove from Liked Songs
                </button>
                <button @click="openAddToPlaylistModal(track)">
                  Add to playlist
                </button>
              </div>
            </div>
          </div>

          <p v-else-if="likedSongs.length > 0" class="empty-state">
            No liked songs match your search.
          </p>

          <div v-else class="actionable-empty-card">
            <p>No liked songs yet. Start exploring to find music you love!</p>
            <button class="btn-sm" @click="router.push('/discover')">
              Discover Music
            </button>
          </div>
        </div>

        <!-- ==================== VIEW 3: BEATS / LIKED BEATS ==================== -->
        <div v-if="activeTab === 'Beats'" class="library-section">
          <div class="section-header-row">
            <h2>Liked Beats</h2>
          </div>

          <div v-if="filteredLikedBeats.length > 0" class="track-grid">
            <div
              v-for="beat in filteredLikedBeats"
              :key="beat.id"
              class="playlist-card-wrapper"
            >
              <div class="track-card clickable" @click="playBeatDirectly(beat)">
                <div class="track-cover-placeholder">
                  <img
                    v-if="beat.coverArt"
                    :src="beat.coverArt"
                    :alt="beat.title"
                    class="track-cover-img"
                  />
                  <span v-else class="play-indicator">▶</span>
                </div>
                <p class="track-title">{{ beat.title }}</p>
                <p class="track-artist">{{ beat.producer || beat.artist }}</p>
              </div>

              <button
                class="options-dots-btn"
                @click.stop="toggleBeatLike(beat.id)"
                title="Unlike Beat"
              >
                ♥
              </button>
            </div>
          </div>

          <p v-else-if="likedBeats.length > 0" class="empty-state">
            No liked beats match your search.
          </p>

          <div v-else class="actionable-empty-card">
            <p>No liked beats yet. Browse the Beat Store to find beats!</p>
            <button class="btn-sm" @click="router.push('/beatstore')">
              Visit Beat Store
            </button>
          </div>
        </div>

        <!-- ==================== VIEW 4: PLAYLISTS ==================== -->
        <div v-if="activeTab === 'Playlists'" class="library-section">
          <h2>Your Playlists</h2>
          <div v-if="filteredPlaylists.length > 0" class="track-grid">
            <div
              v-for="playlist in filteredPlaylists"
              :key="playlist.id"
              class="playlist-card-wrapper"
            >
              <div
                class="track-card clickable"
                @click="openPlaylistDetail(playlist)"
              >
                <div class="track-cover-placeholder playlist-placeholder">
                  <span>🎵</span>
                </div>
                <p class="track-title">{{ playlist.title }}</p>
                <p class="track-artist">
                  {{ (playlist.tracks || []).length }} songs
                </p>
              </div>

              <button
                class="options-dots-btn"
                @click.stop="toggleMenu(playlist.id, $event)"
                title="Playlist Options"
              >
                ⋮
              </button>

              <button
                class="pin-badge-btn"
                @click.stop="
                  togglePin({
                    id: playlist.id,
                    title: playlist.title,
                    type: 'playlist',
                    image: null,
                  })
                "
                :title="isPinned(playlist.id) ? 'Unpin' : 'Pin to top'"
              >
                {{ isPinned(playlist.id) ? "★" : "☆" }}
              </button>

              <div v-if="activeMenuId === playlist.id" class="dropdown-menu">
                <button @click="startEditing(playlist)">Rename</button>
                <button @click="openAddSongsToPlaylistModal(playlist)">
                  Add songs
                </button>
                <button
                  @click="
                    togglePin({
                      id: playlist.id,
                      title: playlist.title,
                      type: 'playlist',
                    })
                  "
                >
                  {{
                    isPinned(playlist.id) ? "Unpin from top" : "Pin playlist"
                  }}
                </button>
                <button class="text-danger" @click="deletePlaylist(playlist)">
                  Delete
                </button>
              </div>
            </div>
          </div>
          <p v-else-if="playlists.length > 0" class="empty-state">
            No playlists match your search.
          </p>
          <div v-else class="actionable-empty-card">
            <p>
              No playlists yet. Click "+ New Playlist" to curate your sounds!
            </p>
            <button class="btn-sm" @click="openCreateModal">
              Create Playlist
            </button>
          </div>
        </div>

        <!-- ==================== VIEW 5: ARTISTS (Followed Artists) ==================== -->
        <div v-if="activeTab === 'Artists'" class="library-section">
          <h2>Followed Artists</h2>
          <div v-if="filteredFollowedArtists.length > 0" class="artist-grid">
            <div
              v-for="artist in filteredFollowedArtists"
              :key="artist.id"
              class="artist-card clickable"
              @click="goToArtist(artist.id)"
            >
              <div class="artist-avatar-wrap">
                <img
                  :src="artist.image"
                  :alt="artist.name"
                  class="artist-avatar"
                />
              </div>
              <p class="artist-name">{{ artist.name }}</p>
            </div>
          </div>
          <p v-else-if="followedArtists.length > 0" class="empty-state">
            No followed artists match your search.
          </p>
          <div v-else class="actionable-empty-card">
            <p>You aren't following any artists yet.</p>
            <button class="btn-sm" @click="router.push('/discover')">
              Explore Artists
            </button>
          </div>
        </div>
      </div>

      <!-- ==================== MODALS ==================== -->
      <div
        v-if="showSongModal"
        class="modal-overlay"
        @click.self="showSongModal = false"
      >
        <div class="modal-card">
          <div class="modal-cover">
            <img
              v-if="selectedSong?.image"
              :src="selectedSong.image"
              class="modal-cover-img"
            />
            <span v-else class="modal-cover-icon">🎵</span>
          </div>
          <h3>{{ selectedSong?.title }}</h3>
          <p class="modal-subtitle">{{ selectedSong?.artist }}</p>

          <div class="playlist-add-section">
            <h4>Add to Playlist</h4>
            <select v-model="targetPlaylistId" class="modal-select">
              <option disabled value="">Select a playlist...</option>
              <option v-for="pl in playlists" :key="pl.id" :value="pl.id">
                {{ pl.title }}
              </option>
            </select>
            <button
              class="btn-secondary"
              @click="addSongToPlaylist"
              :disabled="!targetPlaylistId"
            >
              Add to Playlist
            </button>
          </div>

          <button class="close-btn" @click="showSongModal = false">
            Close
          </button>
        </div>
      </div>

      <div
        v-if="showCreateModal"
        class="modal-overlay"
        @click.self="showCreateModal = false"
      >
        <div class="modal-card create-playlist-modal">
          <h3>Create Playlist</h3>

          <input
            v-model="newPlaylistName"
            type="text"
            placeholder="Playlist name..."
            class="modal-input"
          />

          <div class="song-picker-section">
            <h4>Add Songs (Optional)</h4>
            <div class="search-box">
              <input
                v-model="songSearchQuery"
                type="text"
                placeholder="Search songs or artists..."
                class="search-input"
              />
              <span class="search-icon" aria-hidden="true">🔍︎</span>
            </div>

            <div class="song-picker-list">
              <label
                v-for="song in filteredPickerSongs"
                :key="song.id"
                class="song-picker-row"
              >
                <input
                  type="checkbox"
                  :value="song.id"
                  v-model="selectedSongIds"
                />
                <div class="song-picker-info">
                  <span class="picker-title">{{ song.title }}</span>
                  <span class="picker-artist">{{ song.artist }}</span>
                </div>
              </label>
              <p v-if="filteredPickerSongs.length === 0" class="empty-state-sm">
                No matching songs found.
              </p>
            </div>
          </div>

          <div class="modal-actions">
            <button class="modal-btn-cancel" @click="showCreateModal = false">
              Cancel
            </button>
            <button
              class="modal-btn-submit"
              @click="submitCreatePlaylist"
              :disabled="!newPlaylistName.trim()"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

const store = useStore();
const router = useRouter();

const tabs = ["All", "Songs", "Beats", "Playlists", "Artists"];
const activeTab = ref("All");

// View states
const selectedPlaylist = ref(null);
const activeMenuId = ref(null);
const activeLikedSongMenuId = ref(null);
const isEditingName = ref(false);
const editedPlaylistName = ref("");

// Top-level library search (favourites: liked songs, liked beats, playlists, followed artists)
const librarySearchQuery = ref("");
const isSearching = computed(() => librarySearchQuery.value.trim().length > 0);

// Pinned & History tracking
const pinnedIds = ref(JSON.parse(localStorage.getItem("jamn_pinned") || "[]"));

function isPinned(id) {
  return pinnedIds.value.includes(id);
}

function togglePin(item) {
  if (isPinned(item.id)) {
    pinnedIds.value = pinnedIds.value.filter((i) => i !== item.id);
  } else {
    pinnedIds.value.push(item.id);
  }
  localStorage.setItem("jamn_pinned", JSON.stringify(pinnedIds.value));
  activeMenuId.value = null;
}

const recentTrackIds = ref(
  JSON.parse(localStorage.getItem("jamn_recent_tracks") || "[]"),
);
const playCounts = ref(
  JSON.parse(localStorage.getItem("jamn_play_counts") || "{}"),
);

function recordTrackPlay(track) {
  if (!track || !track.id) return;
  recentTrackIds.value = [
    track.id,
    ...recentTrackIds.value.filter((id) => id !== track.id),
  ].slice(0, 10);
  localStorage.setItem(
    "jamn_recent_tracks",
    JSON.stringify(recentTrackIds.value),
  );

  playCounts.value[track.id] = (playCounts.value[track.id] || 0) + 1;
  localStorage.setItem("jamn_play_counts", JSON.stringify(playCounts.value));
}

// Modals state
const showCreateModal = ref(false);
const newPlaylistName = ref("");
const songSearchQuery = ref("");
const selectedSongIds = ref([]);

const showSongModal = ref(false);
const selectedSong = ref(null);
const targetPlaylistId = ref("");
const activeSongMenuId = ref(null);

// Data mappings
const allArtists = computed(() => store.getters["artists/allArtists"] || []);
const followedArtists = computed(
  () => store.getters["auth/currentUser"]?.followingList || [],
);
const playlists = computed(() => store.getters["auth/userPlaylists"] || []);
const likedSongIds = computed(() => store.getters["auth/likedSongIds"] || []);

const allAvailableTracks = computed(() => {
  return allArtists.value
    .filter((artist) => artist.tracks && artist.tracks.length > 0)
    .flatMap((artist) =>
      artist.tracks.map((t) => ({
        id: `${artist.id}-${t.id}`,
        artistId: artist.id,
        title: t.title,
        artist: artist.name,
        audioUrl: t.audioUrl || artist.audioUrl || null,
        image: artist.image || null,
      })),
    );
});

const likedSongs = computed(() => {
  return allAvailableTracks.value.filter((track) =>
    likedSongIds.value.includes(track.id),
  );
});

// Pull all store beats and filter based on user likes
const allBeats = computed(() => store.getters["beats/allBeats"] || []);
const likedBeats = computed(() => {
  return allBeats.value.filter((beat) => {
    return store?.getters?.["auth/isLiked"]?.(beat.id) ?? false;
  });
});

// --- Search-filtered "favourites" lists with purple active styling consistency ---
const filteredLikedSongs = computed(() => {
  if (!isSearching.value) return likedSongs.value;
  const q = librarySearchQuery.value.toLowerCase();
  return likedSongs.value.filter(
    (t) =>
      t.title?.toLowerCase().includes(q) || t.artist?.toLowerCase().includes(q),
  );
});

const filteredLikedBeats = computed(() => {
  if (!isSearching.value) return likedBeats.value;
  const q = librarySearchQuery.value.toLowerCase();
  return likedBeats.value.filter(
    (b) =>
      b.title?.toLowerCase().includes(q) ||
      (b.producer || b.artist || "").toLowerCase().includes(q),
  );
});

const filteredPlaylists = computed(() => {
  if (!isSearching.value) return playlists.value;
  const q = librarySearchQuery.value.toLowerCase();
  return playlists.value.filter((p) => p.title?.toLowerCase().includes(q));
});

const filteredFollowedArtists = computed(() => {
  if (!isSearching.value) return followedArtists.value;
  const q = librarySearchQuery.value.toLowerCase();
  return followedArtists.value.filter((a) => a.name?.toLowerCase().includes(q));
});

function toggleBeatLike(beatId) {
  store?.commit("auth/TOGGLE_LIKE", beatId);
}

function playBeatDirectly(beat) {
  if (beat.audioUrl) {
    store.dispatch("player/playTrack", beat);
  } else {
    alert("Audio stream not available for this beat.");
  }
}

const recentlyPlayed = computed(() => {
  return recentTrackIds.value
    .map((id) => allAvailableTracks.value.find((t) => t.id === id))
    .filter(Boolean)
    .slice(0, 4);
});

const mostPlayed = computed(() => {
  return [...allAvailableTracks.value]
    .filter((track) => (playCounts.value[track.id] || 0) > 0)
    .sort(
      (a, b) => (playCounts.value[b.id] || 0) - (playCounts.value[a.id] || 0),
    )
    .slice(0, 4);
});

const pinnedItems = computed(() => {
  const matchingPlaylists = playlists.value.filter((p) =>
    pinnedIds.value.includes(p.id),
  );
  return matchingPlaylists.map((p) => ({
    id: p.id,
    title: p.title,
    subtitle: `${(p.tracks || []).length} songs`,
    type: "playlist",
    playlistObj: p,
  }));
});

const isLibraryTotalEmpty = computed(() => {
  return (
    likedSongs.value.length === 0 &&
    likedBeats.value.length === 0 &&
    playlists.value.length === 0 &&
    followedArtists.value.length === 0 &&
    recentlyPlayed.value.length === 0
  );
});

function handleCardClick(item) {
  if (item.type === "playlist" || item.playlistObj) {
    openPlaylistDetail(item.playlistObj || item);
  }
}

function isLiked(songId) {
  return likedSongIds.value.includes(songId);
}

const filteredPickerSongs = computed(() => {
  if (!songSearchQuery.value.trim()) return allAvailableTracks.value;
  const query = songSearchQuery.value.toLowerCase();
  return allAvailableTracks.value.filter(
    (song) =>
      song.title.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query),
  );
});

const filterColors = [
  "var(--accent-plum, #d4bcf0)",
  "var(--accent-blue, #b8e5ff)",
  "var(--accent-yellow, #fae184)",
];

function getFilterStyle(index, isActive) {
  if (isActive) {
    return {
      backgroundColor: "var(--primary-wisteria, #b19cd9)",
      color: "var(--text-dark-btn, #111)",
      fontWeight: "800",
    };
  }
  return {
    backgroundColor: filterColors[index % filterColors.length],
    color: "var(--text-dark-btn, #111)",
  };
}

function openCreateModal() {
  newPlaylistName.value = "";
  songSearchQuery.value = "";
  selectedSongIds.value = [];
  showCreateModal.value = true;
}

async function submitCreatePlaylist() {
  if (!newPlaylistName.value.trim()) return;

  const createdPlaylist = await store.dispatch(
    "auth/createPlaylist",
    newPlaylistName.value.trim(),
  );

  const targetId =
    createdPlaylist?.id || playlists.value[playlists.value.length - 1]?.id;

  if (targetId && selectedSongIds.value.length > 0) {
    for (const songId of selectedSongIds.value) {
      const trackObj = filteredPickerSongs.value.find((s) => s.id === songId);
      if (trackObj) {
        store.dispatch("auth/addTrackToPlaylist", {
          playlistId: targetId,
          track: trackObj,
        });
      }
    }
  }

  showCreateModal.value = false;
}

function handleClickOutside(e) {
  if (
    !e.target.closest(".playlist-card-wrapper") &&
    !e.target.closest(".song-menu-wrapper")
  ) {
    activeMenuId.value = null;
    activeLikedSongMenuId.value = null;
    activeSongMenuId.value = null;
  }
}

onMounted(() => window.addEventListener("click", handleClickOutside));
onUnmounted(() => window.removeEventListener("click", handleClickOutside));

function playSongDirectly(track) {
  if (track.audioUrl) {
    recordTrackPlay(track);
    store.dispatch("player/playTrack", track);
  } else {
    alert("Audio stream not available for this track.");
  }
}

function toggleLikedSongMenu(trackId, event) {
  event.stopPropagation();
  activeLikedSongMenuId.value =
    activeLikedSongMenuId.value === trackId ? null : trackId;
}

function toggleLikeFromLibrary(song) {
  store.dispatch("auth/toggleLike", song.id);
  activeLikedSongMenuId.value = null;
}

function openSongModal(song) {
  selectedSong.value = song;
  targetPlaylistId.value = "";
  showSongModal.value = true;
}

function addSongToPlaylist() {
  if (!targetPlaylistId.value || !selectedSong.value) return;
  store.dispatch("auth/addTrackToPlaylist", {
    playlistId: targetPlaylistId.value,
    track: selectedSong.value,
  });
  alert("Added song to playlist!");
  showSongModal.value = false;
}

function openPlaylistDetail(playlist) {
  selectedPlaylist.value = playlist;
  activeMenuId.value = null;
}

function toggleMenu(playlistId, event) {
  event.stopPropagation();
  activeMenuId.value = activeMenuId.value === playlistId ? null : playlistId;
}

function startEditing(playlist) {
  selectedPlaylist.value = playlist;
  editedPlaylistName.value = playlist.title;
  isEditingName.value = true;
  activeMenuId.value = null;
}

function openAddSongsToPlaylistModal(playlist) {
  selectedPlaylist.value = playlist;
  activeMenuId.value = null;
  openCreateModal();
}

function savePlaylistName() {
  if (!editedPlaylistName.value.trim()) return;
  store.dispatch("auth/updatePlaylistName", {
    playlistId: selectedPlaylist.value.id,
    newName: editedPlaylistName.value.trim(),
  });
  selectedPlaylist.value.title = editedPlaylistName.value.trim();
  isEditingName.value = false;
}

function removeTrackFromPlaylist(trackId) {
  store.dispatch("auth/removeTrackFromPlaylist", {
    playlistId: selectedPlaylist.value.id,
    trackId,
  });
  selectedPlaylist.value.tracks = selectedPlaylist.value.tracks.filter(
    (t) => t.id !== trackId,
  );
  activeSongMenuId.value = null;
}

function deletePlaylist(playlist) {
  if (confirm(`Are you sure you want to delete "${playlist.title}"?`)) {
    store.dispatch("auth/deletePlaylist", playlist.id);
    if (selectedPlaylist.value?.id === playlist.id) {
      selectedPlaylist.value = null;
    }
    activeMenuId.value = null;
  }
}

function playTrackFromPlaylist(track) {
  if (track.audioUrl) {
    recordTrackPlay(track);
    store.dispatch("player/playTrack", track);
  } else {
    alert("Audio stream not available for this track.");
  }
}

function goToTrackDetail(track) {
  router.push(`/track/${track.id}`);
}

function goToArtist(artistId) {
  if (artistId) router.push(`/artists/${artistId}`);
}

function goToArtistByTrack(track) {
  if (track.artistId) {
    router.push(`/artists/${track.artistId}`);
  }
}

function toggleSongMenu(songId, event) {
  event.stopPropagation();
  activeSongMenuId.value = activeSongMenuId.value === songId ? null : songId;
}

function toggleLikeFromMenu(song) {
  store.dispatch("auth/toggleLike", song.id);
  activeSongMenuId.value = null;
}

function openAddToPlaylistModal(song) {
  activeLikedSongMenuId.value = null;
  activeSongMenuId.value = null;
  openSongModal(song);
}
</script>

<style scoped>
.library-page {
  background-color: var(--bg-main, #f7f7f9);
  color: var(--text-main, #111111);
  min-height: 100vh;
}

/* Full width white header spanning edge-to-edge, matching Discover */
.page-header {
  background-color: var(--bg-surface, #ffffff);
  border-bottom: 1px solid var(--border-subtle, #eaeaea);
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  margin-bottom: 2rem;
  padding: 1.5rem 0 1.25rem 0;
}

/* Inner wrapper to match content max-width and padding */
.header-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  width: 100%;
}

/* Container for content below header, widened to match Discover */
.library-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem 2rem 2rem;
  width: 100%;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.page-header h1 {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-main, #111111);
  letter-spacing: -0.02em;
}

.create-playlist-btn {
  border: none;
  background: var(--text-main, #333);
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: opacity 0.15s ease;
}

.create-playlist-btn:hover {
  opacity: 0.9;
}

.library-tabs {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0;
  flex-wrap: wrap;
}

.library-tab {
  border: none;
  padding: 0.4rem 1.25rem;
  border-radius: 18px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 700;
  transition:
    opacity 0.2s ease,
    transform 0.1s ease;
}

.library-tab:hover {
  opacity: 0.85;
}

.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.library-section {
  margin-bottom: 2.5rem;
}

.library-section h2 {
  font-size: 1.1rem;
  margin: 0 0 1rem 0;
  color: var(--text-main, #111111);
}

.track-grid,
.artist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
}

.playlist-card-wrapper {
  position: relative;
}

.options-dots-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.playlist-card-wrapper:hover .options-dots-btn {
  opacity: 1;
}

.pin-badge-btn {
  position: absolute;
  top: 6px;
  left: 6px;
  background: rgba(0, 0, 0, 0.6);
  color: #fae184;
  border: none;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.playlist-card-wrapper:hover .pin-badge-btn {
  opacity: 1;
}

.dropdown-menu {
  position: absolute;
  top: 38px;
  right: 6px;
  background: var(--bg-surface, white);
  border: 1px solid var(--border-subtle, #eee);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  z-index: 10;
  min-width: 140px;
  overflow: hidden;
}

.dropdown-menu button {
  background: transparent;
  border: none;
  padding: 0.5rem 1rem;
  text-align: left;
  font-size: 0.8rem;
  cursor: pointer;
  color: var(--text-main, #111);
}

.dropdown-menu button:hover {
  background: var(--accent-yellow, #fae184);
}

.text-danger {
  color: #ff4d4d;
}

.track-card {
  cursor: pointer;
}

.track-cover-placeholder {
  width: 100%;
  aspect-ratio: 1;
  background: var(--border-subtle, #eee);
  border-radius: 6px;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.track-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-placeholder {
  font-size: 1.5rem;
  background: var(--bg-surface, #f9f9f9);
  border: 1px solid var(--border-subtle, #eee);
}

.play-indicator {
  font-size: 1.2rem;
  opacity: 0.4;
}

.track-title,
.artist-name {
  font-size: 0.85rem;
  font-weight: 600;
  margin: 0;
  cursor: pointer;
  color: var(--text-main, #111111);
}

.track-title:hover,
.track-artist:hover {
  text-decoration: underline;
}

.track-artist {
  font-size: 0.75rem;
  color: var(--text-muted, #666666);
  opacity: 0.8;
  margin: 0;
  cursor: pointer;
}

.artist-card {
  text-align: center;
  cursor: pointer;
}

/* Bulletproof padding-trick wrapper for true circular avatars */
.artist-avatar-wrap {
  width: 100%;
  padding-top: 100%;
  position: relative;
  border-radius: 50%;
  overflow: hidden;
  background: var(--border-subtle, #eee);
  margin-bottom: 0.5rem;
}

.artist-avatar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.empty-state {
  color: var(--text-muted, #666666);
  opacity: 0.7;
  font-size: 0.9rem;
  text-align: center;
  padding: 1.5rem 0;
}

.actionable-empty-card {
  border: 1px dashed var(--border-subtle, #ccc);
  padding: 2rem;
  text-align: center;
  border-radius: 8px;
  background: var(--bg-surface, #fafafa);
  color: var(--text-muted, #666);
}

.actionable-empty-card p {
  margin: 0 0 1rem;
  font-size: 0.9rem;
}

.global-empty-state {
  text-align: center;
  padding: 4rem 1rem;
}

.empty-hero-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.global-empty-state h3 {
  margin: 0 0 0.5rem;
  font-size: 1.3rem;
  color: var(--text-main, #111);
}

.global-empty-state p {
  color: var(--text-muted, #666);
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

/* Playlist Detail Page Styles */
.playlist-detail-page {
  animation: fadeIn 0.2s ease-in-out;
}

.back-btn {
  background: transparent;
  border: none;
  font-size: 0.9rem;
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
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-subtle, #eee);
}

.playlist-hero-cover {
  width: 120px;
  height: 120px;
  background: var(--bg-surface, #f9f9f9);
  border: 1px solid var(--border-subtle, #eee);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  flex-shrink: 0;
}

.playlist-tag {
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--text-muted, #666);
  opacity: 0.8;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0.25rem 0;
}

.title-row h2 {
  margin: 0;
  font-size: 1.8rem;
  color: var(--text-main, #111);
}

.text-action-btn {
  background: transparent;
  border: 1px solid var(--border-subtle, #ccc);
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-main, #333);
}

.text-action-btn:hover {
  background: var(--accent-yellow, #fae184);
  border-color: #999;
}

.edit-title-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin: 0.25rem 0;
}

.inline-input {
  padding: 0.3rem 0.5rem;
  font-size: 1.1rem;
  border: 1px solid var(--border-subtle, #ccc);
  border-radius: 4px;
  background: var(--bg-surface, #fff);
  color: var(--text-main, #111);
}

.btn-sm {
  background: var(--text-main, #333);
  color: white;
  border: none;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.btn-sm-cancel {
  background: transparent;
  border: 1px solid var(--border-subtle, #ccc);
  color: var(--text-main, #333);
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
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
  font-size: 0.85rem;
  border-bottom: 1px solid var(--border-subtle, #f2f2f2);
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

/* Modal Styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-card {
  background: var(--bg-surface, #fff);
  color: var(--text-main, #111);
  padding: 1.5rem;
  border-radius: 12px;
  width: 90%;
  max-width: 360px;
  text-align: center;
}

.create-playlist-modal {
  max-width: 440px;
  text-align: left;
}

.song-picker-section {
  margin-top: 1rem;
  border-top: 1px solid var(--border-subtle, #eee);
  padding-top: 1rem;
}

.song-picker-section h4 {
  font-size: 0.85rem;
  margin: 0 0 0.5rem;
  color: var(--text-main, #444);
}

.song-picker-list {
  max-height: 160px;
  overflow-y: auto;
  border: 1px solid var(--border-subtle, #eee);
  border-radius: 6px;
  padding: 0.4rem;
  margin-bottom: 1rem;
}

.song-picker-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.4rem;
  font-size: 0.8rem;
  cursor: pointer;
  border-radius: 4px;
}

.song-picker-row:hover {
  background: var(--accent-yellow, #fae184);
}

.song-picker-info {
  display: flex;
  flex-direction: column;
}

.picker-title {
  font-weight: 600;
  color: var(--text-main, #111);
}

.picker-artist {
  font-size: 0.7rem;
  color: var(--text-muted, #666);
}

.empty-state-sm {
  font-size: 0.8rem;
  text-align: center;
  color: var(--text-muted, #666);
  opacity: 0.7;
  padding: 0.5rem 0;
  margin: 0;
}

.modal-cover {
  width: 100px;
  height: 100px;
  margin: 0 auto 1rem;
  border-radius: 8px;
  overflow: hidden;
  background: var(--border-subtle, #eee);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-cover-icon {
  font-size: 2rem;
}

.modal-card h3 {
  margin: 0 0 0.25rem;
  font-size: 1.1rem;
  color: var(--text-main, #111);
}

.modal-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted, #666);
  margin: 0 0 1rem;
}

.btn-secondary {
  width: 100%;
  background: var(--accent-yellow, #fae184);
  color: var(--text-dark-btn, #111);
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
}

.modal-input,
.modal-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-subtle, #ccc);
  border-radius: 4px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  background: var(--bg-surface, #fff);
  color: var(--text-main, #111);
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.modal-btn-cancel {
  background: transparent;
  border: 1px solid var(--border-subtle, #ccc);
  color: var(--text-main, #333);
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
}

.modal-btn-submit {
  background: var(--text-main, #333);
  color: #fff;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
}

.modal-btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.playlist-track-row {
  position: relative;
}

.song-menu-wrapper {
  position: relative;
  display: flex;
  justify-content: flex-end;
}

.options-dots-btn-inline {
  background: transparent;
  color: var(--text-muted, #666);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.options-dots-btn-inline:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--text-main, #000);
}

.song-dropdown {
  right: 0;
  top: 28px;
  z-index: 20;
}

/* Search bar styling with scoped overrides for smooth color consistency */
.search-box {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 0.75rem;
}

.search-input {
  background-color: #ede9f6;
  border: none;
  padding: 0.55rem 2.25rem 0.55rem 1rem;
  border-radius: 8px;
  width: 100%;
  font-size: 0.85rem;
  outline: none;
  color: var(--text-main, #111);
  margin-bottom: 0;
  transition: background-color 0.2s ease;
}

.search-input:focus {
  background-color: #e4ddf6;
}

.search-icon {
  position: absolute;
  right: 0.75rem;
  font-size: 0.9rem;
  color: #666;
  pointer-events: none;
}
</style>

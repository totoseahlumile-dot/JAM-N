<template>
  <div class="discover-page">
    <header class="page-header">
      <h1>DISCOVER MUSIC</h1>
      <div class="search-bar">
        <input
          type="text"
          placeholder="Search artists, bands, genres, or cities..."
          v-model="searchQuery"
        />
        <svg class="search-icon" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
          />
        </svg>
      </div>

      <!-- Filter Tags -->
      <div class="filter-tags">
        <button
          v-for="genre in genreOptions"
          :key="genre"
          class="tag"
          :class="{ active: activeGenre === genre }"
          @click="activeGenre = genre"
        >
          {{ genre }}
        </button>
      </div>
    </header>

    <!-- Trending Artists Section -->
    <section class="section">
      <div class="section-header">
        <h2>Trending Artists</h2>
        <a href="#" class="see-all">See All</a>
      </div>
      <div class="card-grid">
        <div
          v-for="artist in trendingArtists"
          :key="artist.id"
          class="artist-card clickable"
          @click="goToArtistProfile(artist.id)"
        >
          <div class="image-wrapper">
            <img
              :src="artist.image"
              :alt="artist.name"
              class="placeholder-img"
            />
          </div>
          <p class="artist-name">{{ artist.name }}</p>
          <p class="artist-genre">{{ artist.genre }}</p>
          <div class="card-actions" @click.stop>
            <button class="btn-outline" @click="goToArtistProfile(artist.id)">
              View Profile
            </button>
            <button
              class="btn-primary"
              :class="{ following: isFollowing(artist.id) }"
              @click="toggleFollow(artist)"
            >
              {{ isFollowing(artist.id) ? "Following" : "Follow Artist" }}
            </button>
          </div>
        </div>
      </div>
      <p v-if="trendingArtists.length === 0" class="empty-state">
        No artists match this filter yet.
      </p>
    </section>

    <!-- Recommended Artists Section -->
    <section class="section">
      <div class="section-header">
        <h2>Recommended Artists</h2>
        <a href="#" class="see-all">See All</a>
      </div>
      <div class="card-grid">
        <div
          v-for="artist in recommendedArtists"
          :key="artist.id"
          class="artist-card compact clickable"
          @click="goToArtistProfile(artist.id)"
        >
          <img
            :src="artist.image"
            :alt="artist.name"
            class="placeholder-img-sm"
          />
          <div class="artist-info">
            <p class="artist-name">{{ artist.name }}</p>
            <p class="artist-genre">{{ artist.genre }}</p>
          </div>
        </div>
      </div>
      <p v-if="recommendedArtists.length === 0" class="empty-state">
        No more artists to show.
      </p>
    </section>

    <!-- Popular Tracks Section -->
    <section class="section">
      <div class="section-header">
        <h2>Popular Tracks</h2>
        <a href="#" class="see-all">See All</a>
      </div>
      <div class="tracks-list">
        <div
          v-for="track in popularTracks"
          :key="track.id"
          class="track-row clickable"
          @click="playTrack(track)"
        >
          <img :src="track.image" :alt="track.title" class="track-thumb" />
          <div class="track-details">
            <p class="track-title">{{ track.title }}</p>
            <p class="track-artist">{{ track.artist }}</p>
          </div>

          <div class="track-actions" @click.stop>
            <!-- Like Button -->
            <button
              class="like-btn-track"
              :class="{ liked: isTrackLiked(track.id) }"
              @click="toggleTrackLike(track.id)"
              aria-label="Like track"
            >
              <svg class="heart-icon" viewBox="0 0 24 24">
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                />
              </svg>
            </button>

            <!-- More Options Dropdown -->
            <div class="dropdown-wrapper">
              <button
                class="more-btn"
                @click="toggleDropdown(track.id, $event)"
                aria-label="More options"
              >
                ⋮
              </button>
              <div v-if="activeDropdownId === track.id" class="dropdown-menu">
                <button @click="addToPlaylist(track)">Add to Playlist</button>
                <button @click="addToQueue(track)">Add to Queue</button>
                <button @click="shareTrack(track)">Share</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p v-if="popularTracks.length === 0" class="empty-state">
        No popular tracks available.
      </p>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

const store = useStore();
const router = useRouter();

const searchQuery = ref("");
const activeGenre = ref("All Genres");
const activeDropdownId = ref(null);

const allArtists = computed(() => store?.getters?.["artists/allArtists"] ?? []);
const popularTracks = computed(
  () => store?.getters?.["tracks/popularTracks"] ?? [],
);

const genreOptions = computed(() => {
  const genres = allArtists.value.map((a) => a.genre).filter(Boolean);
  return ["All Genres", ...new Set(genres)];
});

const filteredArtists = computed(() => {
  let result = allArtists.value;

  if (activeGenre.value !== "All Genres") {
    result = result.filter((a) => a.genre === activeGenre.value);
  }

  if (searchQuery.value.trim() !== "") {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (a) =>
        a.name?.toLowerCase().includes(query) ||
        a.genre?.toLowerCase().includes(query),
    );
  }

  return result;
});

const trendingArtists = computed(() => filteredArtists.value.slice(0, 5));
const recommendedArtists = computed(() => filteredArtists.value.slice(5));

function goToArtistProfile(artistId) {
  router.push(`/artists/${artistId}`);
}

function isFollowing(artistId) {
  return store?.getters?.["auth/isFollowing"]?.(artistId) ?? false;
}

function toggleFollow(artist) {
  store?.commit("auth/TOGGLE_FOLLOW", {
    id: artist.id,
    name: artist.name,
    handle: artist.name
      ? artist.name.toLowerCase().replace(/\s+/g, "_")
      : "user",
    image: artist.image ?? null,
  });
}

// Synced Track Like Interactions (pointing to auth store)
function isTrackLiked(trackId) {
  return store?.getters?.["auth/isLiked"]?.(trackId) ?? false;
}

function toggleTrackLike(trackId) {
  store?.commit("auth/TOGGLE_LIKE", trackId);
}

function playTrack(track) {
  if (track.audioUrl) {
    store.dispatch("player/playTrack", track);
  } else {
    alert("Audio stream not available.");
  }
}

function toggleDropdown(trackId, event) {
  event.stopPropagation();
  activeDropdownId.value = activeDropdownId.value === trackId ? null : trackId;
}

function handleClickOutside(e) {
  if (!e.target.closest(".dropdown-wrapper")) {
    activeDropdownId.value = null;
  }
}

onMounted(() => window.addEventListener("click", handleClickOutside));
onUnmounted(() => window.removeEventListener("click", handleClickOutside));

function addToPlaylist(track) {
  activeDropdownId.value = null;
  console.log("Add to playlist:", track.title);
}

function addToQueue(track) {
  activeDropdownId.value = null;
  store.dispatch("player/addToQueue", track);
}

function shareTrack(track) {
  activeDropdownId.value = null;
  navigator.clipboard.writeText(window.location.origin + track.audioUrl);
  alert("Link copied to clipboard!");
}
</script>

<style scoped>
.discover-page {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  letter-spacing: 0.03em;
}

.search-bar {
  position: relative;
  max-width: 100%;
  margin-bottom: 1.25rem;
}

.search-bar input {
  width: 100%;
  padding: 0.85rem 1rem 0.85rem 2.75rem;
  background-color: #f2f2f2;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #888888;
}

.filter-tags {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
}

.tag {
  border: none;
  background-color: #e8e8f0;
  color: #333333;
  padding: 0.4rem 1.25rem;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  font-weight: 500;
}

.tag.active {
  background-color: #5b5370;
  color: #ffffff;
}

.section {
  margin-bottom: 3rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.section-header h2 {
  font-size: 1.2rem;
  font-weight: 700;
}

.see-all {
  font-size: 0.85rem;
  color: #666666;
  text-decoration: none;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.25rem;
}

.artist-card {
  background: #f9f9f9;
  border: 1px solid #eeeeee;
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.artist-card.clickable {
  cursor: pointer;
}

.artist-card.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.image-wrapper {
  position: relative;
  width: 100%;
  margin-bottom: 0.85rem;
}

.placeholder-img {
  width: 100%;
  height: 160px;
  background-color: #e5e5e5;
  border-radius: 6px;
  object-fit: cover;
  display: block;
}

.artist-name {
  font-weight: 700;
  font-size: 0.9rem;
  margin: 0;
}

.artist-genre {
  font-size: 0.8rem;
  color: #777777;
  margin: 0 0 1rem 0;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.card-actions .btn-outline,
.card-actions .btn-primary {
  flex: 1;
  padding: 0.4rem 0.2rem;
  font-size: 0.725rem;
  border-radius: 15px;
  cursor: pointer;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  transition: all 0.15s ease;
}

.btn-outline {
  border: 1px solid #ccc;
  background: transparent;
  color: #333;
}

.btn-primary {
  border: none;
  background: #6a5acd;
  color: white;
}

.btn-primary.following {
  background: #e8e8f0;
  color: #333;
}

.artist-card.compact {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  position: relative;
}

.artist-info {
  flex: 1;
}

.placeholder-img-sm {
  width: 48px;
  height: 48px;
  background-color: #e5e5e5;
  border-radius: 6px;
  flex-shrink: 0;
  object-fit: cover;
}

/* Popular Tracks Styles */
.tracks-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.track-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: #f9f9f9;
  border: 1px solid #eeeeee;
  border-radius: 8px;
  transition: background 0.15s ease;
}

.track-row:hover {
  background: #f1f1f5;
}

.track-thumb {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  object-fit: cover;
}

.track-details {
  flex: 1;
}

.track-title {
  font-weight: 600;
  font-size: 0.9rem;
  margin: 0;
}

.track-artist {
  font-size: 0.8rem;
  color: #777777;
  margin: 0.1rem 0 0 0;
}

.track-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.like-btn-track {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #888888;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  transition: transform 0.2s ease;
}

.like-btn-track:hover {
  transform: scale(1.1);
}

.like-btn-track.liked {
  color: #e63946;
}

.like-btn-track.liked .heart-icon {
  fill: #e63946;
}

.heart-icon {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}

.dropdown-wrapper {
  position: relative;
}

.more-btn {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #555555;
  padding: 0 0.5rem;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background: #ffffff;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  min-width: 140px;
  z-index: 10;
  overflow: hidden;
}

.dropdown-menu button {
  background: transparent;
  border: none;
  padding: 0.6rem 1rem;
  text-align: left;
  font-size: 0.85rem;
  cursor: pointer;
}

.dropdown-menu button:hover {
  background: #f0f0f5;
}

.empty-state {
  opacity: 0.6;
  font-size: 0.85rem;
}
</style>

<template>
  <div class="discover-page">
    <header class="page-header">
      <h1>Discover Music</h1>
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

      <!-- Filter Tags with Expand/Collapse for overflow -->
      <div class="filter-container">
        <div class="filter-tags" :class="{ expanded: showAllGenres }">
          <button
            v-for="(genre, index) in genreOptions"
            :key="genre"
            class="tag"
            :class="{ active: activeGenre === genre }"
            :style="getFilterStyle(index, activeGenre === genre)"
            @click="activeGenre = genre"
          >
            {{ genre }}
          </button>
        </div>
        <button
          v-if="genreOptions.length > 8"
          class="genre-toggle-btn"
          @click="showAllGenres = !showAllGenres"
        >
          {{
            showAllGenres ? "Show Less ▲" : `+${genreOptions.length - 8} More ▼`
          }}
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
          <p class="artist-genre">
            {{
              Array.isArray(artist.genre)
                ? artist.genre.join(", ")
                : artist.genre
            }}
          </p>
          <div class="card-actions" @click.stop>
            <button class="btn-outline" @click="goToArtistProfile(artist.id)">
              View Profile
            </button>
            <button
              class="btn-primary"
              :class="{ following: isFollowing(artist.id) }"
              @click="toggleFollow(artist)"
            >
              {{ isFollowing(artist.id) ? "Following" : "Follow" }}
            </button>
          </div>
        </div>
      </div>
      <p v-if="trendingArtists.length === 0" class="empty-state">
        No artists match this filter yet.
      </p>
    </section>

    <!-- Recommended Artists Section with Slide / See All functionality -->
    <section class="section">
      <div class="section-header">
        <h2>Recommended Artists</h2>
        <div class="header-controls">
          <div
            v-if="!showAllRecommended && recommendedArtistsFull.length > 9"
            class="slider-arrows"
          >
            <button
              class="arrow-btn"
              @click="scrollRecommended('left')"
              aria-label="Scroll left"
            >
              ‹
            </button>
            <button
              class="arrow-btn"
              @click="scrollRecommended('right')"
              aria-label="Scroll right"
            >
              ›
            </button>
          </div>
          <button
            class="see-all"
            @click="showAllRecommended = !showAllRecommended"
          >
            {{ showAllRecommended ? "See Less" : "See All" }}
          </button>
        </div>
      </div>

      <div
        ref="recommendedScrollRef"
        class="card-grid"
        :class="{ 'scrollable-row': !showAllRecommended }"
      >
        <div
          v-for="artist in displayedRecommendedArtists"
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
            <p class="artist-genre">
              {{
                Array.isArray(artist.genre)
                  ? artist.genre.join(", ")
                  : artist.genre
              }}
            </p>
          </div>
        </div>
      </div>
      <p v-if="recommendedArtistsFull.length === 0" class="empty-state">
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

const showAllGenres = ref(false);
const showAllRecommended = ref(false);
const recommendedScrollRef = ref(null);

const allArtists = computed(() => store?.getters?.["artists/allArtists"] ?? []);
const popularTracks = computed(
  () => store?.getters?.["content/popularTracks"] ?? [],
);

const genreOptions = computed(() => {
  const allGenres = allArtists.value
    .flatMap((a) => a.genre || [])
    .filter(Boolean);
  return ["All Genres", ...new Set(allGenres)];
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
      fontWeight: "700",
    };
  }
  return {
    backgroundColor: filterColors[index % filterColors.length],
    color: "var(--text-dark-btn, #111)",
  };
}

const filteredArtists = computed(() => {
  let result = allArtists.value;

  if (activeGenre.value !== "All Genres") {
    result = result.filter(
      (a) => Array.isArray(a.genre) && a.genre.includes(activeGenre.value),
    );
  }

  if (searchQuery.value.trim() !== "") {
    const query = searchQuery.value.toLowerCase();
    result = result.filter((a) => {
      const matchesName = a.name?.toLowerCase().includes(query);
      const matchesGenre = Array.isArray(a.genre)
        ? a.genre.some((g) => g.toLowerCase().includes(query))
        : a.genre?.toLowerCase().includes(query);
      return matchesName || matchesGenre;
    });
  }

  return result;
});

const trendingArtists = computed(() => filteredArtists.value.slice(0, 5));

const recommendedArtistsFull = computed(() => filteredArtists.value.slice(5));

const displayedRecommendedArtists = computed(() => {
  if (showAllRecommended.value) {
    return recommendedArtistsFull.value;
  }
  return recommendedArtistsFull.value.slice(0, 9);
});

function scrollRecommended(direction) {
  if (recommendedScrollRef.value) {
    const scrollAmount = 300;
    recommendedScrollRef.value.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }
}

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

onMounted(() => {
  window.addEventListener("click", handleClickOutside);
  Promise.allSettled([store.dispatch("artists/fetchArtists"), store.dispatch("content/fetchTracks")]);
});
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
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background-color: var(--bg-main, #ffffff);
  color: var(--text-main, #111111);
}

/* Page Header Typography */
.page-header h1 {
  margin: 0 0 1.25rem 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-main, #111111);
  letter-spacing: -0.02em;
}

.search-bar {
  position: relative;
  max-width: 100%;
  margin-bottom: 1rem;
}

.search-bar input {
  width: 100%;
  padding: 0.6rem 1rem 0.6rem 2.5rem;
  background-color: var(--bg-surface, #fff);
  border: 1px solid var(--border-subtle, #e0e0e0);
  border-radius: 6px;
  font-size: 0.85rem;
  outline: none;
  color: var(--text-main, #111);
  transition: border-color 0.2s ease;
}

.search-bar input:focus {
  border-color: var(--primary-wisteria, #b19cd9);
}

.search-icon {
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--text-muted, #666);
}

/* Filter Tags Collapse Container */
.filter-container {
  margin-bottom: 2rem;
}

.filter-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  max-height: 40px;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.filter-tags.expanded {
  max-height: 250px;
}

.genre-toggle-btn {
  background: transparent;
  border: none;
  color: var(--primary-wisteria, #b19cd9);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
  padding: 0;
}

.tag {
  border: none;
  padding: 0.4rem 1.1rem;
  border-radius: 16px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition:
    opacity 0.2s ease,
    transform 0.1s ease;
  height: 32px;
}

.tag:hover {
  opacity: 0.85;
}

/* Sections */
.section {
  margin-bottom: 2.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h2 {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-main, #111);
  margin: 0;
  letter-spacing: -0.01em;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.slider-arrows {
  display: flex;
  gap: 0.25rem;
}

.arrow-btn {
  background: var(--bg-surface, #fff);
  border: 1px solid var(--border-subtle, #ccc);
  color: var(--text-main, #111);
  width: 24px;
  height: 24px;
  border-radius: 4px;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease;
}

.arrow-btn:hover {
  background: rgba(173, 235, 255, 0.25);
}

.see-all {
  font-size: 0.8rem;
  color: var(--text-muted, #666);
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: none;
  font-weight: 600;
}

.see-all:hover {
  color: var(--text-main, #111);
}

/* Cards Grid & Horizontal Scroll */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
}

.card-grid.scrollable-row {
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  gap: 1rem;
  padding-bottom: 0.5rem;

  scrollbar-width: none;
  -ms-overflow-style: none;
}

.card-grid.scrollable-row::-webkit-scrollbar {
  display: none;
}

.card-grid.scrollable-row .artist-card {
  min-width: 220px;
  flex-shrink: 0;
}

.artist-card {
  background: var(--bg-surface, #fff);
  border: 1px solid var(--border-subtle, #e0e0e0);
  border-radius: 8px;
  padding: 0.65rem;
  display: flex;
  flex-direction: column;
  transition: background 0.15s ease;
}

.artist-card.clickable {
  cursor: pointer;
}

.artist-card.clickable:hover {
  background: rgba(173, 235, 255, 0.15);
}

.image-wrapper {
  position: relative;
  width: 100%;
  margin-bottom: 0.5rem;
}

.placeholder-img {
  width: 100%;
  aspect-ratio: 1;
  background-color: var(--border-subtle, #eee);
  border-radius: 6px;
  object-fit: cover;
  display: block;
}

.artist-name {
  font-weight: 600;
  font-size: 0.85rem;
  margin: 0;
  color: var(--text-main, #111);
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.artist-genre {
  font-size: 0.75rem;
  color: var(--text-muted, #666);
  margin: 0.15rem 0 0.6rem 0;
  text-align: left;
}

.card-actions {
  display: flex;
  gap: 0.35rem;
  margin-top: auto;
}

.card-actions .btn-outline,
.card-actions .btn-primary {
  flex: 1;
  padding: 0.35rem 0.2rem;
  font-size: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  transition: all 0.15s ease;
}

.btn-outline {
  border: 1px solid var(--border-subtle, #ccc);
  background: transparent;
  color: var(--text-main, #111);
}

.btn-outline:hover {
  border-color: var(--primary-wisteria, #b19cd9);
}

.btn-primary {
  border: none;
  background: var(--accent-blue, #b8e5ff);
  color: var(--text-dark-btn, #111);
}

.btn-primary.following {
  background: var(--accent-yellow, #fae184);
  color: var(--text-dark-btn, #111);
}

/* Compact Card Variant */
.artist-card.compact {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.65rem;
  padding: 0.5rem 0.65rem;
}

.artist-info {
  flex: 1;
  min-width: 0;
}

.placeholder-img-sm {
  width: 36px;
  height: 36px;
  background-color: var(--border-subtle, #eee);
  border-radius: 50%;
  flex-shrink: 0;
  object-fit: cover;
}

/* Popular Tracks List */
.tracks-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.track-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: var(--bg-surface, #fff);
  border: 1px solid var(--border-subtle, #e0e0e0);
  border-radius: 8px;
  transition: background-color 0.15s ease;
}

.track-row:hover {
  background-color: rgba(173, 235, 255, 0.15);
}

.track-thumb {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.track-details {
  flex: 1;
  text-align: left;
  min-width: 0;
}

.track-title {
  font-weight: 600;
  font-size: 0.85rem;
  margin: 0;
  color: var(--text-main, #111);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist {
  font-size: 0.75rem;
  color: var(--text-muted, #666);
  margin: 0.1rem 0 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.like-btn-track {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-muted, #666);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  transition: transform 0.2s ease;
}

.like-btn-track:hover {
  transform: scale(1.1);
}

.like-btn-track.liked {
  color: var(--accent-plum, #d4bcf0);
}

.like-btn-track.liked .heart-icon {
  fill: var(--accent-plum, #d4bcf0);
}

.heart-icon {
  width: 15px;
  height: 15px;
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
  font-size: 1.1rem;
  cursor: pointer;
  color: var(--text-muted, #666);
  padding: 0 0.2rem;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background: var(--bg-surface, #fff);
  border: 1px solid var(--border-subtle, #e0e0e0);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  min-width: 130px;
  z-index: 10;
  overflow: hidden;
}

.dropdown-menu button {
  background: transparent;
  border: none;
  padding: 0.45rem 0.75rem;
  text-align: left;
  font-size: 0.75rem;
  cursor: pointer;
  color: var(--text-main, #111);
}

.dropdown-menu button:hover {
  background-color: rgba(173, 235, 255, 0.25);
}

.empty-state {
  font-size: 0.85rem;
  color: var(--text-muted, #666);
  opacity: 0.7;
  text-align: center;
  padding: 1.5rem 0;
}
</style>

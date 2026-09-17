<template>
  <div class="artists-discovery-page">
    <!-- Header & Search -->
    <header class="discovery-header">
      <h2>Discover Local Artists</h2>
      <p class="subtitle">
        Explore independent talent, beats, and sounds from your scene.
      </p>

      <div class="search-filter-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search artists by name or genre..."
          class="search-input"
        />

        <div class="genre-filters">
          <button
            v-for="genre in genres"
            :key="genre"
            class="genre-chip"
            :class="{ active: selectedGenre === genre }"
            @click="selectedGenre = genre"
          >
            {{ genre }}
          </button>
        </div>
      </div>
    </header>

    <!-- Artists Grid -->
    <section v-if="filteredArtists.length > 0" class="artists-grid">
      <div
        v-for="artist in filteredArtists"
        :key="artist.id"
        class="artist-card"
        @click="goToArtist(artist.id)"
      >
        <div class="artist-avatar-container">
          <img
            v-if="artist.image"
            :src="artist.image"
            :alt="artist.name"
            class="artist-img"
          />
          <div v-else class="artist-placeholder">🎵</div>
        </div>

        <div class="artist-info">
          <h3 class="artist-name">{{ artist.name }}</h3>
          <p class="artist-genre">{{ artist.genre || "Independent Artist" }}</p>
          <span v-if="artist.location" class="artist-location"
            >📍 {{ artist.location }}</span
          >
        </div>
      </div>
    </section>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <p>No artists found matching your search.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

const store = useStore();
const router = useRouter();

const searchQuery = ref("");
const selectedGenre = ref("All");

// Mock genres list + 'All' option
const genres = [
  "All",
  "Hip Hop",
  "Amapiano",
  "R&B",
  "Electronic",
  "Soul",
  "Indie",
];

// Pull artists from Vuex store (with a safe fallback array if store module isn't populated yet)
const artists = computed(() => {
  return (
    store?.getters?.["artists/allArtists"] ?? [
      {
        id: "art_1",
        name: "Zola Sounds",
        genre: "Amapiano",
        location: "Cape Town",
        image: null,
      },
      {
        id: "art_2",
        name: "Kloof Street Collective",
        genre: "Indie",
        location: "Cape Town",
        image: null,
      },
      {
        id: "art_3",
        name: "Buntu Beats",
        genre: "Hip Hop",
        location: "Johannesburg",
        image: null,
      },
      {
        id: "art_4",
        name: "Nala Soul",
        genre: "R&B",
        location: "Durban",
        image: null,
      },
    ]
  );
});

// Filter artists based on search query and genre chip
const filteredArtists = computed(() => {
  return artists.value.filter((artist) => {
    const matchesSearch =
      artist.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (artist.genre &&
        artist.genre.toLowerCase().includes(searchQuery.value.toLowerCase()));

    const matchesGenre =
      selectedGenre.value === "All" || artist.genre === selectedGenre.value;

    return matchesSearch && matchesGenre;
  });
});

function goToArtist(artistId) {
  router.push(`/artists/${artistId}`);
}
</script>

<style scoped>
.artists-discovery-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  background-color: var(--bg-main);
  color: var(--text-main);
}

.discovery-header {
  margin-bottom: 2rem;
}

.discovery-header h2 {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0 0 0.25rem;
  color: var(--text-main);
}

.subtitle {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin: 0 0 1.25rem;
}

.search-filter-bar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  outline: none;
  color: var(--text-main);
  transition: border-color 0.2s ease;
}

.search-input:focus {
  border-color: var(--primary-wisteria);
}

.genre-filters {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
  scrollbar-width: none;
}

.genre-filters::-webkit-scrollbar {
  display: none;
}

/* Mapped to your main.css .genre-chip / filter-chip spec */
.genre-chip {
  background-color: var(--accent-plum);
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 18px;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-dark-btn);
  cursor: pointer;
  white-space: nowrap;
  transition:
    opacity 0.2s ease,
    transform 0.15s ease;
}

.genre-chip:hover {
  opacity: 0.85;
}

.genre-chip.active {
  background-color: var(--primary-wisteria);
  color: var(--text-dark-btn);
  font-weight: 800;
}

.artists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.25rem;
}

.artist-card {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    background-color 0.2s ease,
    box-shadow 0.15s ease;
}

.artist-card:hover {
  transform: translateY(-2px);
  background-color: rgba(173, 235, 255, 0.25);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.artist-avatar-container {
  width: 90px;
  height: 90px;
  margin: 0 auto 0.75rem;
  border-radius: 50%;
  background-color: var(--bg-main);
  border: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.artist-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.artist-placeholder {
  font-size: 1.75rem;
}

.artist-name {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0 0 0.2rem;
  color: var(--text-main);
}

.artist-genre {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0 0 0.4rem;
}

.artist-location {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.empty-state {
  text-align: center;
  padding: 3rem 0;
  color: var(--text-muted);
  font-size: 0.9rem;
}
</style>

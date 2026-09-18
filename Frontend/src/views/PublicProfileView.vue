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

    <!-- Content Tabs / Track List -->
    <section class="artist-content">
      <h2>Tracks & Beats</h2>
      <div v-if="artist.tracks && artist.tracks.length" class="track-list">
        <div v-for="track in artist.tracks" :key="track.id" class="track-card">
          <p class="track-title">{{ track.title }}</p>
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
import { computed } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { useStore } from "vuex";

const route = useRoute();
const store = useStore();

const artistId = computed(() => route.params.id);

// Fetch target artist from the artists Vuex module
const artist = computed(() => {
  const all = store.getters["artists/allArtists"] ?? [];
  return all.find((a) => String(a.id) === String(artistId.value));
});

const artistHandle = computed(() => {
  return artist.value?.name
    ? artist.value.name.toLowerCase().replace(/\s+/g, "_")
    : "";
});

// Social status getter from auth module
const isFollowing = computed(
  () => store.getters["auth/isFollowing"]?.(artistId.value) ?? false,
);

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

/* Light blue button state matching discover view cards */
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

/* Switches to yellow/gold when following state is active */
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

.track-card {
  background-color: var(--bg-surface, #fff);
  border: 1px solid var(--border-subtle, #e0e0e0);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.track-title {
  margin: 0;
  font-weight: 600;
  color: var(--text-main, #111);
  font-size: 0.95rem;
}

.empty-msg,
.not-found {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted, #666);
}
</style>

<script setup>
import { useRouter } from "vue-router";

const props = defineProps({
  artist: {
    type: Object,
    required: true,
  },
});

const router = useRouter();

const goToDetail = () => {
  router.push(`/artists/${props.artist.id}`);
};
</script>

<template>
  <div class="artist-card" @click="goToDetail">
    <div class="image-container">
      <img :src="artist.photo" :alt="artist.name" class="artist-img" />
      <span class="type-tag">{{ artist.type }}</span>
    </div>

    <div class="card-content">
      <h3 class="artist-name">{{ artist.name }}</h3>

      <div class="genre-list">
        <span v-for="g in artist.genres" :key="g" class="genre-tag">
          {{ g }}
        </span>
      </div>

      <button class="btn-follow" @click.stop>Follow Artist</button>
    </div>
  </div>
</template>

<style scoped>
.artist-card {
  background-color: var(--color-carbon-black);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(250, 250, 253, 0.08);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

/* Frosted Blue Hover State */
.artist-card:hover {
  transform: translateY(-4px);
  border-color: var(--color-frosted-blue);
  box-shadow: 0 8px 24px rgba(173, 235, 255, 0.15);
}

.image-container {
  position: relative;
  width: 100%;
  height: 200px;
  background-color: var(--color-black);
}

.artist-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.type-tag {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background-color: rgba(10, 9, 8, 0.8);
  color: var(--color-frosted-blue);
  border: 1px solid var(--color-frosted-blue);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  backdrop-filter: blur(4px);
}

.card-content {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.artist-name {
  color: var(--color-off-white);
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.genre-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 1.25rem;
}

.genre-tag {
  background-color: rgba(234, 160, 210, 0.15);
  color: var(--color-plum-pink);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
}

/* Primary Action Button (Wisteria Purple + Carbon Black Text) */
.btn-follow {
  margin-top: auto;
  background-color: var(--color-wisteria);
  color: var(--color-carbon-black);
  font-weight: 700;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: none;
  width: 100%;
  transition: opacity 0.2s ease;
}

.btn-follow:hover {
  opacity: 0.9;
}
</style>

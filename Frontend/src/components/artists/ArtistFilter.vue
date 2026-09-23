<script setup>
defineProps({
  genres: {
    type: Array,
    required: true,
  },
  selectedGenre: {
    type: String,
    default: "All",
  },
});

defineEmits(["select-genre"]);
</script>

<template>
  <div class="filter-wrapper">
    <button
      class="filter-pill"
      :class="{ active: selectedGenre === 'All' }"
      @click="$emit('select-genre', 'All')"
    >
      All
    </button>
    <button
      v-for="genre in genres"
      :key="genre"
      class="filter-pill"
      :class="{ active: selectedGenre === genre }"
      @click="$emit('select-genre', genre)"
    >
      {{ genre }}
    </button>
  </div>
</template>

<style scoped>
.filter-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.filter-pill {
  background-color: var(--color-carbon-black);
  color: var(--color-off-white);
  border: 1px solid rgba(250, 250, 253, 0.2);
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-pill:hover {
  border-color: var(--color-plum-pink);
  color: var(--color-plum-pink);
}

/* Active Genre Pill (Plum Pink Accent) */
.filter-pill.active {
  background-color: var(--color-plum-pink);
  color: var(--color-carbon-black);
  border-color: var(--color-plum-pink);
  font-weight: 700;
}
</style>

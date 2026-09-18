<template>
  <div class="beatstore-view">
    <header class="beatstore-header">
      <h1>Beat Store</h1>
      <div class="header-actions">
        <button class="cart-trigger-btn" @click="showCartDrawer = true">
          🛒 Cart
          <span v-if="cartItems.length > 0" class="cart-badge">{{
            cartItems.length
          }}</span>
        </button>
        <button class="upload-btn" @click="showUploadModal = true">
          + Upload beat
        </button>
      </div>
    </header>

    <!-- Genre filter pills with dynamic multi-color rotation -->
    <div class="genre-filters">
      <button
        v-for="(genre, index) in genres"
        :key="genre"
        class="genre-pill"
        :class="{ active: activeGenre === genre }"
        :style="getFilterStyle(index, activeGenre === genre)"
        @click="activeGenre = genre"
      >
        {{ genre }}
      </button>
    </div>

    <!-- Beat grid with active playing state and image support -->
    <div class="beat-grid">
      <div
        v-for="beat in filteredBeats"
        :key="beat.id"
        class="beat-card clickable"
        :class="{ 'active-card': isCurrentTrack(beat) }"
        @click="playBeatDirectly(beat)"
      >
        <div class="beat-cover-container">
          <img
            v-if="beat.coverArt"
            :src="beat.coverArt"
            :alt="beat.title"
            class="beat-cover-img"
          />
          <div v-else class="beat-cover-placeholder">
            <span class="play-icon">▶</span>
          </div>
        </div>
        <p class="beat-title">{{ beat.title }}</p>
        <p class="beat-producer">{{ beat.artist || beat.producer }}</p>
        <div class="beat-footer">
          <span class="beat-price">R{{ beat.price || 100 }}</span>
          <button class="beat-buy-btn" @click.stop="openPurchaseModal(beat)">
            Buy
          </button>
        </div>
      </div>
    </div>

    <p v-if="filteredBeats.length === 0" class="empty-state">
      No beats in this genre yet.
    </p>

    <!-- Modals & Drawers -->
    <BeatUploadModal
      v-model:is-open="showUploadModal"
      @beat-uploaded="handleBeatUploaded"
    />

    <PurchaseBeatModal
      v-model:is-open="showLicenseModal"
      :selected-beat="selectedBeat"
      @add-to-cart="handleAddToCart"
    />

    <CartDrawer
      v-model:is-open="showCartDrawer"
      :items="cartItems"
      @remove-item="removeCartItem"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import BeatUploadModal from "@/components/beats/BeatUploadModal.vue";
import PurchaseBeatModal from "@/components/beats/PurchaseBeatModal.vue";
import CartDrawer from "@/components/cart/CartDrawer.vue";

const store = useStore();
const activeGenre = ref("All");

// Modal and drawer state
const showUploadModal = ref(false);
const showLicenseModal = ref(false);
const showCartDrawer = ref(false);
const selectedBeat = ref(null);

// Cart State
const cartItems = ref([]);

// Colors for rotating filter pills matching the Discover page pattern
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

// Pulls tracks and active track state from player.js
const beats = computed(() => store.getters["player/trackQueue"]);
const currentTrack = computed(() => store.getters["player/activeTrack"]);

function isCurrentTrack(beat) {
  return currentTrack.value && currentTrack.value.id === beat.id;
}

const genres = computed(() => {
  const uniqueGenres = [...new Set(beats.value.map((b) => b.genre))];
  return ["All", ...uniqueGenres];
});

const filteredBeats = computed(() => {
  if (activeGenre.value === "All") return beats.value;
  return beats.value.filter((b) => b.genre === activeGenre.value);
});

function playBeatDirectly(beat) {
  if (beat.audioUrl) {
    store.dispatch("player/playTrack", beat);
  } else {
    alert("Audio stream not available for this beat.");
  }
}

function openPurchaseModal(beat) {
  selectedBeat.value = beat;
  showLicenseModal.value = true;
}

function handleAddToCart(cartItem) {
  cartItems.value.push(cartItem);
  showCartDrawer.value = true;
}

function removeCartItem(index) {
  cartItems.value.splice(index, 1);
}

function handleBeatUploaded(newBeat) {
  store.dispatch("player/addToQueue", newBeat);
}
</script>

<style scoped>
.beatstore-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background-color: var(--bg-main, #ffffff);
  color: var(--text-main, #111111);
}

.beatstore-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.beatstore-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-main, #111111);
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.cart-trigger-btn {
  position: relative;
  border: 1px solid var(--border-subtle, #ccc);
  background: var(--bg-surface, #fff);
  color: var(--text-main, #111);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.cart-badge {
  background: var(--text-main, #111);
  color: #fff;
  font-size: 0.7rem;
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
}

.upload-btn {
  border: none;
  background: var(--text-main, #333);
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
}

.genre-filters {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.genre-pill {
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

.genre-pill:hover {
  opacity: 0.85;
}

.beat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1.25rem;
}

.beat-card {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  padding: 10px;
  border-radius: 12px;
  background-color: var(--bg-surface, #ffffff);
  border: 1px solid var(--border-subtle, #eaeaea);
  transition:
    transform 0.15s ease,
    background-color 0.15s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

/* Hover effect for unselected state */
.beat-card:hover {
  background-color: rgba(173, 235, 255, 0.08);
  border-color: var(--accent-blue, #b8e5ff);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

/* Active card styling with yellow pastel border */
.beat-card.active-card {
  border-color: var(--accent-yellow, #fae184);
  border-width: 2px;
  background-color: var(--bg-surface, #fafafa);
}

/* Hover effect should persist/override even when the card is active */
.beat-card.active-card:hover {
  background-color: rgba(173, 235, 255, 0.12);
  border-color: var(--accent-blue, #b8e5ff);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

/* Cover container supporting actual JPEGs/PNGs */
.beat-cover-container {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 0.5rem;
  border: 1px solid var(--border-subtle, #eee);
  background-color: var(--bg-surface, #f9f9f9);
}

.beat-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.beat-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-icon {
  font-size: 1.5rem;
  opacity: 0.4;
}

.beat-title {
  font-size: 0.85rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-main, #111);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.beat-producer {
  font-size: 0.75rem;
  color: var(--text-muted, #666);
  opacity: 0.8;
  margin: 0.15rem 0 0.5rem;
}

.beat-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.beat-price {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-main, #111);
}

/* Yellow Buy button styling */
.beat-buy-btn {
  border: none;
  background: var(--accent-yellow, #fae184);
  color: var(--text-dark-btn, #111);
  padding: 0.3rem 0.85rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.beat-buy-btn:hover {
  opacity: 0.85;
}

.empty-state {
  color: var(--text-muted, #666);
  opacity: 0.7;
  font-size: 0.9rem;
  text-align: center;
  margin-top: 2rem;
}
</style>

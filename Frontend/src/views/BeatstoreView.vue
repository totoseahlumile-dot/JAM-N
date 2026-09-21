<template>
  <div class="beatstore-view">
    <header class="beatstore-header">
      <h1>Beat Store</h1>
      <div class="header-actions">
        <button class="cart-trigger-btn" disabled title="Beat checkout is not available yet">
          🛒 Cart coming soon
          <span v-if="cartItems.length > 0" class="cart-badge">{{
            cartItems.length
          }}</span>
        </button>
        <button class="upload-btn" disabled title="Beat file storage is not connected yet">
          Beat uploads coming soon
        </button>
      </div>

      <!-- Search Bar matching Discover Page -->
      <div class="search-bar">
        <input
          type="text"
          placeholder="Search beats, producers..."
          v-model="searchQuery"
        />
        <svg class="search-icon" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
          />
        </svg>
      </div>

      <!-- Expandable Filter Tags Container matching Discover Page -->
      <div class="filter-container">
        <div class="filter-tags" :class="{ expanded: showAllGenres }">
          <button
            v-for="(genre, index) in genres"
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
          v-if="genres.length > 8"
          class="genre-toggle-btn"
          @click="showAllGenres = !showAllGenres"
        >
          {{ showAllGenres ? "Show Less ▲" : `+${genres.length - 8} More ▼` }}
        </button>
      </div>
    </header>

    <!-- Beat grid with Discover-style card layout -->
    <div class="beat-grid">
      <div
        v-for="beat in filteredBeats"
        :key="beat.id"
        class="beat-card clickable"
        :class="{ 'active-card': isCurrentTrack(beat) }"
        @click="playBeatDirectly(beat)"
      >
        <div class="image-wrapper">
          <img
            v-if="beat.coverArt"
            :src="beat.coverArt"
            :alt="beat.title"
            class="placeholder-img"
          />
          <div v-else class="placeholder-img placeholder-fallback">
            <span class="play-icon">▶</span>
          </div>
        </div>
        <p class="beat-title">{{ beat.title }}</p>
        <p class="beat-producer">{{ beat.artist || beat.producer }}</p>

        <div class="beat-footer">
          <span class="beat-price">R{{ beat.price || 100 }}</span>
          <div class="footer-actions" @click.stop>
            <button
              class="like-btn-footer"
              :class="{ liked: isBeatLiked(beat.id) }"
              @click="toggleBeatLike(beat.id)"
              aria-label="Like beat"
            >
              <svg class="heart-icon" viewBox="0 0 24 24">
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                />
              </svg>
            </button>
            <button class="beat-buy-btn" disabled title="Beat licensing is not available yet">
              Licensing soon
            </button>
          </div>
        </div>
      </div>
    </div>

    <p v-if="filteredBeats.length === 0" class="empty-state">
      No beats match this filter yet.
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
const activeGenre = ref("All Genres");
const searchQuery = ref("");
const showAllGenres = ref(false);

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
      fontWeight: "700",
    };
  }
  return {
    backgroundColor: filterColors[index % filterColors.length],
    color: "var(--text-dark-btn, #111)",
  };
}

// Pulls beats from the dedicated beats.js store module
const beats = computed(() => store.getters["beats/allBeats"]);
const currentTrack = computed(() => store.getters["player/activeTrack"]);

function isCurrentTrack(beat) {
  return currentTrack.value && currentTrack.value.id === beat.id;
}

// Like functionality leveraging auth state store module
function isBeatLiked(beatId) {
  return store?.getters?.["auth/isLiked"]?.(beatId) ?? false;
}

function toggleBeatLike(beatId) {
  store?.commit("auth/TOGGLE_LIKE", beatId);
}

const genres = computed(() => {
  const uniqueGenres = [
    ...new Set(beats.value.map((b) => b.genre).filter(Boolean)),
  ];
  return ["All Genres", ...uniqueGenres];
});

const filteredBeats = computed(() => {
  let result = beats.value;

  if (activeGenre.value !== "All Genres") {
    result = result.filter((b) => b.genre === activeGenre.value);
  }

  if (searchQuery.value.trim() !== "") {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (b) =>
        b.title?.toLowerCase().includes(query) ||
        b.artist?.toLowerCase().includes(query) ||
        b.producer?.toLowerCase().includes(query) ||
        b.genre?.toLowerCase().includes(query),
    );
  }

  return result;
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
  store.dispatch("beats/addBeat", newBeat);
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
  margin-bottom: 1.5rem;
}

.beatstore-header h1 {
  margin: 0 0 1.25rem 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-main, #111111);
  letter-spacing: -0.02em;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  float: right;
  margin-top: -3.2rem;
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

/* Search Bar matching Discover Page */
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

/* Filter Tags Collapse Container matching Discover Page */
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

/* Grid & Cards matching Discover Page */
.beat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
}

.beat-card {
  background: var(--bg-surface, #fff);
  border: 1px solid var(--border-subtle, #e0e0e0);
  border-radius: 8px;
  padding: 0.65rem;
  display: flex;
  flex-direction: column;
  transition: background 0.15s ease;
}

.beat-card.clickable {
  cursor: pointer;
}

.beat-card.clickable:hover {
  background: rgba(173, 235, 255, 0.15);
}

.beat-card.active-card {
  border-color: var(--accent-yellow, #fae184);
  border-width: 2px;
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

.placeholder-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-icon {
  font-size: 1.5rem;
  opacity: 0.4;
}

.beat-title {
  font-weight: 600;
  font-size: 0.85rem;
  margin: 0;
  color: var(--text-main, #111);
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.beat-producer {
  font-size: 0.75rem;
  color: var(--text-muted, #666);
  margin: 0.15rem 0 0.6rem 0;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.footer-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.like-btn-footer {
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

.like-btn-footer:hover {
  transform: scale(1.1);
}

.like-btn-footer.liked {
  color: var(--accent-plum, #d4bcf0);
}

.like-btn-footer.liked .heart-icon {
  fill: var(--accent-plum, #d4bcf0);
}

.heart-icon {
  width: 15px;
  height: 15px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}

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
  font-size: 0.85rem;
  color: var(--text-muted, #666);
  opacity: 0.7;
  text-align: center;
  padding: 1.5rem 0;
}
</style>

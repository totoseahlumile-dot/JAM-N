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

    <!-- Genre filter pills -->
    <div class="genre-filters">
      <button
        v-for="genre in genres"
        :key="genre"
        class="genre-pill"
        :class="{ active: activeGenre === genre }"
        @click="activeGenre = genre"
      >
        {{ genre }}
      </button>
    </div>

    <!-- Beat grid -->
    <div class="beat-grid">
      <div
        v-for="beat in filteredBeats"
        :key="beat.id"
        class="beat-card clickable"
        @click="playBeatDirectly(beat)"
      >
        <div class="beat-cover-placeholder">
          <span class="play-icon">▶</span>
        </div>
        <p class="beat-title">{{ beat.title }}</p>
        <p class="beat-producer">{{ beat.producer }}</p>
        <div class="beat-footer">
          <span class="beat-price">R{{ beat.price }}</span>
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

const beats = ref([
  {
    id: "b1",
    title: "Driving Soul",
    producer: "Ketsa",
    genre: "Hip-Hop",
    price: 120,
    audioUrl: "/audio/b1.mp3",
  },
  {
    id: "b2",
    title: "Crumbling",
    producer: "Ketsa",
    genre: "Hip-Hop",
    price: 100,
    audioUrl: "/audio/b2.mp3",
  },
  {
    id: "b3",
    title: "Hollow",
    producer: "KaizanBlu",
    genre: "Hip-Hop",
    price: 110,
    audioUrl: "/audio/b3.mp3",
  },
  {
    id: "b4",
    title: "Rest Assured Interlude",
    producer: "Lutant Savage",
    genre: "Hip-Hop",
    price: 90,
    audioUrl: "/audio/b4.mp3",
  },
  {
    id: "b5",
    title: "Rap Beat Beats",
    producer: "SolarFLEX",
    genre: "Trap",
    price: 130,
    audioUrl: "/audio/b5.mp3",
  },
  {
    id: "b6",
    title: "Melodic Type Beat",
    producer: "zharovbeatz",
    genre: "Trap",
    price: 115,
    audioUrl: "/audio/b6.mp3",
  },
  {
    id: "b7",
    title: "Back Home",
    producer: "Pryces",
    genre: "Hip-Hop",
    price: 105,
    audioUrl: "/audio/b7.mp3",
  },
  {
    id: "b8",
    title: "Sanctuary",
    producer: "Torus",
    genre: "Electronic",
    price: 95,
    audioUrl: "/audio/b8.mp3",
  },
  {
    id: "b9",
    title: "Jaipur",
    producer: "ASHUTOSH",
    genre: "Electronic",
    price: 100,
    audioUrl: "/audio/b9.mp3",
  },
  {
    id: "b10",
    title: "Game Over",
    producer: "ASHUTOSH",
    genre: "Electronic",
    price: 100,
    audioUrl: "/audio/b10.mp3",
  },
  {
    id: "b11",
    title: "South Africa",
    producer: "EuGenius Music",
    genre: "World",
    price: 120,
    audioUrl: "/audio/b11.mp3",
  },
  {
    id: "b12",
    title: "Inspiration",
    producer: "Le Gang",
    genre: "World",
    price: 110,
    audioUrl: "/audio/b12.mp3",
  },
]);

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
  beats.value.unshift(newBeat);
}
</script>

<style scoped>
.beatstore-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.beatstore-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.cart-trigger-btn {
  position: relative;
  border: 1px solid #ccc;
  background: #fff;
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
  background: #111;
  color: #fff;
  font-size: 0.7rem;
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
}

.upload-btn {
  border: none;
  background: #333;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}

.genre-filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.genre-pill {
  border: 1px solid #ccc;
  background: transparent;
  padding: 0.4rem 1rem;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.8rem;
}

.genre-pill.active {
  border-color: #333;
  font-weight: 600;
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
}

.beat-cover-placeholder {
  width: 100%;
  aspect-ratio: 1;
  background: #eee;
  border-radius: 8px;
  margin-bottom: 0.5rem;
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
}

.beat-producer {
  font-size: 0.75rem;
  opacity: 0.7;
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
}

.beat-buy-btn {
  border: 1px solid #ccc;
  background: transparent;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
}

.beat-buy-btn:hover {
  background: #f0f0f0;
}

.empty-state {
  opacity: 0.6;
  font-size: 0.9rem;
  text-align: center;
  margin-top: 2rem;
}
</style>

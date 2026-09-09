<template>
  <BaseModal :model-value="isOpen" title="Purchase Beat" @update:model-value="close">
    <div v-if="selectedBeat" class="purchase-beat-modal">
      <!-- Beat Artwork Header -->
      <div class="artwork-container">
        <img
          v-if="selectedBeat.image"
          :src="selectedBeat.image"
          :alt="selectedBeat.title"
          class="artwork-img"
        />
        <div v-else class="artwork-placeholder">
          <svg class="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke-width="1.5" />
            <circle cx="8.5" cy="8.5" r="1.5" stroke-width="1.5" />
            <polyline points="21 15 16 10 5 21" stroke-width="1.5" />
          </svg>
        </div>
      </div>

      <!-- Beat Details -->
      <div class="beat-info-block">
        <h3 class="song-title">{{ selectedBeat.title }}</h3>
        <p class="artist-name">{{ selectedBeat.producer }}</p>
        <div class="price-display">R{{ calculatedPrice }}</div>
        <p class="body-text">{{ selectedBeat.description || 'Includes high-quality MP3/WAV file format along with usage rights.' }}</p>
      </div>

      <!-- License Options -->
      <div class="license-section">
        <label class="section-label">License Type</label>

        <div class="license-buttons">
          <button
            type="button"
            class="license-btn"
            :class="{ active: selectedLicenseType === 'non-exclusive' }"
            @click="selectedLicenseType = 'non-exclusive'"
          >
            Non- Exclusive
          </button>

          <button
            type="button"
            class="license-btn"
            :class="{ active: selectedLicenseType === 'exclusive' }"
            @click="selectedLicenseType = 'exclusive'"
          >
            Exclusive
          </button>
        </div>
      </div>

      <!-- Cart Action -->
      <button type="button" class="add-to-cart-btn" @click="addToCart">
        Add to cart - R{{ calculatedPrice }}
      </button>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  selectedBeat: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:isOpen', 'add-to-cart'])

const selectedLicenseType = ref('non-exclusive')

const calculatedPrice = computed(() => {
  if (!props.selectedBeat) return 0
  const basePrice = props.selectedBeat.price || 0
  return selectedLicenseType.value === 'exclusive' ? basePrice * 3 : basePrice
})

function close() {
  emit('update:isOpen', false)
}

function addToCart() {
  emit('add-to-cart', {
    beat: props.selectedBeat,
    licenseType: selectedLicenseType.value,
    price: calculatedPrice.value,
  })
  close()
}
</script>

<style scoped>
.purchase-beat-modal {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 420px;
  margin: 0 auto;
}

.artwork-container {
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: #e5e5e5;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.artwork-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-icon {
  width: 64px;
  height: 64px;
  color: #a0a0a0;
}

.beat-info-block {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.song-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  color: #111;
}

.artist-name {
  font-size: 0.95rem;
  color: #444;
  margin: 0;
}

.price-display {
  font-size: 1.25rem;
  font-weight: 800;
  color: #000;
  margin-top: 0.5rem;
}

.body-text {
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.25rem;
  line-height: 1.4;
}

.license-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-label {
  font-weight: 600;
  font-size: 0.95rem;
  color: #222;
}

.license-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.license-btn {
  width: 100%;
  padding: 0.85rem;
  background-color: #2c2c2c;
  color: #ffffff;
  border: 2px solid transparent;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.license-btn:hover {
  background-color: #3a3a3a;
}

.license-btn.active {
  background-color: #1a1a1a;
  border-color: #6a5acd;
}

.add-to-cart-btn {
  width: 100%;
  padding: 0.9rem;
  background-color: #eeeeee;
  color: #111111;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background-color 0.2s ease;
}

.add-to-cart-btn:hover {
  background-color: #e0e0e0;
}
</style>
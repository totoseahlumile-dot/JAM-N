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
            class="license-btn license-btn-non-exclusive"
            :class="{ active: selectedLicenseType === 'non-exclusive' }"
            @click="selectedLicenseType = 'non-exclusive'"
          >
            Non-Exclusive
          </button>

          <button
            type="button"
            class="license-btn license-btn-exclusive"
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
  background-color: var(--border-subtle);
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
  color: var(--text-muted);
}

.beat-info-block {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.song-title {
  font-size: 1.1rem;
  font-weight: 800;
  margin: 0;
  color: var(--text-light);
}

.artist-name {
  font-size: 0.95rem;
  color: var(--text-muted);
  margin: 0;
}

.price-display {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-light);
  margin-top: 0.5rem;
}

.body-text {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
  line-height: 1.4;
}

.license-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-label {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text-light);
}

.license-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.license-btn {
  width: 100%;
  padding: 0.85rem;
  border: 2px solid transparent;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Top Button (Non-Exclusive) -> Purple using --primary-wisteria */
.license-btn-non-exclusive {
  background-color: var(--primary-wisteria);
  color: var(--text-dark-btn);
}

.license-btn-non-exclusive:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.license-btn-non-exclusive.active {
  border-color: var(--accent-plum);
}

/* Bottom Button (Exclusive) -> Blue using --secondary-frosted */
.license-btn-exclusive {
  background-color: var(--secondary-frosted);
  color: var(--text-dark-btn);
}

.license-btn-exclusive:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.license-btn-exclusive.active {
  border-color: var(--primary-wisteria);
}

.add-to-cart-btn {
  width: 100%;
  padding: 0.9rem;
  background-color: var(--accent-gold);
  color: var(--text-dark-btn);
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 800;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: opacity 0.2s ease;
}

.add-to-cart-btn:hover {
  opacity: 0.9;
}
</style>
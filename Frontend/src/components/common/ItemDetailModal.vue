<template>
  <BaseModal :model-value="isOpen" title="Track Details" @update:model-value="close">
    <div v-if="item" class="item-detail">
      <!-- Media Cover / Artwork Placeholder -->
      <div class="cover-art">
        <img v-if="item.image" :src="item.image" :alt="item.title || item.name" />
        <div v-else class="art-placeholder">
          <span class="music-note">🎵</span>
        </div>
      </div>

      <!-- Metadata Section -->
      <div class="item-info">
        <h3 class="item-title">{{ item.title || item.name }}</h3>
        <p v-if="item.artist || item.genre" class="item-subtitle">
          {{ item.artist ? item.artist : '' }} {{ item.genre ? `· ${item.genre}` : '' }}
        </p>

        <!-- Dynamic Controls -->
        <div class="modal-actions">
          <button class="action-btn primary" @click="playItem">
            <span class="btn-icon">▶</span> Play Track
          </button>
          
          <button
            class="action-btn secondary"
            :class="{ active: isLiked }"
            @click="toggleLike"
          >
            <span class="btn-icon">{{ isLiked ? '♥' : '♡' }}</span>
            {{ isLiked ? 'Liked' : 'Like' }}
          </button>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import BaseModal from '@/components/common/BaseModal.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  item: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:isOpen'])

const store = useStore()

const isLiked = computed(() => {
  if (!props.item?.id) return false
  return store.getters['auth/isLiked'](props.item.id)
})

function close() {
  emit('update:isOpen', false)
}

function toggleLike() {
  if (props.item?.id) {
    store.commit('auth/TOGGLE_LIKE', props.item.id)
  }
}

function playItem() {
  console.log('Playing:', props.item)
  // Integrate player dispatch action here when ready
}
</script>

<style scoped>
.item-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  text-align: center;
  padding: 0.5rem 0;
}

.cover-art {
  width: 180px;
  height: 180px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: #eee;
}

.cover-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.art-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e8e8f0;
}

.music-note {
  font-size: 3rem;
  opacity: 0.5;
}

.item-info {
  width: 100%;
}

.item-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
  color: #222;
}

.item-subtitle {
  font-size: 0.85rem;
  color: #666;
  margin: 0 0 1.25rem;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.25rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: transform 0.15s ease, background-color 0.15s ease;
}

.action-btn:active {
  transform: scale(0.96);
}

.action-btn.primary {
  background: #333;
  color: #fff;
}

.action-btn.primary:hover {
  background: #111;
}

.action-btn.secondary {
  background: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
}

.action-btn.secondary.active {
  color: #e63946;
  border-color: #e63946;
  background: #fff0f1;
}

.btn-icon {
  font-size: 0.95rem;
}
</style>
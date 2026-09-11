<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="closeModal">
    <div class="modal-card">
      <header class="modal-header">
        <h3>Create Post</h3>
        <button class="close-icon-btn" @click="closeModal" aria-label="Close">×</button>
      </header>

      <!-- Post Type Selector Tabs -->
      <div class="type-tabs">
        <button
          type="button"
          class="type-tab"
          :class="{ active: postType === 'audio' }"
          @click="setPostType('audio')"
        >
          Track / Audio
        </button>
        <button
          type="button"
          class="type-tab"
          :class="{ active: postType === 'media' }"
          @click="setPostType('media')"
        >
          Visual / Media
        </button>
        <button
          type="button"
          class="type-tab"
          :class="{ active: postType === 'text' }"
          @click="setPostType('text')"
        >
          Text Update
        </button>
      </div>

      <form class="post-form" @submit.prevent="submitPost">
        <!-- Main Caption / Text Input -->
        <div class="form-field">
          <textarea
            v-model="caption"
            rows="3"
            :placeholder="captionPlaceholder"
            :maxlength="postType === 'text' ? 280 : 1000"
            required
          ></textarea>
          <span v-if="postType === 'text'" class="char-count">
            {{ caption.length }}/280
          </span>
        </div>

        <!-- Audio Specific Fields -->
        <div v-if="postType === 'audio'" class="type-section">
          <div class="form-field">
            <label>Track Title *</label>
            <input v-model="audioForm.title" type="text" placeholder="e.g. Summer Nights Beat" required />
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>Genre</label>
              <input v-model="audioForm.genre" type="text" placeholder="e.g. Hip-Hop / Lofi" />
            </div>
            <div class="form-field">
              <label>BPM</label>
              <input v-model.number="audioForm.bpm" type="number" placeholder="120" />
            </div>
          </div>

          <div class="form-field">
            <label>Audio File (.mp3, .wav) *</label>
            <input type="file" accept="audio/*" @change="handleAudioSelect" required />
            <p v-if="audioForm.fileName" class="file-name-preview">Selected: {{ audioForm.fileName }}</p>
          </div>

          <div class="form-field">
            <label>Cover Image (Optional)</label>
            <input type="file" accept="image/*" @change="handleCoverSelect" />
            <div v-if="coverPreview" class="media-preview-box">
              <img :src="coverPreview" class="preview-img" alt="Cover preview" />
            </div>
          </div>
        </div>

        <!-- Visual / Media Specific Fields -->
        <div v-if="postType === 'media'" class="type-section">
          <div class="form-field">
            <label>Upload Image or Video *</label>
            <input type="file" accept="image/*,video/*" @change="handleMediaSelect" required />
          </div>

          <div v-if="mediaPreview" class="media-preview-box">
            <img v-if="mediaFileType === 'image'" :src="mediaPreview" class="preview-img" alt="Media preview" />
            <video v-else-if="mediaFileType === 'video'" :src="mediaPreview" controls class="preview-video"></video>
          </div>
        </div>

        <!-- Modal Actions -->
        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="closeModal">Cancel</button>
          <button type="submit" class="btn-submit" :disabled="!isFormValid">Post</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useStore } from 'vuex'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'post-created'])
const store = useStore()

const postType = ref('audio') // 'audio' | 'media' | 'text'
const caption = ref('')

// Audio Post State
const audioForm = reactive({
  title: '',
  genre: '',
  bpm: null,
  fileName: '',
  audioUrl: null,
})
const coverPreview = ref(null)

// Visual Media State
const mediaPreview = ref(null)
const mediaFileType = ref(null) // 'image' | 'video'

const captionPlaceholder = computed(() => {
  if (postType.value === 'audio') return 'Say something about this track...'
  if (postType.value === 'media') return 'Write a caption...'
  return "What's on your mind?"
})

const isFormValid = computed(() => {
  if (postType.value === 'text') {
    return caption.value.trim().length > 0
  }
  if (postType.value === 'audio') {
    return caption.value.trim().length > 0 && audioForm.title.trim() !== '' && audioForm.audioUrl !== null
  }
  if (postType.value === 'media') {
    return caption.value.trim().length > 0 && mediaPreview.value !== null
  }
  return false
})

function setPostType(type) {
  postType.value = type
}

function handleAudioSelect(event) {
  const file = event.target.files[0]
  if (file) {
    audioForm.fileName = file.name
    audioForm.audioUrl = URL.createObjectURL(file)
  }
}

function handleCoverSelect(event) {
  const file = event.target.files[0]
  if (file) {
    coverPreview.value = URL.createObjectURL(file)
  }
}

function handleMediaSelect(event) {
  const file = event.target.files[0]
  if (file) {
    mediaFileType.value = file.type.startsWith('video') ? 'video' : 'image'
    mediaPreview.value = URL.createObjectURL(file)
  }
}

function submitPost() {
  if (!isFormValid.value) return

  let contentData = {
    caption: caption.value,
  }

  if (postType.value === 'audio') {
    contentData = {
      ...contentData,
      title: audioForm.title,
      genre: audioForm.genre,
      bpm: audioForm.bpm,
      audioUrl: audioForm.audioUrl,
      coverImage: coverPreview.value,
    }
  } else if (postType.value === 'media') {
    contentData = {
      ...contentData,
      mediaUrl: mediaPreview.value,
      mediaType: mediaFileType.value,
    }
  }

  // Dispatch post action to Vuex store (if posts module exists)
  if (store?.hasModule?.('posts')) {
    store.dispatch('posts/createPost', {
      type: postType.value,
      content: contentData,
    })
  }

  emit('post-created', { type: postType.value, content: contentData })
  closeModal()
}

function closeModal() {
  // Reset form
  caption.value = ''
  audioForm.title = ''
  audioForm.genre = ''
  audioForm.bpm = null
  audioForm.fileName = ''
  audioForm.audioUrl = null
  coverPreview.value = null
  mediaPreview.value = null
  mediaFileType.value = null
  postType.value = 'audio'

  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  background: #ffffff;
  border-radius: 12px;
  width: 90%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 1.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
}

.close-icon-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.type-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.75rem;
}

.type-tab {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #eee;
  background: #f9f9f9;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.type-tab.active {
  background: #333;
  color: #fff;
  border-color: #333;
}

.post-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  position: relative;
}

.form-field label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #444;
}

.form-field input[type='text'],
.form-field input[type='number'],
.form-field textarea {
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 0.55rem;
  font-size: 0.85rem;
  font-family: inherit;
}

.char-count {
  align-self: flex-end;
  font-size: 0.7rem;
  color: #888;
  margin-top: 0.2rem;
}

.form-row {
  display: flex;
  gap: 0.75rem;
}

.form-row .form-field {
  flex: 1;
}

.type-section {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.file-name-preview {
  font-size: 0.75rem;
  color: #1db954;
  margin: 0;
  font-weight: 600;
}

.media-preview-box {
  width: 100%;
  max-height: 180px;
  border-radius: 6px;
  overflow: hidden;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.25rem;
}

.preview-img,
.preview-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn-cancel {
  border: 1px solid #ccc;
  background: transparent;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn-submit {
  background: #333;
  color: white;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
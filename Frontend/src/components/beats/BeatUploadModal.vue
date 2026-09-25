<template>
  <BaseModal :model-value="isOpen" title="Upload New Beat" @update:model-value="close">
    <form class="beat-upload-form" @submit.prevent="handleSubmit">
      <label class="form-field">
        <span>Beat Title</span>
        <input v-model="form.title" type="text" placeholder="e.g. Midnight Waves" required />
      </label>

      <div class="form-row">
        <label class="form-field">
          <span>Genre</span>
          <select v-model="form.genre" required>
            <option disabled value="">Select genre</option>
            <option v-for="g in genres" :key="g" :value="g">{{ g }}</option>
          </select>
        </label>

        <label class="form-field">
          <span>BPM</span>
          <input v-model.number="form.bpm" type="number" min="40" max="220" placeholder="120" required />
        </label>
      </div>

      <div class="form-row">
        <label class="form-field">
          <span>Key Signature</span>
          <input v-model="form.key" type="text" placeholder="e.g. C Minor" required />
        </label>

        <label class="form-field">
          <span>Starting Price (R)</span>
          <input v-model.number="form.price" type="number" min="1" step="0.01" placeholder="120" required />
        </label>
      </div>

      <label class="form-field">
        <span>Audio File (MP3 / WAV)</span>
        <input type="file" accept="audio/*" @change="handleAudioSelect" required />
        <span v-if="form.audioFile" class="file-name">Selected: {{ form.audioFile.name }}</span>
      </label>

      <button type="submit" class="submit-btn">Upload Beat</button>
    </form>
  </BaseModal>
</template>

<script setup>
import { reactive } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:isOpen', 'beat-uploaded'])

const genres = ['Hip-Hop', 'Trap', 'R&B', 'Amapiano', 'Electronic', 'World', 'Pop']

const form = reactive({
  title: '',
  genre: '',
  bpm: null,
  key: '',
  price: null,
  audioFile: null,
})

function close() {
  emit('update:isOpen', false)
}

function handleAudioSelect(e) {
  form.audioFile = e.target.files[0] ?? null
}

function handleSubmit() {
  const newBeat = {
    id: `beat-${Date.now()}`,
    title: form.title,
    genre: form.genre,
    bpm: form.bpm,
    key: form.key,
    price: form.price,
    producer: 'You',
    audioUrl: form.audioFile ? URL.createObjectURL(form.audioFile) : null,
  }

  emit('beat-uploaded', newBeat)

  // Reset form
  form.title = ''
  form.genre = ''
  form.bpm = null
  form.key = ''
  form.price = null
  form.audioFile = null

  close()
}
</script>

<style scoped>
.beat-upload-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-field {
  flex: 1;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.85rem;
  font-weight: 600;
}

.form-field input,
.form-field select {
  padding: 0.55rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.85rem;
  font-family: inherit;
}

.file-name {
  font-weight: 400;
  font-size: 0.75rem;
  color: #666;
}

.submit-btn {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: #333;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
}

.submit-btn:hover {
  opacity: 0.9;
}
</style>
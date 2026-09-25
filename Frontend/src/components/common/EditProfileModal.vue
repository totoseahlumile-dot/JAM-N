<template>
  <BaseModal v-model="isOpen" title="Edit profile">
    <form class="edit-form" @submit.prevent="saveProfile">
      <label class="form-field">
        <span>Display name</span>
        <input v-model="form.name" type="text" required />
      </label>

      <label class="form-field">
        <span>Email</span>
        <input v-model="form.email" type="email" required />
      </label>

      <label class="form-field">
        <span>Bio</span>
        <textarea v-model="form.bio" rows="3" />
      </label>

      <button type="submit" class="form-submit-btn">Save changes</button>
    </form>
  </BaseModal>
</template>

<script setup>
import { reactive, watch, computed } from 'vue'
import { useStore } from 'vuex'
import BaseModal from '@/components/common/BaseModal.vue'

// Single shared edit-profile modal, used from both AccountView (profile page)
// and SettingsView, so there's one source of truth for the edit logic -
// no more duplicated forms that can drift out of sync.
//
// Usage: <EditProfileModal v-model="showEditModal" />

const props = defineProps({
  modelValue: { type: Boolean, required: true },
})
const emit = defineEmits(['update:modelValue'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const store = useStore()
const user = computed(() => store.state.auth.user)

const form = reactive({
  name: '',
  email: '',
  bio: '',
})

// Repopulate the form with current user data every time the modal opens,
// so it doesn't show stale values from a previous edit session.
watch(isOpen, (open) => {
  if (open) {
    form.name = user.value?.name ?? ''
    form.email = user.value?.email ?? ''
    form.bio = user.value?.bio ?? ''
  }
})

function saveProfile() {
  // Real functionality: updates the shared user object in the auth store.
  // Once a real backend exists, this should also send a PATCH/PUT request
  // to persist the change server-side.
  store.commit('auth/SET_USER', {
    ...user.value,
    name: form.name,
    email: form.email,
    bio: form.bio,
  })
  isOpen.value = false
}
</script>

<style scoped>
.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
}

.form-field input,
.form-field textarea {
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 0.5rem;
  font-size: 0.85rem;
  font-family: inherit;
}

.form-submit-btn {
  width: 100%;
  border: none;
  background: #333;
  color: #fff;
  padding: 0.6rem;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
}
</style>
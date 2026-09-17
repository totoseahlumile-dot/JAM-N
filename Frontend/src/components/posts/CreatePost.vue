<script setup>
import { reactive } from "vue";
import { useAuth } from "../composables/useAuth";

const emit = defineEmits(["post-created"]);
const { requireAuth } = useAuth();

const form = reactive({
  artist: "",
  genres: "",
  title: "",
  type: "Single",
  bannerText: "",
  description: "",
  isTrending: false,
});

const handleSubmit = () => {
  requireAuth(() => {
    const newPost = {
      id: Date.now(),
      artist: form.artist,
      genres: form.genres,
      title: form.title,
      type: form.type,
      bannerText: form.bannerText || ":p",
      description: form.description,
      isTrending: form.isTrending,
      liked: false,
    };

    emit("post-created", newPost);
    resetForm();
  });
};

const resetForm = () => {
  form.artist = "";
  form.genres = "";
  form.title = "";
  form.type = "Single";
  form.bannerText = "";
  form.description = "";
  form.isTrending = false;
};
</script>

<template>
  <div class="modal-card create-post-card">
    <div class="modal-header">
      <h2 class="modal-title">Create New Post</h2>
      <p class="modal-subtitle">Share your latest release or update</p>
    </div>

    <form class="auth-form" @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="artist">Artist Name</label>
        <input
          id="artist"
          v-model="form.artist"
          type="text"
          placeholder="e.g. Luna Echo"
          required
        />
      </div>

      <div class="form-group">
        <label for="genres">Genres</label>
        <input
          id="genres"
          v-model="form.genres"
          type="text"
          placeholder="e.g. Indie Pop / Synth"
          required
        />
      </div>

      <div class="title-type-row">
        <div class="form-group flex-2">
          <label for="title">Title</label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            placeholder="e.g. Midnight Waves"
            required
          />
        </div>

        <div class="form-group flex-1">
          <label for="type">Release Type</label>
          <select id="type" v-model="form.type">
            <option value="Single">Single</option>
            <option value="EP">EP</option>
            <option value="Album">Album</option>
            <option value="Announcement">Announcement</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="bannerText">Banner Emote/Text (Optional)</label>
        <input
          id="bannerText"
          v-model="form.bannerText"
          type="text"
          placeholder=":p"
          maxlength="8"
        />
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <textarea
          id="description"
          v-model="form.description"
          rows="3"
          placeholder="Write something about this post..."
          required
        ></textarea>
      </div>

      <div class="form-group checkbox-group">
        <label class="checkbox-label">
          <input v-model="form.isTrending" type="checkbox" />
          <span>Mark as Trending</span>
        </label>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn-secondary" @click="resetForm">
          Clear
        </button>
        <button type="submit" class="btn-primary">Publish Post</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.create-post-card {
  max-width: 520px;
  margin: 0 auto;
}

.title-type-row {
  display: flex;
  gap: 0.75rem;
}

.flex-1 {
  flex: 1;
}

.flex-2 {
  flex: 2;
}

.checkbox-group {
  margin-top: 0.25rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  color: var(--text-main);
}

.checkbox-label input[type="checkbox"] {
  accent-color: var(--primary-wisteria);
  width: 16px;
  height: 16px;
  cursor: pointer;
}
</style>

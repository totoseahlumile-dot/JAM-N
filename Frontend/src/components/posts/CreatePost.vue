<script setup>
import { ref } from "vue";

const emit = defineEmits(["close", "submit"]);

const artistName = ref("");
const title = ref("");
const type = ref("Songs");
const coverFile = ref(null);
const badge = ref("None");
const genre = ref("");
const description = ref("");

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    coverFile.value = file;
  }
};

const handlePublish = () => {
  if (!title.value) {
    alert("Please enter a title for your post.");
    return;
  }

  const postData = {
    artistName: artistName.value,
    title: title.value,
    type: type.value,
    coverFile: coverFile.value,
    badge: badge.value,
    genre: genre.value,
    description: description.value,
  };

  emit("submit", postData);
  emit("close");
};
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="create-post-modal">
      <!-- Fixed Header -->
      <div class="modal-header">
        <h2 class="modal-title">Create A New Post</h2>
        <button
          class="close-btn"
          aria-label="Close"
          type="button"
          @click="$emit('close')"
        >
          ✕
        </button>
      </div>

      <div class="modal-body">
        <form
          id="create-post-form"
          class="post-form"
          @submit.prevent="handlePublish"
        >
          <div class="form-group">
            <label>Artist Name</label>
            <input
              v-model="artistName"
              type="text"
              placeholder="Enter Your Name"
            />
          </div>

          <div class="form-group">
            <label>Title</label>
            <input
              v-model="title"
              type="text"
              placeholder="Track or Post Title"
              required
            />
          </div>

          <div class="form-group">
            <label>Type</label>
            <select v-model="type">
              <option value="Songs">Songs</option>
              <option value="Beats">Beats</option>
              <option value="Posts">Posts</option>
            </select>
          </div>

          <div class="form-group">
            <label>Upload Cover / Picture</label>
            <input type="file" accept="image/*" @change="handleFileUpload" />
          </div>

          <div class="form-group">
            <label
              >Badge Callout <span class="sub-label">(Optional)</span></label
            >
            <select v-model="badge">
              <option value="None">None</option>
              <option value="New Release">New Release</option>
              <option value="Featured">Featured</option>
              <option value="Exclusive">Exclusive</option>
            </select>
          </div>

          <div class="form-group">
            <label>Genre <span class="sub-label">(Optional)</span></label>
            <input
              v-model="genre"
              type="text"
              placeholder="e.g. R&B, Hip Hop"
            />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea
              v-model="description"
              rows="3"
              placeholder="Write your details..."
            ></textarea>
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn-cancel" @click="$emit('close')">
          Cancel
        </button>
        <button type="submit" form="create-post-form" class="btn-publish">
          Publish
        </button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  box-sizing: border-box;
}

.create-post-modal {
  display: flex;
  flex-direction: column;
  background-color: var(--border-subtle, #f0f0f5);
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  max-height: 80vh !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  flex-shrink: 0;
  padding: 1.25rem 1.5rem;
  position: relative;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.modal-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
  text-align: center;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1.25rem;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
}

.modal-body {
  flex: 1 1 auto !important;
  min-height: 0 !important;
  overflow-y: auto !important;
  -webkit-overflow-scrolling: touch;
  padding: 1.25rem 1.5rem;
}

.post-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.sub-label {
  font-weight: 400;
  color: #666;
}

.form-group input,
.form-group select,
.form-group textarea {
  background-color: #ffffff;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 0.65rem;
  font-size: 0.88rem;
  font-family: inherit;
}

.modal-footer {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.btn-cancel {
  background: transparent;
  border: none;
  font-weight: 600;
  cursor: pointer;
}

.btn-publish {
  background-color: #ede4f8;
  padding: 0.6rem 1.5rem;
  border-radius: 20px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}
</style>

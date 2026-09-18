<script setup>
defineProps({
  post: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div class="post-card">
    <!-- Renders image dynamically if present -->
    <div v-if="post.image" class="post-image-wrapper">
      <img :src="post.image" :alt="post.title" class="post-cover-img" />
    </div>

    <div class="post-body">
      <div class="post-meta">
        <span class="post-category">{{ post.category }}</span>
        <span v-if="post.status" class="post-badge">{{ post.status }}</span>
      </div>

      <h2 class="post-title">{{ post.title }}</h2>
      <p class="post-author">By {{ post.artist }} • {{ post.genre }}</p>
      <p class="post-description">{{ post.description }}</p>
    </div>
  </div>
</template>

<style scoped>
.post-card {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-card);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.post-image-wrapper {
  width: 100%;
  max-height: 380px;
  overflow: hidden;
  background-color: #000;
}

.post-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.post-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.post-meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.post-category {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-muted);
}

.post-badge {
  font-size: 0.7rem;
  font-weight: 700;
  background-color: var(--brand-primary, #f7e88a);
  color: #fff;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.post-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-main);
  margin: 0;
}

.post-author {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0;
}

.post-description {
  font-size: 0.95rem;
  color: var(--text-main);
  margin-top: 0.5rem;
}
</style>

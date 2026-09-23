<script setup>
defineProps({
  post: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["toggle-like"]);
</script>

<template>
  <div class="post-card">
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

      <div class="post-footer">
        <button
          class="like-btn"
          :class="{ liked: post.liked }"
          @click="emit('toggle-like', post.id)"
        >
          <span class="heart-icon">{{ post.liked ? "❤️" : "🤍" }}</span>
          <span>{{ post.liked ? "Liked" : "Like" }}</span>
        </button>
      </div>
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

.post-footer {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  justify-content: flex-end;
}

.like-btn {
  background: transparent;
  border: 1px solid var(--border-card);
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--text-main);
  transition: all 0.2s ease;
}

.like-btn:hover {
  background-color: var(--bg-card-hover);
}

.like-btn.liked {
  border-color: #ff3366;
  color: #ff3366;
}
</style>

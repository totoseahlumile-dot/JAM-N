<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useAuth } from "../composables/useAuth";

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
});

const { requireAuth } = useAuth();

const isMenuOpen = ref(false);
const menuRef = ref(null);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

const handleLike = () => {
  requireAuth(() => {
    props.post.liked = !props.post.liked;
  });
};

const handleShare = () => {
  closeMenu();
  if (navigator.share) {
    navigator.share({
      title: props.post.title,
      url: window.location.href,
    });
  } else {
    alert(`Link for "${props.post.title}" copied to clipboard!`);
  }
};

const handleSave = () => {
  closeMenu();
  requireAuth(() => {
    alert(`Saved "${props.post.title}" to your library!`);
  });
};

const handleReport = () => {
  closeMenu();
  requireAuth(() => {
    alert(`Reported post: ${props.post.title}`);
  });
};

const handleClickOutside = (event) => {
  if (menuRef.value && !menuRef.value.contains(event.target)) {
    closeMenu();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div class="media-card post-card">
    <!-- Header Row -->
    <div class="card-header">
      <div class="artist-info">
        <div class="artist-avatar">{{ post.artist.charAt(0) }}</div>
        <div>
          <h3 class="artist-name">{{ post.artist }}</h3>
          <p class="artist-genres">{{ post.genres }}</p>
        </div>
      </div>

      <!-- Header Actions: Badge & Functional Menu -->
      <div class="header-actions">
        <span
          v-if="post.isTrending || post.status === 'TRENDING'"
          class="badge-callout"
        >
          TRENDING
        </span>
        <span
          v-else-if="post.isExclusive || post.status === 'EXCLUSIVE'"
          class="badge-callout"
        >
          EXCLUSIVE
        </span>

        <!-- Three Dot Options Menu -->
        <div ref="menuRef" class="options-wrapper">
          <button
            class="three-dots-btn"
            aria-label="More options"
            :aria-expanded="isMenuOpen"
            @click="toggleMenu"
          >
            ⋮
          </button>

          <!-- Dropdown Options -->
          <Transition name="fade-slide">
            <div v-if="isMenuOpen" class="options-menu">
              <button class="menu-item" @click="handleShare">Share Link</button>
              <button class="menu-item" @click="handleSave">Save Post</button>
              <hr class="menu-divider" />
              <button class="menu-item text-danger" @click="handleReport">
                Report Post
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- Banner Content -->
    <div class="card-banner">
      <span class="banner-text">{{ post.bannerText || ":p" }}</span>
    </div>

    <!-- Footer Content -->
    <div class="card-body">
      <div class="title-row">
        <div>
          <h2 class="post-title">{{ post.title }}</h2>
          <p class="post-type">{{ post.type }}</p>
        </div>
        <button
          class="like-btn"
          :class="{ liked: post.liked }"
          aria-label="Like"
          @click="handleLike"
        >
          {{ post.liked ? "💗" : "🤍" }}
        </button>
      </div>
      <p class="post-description">{{ post.description }}</p>
    </div>
  </div>
</template>

<style scoped>
.post-card {
  margin-bottom: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
}

.artist-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.artist-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-wisteria);
  color: var(--text-dark-btn);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.artist-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.artist-genres {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* SCOPED BADGE CALLOUT FIX */
.badge-callout {
  display: inline-block;
  background-color: var(--accent-gold, #f7e88a);
  color: var(--text-main, #1d1e18);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.35rem 0.75rem;
  border-radius: 4px;
  letter-spacing: 0.5px;
  line-height: 1;
  text-transform: uppercase;
  white-space: nowrap;
  flex-shrink: 0;
}

.options-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.three-dots-btn {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--text-main);
  cursor: pointer;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  line-height: 1;
}

.three-dots-btn:hover {
  background-color: var(--border-subtle);
}

.card-banner {
  background-color: var(--secondary-frosted);
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-text {
  font-size: 3rem;
  color: var(--text-main);
}

.card-body {
  padding: 1.25rem;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.post-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.post-type {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0;
}

.post-description {
  font-size: 0.88rem;
  color: var(--text-main);
  margin: 0;
}

.like-btn {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  opacity: 0.7;
  transition:
    transform 0.15s ease,
    opacity 0.15s ease;
}

.like-btn:hover {
  opacity: 1;
  transform: scale(1.15);
}

.like-btn.liked {
  opacity: 1;
}
</style>
 
<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// Audio state
const currentAudio = ref(null);
const playingSongId = ref(null);

const currentSlide = ref(0);
let carouselInterval = null;

const slides = ref([
  { id: 1, image: "/images/carousel-img-1.png" },
  { id: 2, image: "/images/carousel-img-2.png" },
  { id: 3, image: "/images/carousel-img-3.png" },
  { id: 4, image: "/images/carousel-img-4.png" },
]);

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.value.length;
};

const prevSlide = () => {
  currentSlide.value =
    (currentSlide.value - 1 + slides.value.length) % slides.value.length;
};

const goToSlide = (index) => {
  currentSlide.value = index;
};

onMounted(() => {
  carouselInterval = setInterval(nextSlide, 5000);
});

onUnmounted(() => {
  if (carouselInterval) clearInterval(carouselInterval);
});

const trendingSongs = ref([
  {
    id: 1,
    title: "Jamali - Maisha",
    src: "/audio/maisha.mp3",
    cover: "/images/Jamali.png",
  },
  {
    id: 2,
    title: " Moonchild Sanelly - Demon",
    src: "/audio/demon.mp3",
    cover: "/images/Moonchild Sanelly.png",
  },
  {
    id: 3,
    title: "Springbok Nude Girls - Genie",
    src: "/audio/genie.mp3",
    cover: "/images/Springbok Nude Girls.png",
  },
  {
    id: 4,
    title: "Da Capo - A Prayer For All My Countrymen",
    src: "/audio/prayer.mp3",
    cover: "/images/Da Capo.png",
  },
]);

const togglePlay = (song) => {
  if (playingSongId.value === song.id) {
    if (currentAudio.value) currentAudio.value.pause();
    playingSongId.value = null;
    return;
  }

  if (currentAudio.value) {
    currentAudio.value.pause();
  }

  currentAudio.value = new Audio(song.src);
  playingSongId.value = song.id;

  currentAudio.value.play().catch((error) => {
    console.error("Playback error:", error);
  });

  currentAudio.value.onended = () => {
    playingSongId.value = null;
  };
};

const handleGuestAccess = () => {
  if (router) router.push("/discover");
};

const handleSignUp = () => {
  if (router) router.push("/signup");
};
</script>

<template>
  <div class="landing-page">
    <main class="landing-main">
      <!-- Carousel Hero Section -->
      <section class="carousel-hero">
        <div
          v-for="(slide, index) in slides"
          :key="slide.id"
          class="carousel-slide"
          :class="{ active: currentSlide === index }"
          :style="{
            backgroundImage: `linear-gradient(90deg, rgba(10, 9, 8, 0.85) 0%, rgba(10, 9, 8, 0.5) 60%, rgba(0, 0, 0, 0.2) 100%), url(${slide.image})`,
          }"
        >
          <div class="slide-content">
            <h1 class="hero-title">
              Amplifying local Sound and Talent from South Africa
            </h1>
            <p class="hero-subtitle">
              This is the platform powering South Africa's independent music
              ecosystem:
            </p>
            <ul class="hero-features">
              <li>
                A platform for South African artists to expand their reach and
                grow
              </li>
              <li>
                Discover underground Amapiano, Afrobeats, Hip-Hop, R&amp;B and
                live local events
              </li>
              <li>
                Direct artist-to-fan community engagement and exclusive beat
                drops
              </li>
            </ul>
          </div>
        </div>

        <button
          type="button"
          class="carousel-arrow prev"
          @click="prevSlide"
          aria-label="Previous Slide"
        >
          &#10094;
        </button>
        <button
          type="button"
          class="carousel-arrow next"
          @click="nextSlide"
          aria-label="Next Slide"
        >
          &#10095;
        </button>

        <div class="carousel-dots">
          <span
            v-for="(slide, index) in slides"
            :key="'dot-' + slide.id"
            class="dot"
            :class="{ active: currentSlide === index }"
            @click="goToSlide(index)"
          ></span>
        </div>
      </section>

      <!-- Action Buttons -->
      <div class="hero-actions">
        <button type="button" class="btn-primary" @click="handleSignUp">
          Sign up
        </button>
        <button
          type="button"
          class="btn-secondary-pill"
          @click="handleGuestAccess"
        >
          Continue as guest
        </button>
      </div>

      <!-- Trending Section -->
      <section class="trending-section">
        <div class="section-header">
          <h2 class="section-title">Here's what's trending</h2>
          <span class="badge-trending">TRENDING</span>
        </div>

        <div class="trending-grid">
          <div v-for="song in trendingSongs" :key="song.id" class="media-card">
            <div class="media-thumbnail">
              <img
                :src="song.cover"
                :alt="song.title"
                class="album-cover-img"
              />
            </div>
            <div class="media-details">
              <span class="song-name">{{ song.title }}</span>
              <button type="button" class="btn-play" @click="togglePlay(song)">
                {{ playingSongId === song.id ? "Pause" : "Play" }}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.landing-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #cbcbcf;
  min-height: 100vh;
}

.landing-main {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
}

.carousel-hero {
  position: relative;
  width: 100%;
  min-height: 380px;
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  background-color: #0a0908;
}

.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transition: opacity 0.8s ease-in-out;
  display: flex;
  align-items: center;
  padding: 3rem 4rem;
  pointer-events: none;
}

.carousel-slide.active {
  opacity: 1;
  pointer-events: auto;
}

.slide-content {
  max-width: 650px;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  color: #ffffff;
}

.hero-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.25;
}

.hero-subtitle {
  color: #adebff;
  font-weight: 600;
  font-size: 0.95rem;
}

.hero-features {
  list-style: disc;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: #fafafd;
  font-weight: 500;
  font-size: 0.9rem;
}

.hero-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  margin-top: 0.5rem;
}

.btn-primary {
  background-color: #ba93dc;
  color: #1d1e18;
  font-weight: 700;
  border: none;
  padding: 0.8rem 2.5rem;
  border-radius: 24px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: opacity 0.2s ease;
}

.btn-secondary-pill {
  background-color: #adebff;
  color: #1d1e18;
  font-weight: 700;
  border: none;
  padding: 0.8rem 2.5rem;
  border-radius: 24px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: opacity 0.2s ease;
}

.btn-primary:hover,
.btn-secondary-pill:hover {
  opacity: 0.9;
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.4);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
  z-index: 5;
}

.carousel-arrow:hover {
  background: rgba(0, 0, 0, 0.8);
}

.carousel-arrow.prev {
  left: 1.25rem;
}
.carousel-arrow.next {
  right: 1.25rem;
}

.carousel-dots {
  position: absolute;
  bottom: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.6rem;
  z-index: 5;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
}

.dot.active {
  background-color: #ba93dc;
  width: 20px;
  border-radius: 10px;
}

/* --- Trending Section --- */
.trending-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  align-items: center;
  margin-top: 1rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.section-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #1d1e18;
  margin: 0;
}

/* Simplified SA Flag Color Cycle Badge */
.badge-trending {
  font-size: 0.68rem;
  font-weight: 800;
  padding: 0.35rem 0.85rem;
  border-radius: 12px;
  letter-spacing: 0.6px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  animation: saSimpleColorCycle 6s ease-in-out infinite;
}

@keyframes saSimpleColorCycle {
  0% {
    background-color: #007a3d; /* SA Green */
    color: #ffffff;
  }
  16.6% {
    background-color: #fdb813; /* SA Gold/Yellow */
    color: #1d1e18;
  }
  33.3% {
    background-color: #ffffff; /* SA White */
    color: #1d1e18;
  }
  50% {
    background-color: #000000; /* SA Black */
    color: #ffffff;
  }
  66.6% {
    background-color: #e03c31; /* SA Red */
    color: #ffffff;
  }
  83.3% {
    background-color: #002395; /* SA Blue */
    color: #ffffff;
  }
  100% {
    background-color: #007a3d; /* SA Green */
    color: #ffffff;
  }
}

.trending-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  align-items: stretch;
}

.media-card {
  background-color: #ffffff;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid #e0e0e6;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease;
}

.media-card:hover {
  border-color: #ba93dc;
  transform: translateY(-2px);
}

.media-thumbnail {
  aspect-ratio: 4 / 5;
  background-color: #f0f0f4;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.album-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-details {
  background-color: #ffffff;
  padding: 1rem 1.1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  min-height: 64px;
}

.song-name {
  font-size: 0.88rem;
  font-weight: 800;
  color: #1d1e18;
  line-height: 1.25;
  white-space: normal;
  word-break: break-word;
}

.btn-play {
  background-color: #ba93dc;
  color: #1d1e18;
  border: none;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.45rem 1.15rem;
  border-radius: 16px;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity 0.2s ease;
}

.btn-play:hover {
  opacity: 0.9;
}

@media (max-width: 900px) {
  .trending-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .carousel-hero {
    min-height: 440px;
  }
  .carousel-slide {
    padding: 2rem 1.5rem;
  }
  .hero-title {
    font-size: 1.5rem;
  }
}
</style>

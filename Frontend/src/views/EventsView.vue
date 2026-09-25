<script setup>
import { ref, computed } from "vue";
import { useAuth } from "@/composables/useAuth";

const { requireAuth } = useAuth();

// Search & Filtering State
const searchQuery = ref("");
const activeFilter = ref("Events");
const filters = ["Events", "This week", "Free"];

// Modal State
const selectedItem = ref(null);
const modalType = ref(null); // 'details' | 'buy-ticket'

// Sample Data: Events
const events = ref([
  {
    id: 1,
    title: "Live Jazz & Soul Night",
    location:
      "Baxter Theatre Centre (Concert Hall), Main Road, Rondebosch, Cape Town",
    genre: "Jazz / Soul",
    date: "22nd September, 7:00 PM",
    isoDate: "2026-09-22T19:00:00",
    price: "R210",
    isFree: false,
    image: "/images/event1.jpg",
  },
  {
    id: 2,
    title: "Amapiano Under The Tent",
    location: "Luferheng Department of Human Settlements, Soweto, Johannesburg",
    genre: "Amapiano / Electronic",
    date: "26th September, 2:00 PM",
    isoDate: "2026-09-26T14:00:00",
    price: "R60",
    isFree: false,
    image: "/images/event2.jpg",
  },
  {
    id: 3,
    title: "Mojo Jazzy Tuesdays",
    location: "Mojo Market, 30 Regent Road, Sea Point, Cape Town",
    genre: "Jazz",
    date: "22nd September, 7:30 PM",
    isoDate: "2026-09-22T19:30:00",
    price: "R100",
    isFree: false,
    image: "/images/event3.jpg",
  },
  {
    id: 4,
    title: "The Soul & RnB Xperience",
    location: "Emperors Palace, 64 Jones Road, Kempton Park, Johannesburg",
    genre: "Soul / R&B",
    date: "26th September, 7:00 PM",
    isoDate: "2026-09-26T19:00:00",
    price: "R300",
    isFree: false,
    image: "/images/event4.jpg",
  },
  {
    id: 5,
    title: "Woodii Live at JitterBugz",
    location: "JitterBugz, 12th Avenue, Parktown, Johannesburg",
    genre: "Afrikaans Live Vermaak / Folk-Rock / Pub Acoustic",
    date: "2nd October, 8:00 PM",
    isoDate: "2026-10-02T20:00:00",
    price: "R150",
    isFree: false,
    image: "/images/event5.jpg",
  },
  {
    id: 6,
    title: "Wonder Fest 2026",
    location: "Wonderboom National Airport, Pretoria",
    genre: "WSgija / Dark Amapiano",
    date: "5th December, 12:00 PM",
    isoDate: "2026-12-05T12:00:00",
    price: "R320",
    isFree: false,
    image: "/images/event6.jpg",
  },
  {
    id: 7,
    title: "Free the Jazz Concert",
    location: "Sandton City, 83 Rivonia Road, Sandton, Johannesburg",
    genre: "Afro Jazz / Jazz Fusion",
    date: "24th September, 10:00 AM",
    isoDate: "2026-09-24T10:00:00",
    price: "Free",
    isFree: true,
    image: "/images/event7.jpg",
  },
  {
    id: 8,
    title: "WOMAD Global Sounds",
    location: "Amphitheatre, V&A Waterfront, Dock Road, Cape Town",
    genre: "World Music / Global Rhythms",
    date: "24th September, 12:00 PM",
    isoDate: "2026-09-24T12:00:00",
    price: "Free",
    isFree: true,
    image: "/images/event8.jpg",
  },
]);

// Helper function to check if a date string falls within the current week
const isThisWeek = (isoDateStr) => {
  if (!isoDateStr) return false;
  const eventDate = new Date(isoDateStr);
  const now = new Date();

  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(now);
  const daysUntilSunday = 7 - (now.getDay() === 0 ? 7 : now.getDay());
  endOfWeek.setDate(now.getDate() + daysUntilSunday);
  endOfWeek.setHours(23, 59, 59, 999);

  return eventDate >= startOfWeek && eventDate <= endOfWeek;
};

// Filtered Events Computed Property
const filteredEvents = computed(() => {
  return events.value.filter((event) => {
    const query = searchQuery.value.toLowerCase().trim();
    const matchesSearch =
      !query ||
      event.title.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query) ||
      event.genre.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (activeFilter.value === "Free") {
      return event.isFree;
    }

    if (activeFilter.value === "This week") {
      return isThisWeek(event.isoDate);
    }

    return true;
  });
});

// Resets filters and search query to show all available events
const handleSeeAll = () => {
  activeFilter.value = "Events";
  searchQuery.value = "";
};

// Action Handlers
const handleViewDetails = (item) => {
  selectedItem.value = item;
  modalType.value = "details";
};

const handleBuyTicket = (item) => {
  // Close the current modal right away so it doesn't stay in the background
  closeModal();

  requireAuth(() => {
    selectedItem.value = item;
    modalType.value = "buy-ticket";
  });
};

const closeModal = () => {
  selectedItem.value = null;
  modalType.value = null;
};
</script>

<template>
  <div class="events-page">
    <!-- Header Control Toolbar -->
    <header class="events-header-bar">
      <div class="header-container">
        <h1 class="page-title">Local Events</h1>

        <div class="controls-wrapper">
          <!-- Filter Chips -->
          <div class="filter-chips" role="tablist">
            <button
              v-for="filter in filters"
              :key="filter"
              class="filter-chip"
              :class="{ active: activeFilter === filter }"
              @click="activeFilter = filter"
            >
              {{ filter }}
            </button>
          </div>

          <!-- Search Input Bar -->
          <div class="search-box">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Looking for an Event?"
              class="search-input"
            />
            <span class="search-icon" aria-hidden="true">🔍︎</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="events-main-container">
      <section class="events-section">
        <div class="section-header">
          <h2>All Events</h2>
          <button
            v-if="activeFilter !== 'Events' || searchQuery"
            class="btn-link"
            @click="handleSeeAll"
          >
            See All
          </button>
        </div>

        <div v-if="filteredEvents.length > 0" class="cards-grid">
          <article
            v-for="event in filteredEvents"
            :key="event.id"
            class="event-card"
          >
            <div class="card-media">
              <img :src="event.image" :alt="event.title" class="card-img" />
            </div>

            <div class="card-content">
              <h3 class="card-title">{{ event.title }}</h3>
              <p class="card-subtitle">
                {{ event.location }} • {{ event.genre }}
              </p>
              <p class="card-date">{{ event.date }}</p>

              <div class="card-actions">
                <button class="btn-outline" @click="handleViewDetails(event)">
                  View Details
                </button>
                <button class="btn-solid" @click="handleBuyTicket(event)">
                  {{ event.isFree ? "Register Free" : "Buy Ticket" }}
                </button>
              </div>
            </div>
          </article>
        </div>

        <!-- Empty State View -->
        <div v-else class="empty-state">
          <p>No events found for the selected criteria.</p>
          <button class="btn-solid" @click="handleSeeAll">
            Show All Events
          </button>
        </div>
      </section>
    </main>

    <!-- Contextual Action Modals -->
    <Teleport to="body">
      <div v-if="modalType" class="modal-overlay" @click.self="closeModal">
        <div class="modal-card">
          <button
            class="close-btn"
            @click="closeModal"
            aria-label="Close Modal"
          >
            ✕
          </button>

          <!-- Details Modal View -->
          <template v-if="modalType === 'details'">
            <h2 class="modal-heading">{{ selectedItem?.title }}</h2>
            <div class="modal-body">
              <p><strong>Location:</strong> {{ selectedItem?.location }}</p>
              <p v-if="selectedItem?.genre">
                <strong>Genre:</strong> {{ selectedItem.genre }}
              </p>
              <p v-if="selectedItem?.date">
                <strong>Date & Time:</strong> {{ selectedItem.date }}
              </p>
              <p v-if="selectedItem?.price">
                <strong>Price:</strong> {{ selectedItem.price }}
              </p>
            </div>
            <div class="modal-footer">
              <button class="btn-solid" @click="handleBuyTicket(selectedItem)">
                {{ selectedItem?.isFree ? "Register Free" : "Buy Ticket" }}
              </button>
            </div>
          </template>

          <!-- Ticket Purchase Modal -->
          <template v-else-if="modalType === 'buy-ticket'">
            <h2 class="modal-heading">
              {{
                selectedItem?.isFree ? "Claim Free Ticket" : "Purchase Ticket"
              }}
            </h2>
            <div class="modal-body">
              <p>
                You are getting tickets for
                <strong>{{ selectedItem?.title }}</strong
                >.
              </p>
              <p class="ticket-price">
                <strong>Total Amount:</strong> {{ selectedItem?.price }}
              </p>
            </div>
            <div class="modal-footer">
              <button class="btn-solid" @click="closeModal">
                {{
                  selectedItem?.isFree
                    ? "Confirm Registration"
                    : "Proceed to Payment"
                }}
              </button>
            </div>
          </template>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* Main Page Layout */
.events-page {
  background-color: var(--bg-main, #f8f8fc);
  min-height: 100vh;
  color: var(--text-main, #1a1a1a);
}

/* Navigation & Controls Bar */
.events-header-bar {
  background-color: var(--bg-surface, #ffffff);
  padding: 1.25rem 2rem;
  border-bottom: 1px solid var(--border-subtle, #e5e5eb);
}

.header-container {
  max-width: 1360px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-main, #111111);
  letter-spacing: -0.02em;
}

.controls-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-chips {
  display: flex;
  gap: 0.5rem;
}

.filter-chip {
  background-color: #eaa0d2;
  border: none;
  padding: 0.55rem 1.1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #fdfbfb;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-chip.active,
.filter-chip:hover {
  background-color: #f7e88a;
  color: #1a1a1a;
  font-weight: 600;
}

/* Search Bar Input */
.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  background-color: #ede9f6;
  border: none;
  padding: 0.55rem 2.25rem 0.55rem 1rem;
  border-radius: 8px;
  width: 260px;
  font-size: 0.85rem;
  outline: none;
  transition: background-color 0.2s ease;
}

.search-input:focus {
  background-color: #e4ddf6;
}

.search-icon {
  position: absolute;
  right: 0.75rem;
  font-size: 0.9rem;
  color: #666;
  pointer-events: none;
}

/* Button Variants */
.btn-outline {
  background: transparent;
  border: 1px solid #d0d0dc;
  padding: 0.45rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #444;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-outline:hover {
  background-color: #f1f1f7;
}

.btn-solid {
  background-color: #9172ab;
  color: #ffffff;
  border: none;
  padding: 0.45rem 1.1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.btn-solid:hover {
  opacity: 0.92;
}

.btn-link {
  background: none;
  border: none;
  font-size: 0.85rem;
  color: #666;
  cursor: pointer;
}

.btn-link:hover {
  text-decoration: underline;
}

/* Page Layout Grids */
.events-main-container {
  max-width: 1360px;
  margin: 2.5rem auto;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  gap: 3.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

/* Card Styling */
.event-card {
  background-color: #ffffff;
  border: 1px solid #e3e3eb;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-media {
  width: 100%;
  height: 180px;
  background-color: #ede9f6;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-content {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  color: #111;
}

.card-subtitle {
  font-size: 0.825rem;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

.card-date {
  font-size: 0.8rem;
  font-weight: 600;
  color: #9172ab;
  margin: 0.5rem 0 0 0;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: auto;
  padding-top: 1.25rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #777;
  font-size: 0.95rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

/* Overlay & Modals */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-card {
  background: #ffffff;
  padding: 1.75rem;
  border-radius: 16px;
  width: 100%;
  max-width: 440px;
  position: relative;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  font-size: 1.1rem;
  color: #888;
  cursor: pointer;
}

.close-btn:hover {
  color: #111;
}

.modal-heading {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
}

.modal-body {
  font-size: 0.9rem;
  color: #444;
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.ticket-price {
  margin-top: 0.75rem;
  color: #111;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
}
</style>

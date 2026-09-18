<template>
  <main class="events-view">
    <header><h1>Upcoming events</h1><p>Live music and community events around South Africa.</p></header>
    <p v-if="loading" class="state">Loading events…</p>
    <p v-else-if="error" class="state error">{{ error }}</p>
    <section v-else-if="events.length" class="event-grid">
      <article v-for="event in events" :key="event.id" class="event-card">
        <time :datetime="event.startsAt">{{ formatDate(event.startsAt) }}</time>
        <h2>{{ event.name }}</h2><p>{{ event.location }}</p>
        <strong>{{ event.priceDescription || "Price to be announced" }}</strong>
        <a v-if="event.ticketUrl" :href="event.ticketUrl" target="_blank" rel="noopener noreferrer" class="btn-primary">Get tickets</a>
        <span v-else class="unavailable">Ticket details coming soon</span>
      </article>
    </section>
    <p v-else class="state">No upcoming events are listed.</p>
  </main>
</template>
<script setup>
import { computed, onMounted } from "vue";
import { useStore } from "vuex";
const store = useStore();
const events = computed(() => store.getters["content/events"] || []);
const loading = computed(() => store.getters["content/isLoading"]("events"));
const error = computed(() => store.getters["content/error"]("events"));
const formatDate = (value) => new Intl.DateTimeFormat("en-ZA", { dateStyle: "long", timeStyle: "short" }).format(new Date(value));
onMounted(() => store.dispatch("content/fetchEvents").catch(() => {}));
</script>
<style scoped>
.events-view{max-width:1100px;margin:auto;padding:2rem}.events-view header{margin-bottom:2rem}.events-view header p,.event-card p{color:var(--text-muted)}.event-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1rem}.event-card{display:flex;flex-direction:column;gap:.7rem;padding:1.25rem;border:1px solid var(--border-subtle);border-radius:16px;background:var(--bg-surface)}time{font-weight:700;color:#76559a}.btn-primary{align-self:flex-start;margin-top:.5rem}.unavailable{color:var(--text-muted);font-size:.9rem}.state{text-align:center;padding:3rem}.error{color:#a52222}
</style>

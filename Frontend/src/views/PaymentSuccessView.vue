<template>
  <div class="payment-result-page">
    <div class="result-card">
      <template v-if="loading">
        <p>Confirming your payment…</p>
      </template>

      <template v-else-if="resultType === 'subscription' && plan">
        <h1>Welcome to {{ plan.name }}!</h1>
        <p class="result-text">
          Your payment went through and your plan is now active. Your new
          limits and perks are live straight away.
        </p>
        <button class="modal-btn primary" @click="goToSubscription">
          Back to Subscription
        </button>
      </template>

      <template v-else-if="resultType === 'beat_cart' && purchasedCount > 0">
        <h1>Purchase complete!</h1>
        <p class="result-text">
          {{
            purchasedCount === 1
              ? "Your beat is now"
              : `Your ${purchasedCount} beats are now`
          }}
          available in your library.
        </p>
        <button class="modal-btn primary" @click="goToBeatStore">
          Back to Beat Store
        </button>
      </template>

      <template v-else>
        <h1>Something went wrong</h1>
        <p class="result-text">
          We couldn't confirm your payment. If you were charged, this should
          resolve automatically shortly — otherwise contact support.
        </p>
        <button class="modal-btn ghost" @click="goHome">Back Home</button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { PLANS } from "@/stores/config/plans";

const route = useRoute();
const router = useRouter();
const store = useStore();

const loading = ref(true);
const resultType = ref(null); // "subscription" | "beat_cart" | null
const plan = ref(null);
const purchasedCount = ref(0);

onMounted(async () => {
  const type = route.query.type; // "beat_cart" for beat purchases, absent/undefined for subscriptions
  const planId = route.query.plan;
  const beatIdsRaw = route.query.beat_ids;

  if (type === "beat_cart" && beatIdsRaw) {
    const beatIds = beatIdsRaw.split(",").filter(Boolean);

    // NOTE: activation is based on the browser landing here. The trustworthy
    // confirmation is the backend's ITN handler (server-to-server) — once
    // orders are persisted in a real DB rather than in-memory, that should
    // be the actual source of truth for granting purchases.
    await store.dispatch("beats/purchaseBeats", beatIds);

    resultType.value = "beat_cart";
    purchasedCount.value = beatIds.length;
  } else if (planId && PLANS[planId]) {
    await store.dispatch("subscription/subscribe", planId);
    resultType.value = "subscription";
    plan.value = PLANS[planId];
  }

  loading.value = false;
});

function goToSubscription() {
  router.push({ name: "subscription" });
}

function goToBeatStore() {
  router.push({ name: "beat-store" });
}

function goHome() {
  router.push({ name: "home" });
}
</script>

<style scoped>
.payment-result-page {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.result-card {
  max-width: 440px;
  width: 100%;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 20px;
  padding: 2.5rem 2rem;
  text-align: center;
  color: var(--text-main);
}

.result-card h1 {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0 0 1rem;
  letter-spacing: -0.02em;
}

.result-text {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin: 0 0 1.5rem;
  line-height: 1.4;
}

.modal-btn {
  padding: 0.7rem 1.25rem;
  border-radius: 14px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
}

.modal-btn.primary {
  background: var(--primary-wisteria);
  color: var(--text-dark-btn);
}

.modal-btn.ghost {
  background: transparent;
  border-color: var(--border-subtle);
  color: var(--text-main);
}
</style>
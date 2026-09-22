<template>
  <div class="payment-result-page">
    <div class="result-card">
      <template v-if="loading">
        <p>Confirming your payment…</p>
      </template>
      <template v-else-if="plan">
        <h1>Welcome to {{ plan.name }}!</h1>
        <p class="result-text">
          Your payment went through and your plan is now active. Your new
          limits and perks are live straight away.
        </p>
        <button class="modal-btn primary" @click="goToSubscription">
          Back to Subscription
        </button>
      </template>
      <template v-else>
        <h1>Something went wrong</h1>
        <p class="result-text">
          We couldn't confirm your plan. If you were charged, this should
          resolve automatically shortly — otherwise contact support.
        </p>
        <button class="modal-btn ghost" @click="goToSubscription">
          Back to Subscription
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { PLANS } from "@/stores/config/plans";

const route = useRoute();
const router = useRouter();
const store = useStore();

const loading = ref(true);
const plan = ref(null);

onMounted(async () => {
  const planId = route.query.plan;
  const matchedPlan = PLANS[planId];

  if (matchedPlan) {
    // NOTE: this activates the plan on the strength of the browser landing
    // here. The trustworthy confirmation is the backend's ITN handler
    // (server-to-server), which should be the real source of truth once
    // you're persisting orders in a database rather than in-memory.
    await store.dispatch("subscription/subscribe", planId);
    plan.value = matchedPlan;
  }

  loading.value = false;
});

function goToSubscription() {
  router.push({ name: "subscription" });
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
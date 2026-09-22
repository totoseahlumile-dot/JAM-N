<template>
  <div class="payment-result-page">
    <div class="result-card">
      <h1>Payment cancelled</h1>
      <p class="result-text">
        No charge was made. Your plan hasn't changed.
      </p>
      <button class="modal-btn ghost" @click="goToSubscription">
        Back to Subscription
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

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

.modal-btn.ghost {
  background: transparent;
  border: 1px solid var(--border-subtle);
  color: var(--text-main);
  padding: 0.7rem 1.25rem;
  border-radius: 14px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
}
</style>
<template>
  <div class="subscription-page">
    <header class="subscription-header">
      <h1>Subscription Plans</h1>
      <p class="subtitle">
        You're on the <strong>{{ currentPlan.name }}</strong> plan. Choose the
        right tier to grow your audience, boost your tracks, and unlock advanced
        creator tools.
      </p>
    </header>
    <section class="usage-section" aria-label="Verified plan status">
      <p>Plans are verified by the backend. Returning from PayFast alone does not activate access.</p>
      <RouterLink v-if="!isLoggedIn" to="/login">Sign in to check your plan</RouterLink>
      <button class="btn-outline" @click="refreshStatus">Refresh verified plan</button>
      <p v-if="statusMessage" role="status">{{ statusMessage }}</p>
    </section>

    <!-- Usage -->
    <section class="usage-section" aria-label="Your upload usage">
      <div v-for="row in usageRows" :key="row.type" class="usage-item">
        <div class="usage-top">
          <span class="usage-label">{{ row.label }}</span>
          <span class="usage-count" :class="{ 'at-limit': row.atLimit }">
            {{ row.used }} / {{ row.limitText }}
          </span>
        </div>
        <div v-if="row.finite" class="meter">
          <div
            class="meter-fill"
            :class="{ 'at-limit': row.atLimit }"
            :style="{ width: row.percent + '%' }"
          ></div>
        </div>
        <p v-if="row.atLimit" class="usage-hint">
          Limit reached. Upgrade to upload more.
        </p>
      </div>
    </section>

    <div class="plans-grid">
      <div
        v-for="plan in PLANS"
        :key="plan.id"
        class="plan-card"
        :class="{
          'featured-card': plan.featured,
          'current-card': planState(plan) === 'current',
        }"
      >
        <div class="plan-badge-wrapper">
          <span class="status-pill" :class="`${plan.id}-pill`">{{
            plan.name
          }}</span>
        </div>

        <div class="plan-pricing">
          <span class="price">{{ formatPrice(plan) }}</span>
          <span class="billing-period">/ month</span>
        </div>
        <p class="plan-desc">{{ plan.description }}</p>

        <div class="plan-features-list">
          <div v-for="row in FEATURE_ROWS" :key="row.key" class="feature-row">
            <span class="feature-name">{{ row.label }}</span>
            <span class="feature-value" :class="{ highlight: plan.price > 0 }">
              {{ row.format(plan) }}
            </span>
          </div>
        </div>

        <button
          v-if="planState(plan) === 'current'"
          class="btn-outline plan-btn"
          disabled
        >
          Current Plan
        </button>
        <button
          v-else-if="plan.id !== 'free'"
          class="plan-btn"
          :class="planState(plan) === 'upgrade' ? 'btn-primary' : 'btn-outline'"
          @click="openCheckout(plan)"
        >
          {{ planState(plan) === "upgrade" ? "Upgrade" : "Downgrade" }} to
          {{ plan.name }}
        </button>
      </div>
    </div>

    <!-- FAQ Section -->
    <section class="info-section">
      <h3>Frequently Asked Questions</h3>
      <div class="faq-item">
        <h4>Can I cancel or change my plan anytime?</h4>
        <p>
          Plus and Pro are one-time 30-day purchases. They do not renew automatically. Paid access expires unless you buy another term.
        </p>
      </div>
      <div class="faq-item">
        <h4>What happens to my uploads if I downgrade?</h4>
        <p>
          Everything you've already uploaded stays live. You just won't be able
          to upload more until you're back under your plan's limit.
        </p>
      </div>
      <div class="faq-item">
        <h4>How does the beat commission work?</h4>
        <p>
          It's the percentage JAM'N keeps when one of your beats sells. On a
          R500 beat you'd keep {{ payoutExample }}.
        </p>
      </div>
      <div class="faq-item">
        <h4>How do boosted placements work?</h4>
        <p>
          Plus and Pro members receive monthly boosts that feature a track or
          beat near the top of the Discover feed.
        </p>
      </div>
    </section>

    <CheckoutModal
      v-if="checkout"
      :key="checkout.plan.id"
      :plan="checkout.plan"
      :mode="checkout.mode"
      @close="checkout = null"
    />
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { RouterLink } from "vue-router";
import CheckoutModal from "@/components/common/CheckoutModal.vue";
import {
  PLANS,
  FEATURE_ROWS,
  formatLimit,
  formatPrice,
  getPlanRank,
  calcBeatPayout,
} from "@/stores/config/plans";

const store = useStore();
const statusMessage = ref("");
const isLoggedIn = computed(() => store.getters["auth/isLoggedIn"]);

async function refreshStatus() {
  try {
    if (!isLoggedIn.value) throw new Error("Sign in first.");
    let result;
    try {
      result = await store.dispatch("subscription/refreshSubscription", store.getters["auth/accessToken"]);
    } catch (cause) {
      if (cause.status !== 401) throw cause;
      const session = await store.dispatch("auth/restoreSession");
      if (!session) throw new Error("Your session expired. Please sign in again.");
      result = await store.dispatch("subscription/refreshSubscription", session.accessToken);
    }
    statusMessage.value = result.activeUntil ? `${result.planId} active until ${new Date(result.activeUntil).toLocaleString()}` : "No active paid plan yet.";
  } catch (error) {
    statusMessage.value = error.message || "Could not check plan status.";
  }
}

const currentPlan = computed(() => store.getters["subscription/plan"]);
const checkout = ref(null); // { plan, mode } while the modal is open

// "current" | "upgrade" | "downgrade" relative to the user's plan
function planState(plan) {
  const diff = getPlanRank(plan.id) - getPlanRank(currentPlan.value.id);
  if (diff === 0) return "current";
  return diff > 0 ? "upgrade" : "downgrade";
}

function openCheckout(plan) {
  checkout.value = { plan, mode: planState(plan) };
}

const usageRows = computed(() =>
  [
    { type: "songs", label: "Song uploads" },
    { type: "beats", label: "Beat uploads" },
  ].map(({ type, label }) => {
    const used = store.getters["subscription/usageFor"](type);
    const limit = store.getters["subscription/limitFor"](type);
    const finite = limit !== Infinity;
    return {
      type,
      label,
      used,
      finite,
      limitText: formatLimit(limit),
      percent: finite ? Math.min(100, (used / limit) * 100) : 0,
      atLimit: finite && used >= limit,
    };
  }),
);

const payoutExample = computed(() =>
  Object.values(PLANS)
    .map((p) => `R${calcBeatPayout(500, p).payout} on ${p.name}`)
    .join(", "),
);
</script>

<style scoped>
.subscription-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 4rem;
  color: var(--text-main);
}

.subscription-header {
  text-align: center;
  margin-bottom: 2rem;
}

.subscription-header h1 {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 0.5rem;
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 0.95rem;
  color: var(--text-muted);
  margin: 0;
}

.subtitle strong {
  color: var(--text-main);
}

/* Usage */
.usage-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 20px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 2rem;
}

.usage-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
}

.usage-label {
  color: var(--text-muted);
  font-weight: 600;
}

.usage-count {
  font-weight: 700;
}

.usage-count.at-limit {
  color: var(--primary-wisteria);
}

.meter {
  height: 8px;
  border-radius: 999px;
  background: var(--border-subtle);
  overflow: hidden;
}

.meter-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--primary-wisteria);
  opacity: 0.6;
  transition: width 0.3s ease;
}

.meter-fill.at-limit {
  opacity: 1;
}

.usage-hint {
  margin: 0.5rem 0 0;
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Plans */
.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.plan-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.plan-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
}

.featured-card {
  border: 2px solid var(--primary-wisteria);
  background: linear-gradient(
    to bottom,
    var(--bg-surface),
    rgba(186, 147, 220, 0.03)
  );
}

/* The plan you're on gets a solid outline so it's obvious at a glance */
.current-card {
  border: 2px solid var(--text-main);
}

.plan-badge-wrapper {
  margin-bottom: 1rem;
}

.free-pill {
  background-color: var(--border-subtle);
  color: var(--text-main);
}

.plus-pill {
  background-color: var(--border-subtle);
  color: var(--text-main);
}

.pro-pill {
  background-color: var(--primary-wisteria);
  color: var(--text-dark-btn);
}

.plan-pricing {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.price {
  font-size: 2.25rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.billing-period {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 600;
}

.plan-desc {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
  min-height: 40px;
}

.plan-features-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin-bottom: 2rem;
  border-top: 1px solid var(--border-subtle);
  padding-top: 1.25rem;
  flex: 1;
}

.feature-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.825rem;
  gap: 1rem;
}

.feature-name {
  color: var(--text-muted);
  font-weight: 500;
}

.feature-value {
  color: var(--text-main);
  font-weight: 700;
  text-align: right;
}

.feature-value.highlight {
  color: var(--primary-wisteria);
}

.plan-btn {
  width: 100%;
  padding: 0.75rem;
  text-align: center;
  border-radius: 14px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-outline {
  border: 1px solid var(--border-subtle);
  background: transparent;
  color: var(--text-main);
}

.btn-outline:hover:not(:disabled) {
  border-color: var(--text-muted);
}

.btn-outline:disabled {
  color: var(--text-muted);
  cursor: not-allowed;
}

/* FAQ */
.info-section {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 20px;
  padding: 2rem;
}

.info-section h3 {
  font-size: 1.15rem;
  margin-bottom: 1.5rem;
  letter-spacing: -0.01em;
}

.faq-item {
  margin-bottom: 1.25rem;
}

.faq-item:last-child {
  margin-bottom: 0;
}

.faq-item h4 {
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: var(--text-main);
}

.faq-item p {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.4;
}
</style>

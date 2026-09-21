<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="attemptClose">
      <div
        class="modal-card"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
      >
        <!-- Confirm step -->
        <template v-if="!completed">
          <h2>{{ title }}</h2>

          <div class="summary">
            <div class="summary-row">
              <span>Current plan</span>
              <strong>{{ currentPlan.name }}</strong>
            </div>
            <div class="summary-row">
              <span>New plan</span>
              <strong>{{ plan.name }}</strong>
            </div>
            <div class="summary-row total">
              <span>{{
                isDowngrade ? "New monthly price" : "Billed today"
              }}</span>
              <strong>{{ formatPrice(plan) }} / month</strong>
            </div>
          </div>

          <p class="payout-note">
            On a R{{ EXAMPLE_SALE }} beat sale you'd keep
            <strong>R{{ payout.payout }}</strong>
            ({{ plan.commissionText }} commission).
          </p>

          <div v-if="overLimit.length" class="warning">
            <p v-for="item in overLimit" :key="item.type">
              You have {{ item.used }} {{ item.type }} but
              {{ plan.name }} allows {{ item.limit }}. Your existing uploads
              stay live, but you can't add more until you're under the limit.
            </p>
          </div>

          <p class="sim-note">Sandbox checkout: no real charge. Access starts only after PayFast confirms payment. This is a one-time 30-day purchase, not automatic renewal.</p>
          <p v-if="!isLoggedIn" class="sim-note">Sign in before starting checkout. <RouterLink to="/login">Go to login</RouterLink></p>
          <p v-if="error" role="alert" class="warning">{{ error }}</p>

          <div class="actions">
            <button
              class="modal-btn ghost"
              :disabled="processing"
              @click="emit('close')"
            >
              Cancel
            </button>
            <button
              class="modal-btn primary"
              :disabled="processing"
              @click="confirm"
            >
              {{ processing ? "Processing…" : confirmLabel }}
            </button>
          </div>
        </template>

        <!-- Success step -->
        <template v-else>
          <h2>
            {{
              isDowngrade
                ? `You're now on ${plan.name}`
                : `Welcome to ${plan.name}`
            }}
          </h2>
          <p class="success-text">
            {{
              isDowngrade
                ? "Your plan has been changed. Your limits update straight away."
                : "Your new limits and perks are active straight away."
            }}
          </p>
          <div class="actions">
            <button class="modal-btn primary" @click="emit('close')">
              Done
            </button>
          </div>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { RouterLink } from "vue-router";
import { calcBeatPayout, formatPrice } from "@/stores/config/plans";
import { apiRequest } from "@/services/api";

const props = defineProps({
  plan: { type: Object, required: true },
  mode: { type: String, default: "upgrade" }, // "upgrade" | "downgrade"
});
const emit = defineEmits(["close"]);

const store = useStore();
const EXAMPLE_SALE = 500;

const processing = ref(false);
const completed = ref(false);
const error = ref("");
const isLoggedIn = computed(() => store.getters["auth/isLoggedIn"]);

const currentPlan = computed(() => store.getters["subscription/plan"]);
const isDowngrade = computed(() => props.mode === "downgrade");
const payout = computed(() => calcBeatPayout(EXAMPLE_SALE, props.plan));

const title = computed(() =>
  isDowngrade.value
    ? `Downgrade to ${props.plan.name}`
    : `Upgrade to ${props.plan.name}`,
);
const confirmLabel = computed(() =>
  isDowngrade.value ? "Confirm downgrade" : `Pay ${formatPrice(props.plan)}`,
);

// On a downgrade, flag any uploads that already exceed the new plan's limits.
const overLimit = computed(() =>
  ["songs", "beats"]
    .map((type) => ({
      type,
      used: store.getters["subscription/usageFor"](type),
      limit: props.plan.limits[type],
    }))
    .filter((item) => item.used > item.limit),
);

async function confirm() {
  error.value = "";
  if (!isLoggedIn.value) {
    error.value = "Sign in first to purchase a plan.";
    return;
  }
  processing.value = true;
  try {
    let checkout;
    try {
      checkout = await apiRequest("/api/payments/checkout", {
        method: "POST", token: store.getters["auth/accessToken"], body: { planId: props.plan.id },
      });
    } catch (cause) {
      if (cause.status !== 401) throw cause;
      const session = await store.dispatch("auth/restoreSession");
      if (!session) throw new Error("Your session expired. Please sign in again.");
      checkout = await apiRequest("/api/payments/checkout", {
        method: "POST", token: session.accessToken, body: { planId: props.plan.id },
      });
    }
    const form = document.createElement("form");
    form.method = "POST";
    form.action = checkout.checkoutUrl;
    Object.entries(checkout.fields).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.append(input);
    });
    document.body.append(form);
    form.submit();
  } catch (cause) {
    error.value = cause.message || "Checkout could not start.";
    processing.value = false;
  }
}

function attemptClose() {
  if (!processing.value) emit("close");
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 1000;
}

.modal-card {
  width: 100%;
  max-width: 440px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 20px;
  padding: 2rem;
  color: var(--text-main);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
}

.modal-card h2 {
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0 0 1.25rem;
}

.summary {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: 1.25rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.summary-row strong {
  color: var(--text-main);
}

.summary-row.total {
  font-size: 1rem;
  font-weight: 700;
}

.payout-note {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0 0 1rem;
  line-height: 1.4;
}

.payout-note strong {
  color: var(--primary-wisteria);
}

.warning {
  border: 1px solid var(--primary-wisteria);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
}

.warning p {
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.4;
  color: var(--text-main);
}

.warning p + p {
  margin-top: 0.5rem;
}

.sim-note {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0 0 1.5rem;
}

.success-text {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin: 0 0 1.5rem;
  line-height: 1.4;
}

.actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
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

.modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-btn:focus-visible {
  outline: 2px solid var(--primary-wisteria);
  outline-offset: 2px;
}
</style>

import { DEFAULT_PLAN_ID, getPlan } from "../config/plans";

// Demo persistence so the chosen plan survives a page refresh.
// When the backend Subscriptions table is ready, replace this with API calls in the actions.
const STORAGE_KEY = "jamn-subscription";

function loadSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && getPlan(saved.planId)) return saved;
  } catch (e) {
    // Storage unavailable or corrupted: fall back to defaults.
  }
  return null;
}

function save(state) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ planId: state.planId, usage: state.usage }),
    );
  } catch (e) {
    // Not critical for the demo.
  }
}

const saved = loadSaved();

export default {
  namespaced: true,

  state: () => ({
    planId: saved?.planId ?? DEFAULT_PLAN_ID,
    // How many songs and beats the user has uploaded so far.
    usage: {
      songs: saved?.usage?.songs ?? 0,
      beats: saved?.usage?.beats ?? 0,
    },
  }),

  getters: {
    plan: (state) => getPlan(state.planId),
    isPaid: (state, getters) => getters.plan.price > 0,
    // `type` is "songs" or "beats"
    limitFor: (state, getters) => (type) => getters.plan.limits[type],
    usageFor: (state) => (type) => state.usage[type],
    remainingFor: (state, getters) => (type) =>
      Math.max(0, getters.limitFor(type) - state.usage[type]),
    canUpload: (state, getters) => (type) =>
      state.usage[type] < getters.limitFor(type),
  },

  mutations: {
    SET_PLAN(state, planId) {
      state.planId = planId;
      save(state);
    },
    SET_USAGE(state, usage) {
      state.usage = { ...state.usage, ...usage };
      save(state);
    },
    ADD_USAGE(state, { type, amount }) {
      state.usage[type] = Math.max(0, state.usage[type] + amount);
      save(state);
    },
  },

  actions: {
    // Simulated payment succeeds instantly here; the checkout modal adds the fake "processing" delay.
    // Returns a receipt object directly instead of making callers look the result up afterwards.
    subscribe({ commit }, planId) {
      const plan = getPlan(planId);
      if (!plan) return null;
      commit("SET_PLAN", planId);
      return {
        planId: plan.id,
        planName: plan.name,
        price: plan.price,
        date: new Date().toISOString(),
      };
    },

    // Use this to sync counts from the real uploads list (e.g. when Account/Beat Store loads).
    setUsage({ commit }, usage) {
      commit("SET_USAGE", usage);
    },

    // Call after a successful upload. Returns false if the plan limit was already reached.
    recordUpload({ commit, getters }, type) {
      if (!getters.canUpload(type)) return false;
      commit("ADD_USAGE", { type, amount: 1 });
      return true;
    },

    // Call when a song or beat is deleted so the counter goes back down.
    removeUpload({ commit }, type) {
      commit("ADD_USAGE", { type, amount: -1 });
    },
  },
};

import { createStore } from "vuex";
import artists from "./artists";
import auth from "./auth";
import player from "./player";
import beats from "./beats";
import subscription from "./modules/subscription"; // Bring in your subscription module

const store = createStore({
  state: {
    // Global app state if needed
  },
  mutations: {
    // Global mutations if needed
  },
  actions: {
    // Global actions if needed
  },
  modules: {
    artists,
    auth,
    player,
    beats,
    subscription, // Register it here
  },
});

export default store;

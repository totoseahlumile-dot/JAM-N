import { createStore } from "vuex";
import artists from "./artists";
import auth from "./auth";
import player from "./player";
import beats from "./beats"; // 1. Import your new beats module

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
    beats, // 2. Register it here under modules
  },
});

export default store;

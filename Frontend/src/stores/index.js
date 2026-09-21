import { createStore } from "vuex";
import artists from "./artists";
import auth from "./auth";
import player from "./player";
import beats from "./beats";
import subscription from "./modules/subscription";
import content from "./content";

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
    subscription,
    content,
  },
});

export default store;

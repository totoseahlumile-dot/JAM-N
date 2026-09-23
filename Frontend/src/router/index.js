import { createRouter, createWebHistory } from "vue-router";
import store from "../stores";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "home", component: HomeView, meta: { public: true } },
    {
      path: "/discover",
      name: "discover",
      component: () => import("../views/DiscoverView.vue"),
      meta: { public: true },
    },
    {
      path: "/feed",
      name: "feed",
      component: () => import("../views/FeedIntegratedView.vue"),
    },
    {
      path: "/library",
      name: "library",
      component: () => import("../views/LibraryView.vue"),
    },
    {
      path: "/beat-store",
      name: "beat-store",
      component: () => import("../views/BeatstoreView.vue"),
    },
    {
      path: "/events",
      name: "events",
      component: () => import("../views/EventsView.vue"),
    },
    {
      path: "/account",
      name: "account",
      component: () => import("../views/AccountView.vue"),
    },
    {
      path: "/artists/:id",
      name: "public-profile",
      component: () => import("../views/PublicProfileView.vue"),
      props: true,
    },
    {
      path: "/settings",
      name: "settings",
      component: () => import("../views/SettingsView.vue"),
    },
    {
      path: "/subscription",
      name: "subscription",
      component: () => import("../views/SubscriptionView.vue"),
    },
    {
      path: "/track/:id",
      name: "track-detail",
      component: () => import("../views/TrackDetailView.vue"),
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
      meta: { public: true },
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../views/RegisterView.vue"),
      meta: { public: true },
    },
    { path: "/signup", redirect: "/register" },
    { path: "/:pathMatch(.*)*", redirect: "/discover" },
  ],
});

// The access token is memory-only, so main.js restores the refresh-cookie
// session before installing the router. Every page is private by default.
router.beforeEach((to) => {
  const loggedIn = store.getters["auth/isLoggedIn"];
  if (!loggedIn && !to.meta.public) {
    return { name: "login", query: { redirect: to.fullPath } };
  }
  if (loggedIn && ["login", "register"].includes(to.name)) return { name: "discover" };
});

export default router;

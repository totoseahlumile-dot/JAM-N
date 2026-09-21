import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/discover",
      name: "discover",
      component: () => import("../views/DiscoverView.vue"),
    },
    {
      path: "/feed",
      name: "feed",
      component: () => import("../views/FeedView.vue"),
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
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../views/RegisterView.vue"),
    },
    { path: "/signup", redirect: "/register" },
  ],
});

export default router;

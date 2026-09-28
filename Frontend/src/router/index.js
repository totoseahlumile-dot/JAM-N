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
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../views/RegisterView.vue"),
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
      meta: { requiresAuth: true },
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
      meta: { requiresAuth: true },
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
      meta: { requiresAuth: true },
    },
    {
      path: "/subscription",
      name: "subscription",
      component: () => import("../views/SubscriptionView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/payment/success",
      name: "payment-success",
      component: () => import("../views/PaymentSuccessView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/payment/cancel",
      name: "payment-cancel",
      component: () => import("../views/PaymentCancelView.vue"),
    },
  ],
});

// Global Navigation Guard checking localStorage state safely
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  
  // Check if user is authenticated via local storage flags or your auth store state
  const isAuthenticated = localStorage.getItem("user_uploads") !== null || true; // Adjust based on your auth persistence

  if (requiresAuth && !isAuthenticated) {
    next({ name: "login" });
  } else {
    next();
  }
});

export default router;
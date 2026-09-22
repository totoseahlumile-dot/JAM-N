import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import FeedView from "@/views/FeedView.vue";
import DiscoverView from "@/views/DiscoverView.vue";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import ForgotPasswordView from "@/views/ForgotPasswordView.vue";
import EventsView from "@/views/EventsView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/feed",
      name: "feed",
      component: FeedView,
    },
    {
      path: "/Feed",
      redirect: "/feed",
    },
    {
      path: "/discover",
      name: "discover",
      component: DiscoverView,
    },
    {
      path: "/Discover",
      redirect: "/discover",
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/register",
      name: "register",
      component: RegisterView,
    },
    {
      path: "/signup",
      redirect: "/register",
    },
    {
      path: "/forgot-password",
      name: "forgot-password",
      component: ForgotPasswordView,
    },
    {
      path: "/events",
      name: "events",
      component: EventsView,
    },
    /* Catch-all route to prevent blank screens on broken or unhandled URLs */
    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
});

export default router;

import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView // Landing Page (Maiesha)
    },
    {
      path: '/discover',
      name: 'discover',
      component: () => import('../views/DiscoverView.vue') // Discover Music Page (James)
    },
    {
      path: '/feed',
      name: 'feed',
      component: () => import('../views/FeedView.vue')
    },
    {
      path: '/library',
      name: 'library',
      component: () => import('../views/LibraryView.vue')
    },
    {
      path: '/beat-store',
      name: 'beat-store',
      component: () => import('../views/BeatStoreView.vue')
    },
    {
      path: '/events',
      name: 'events',
      component: () => import('../views/EventsView.vue')
    }
  ]
})

export default router
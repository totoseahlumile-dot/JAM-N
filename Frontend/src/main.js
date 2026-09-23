import './assets/css/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './stores'

// Resolve the refresh cookie before the first route guard runs. Otherwise a
// logged-in user refreshing a private URL would be redirected to login.
async function startApp() {
  const session = await store.dispatch('auth/restoreSession')
  const app = createApp(App)
  app.use(store)
  app.use(router)
  await router.isReady()
  app.mount('#app')
  if (session) store.dispatch('subscription/refreshSubscription', session.accessToken).catch(() => {})
}

startApp()

import './assets/css/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './stores'

const app = createApp(App)

app.use(router)
app.use(store)

app.mount('#app')
// The refresh token stays in an HttpOnly cookie; access tokens remain in memory.
store.dispatch('auth/restoreSession').then((session) => {
  if (session) store.dispatch('subscription/refreshSubscription', session.accessToken).catch(() => {})
})

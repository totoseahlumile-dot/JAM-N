<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

const router = useRouter()
const route = useRoute()
const store = useStore()
const email = ref('')
const password = ref('')
const busy = ref(false)
const error = ref('')

async function handleLogin() {
  error.value = ''
  busy.value = true
  try {
    await store.dispatch('auth/login', { email: email.value, password: password.value })
    await store.dispatch('subscription/refreshSubscription', store.getters['auth/accessToken']).catch(() => {})
    const requested = route.query.redirect
    router.replace(typeof requested === 'string' && requested.startsWith('/') && !requested.startsWith('//') ? requested : '/discover')
  } catch (cause) { error.value = cause.message || 'Sign in failed.' }
  finally { busy.value = false }
}
</script>

<template>
  <div class="auth-page-wrapper">
    <div class="auth-card">
      <header class="modal-header"><h1>Welcome to JAM’N</h1><p>Sign in or create an account to continue</p></header>
      <nav class="segment-toggle" aria-label="Authentication"><span class="segment-btn active">Sign in</span><RouterLink :to="{ name: 'register', query: route.query.redirect ? { redirect: route.query.redirect } : {} }" class="segment-btn">Sign up</RouterLink></nav>
      <form class="auth-form" @submit.prevent="handleLogin">
        <div class="form-group"><label for="login-email">Email</label><input id="login-email" v-model.trim="email" type="email" autocomplete="email" placeholder="Enter your email" required /></div>
        <div class="form-group"><label for="login-password">Password</label><input id="login-password" v-model="password" type="password" autocomplete="current-password" placeholder="Enter your password" required /></div>
        <p v-if="error" role="alert" class="form-error">{{ error }}</p>
        <button type="submit" class="btn-primary" :disabled="busy">{{ busy ? 'Signing in…' : 'Sign in' }}</button>
      </form>
      <p class="auth-footer">Don’t have an account? <RouterLink :to="{ name: 'register', query: route.query.redirect ? { redirect: route.query.redirect } : {} }">Sign up</RouterLink></p>
    </div>
  </div>
</template>

<style scoped>
.auth-page-wrapper { min-height:calc(100vh - 80px); display:grid; place-items:center; padding:3rem 1.25rem 7rem; background:linear-gradient(145deg,#f6f2fa,#ebe2f5); }
.auth-card { position:relative; width:min(100%,480px); padding:2.6rem; border:1px solid #e3d9ec; border-radius:22px; background:#fff; color:#221c28; box-shadow:0 24px 70px #30123c23; }
.close-btn { position:absolute; right:1.35rem; top:1.05rem; display:grid; place-items:center; width:32px; height:32px; border-radius:50%; color:#5e5367; font-size:1.55rem; text-decoration:none; }
.close-btn:hover { background:#f3edf8; }
.modal-header { text-align:center; margin:1rem 0 1.8rem; }
.modal-header h1 { font-size:clamp(1.7rem,4vw,2.1rem); }
.modal-header p { margin-top:.45rem; color:#756b7c; }
.segment-toggle { display:flex; margin-bottom:1.7rem; padding:4px; border-radius:12px; background:#5c4ca8; }
.segment-btn { flex:1; padding:.7rem; border-radius:9px; color:#fff; font-weight:700; text-align:center; text-decoration:none; }
.segment-btn.active { background:#fff; color:#47356b; box-shadow:0 2px 8px #28183933; }
.auth-form { display:grid; gap:1rem; }
.form-group { display:grid; gap:.4rem; }
.form-group label { font-weight:700; font-size:.9rem; }
.form-group input { width:100%; padding:.85rem .95rem; border:1px solid #dcd2e5; border-radius:9px; background:#fff; color:inherit; font:inherit; }
.form-group input:focus { outline:2px solid #ae86d1; outline-offset:1px; }
.btn-primary { width:100%; margin-top:.45rem; padding:.85rem; border:0; border-radius:10px; background:#a87dcc; color:#201629; font:inherit; font-weight:800; cursor:pointer; }
.btn-primary:hover { background:#bb94da; }.btn-primary:disabled { opacity:.6; cursor:wait; }
.form-error { padding:.65rem .8rem; border-radius:8px; background:#fff0f2; color:#a21d36; font-size:.88rem; }
.auth-footer { margin-top:1.5rem; text-align:center; color:#665d6d; }.auth-footer a { color:#7850a4; font-weight:700; }
@media(max-width:520px) { .auth-card { padding:2rem 1.25rem; } }
</style>

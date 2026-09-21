<script setup>
import { ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useStore } from "vuex";

const router = useRouter();
const store = useStore();
const email = ref("");
const password = ref("");
const busy = ref(false);
const error = ref("");

async function handleLogin() {
  error.value = "";
  busy.value = true;
  try {
    await store.dispatch("auth/login", { email: email.value, password: password.value });
    await store.dispatch("subscription/refreshSubscription", store.getters["auth/accessToken"]).catch(() => {});
    router.push("/discover");
  } catch (cause) {
    error.value = cause.message || "Sign in failed.";
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <div class="auth-page-wrapper">
    <div class="auth-card">
      <RouterLink to="/discover" class="close-btn" aria-label="Close">×</RouterLink>
      <header class="modal-header">
        <h1>Welcome to JAM’N</h1>
        <p>Sign in or create an account to continue</p>
      </header>
      <nav class="segment-toggle" aria-label="Authentication">
        <span class="segment-btn active">Sign in</span>
        <RouterLink to="/register" class="segment-btn">Sign up</RouterLink>
      </nav>
      <form class="auth-form" @submit.prevent="handleLogin">
        <label for="login-email">Email</label>
        <input id="login-email" v-model.trim="email" type="email" autocomplete="email" required />
        <label for="login-password">Password</label>
        <input id="login-password" v-model="password" type="password" autocomplete="current-password" required />
        <p v-if="error" role="alert" class="form-error">{{ error }}</p>
        <button type="submit" class="btn-primary" :disabled="busy">{{ busy ? "Signing in…" : "Sign in" }}</button>
      </form>
      <p class="auth-footer">Don’t have an account? <RouterLink to="/register">Sign up</RouterLink></p>
    </div>
  </div>
</template>

<style scoped>
.auth-page-wrapper { display:flex; justify-content:center; padding:3rem 1.5rem; }
.auth-card { position:relative; width:100%; max-width:480px; padding:2.5rem; border-radius:20px; background:var(--bg-surface,#fff); color:var(--text-main,#222); box-shadow:0 10px 25px #0002; }
.close-btn { position:absolute; right:1.5rem; top:1rem; font-size:1.5rem; text-decoration:none; color:inherit; }
.modal-header { text-align:center; margin-bottom:1.5rem; }
.modal-header p { color:var(--text-muted,#666); margin-top:.4rem; }
.segment-toggle { display:flex; background:#5c4ca8; border-radius:30px; padding:3px; margin-bottom:1.5rem; }
.segment-btn { flex:1; text-align:center; padding:.6rem; border-radius:25px; color:#fff; text-decoration:none; }
.segment-btn.active { background:#ede4f8; color:#222; }
.auth-form { display:flex; flex-direction:column; gap:.6rem; }
.auth-form label { font-weight:600; font-size:.88rem; }
.auth-form input { padding:.7rem; border:1px solid var(--border-subtle,#ccc); border-radius:8px; background:var(--bg-surface,#fff); color:inherit; }
.btn-primary { border:0; border-radius:25px; padding:.75rem; margin-top:.8rem; cursor:pointer; background:#ede4f8; color:#222; font-weight:700; }
.btn-primary:disabled { opacity:.6; cursor:wait; }
.form-error { color:#a21d36; font-size:.88rem; }
.auth-footer { text-align:center; margin-top:1.25rem; }
</style>

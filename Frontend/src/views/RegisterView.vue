<script setup>
import { ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useStore } from "vuex";

const router = useRouter();
const store = useStore();
const role = ref("listener");
const username = ref("");
const displayName = ref("");
const email = ref("");
const password = ref("");
const busy = ref(false);
const error = ref("");

async function handleRegister() {
  error.value = "";
  busy.value = true;
  try {
    await store.dispatch("auth/register", {
      username: username.value, displayName: displayName.value,
      email: email.value, password: password.value, role: role.value,
    });
    router.push("/discover");
  } catch (cause) {
    error.value = cause.details?.join(". ") || cause.message || "Registration failed.";
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <div class="auth-page-wrapper">
    <div class="auth-card">
      <RouterLink to="/discover" class="close-btn" aria-label="Close">×</RouterLink>
      <header class="modal-header"><h1>Join JAM’N</h1><p>Create your account to get started</p></header>
      <nav class="segment-toggle" aria-label="Authentication">
        <RouterLink to="/login" class="segment-btn">Sign in</RouterLink>
        <span class="segment-btn active">Sign up</span>
      </nav>
      <form class="auth-form" @submit.prevent="handleRegister">
        <fieldset>
          <legend>I am a…</legend>
          <label class="role-card" :class="{ selected: role === 'listener' }"><input v-model="role" type="radio" value="listener" /> Listener</label>
          <label class="role-card" :class="{ selected: role === 'artist' }"><input v-model="role" type="radio" value="artist" /> Artist / Producer</label>
        </fieldset>
        <label for="register-username">Username</label>
        <input id="register-username" v-model.trim="username" minlength="3" maxlength="30" pattern="[A-Za-z0-9_]+" required />
        <label for="register-name">Display name</label>
        <input id="register-name" v-model.trim="displayName" maxlength="80" required />
        <label for="register-email">Email</label>
        <input id="register-email" v-model.trim="email" type="email" autocomplete="email" required />
        <label for="register-password">Password (8–72 characters)</label>
        <input id="register-password" v-model="password" type="password" autocomplete="new-password" minlength="8" maxlength="72" required />
        <p v-if="error" role="alert" class="form-error">{{ error }}</p>
        <button type="submit" class="btn-primary" :disabled="busy">{{ busy ? "Creating account…" : "Create account" }}</button>
      </form>
      <p class="auth-footer">Already have an account? <RouterLink to="/login">Sign in</RouterLink></p>
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
.auth-form input:not([type=radio]) { padding:.7rem; border:1px solid var(--border-subtle,#ccc); border-radius:8px; background:var(--bg-surface,#fff); color:inherit; }
fieldset { border:0; display:flex; gap:.75rem; margin-bottom:.5rem; }
legend { font-weight:600; margin-bottom:.5rem; }
.role-card { padding:.6rem; border-radius:10px; background:#ddd; cursor:pointer; }
.role-card.selected { background:#ede4f8; color:#222; }
.btn-primary { border:0; border-radius:25px; padding:.75rem; margin-top:.8rem; cursor:pointer; background:#ede4f8; color:#222; font-weight:700; }
.btn-primary:disabled { opacity:.6; cursor:wait; }
.form-error { color:#a21d36; font-size:.88rem; }
.auth-footer { text-align:center; margin-top:1.25rem; }
</style>

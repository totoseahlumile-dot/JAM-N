<script setup>
import { ref } from "vue";
import { useRouter, RouterLink } from "vue-router";

const router = useRouter();

const email = ref("");
const password = ref("");

const handleLogin = () => {
  if (!email.value || !password.value) {
    alert("Please enter both email and password.");
    return;
  }
  router.push("/discover");
};

const handleClose = () => {
  router.push("/discover");
};
</script>

<template>
  <div class="modal-overlay page-level">
    <div class="auth-card">
      <!-- Close Button -->
      <button class="close-btn" aria-label="Close" @click="handleClose">
        ✕
      </button>

      <!-- Header -->
      <div class="modal-header">
        <h1 class="modal-title">Welcome to JAM’N</h1>
        <p class="modal-subtitle">Sign in or create an account to continue</p>
      </div>

      <!-- Segmented Tab Bar -->
      <div class="segment-toggle">
        <button class="segment-btn active">Sign in</button>
        <RouterLink to="/register" class="segment-btn inactive"
          >Sign up</RouterLink
        >
      </div>

      <!-- Form -->
      <form class="auth-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="Enter Your Email"
            required
          />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="Enter Your Password"
            required
          />
        </div>

        <div class="forgot-wrapper">
          <RouterLink to="/forgot-password" class="form-link"
            >Forgot password?</RouterLink
          >
        </div>

        <button type="submit" class="btn-primary btn-block">Sign in</button>
      </form>

      <!-- Footer -->
      <div class="auth-footer">
        <p>
          Don’t have an account?
          <RouterLink to="/register" class="form-link">Sign up</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.forgot-wrapper {
  text-align: right;
  margin-top: -0.25rem;
}

.auth-footer {
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 0.5rem;
}
</style>

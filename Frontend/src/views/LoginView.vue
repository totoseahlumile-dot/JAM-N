<script setup>
import { ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useAuth } from "../composables/useAuth";
import api from "../services/api";

const router = useRouter();
const { setAuth } = useAuth();

const email = ref("");
const password = ref("");

const handleLogin = async (e) => {
  if (e) e.preventDefault();

  if (!email.value || !password.value) {
    alert("Please enter both email and password.");
    return;
  }

  try {
    const response = await api.post("/auth/login", {
      email: email.value,
      password: password.value,
    });

    const { user, token } = response.data;
    setAuth(user, token);
    router.push("/discover");
  } catch (error) {
    console.error("Login failed:", error);
    alert(error.response?.data?.message || "Login failed. Please check your credentials or backend connection.");
  }
};

const handleClose = () => {
  router.push("/discover");
};
</script>

<template>
  <div class="modal-overlay page-level">
    <div class="auth-card">
      <button class="close-btn" aria-label="Close" @click="handleClose" type="button">
        ✕
      </button>

      <div class="modal-header">
        <h1 class="modal-title">Welcome to JAM’N</h1>
        <p class="modal-subtitle">Sign in or create an account to continue</p>
      </div>

      <div class="segment-toggle">
        <button class="segment-btn active" type="button">Sign in</button>
        <RouterLink to="/register" class="segment-btn inactive">Sign up</RouterLink>
      </div>

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
          <RouterLink to="/forgot-password" class="form-link">Forgot password?</RouterLink>
        </div>

        <button type="submit" class="btn-primary btn-block">Sign in</button>
      </form>

      <div class="auth-footer">
        <p>
          Don’t have an account?
          <RouterLink to="/register" class="form-link">Signup</RouterLink>
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

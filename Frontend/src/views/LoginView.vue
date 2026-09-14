<script setup>
import { ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const errorMessage = ref("");

const handleLogin = async () => {
  try {
    errorMessage.value = "";
    if (authStore?.login) {
      await authStore.login({ email: email.value, password: password.value });
    }
    // Redirects to the Discover page on successful sign-in
    router.push("/discover");
  } catch (error) {
    errorMessage.value =
      error?.message || "Failed to log in. Please try again.";
  }
};

const goToSignUp = () => {
  router.push("/signup");
};

const closeCard = () => {
  router.push("/");
};
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <button class="close-btn" aria-label="Close" @click="closeCard">✕</button>

      <h2 class="auth-title">Welcome to JAM'N</h2>
      <p class="auth-subtitle">Sign in or create an account to continue</p>

      <!-- Segmented Pill Toggle -->
      <div class="tab-toggle">
        <div class="tab-pill sign-in-active"></div>
        <button type="button" class="tab-btn active">Sign in</button>
        <button type="button" class="tab-btn" @click="goToSignUp">
          Sign up
        </button>
      </div>

      <form class="auth-form" @submit.prevent="handleLogin">
        <div v-if="errorMessage" class="error-banner">
          {{ errorMessage }}
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="Enter Your Email Address"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Enter Your Password"
            required
          />
        </div>

        <div class="forgot-wrapper">
          <RouterLink to="/forgot-password" class="forgot-link">
            Forgot password?
          </RouterLink>
        </div>

        <button type="submit" class="btn-submit">Sign in</button>
      </form>

      <p class="auth-switch">
        Don't have an account?
        <RouterLink to="/signup" class="auth-link">Sign up</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: calc(100vh - 70px);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #cbcae0;
  padding: 2rem 1rem;
}

.auth-card {
  position: relative;
  background-color: #e0e0e0;
  width: 100%;
  max-width: 440px;
  border-radius: 16px;
  padding: 2.5rem 2.2rem 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.close-btn {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  background: none;
  border: none;
  font-size: 1.25rem;
  font-weight: 800;
  color: #1d1e18;
  cursor: pointer;
  line-height: 1;
}

.auth-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #1d1e18;
  margin-bottom: 0.25rem;
}

.auth-subtitle {
  font-size: 0.88rem;
  color: #333333;
  margin-bottom: 1.4rem;
}

.tab-toggle {
  position: relative;
  display: flex;
  background-color: #6c52a1;
  border-radius: 30px;
  padding: 4px;
  margin-bottom: 2rem;
}

.tab-pill {
  position: absolute;
  top: 4px;
  bottom: 4px;
  width: calc(50% - 4px);
  background-color: #e8dcfc;
  border-radius: 26px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

.tab-pill.sign-in-active {
  transform: translateX(0);
}

.tab-btn {
  position: relative;
  z-index: 2;
  flex: 1;
  text-align: center;
  padding: 0.65rem 0;
  font-size: 0.9rem;
  font-weight: 700;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #ffffff;
  transition: color 0.3s ease;
}

.tab-btn.active {
  color: #523e85;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.error-banner {
  background-color: #ffe5e5;
  color: #d32f2f;
  padding: 0.65rem 0.9rem;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 600;
  text-align: center;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-group label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #1d1e18;
}

.form-group input {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid #ffffff;
  background-color: #ffffff;
  font-size: 0.88rem;
  color: #1d1e18;
  outline: none;
}

.form-group input::placeholder {
  color: #999999;
}

.forgot-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: -0.2rem;
}

.forgot-link {
  font-size: 0.82rem;
  color: #1d1e18;
  text-decoration: underline;
  font-weight: 600;
}

.btn-submit {
  margin-top: 0.6rem;
  width: 100%;
  background-color: #e8dcfc;
  color: #453472;
  font-weight: 700;
  border: none;
  padding: 0.85rem;
  border-radius: 24px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: opacity 0.2s ease;
}

.btn-submit:hover {
  opacity: 0.9;
}

.auth-switch {
  margin-top: 1.5rem;
  font-size: 0.85rem;
  color: #1d1e18;
  text-align: center;
}

.auth-link {
  color: #1d1e18;
  font-weight: 700;
  text-decoration: underline;
  margin-left: 0.2rem;
}
</style>

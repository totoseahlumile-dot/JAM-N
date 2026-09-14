<script setup>
import { ref } from "vue";
import { useRouter, RouterLink } from "vue-router";

const router = useRouter();
const email = ref("");
const isSubmitted = ref(false);

const handleReset = () => {
  isSubmitted.value = true;
};
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <button class="close-btn" @click="router.push('/login')">✕</button>

      <h2 class="auth-title">Reset Password</h2>
      <p class="auth-subtitle">
        Enter your email address to receive a reset link
      </p>

      <div v-if="isSubmitted" class="success-banner">
        Reset link sent! Please check your inbox.
      </div>

      <form v-else class="auth-form" @submit.prevent="handleReset">
        <div class="form-group">
          <label for="reset-email">Email</label>
          <input
            id="reset-email"
            v-model="email"
            type="email"
            placeholder="Enter Your Email Address"
            required
          />
        </div>

        <button type="submit" class="btn-submit">Send Reset Link</button>
      </form>

      <p class="auth-switch">
        Have you remembered your password?
        <RouterLink to="/login" class="auth-link">Back to Sign in</RouterLink>
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
}

.auth-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #1d1e18;
  margin-bottom: 0.25rem;
}

.auth-subtitle {
  font-size: 0.88rem;
  color: #333;
  margin-bottom: 1.5rem;
}

.success-banner {
  background-color: #e3f7e8;
  color: #2e7d32;
  padding: 0.8rem;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  text-align: center;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
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
  outline: none;
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

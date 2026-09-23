<script setup>
import { ref } from "vue";
import { useRouter, RouterLink } from "vue-router";

const router = useRouter();
const email = ref("");
const isSubmitted = ref(false);

const handleReset = () => {
  if (!email.value) return;
  isSubmitted.value = true;
};
</script>

<template>
  <div class="modal-overlay">
    <div class="modal-card">
      <!-- Close Button -->
      <button
        class="close-btn"
        aria-label="Close"
        @click="router.push('/login')"
      >
        ✕
      </button>

      <!-- Header -->
      <div class="modal-header">
        <h1 class="modal-title">Reset Password</h1>
        <p class="modal-subtitle">
          Enter your email address to receive a reset link
        </p>
      </div>

      <!-- Success Banner -->
      <div v-if="isSubmitted" class="success-banner">
        Reset link sent! Please check your inbox.
      </div>

      <!-- Reset Form -->
      <form v-else class="auth-form" @submit.prevent="handleReset">
        <div class="form-group">
          <label for="reset-email">Email</label>
          <input
            id="reset-email"
            v-model="email"
            type="email"
            placeholder="Enter Your Email"
            required
          />
        </div>

        <button type="submit" class="btn-primary">Send Reset Link</button>
      </form>

      <!-- Footer Switch Link -->
      <div class="modal-footer">
        <p>
          Have you remembered your password?
          <RouterLink to="/login" class="footer-link"
            >Back to Sign in</RouterLink
          >
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-main);
  padding: 1.5rem;
  box-sizing: border-box;
}

.modal-card {
  position: relative;
  background-color: var(--border-subtle);
  border-radius: 20px;
  padding: 2.5rem;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

.close-btn {
  position: absolute;
  top: 1.25rem;
  right: 1.5rem;
  background: none;
  border: none;
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--text-main);
  cursor: pointer;
  opacity: 0.7;
}

.close-btn:hover {
  opacity: 1;
}

.modal-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.modal-title {
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 0.35rem;
}

.modal-subtitle {
  font-size: 0.88rem;
  font-weight: 400;
  color: var(--text-muted);
}

/* Success State */
.success-banner {
  background-color: #e3f7e8;
  color: #2e7d32;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 0.5rem;
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
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-main);
}

.form-group input {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 0.65rem 0.85rem;
  font-size: 0.88rem;
  color: var(--text-main);
  outline: none;
}

.form-group input::placeholder {
  color: var(--text-muted);
}

.btn-primary {
  width: 100%;
  background-color: #ede4f8;
  color: var(--text-main);
  padding: 0.75rem;
  border-radius: 25px;
  font-size: 0.92rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background-color: var(--primary-wisteria);
}
</style>

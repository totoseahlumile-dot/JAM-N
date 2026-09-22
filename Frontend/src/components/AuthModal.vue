<script setup>
import { ref } from "vue";
import { useAuth } from "@/composables/useAuth";

const { isAuthModalOpen, authMode, closeAuthModal, login, register } =
  useAuth();

const email = ref("");
const password = ref("");
const name = ref("");

const handleSubmit = () => {
  if (!email.value || !password.value) return;

  const userData = {
    name: name.value || email.value.split("@")[0],
    email: email.value,
  };

  if (authMode.value === "signup") {
    register(userData);
  } else {
    login(userData);
  }

  email.value = "";
  password.value = "";
  name.value = "";
};

const switchMode = (mode) => {
  authMode.value = mode;
};
</script>

<template>
  <div
    v-if="isAuthModalOpen"
    class="modal-overlay"
    @click.self="closeAuthModal"
  >
    <div class="modal-card">
      <button class="close-btn" @click="closeAuthModal">✕</button>

      <h2 class="modal-title">
        {{
          authMode === "signup" ? "Create an Account" : "Sign In to Continue"
        }}
      </h2>
      <p class="modal-sub">
        {{
          authMode === "signup"
            ? "Join JAM'N to post, upload, and connect with creators."
            : "Please sign in to access this feature."
        }}
      </p>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div v-if="authMode === 'signup'" class="form-group">
          <label>Username</label>
          <input
            v-model="name"
            type="text"
            placeholder="Enter Your Username"
            required
            class="auth-input"
          />
        </div>

        <div class="form-group">
          <label>Email Address</label>
          <input
            v-model="email"
            type="email"
            placeholder="Enter Your Email Address"
            required
            class="auth-input"
          />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="Enter Your Password"
            required
            class="auth-input"
          />
        </div>

        <button type="submit" class="btn-submit">
          {{ authMode === "signup" ? "Sign Up" : "Sign In" }}
        </button>
      </form>

      <div class="modal-footer">
        <p v-if="authMode === 'signin'">
          Don't have an account?
          <button class="link-btn" @click="switchMode('signup')">
            Sign Up
          </button>
        </p>
        <p v-else>
          Already have an account?
          <button class="link-btn" @click="switchMode('signin')">
            Sign In
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-card {
  background: var(--bg-surface, #ffffff);
  color: var(--text-main, #111111);
  padding: 2rem;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  position: relative;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--text-muted, #777);
}

.modal-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.modal-sub {
  font-size: 0.875rem;
  color: var(--text-muted, #666);
  margin-bottom: 1.5rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: left;
}

.form-group label {
  font-size: 0.8rem;
  font-weight: 600;
}

.auth-input {
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--border-card, #ccc);
  background: var(--bg-main, #f9f9f9);
  color: var(--text-main, #111);
  font-size: 0.9rem;
}

.btn-submit {
  margin-top: 0.5rem;
  padding: 0.75rem;
  border-radius: 8px;
  border: none;
  background-color: var(--brand-primary, #ba93dc);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.btn-submit:hover {
  opacity: 0.9;
}

.modal-footer {
  margin-top: 1.25rem;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-muted, #666);
}

.link-btn {
  background: none;
  border: none;
  color: var(--brand-primary, #ba93dc);
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin-left: 0.25rem;
}
</style>

<script setup>
import { reactive } from "vue";
import { useAuth } from "@/composables/useAuth";

const { isAuthModalOpen, authMode, closeAuthModal, setAuth } = useAuth();

const form = reactive({
  username: "",
  email: "",
  password: "",
});

const handleAuthSubmit = () => {
  if (!form.email || !form.password) {
    alert("Please complete all required fields.");
    return;
  }

  // Mock successful response data
  const mockUser = {
    id: Date.now(),
    name: form.username || form.email.split("@")[0],
    email: form.email,
  };
  const mockToken = "mock-jwt-token-" + Date.now();

  // Reset form
  form.username = "";
  form.email = "";
  form.password = "";

  // Save auth state & auto-run intercepted action
  setAuth(mockUser, mockToken);
};
</script>

<template>
  <div
    v-if="isAuthModalOpen"
    class="modal-overlay"
    @click.self="closeAuthModal"
  >
    <div class="modal-card">
      <button class="close-btn" @click="closeAuthModal">&times;</button>

      <div class="modal-header">
        <h2 class="modal-title">
          {{ authMode === "signin" ? "Welcome Back" : "Join JAM'N" }}
        </h2>
        <p class="modal-subtitle">
          Sign in or create an account to upload tracks and manage connections.
        </p>
      </div>

      <div class="segment-toggle">
        <button
          class="segment-btn"
          :class="{ active: authMode === 'signin' }"
          @click="authMode = 'signin'"
        >
          Sign In
        </button>
        <button
          class="segment-btn"
          :class="{ active: authMode === 'signup' }"
          @click="authMode = 'signup'"
        >
          Sign Up
        </button>
      </div>

      <form class="auth-form" @submit.prevent="handleAuthSubmit">
        <div v-if="authMode === 'signup'" class="form-group">
          <label>Username</label>
          <input
            v-model="form.username"
            type="text"
            placeholder="Enter Your Username"
            required
          />
        </div>

        <div class="form-group">
          <label>Email Address</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="Enter Your Email Address"
            required
          />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="Enter Your Password"
            required
          />
        </div>

        <button type="submit" class="btn-primary btn-block">
          {{ authMode === "signin" ? "Sign In" : "Create Account" }}
        </button>
      </form>
    </div>
  </div>
</template>

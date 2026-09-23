<script setup>
import { ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useAuth } from "../composables/useAuth";

const router = useRouter();
const { setAuth } = useAuth();

const selectedRoles = ref([]);
const username = ref("");
const email = ref("");
const password = ref("");

const roles = ["Listener", "Artist", "Producer"];

const toggleRole = (role) => {
  if (selectedRoles.value.includes(role)) {
    selectedRoles.value = selectedRoles.value.filter((r) => r !== role);
  } else {
    selectedRoles.value.push(role);
  }
};

const handleRegister = (e) => {
  if (e) e.preventDefault();

  if (!username.value || !email.value || !password.value) {
    alert("Please fill out all fields.");
    return;
  }

  // Create user object and update auth state with setAuth
  const userData = {
    username: username.value,
    email: email.value,
    roles: selectedRoles.value,
  };

  // setAuth updates user, sets token, turns off guest mode, and runs pending actions
  setAuth(userData, "mock-jwt-token-12345");

  // Redirect to Discover page
  router.push("/discover");
};

const handleClose = () => {
  router.push("/discover");
};
</script>

<template>
  <div class="auth-page-wrapper">
    <div class="modal-card">
      <button
        class="close-btn"
        aria-label="Close"
        type="button"
        @click="handleClose"
      >
        ✕
      </button>

      <div class="modal-header">
        <h1 class="modal-title">Join JAM’N</h1>
        <p class="modal-subtitle">Create your account to get started</p>
      </div>

      <!-- Segmented Tab Bar -->
      <div class="segment-toggle">
        <RouterLink to="/login" class="segment-btn inactive"
          >Sign in</RouterLink
        >
        <button class="segment-btn active" type="button">Sign up</button>
      </div>

      <!-- Roles Selection Cards -->
      <div class="role-selection">
        <label class="role-label"
          >I am a...
          <span class="role-sub">(select all that apply)</span></label
        >
        <div class="role-cards-grid">
          <button
            v-for="role in roles"
            :key="role"
            type="button"
            class="role-card"
            :class="[
              role.toLowerCase(),
              { selected: selectedRoles.includes(role) },
            ]"
            @click="toggleRole(role)"
          >
            {{ role }}
          </button>
        </div>
      </div>

      <!-- Form -->
      <form class="auth-form" @submit.prevent="handleRegister">
        <div class="form-group">
          <label>Username</label>
          <input
            v-model="username"
            type="text"
            placeholder="Enter Your Username"
            required
          />
        </div>

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

        <button type="submit" class="btn-primary">Create Account</button>
      </form>

      <!-- Footer -->
      <div class="modal-footer">
        <p>
          Already have an account?
          <RouterLink to="/login" class="footer-link">Sign in</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  box-sizing: border-box;
  width: 100%;
}

.modal-card {
  position: relative;
  background-color: var(--border-subtle, #f0f0f5);
  border-radius: 20px;
  padding: 2.5rem;
  width: 100%;
  max-width: 480px;
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

/* Segmented Pill Toggle */
.segment-toggle {
  display: flex;
  background-color: #5c4ca8;
  border-radius: 30px;
  padding: 3px;
  margin-bottom: 1.5rem;
}

.segment-btn {
  flex: 1;
  text-align: center;
  padding: 0.6rem 0;
  border-radius: 25px;
  font-size: 0.88rem;
  font-weight: 500;
  border: none;
  text-decoration: none;
  transition: all 0.2s ease;
}

.segment-btn.active {
  background-color: #ede4f8;
  color: var(--text-main);
}

.segment-btn.inactive {
  background-color: transparent;
  color: #ffffff;
}

/* Role Selector */
.role-selection {
  margin-bottom: 1.25rem;
}

.role-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 0.6rem;
}

.role-sub {
  font-weight: 400;
  color: var(--text-muted);
}

.role-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.role-card {
  background-color: #d0d0d8;
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-main);
  cursor: pointer;
  transition: all 0.2s ease;
}

.role-card:hover {
  background-color: #c4c4cc;
}

/* Selected States */
.role-card.selected {
  background-color: var(--secondary-frosted, #c7c6eb);
  border-color: transparent;
  font-weight: 700;
}

.role-card.artist.selected {
  background-color: #eaa0d2;
  border-color: #eaa0d2;
  color: #1d1e18;
}

.role-card.producer.selected {
  background-color: #f7e88a;
  border-color: #f7e88a;
  color: #1d1e18;
}

/* Form Styles */
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
  background-color: var(--bg-surface, #ffffff);
  border: 1px solid var(--border-subtle, #ccc);
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
  background-color: var(--primary-wisteria, #d1bce3);
}

.modal-footer {
  text-align: center;
  margin-top: 1.25rem;
  font-size: 0.85rem;
}

.footer-link {
  color: #5c4ca8;
  font-weight: 600;
  text-decoration: none;
}
</style>

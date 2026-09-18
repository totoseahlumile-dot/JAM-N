import { ref, computed } from "vue";

// Shared reactive state defined outside the composable function (module scope)
const user = ref(JSON.parse(localStorage.getItem("user")) || null);
const token = ref(localStorage.getItem("token") || null);
const isGuest = ref(
  localStorage.getItem("isGuest") !== null
    ? JSON.parse(localStorage.getItem("isGuest"))
    : !token.value,
);

// Interceptor & Modal state
const isAuthModalOpen = ref(false);
const authMode = ref("signin"); // 'signin' | 'signup'
const pendingAction = ref(null);

export function useAuth() {
  // Getters
  const isAuthenticated = computed(() => !!token.value && !isGuest.value);

  // Core Authentication Action
  function setAuth(userData, authToken = "mock-jwt-token-12345") {
    user.value = userData;
    token.value = authToken;
    isGuest.value = false;

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", authToken);
    localStorage.setItem("isGuest", "false");

    // Close auth modal and automatically execute any intercepted guest action
    isAuthModalOpen.value = false;
    if (pendingAction.value) {
      pendingAction.value();
      pendingAction.value = null;
    }
  }

  // Alias methods for component convenience
  function login(userData, authToken) {
    setAuth(userData, authToken);
  }

  function register(userData, authToken) {
    setAuth(userData, authToken);
  }

  function setGuestMode() {
    user.value = null;
    token.value = null;
    isGuest.value = true;

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.setItem("isGuest", "true");
  }

  function logout() {
    user.value = null;
    token.value = null;
    isGuest.value = true;

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.setItem("isGuest", "true");
  }

  // Action Interceptor to block guests from protected actions
  function requireAuth(action, mode = "signin") {
    if (isAuthenticated.value) {
      // User is authenticated; execute action directly
      action();
    } else {
      // User is a guest; save action to replay after sign-in/up
      pendingAction.value = action;
      authMode.value = mode;
      isAuthModalOpen.value = true;
    }
  }

  function openAuthModal(mode = "signin") {
    authMode.value = mode;
    isAuthModalOpen.value = true;
  }

  function closeAuthModal() {
    isAuthModalOpen.value = false;
    pendingAction.value = null;
  }

  return {
    // State
    user,
    token,
    isGuest,
    isAuthModalOpen,
    authMode,
    // Getters
    isAuthenticated,
    // Actions
    setAuth,
    login,
    register,
    setGuestMode,
    logout,
    requireAuth,
    openAuthModal,
    closeAuthModal,
  };
}

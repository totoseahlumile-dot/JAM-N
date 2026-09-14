import { ref, computed } from "vue";

const user = ref(JSON.parse(localStorage.getItem("user")) || null);
const token = ref(localStorage.getItem("token") || null);
const isGuest = ref(JSON.parse(localStorage.getItem("isGuest")) || false);

// Getters
const isAuthenticated = computed(() => !!token.value && !isGuest.value);

// Actions
function setAuth(userData, authToken) {
  user.value = userData;
  token.value = authToken;
  isGuest.value = false;

  localStorage.setItem("user", JSON.stringify(userData));
  localStorage.setItem("token", authToken);
  localStorage.removeItem("isGuest");
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
  isGuest.value = false;

  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("isGuest");
}

export function useAuthStore() {
  return {
    user,
    token,
    isGuest,
    isAuthenticated,
    setAuth,
    setGuestMode,
    logout,
  };
}

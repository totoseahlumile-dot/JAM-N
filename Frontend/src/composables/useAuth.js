import { ref } from "vue";
import { useRouter } from "vue-router";

const isAuthenticated = ref(localStorage.getItem("user_logged_in") === "true");

export function useAuth() {
  const router = useRouter();

  const login = () => {
    isAuthenticated.value = true;
    localStorage.setItem("user_logged_in", "true");
  };

  const logout = () => {
    isAuthenticated.value = false;
    localStorage.removeItem("user_logged_in");
  };

  const requireAuth = (callback) => {
    if (!isAuthenticated.value) {
      alert("Please sign in or create an account to perform this action.");
      router.push("/login");
    } else {
      callback();
    }
  };

  return {
    isAuthenticated,
    login,
    logout,
    requireAuth,
  };
}

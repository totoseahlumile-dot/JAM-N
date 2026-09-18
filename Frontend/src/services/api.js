const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "");

class ApiError extends Error {
  constructor(response, payload) {
    super(payload?.error?.message || `Request failed with status ${response.status}`);
    this.name = "ApiError";
    this.status = response.status;
    this.code = payload?.error?.code || "REQUEST_FAILED";
    this.details = payload?.error?.details;
  }
}

const apiRequest = async (path, { method = "GET", body, token, signal } = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method, credentials: "include", signal,
    headers: { ...(body ? { "content-type": "application/json" } : {}), ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  if (response.status === 204) return null;
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(response, payload);
  return payload;
};

export { API_BASE_URL, ApiError, apiRequest };

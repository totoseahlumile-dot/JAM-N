import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // adjust if your backend uses a different prefix
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach token if available in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

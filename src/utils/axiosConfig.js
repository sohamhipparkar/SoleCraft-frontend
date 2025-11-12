import axios from "axios";

// Configure axios base URL
const API_BASE_URL =
  import.meta?.env?.VITE_API_BASE_URL ||
  "https://sole-craft-backend.vercel.app";
axios.defaults.baseURL = API_BASE_URL;

// Request interceptor - Add token to all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401 errors globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem("token");

      // Only redirect if not already on login page
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login?error=session_expired";
      }
    }
    return Promise.reject(error);
  }
);

export default axios;
export { API_BASE_URL };

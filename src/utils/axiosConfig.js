import axios from "axios";

// Get API base URL - prioritize environment variable for deployment
const getApiBaseUrl = () => {
  // For Vercel deployment
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // For production (deployed frontend)
  if (import.meta.env.PROD) {
    return "https://sole-craft-backend.vercel.app";
  }

  // For local development
  return "http://localhost:5000";
};

const API_BASE_URL = getApiBaseUrl();

// Set axios defaults
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common["Content-Type"] = "application/json";

// Flag to prevent infinite loops
let isRefreshing = false;

// Request interceptor - Add token to all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // Only add Authorization header if token exists and is not empty
    if (token && token !== "null" && token !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors silently for certain endpoints
    if (error.code === "ERR_NETWORK" || error.code === "ECONNABORTED") {
      console.warn("Network error:", error.config?.url);

      // Don't redirect on network errors for these endpoints
      const silentEndpoints = [
        "/api/auth/verify",
        "/api/shop/stats",
        "/api/products/filters",
        "/api/product-wishlist",
        "/api/cart",
      ];

      const shouldIgnore = silentEndpoints.some((endpoint) =>
        error.config?.url?.includes(endpoint)
      );

      if (shouldIgnore) {
        return Promise.reject(error);
      }
    }

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !isRefreshing) {
      isRefreshing = true;

      // Clear invalid token
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Only redirect if not already on auth pages
      const currentPath = window.location.pathname;
      const authPaths = ["/login", "/register", "/forgot-password"];
      const isOnAuthPage = authPaths.some((path) => currentPath.includes(path));

      if (!isOnAuthPage) {
        window.location.href = "/login?error=session_expired";
      }

      isRefreshing = false;
    }

    return Promise.reject(error);
  }
);

export default axios;
export { API_BASE_URL };

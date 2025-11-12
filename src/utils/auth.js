import axios from "./axiosConfig";

// Check if user is authenticated with proper token validation
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");

  if (
    !token ||
    token === "null" ||
    token === "undefined" ||
    token.trim() === ""
  ) {
    return false;
  }

  try {
    const payload = parseJwt(token);
    if (payload && payload.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp < currentTime) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return false;
      }
    }
  } catch (error) {
    console.warn("Token validation error:", error);
    return false;
  }

  return true;
};

const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error parsing JWT:", error);
    return null;
  }
};

export const getCurrentUser = () => {
  const token = localStorage.getItem("token");
  if (!token || token === "null" || token === "undefined") return null;

  try {
    return parseJwt(token);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export const verifyToken = async () => {
  if (!isAuthenticated()) return false;

  try {
    const response = await axios.post("/api/auth/verify");
    return response.data.success;
  } catch (error) {
    console.error("Token verification failed:", error);
    if (error.response?.status === 401) {
      logout();
    }
    return false;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

export const login = (token, user) => {
  if (!token || token === "null" || token === "undefined") {
    console.error("Invalid token provided to login");
    return false;
  }

  localStorage.setItem("token", token);
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }
  return true;
};

export const getUserData = () => {
  try {
    const userData = localStorage.getItem("user");
    if (!userData || userData === "null" || userData === "undefined") {
      return null;
    }
    return JSON.parse(userData);
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

export const cleanupInvalidTokens = () => {
  const token = localStorage.getItem("token");
  if (token === "null" || token === "undefined" || token === "") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};

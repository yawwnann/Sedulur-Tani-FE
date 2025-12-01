import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8686";

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
api.interceptors.request.use(
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthError = error.response?.status === 401;
    const isUserNotFoundError =
      error.response?.status === 404 && error.config?.url?.includes("/auth/me");
    
    // Jangan redirect jika error dari cart API (bisa jadi user belum punya cart)
    const isCartError = error.config?.url?.includes("/cart");

    if ((isAuthError || isUserNotFoundError) && !isCartError) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new Event("auth-changed"));
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

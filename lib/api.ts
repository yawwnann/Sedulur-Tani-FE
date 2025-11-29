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
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("storage"));
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role: "buyer" | "seller";
  }) => api.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  getProfile: () => api.get("/auth/me"),
};

// Products API
export const productsApi = {
  getAll: (params?: {
    seller_id?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
    in_stock?: boolean;
    page?: number;
    limit?: number;
  }) => api.get("/products", { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: FormData) =>
    api.post("/products", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id: string, data: FormData) =>
    api.put(`/products/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// Cart API
export const cartApi = {
  getCart: () => api.get("/cart"),
  addToCart: (data: { productId: string; quantity: number }) =>
    api.post("/cart", { product_id: data.productId, quantity: data.quantity }),
  updateItem: (itemId: string, data: { quantity: number }) =>
    api.put(`/cart/${itemId}`, data),
  removeItem: (itemId: string) => api.delete(`/cart/${itemId}`),
};

// Checkout API
export const checkoutApi = {
  create: (data: {
    addressId: string;
    items: { productId: string; quantity: number }[];
    shippingCost: number;
    notes?: string;
  }) => api.post("/checkout", data),
  getById: (id: string) => api.get(`/checkout/${id}`),
};

// Payment API
export const paymentApi = {
  create: (data: { checkoutId: string }) => api.post("/payments/create", data),
  getStatus: (checkoutId: string) => api.get(`/payments/${checkoutId}`),
};

// Orders API
export const ordersApi = {
  getAll: (params?: { status?: string }) => api.get("/orders", { params }),
  getById: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (
    id: string,
    data: { status: string; trackingNumber?: string }
  ) => api.put(`/orders/${id}/status`, data),
};

// Address API
export const addressApi = {
  getAll: () => api.get("/addresses"),
  getById: (id: string) => api.get(`/addresses/${id}`),
  create: (data: {
    label: string;
    recipient_name: string;
    phone: string;
    address_line: string;
    city: string;
    province: string;
    postal_code: string;
    is_default?: boolean;
  }) => api.post("/addresses", data),
  update: (
    id: string,
    data: {
      label?: string;
      recipient_name?: string;
      phone?: string;
      address_line?: string;
      city?: string;
      province?: string;
      postal_code?: string;
      is_default?: boolean;
    }
  ) => api.put(`/addresses/${id}`, data),
  delete: (id: string) => api.delete(`/addresses/${id}`),
};

// Shipping API
export const shippingApi = {
  getProvinces: () => api.get("/shipping/provinces"),
  getRegencies: (provinceId: string) =>
    api.get(`/shipping/regencies/${provinceId}`),
  getDistricts: (regencyId: string) =>
    api.get(`/shipping/districts/${regencyId}`),
  calculateCost: (data: { provinceId: string; weight: number }) =>
    api.post("/shipping/cost", data),
};

// User API
export const userApi = {
  getById: (id: string) => api.get(`/users/${id}`),
  updateProfile: (
    id: string,
    data: { name?: string; phone?: string; email?: string }
  ) => api.put(`/users/${id}`, data),
};

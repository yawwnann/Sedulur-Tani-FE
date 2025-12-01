import { api } from "./client";

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

export const shippingApi = {
  getProvinces: () => api.get("/shipping/provinces"),
  getRegencies: (provinceId: string) =>
    api.get(`/shipping/regencies/${provinceId}`),
  getDistricts: (regencyId: string) =>
    api.get(`/shipping/districts/${regencyId}`),
  calculateCost: (data: { provinceId: string; weight: number }) =>
    api.post("/shipping/cost", data),
};

import { api } from "./client";

export const userApi = {
  getById: (id: string) => api.get(`/users/${id}`),
  updateProfile: (
    id: string,
    data: { name?: string; phone?: string; email?: string }
  ) => api.put(`/users/${id}`, data),
};

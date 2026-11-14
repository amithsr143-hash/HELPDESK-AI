import { api } from './api';

export const categoryService = {
  getCategories: (includeInactive = false) =>
    api.get(`/categories${includeInactive ? '?includeInactive=true' : ''}`),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`)
};


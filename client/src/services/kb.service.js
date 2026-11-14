import { api } from './api';

export const kbService = {
  getPublished: (params) => api.get('/knowledge-base', params),
  getArticle: (id) => api.get(`/knowledge-base/articles/${id}`),
  getAllAdmin: (params) => api.get('/knowledge-base/admin/all', params),
  createArticle: (data) => api.post('/knowledge-base/admin', data),
  updateArticle: (id, data) => api.put(`/knowledge-base/admin/${id}`, data),
  deleteArticle: (id) => api.delete(`/knowledge-base/admin/${id}`)
};


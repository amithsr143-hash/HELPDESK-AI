import { api } from './api';

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', params),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  updateUserStatus: (id, isActive) => api.patch(`/admin/users/${id}/status`, { isActive }),
  getAgents: () => api.get('/admin/agents'),
  createAgent: (data) => api.post('/admin/agents', data),
  getAIAnalytics: () => api.get('/admin/analytics'),
  getCategories: () => api.get('/knowledge-base') // returns categories through articles or direct
};


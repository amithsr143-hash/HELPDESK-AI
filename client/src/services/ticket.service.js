import { api } from './api';

export const ticketService = {
  getTickets: (params) => api.get('/tickets', params),
  getTicket: (id) => api.get(`/tickets/${id}`),
  createTicket: (data) => api.post('/tickets', data),
  updateStatus: (id, data) => api.patch(`/tickets/${id}/status`, data),
  assignAgent: (id, agentId) => api.patch(`/tickets/${id}/assign`, { agent_id: agentId }),
  addResponse: (id, data) => api.post(`/tickets/${id}/responses`, data),
  getActivity: (id) => api.get(`/tickets/${id}/activity`),
  submitFeedback: (id, data) => api.post(`/tickets/${id}/feedback`, data),
  getAiSummary: (id) => api.get(`/tickets/${id}/summary`)
};


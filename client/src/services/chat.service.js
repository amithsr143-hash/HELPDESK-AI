import { api } from './api';

export const chatService = {
  sendMessage: (data) => api.post('/chat/message', data),
  getConversations: () => api.get('/chat/conversations'),
  getConversation: (id) => api.get(`/chat/conversations/${id}`),
  escalateToTicket: (data) => api.post('/chat/escalate', data)
};


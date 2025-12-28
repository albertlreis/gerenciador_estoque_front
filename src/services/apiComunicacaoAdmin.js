import api from './apiEstoque';

export const comms = {
  // Templates
  templatesIndex: (params) => api.get('/comunicacao/templates', { params }),
  templatesShow: (id, config) => api.get(`/comunicacao/templates/${id}`, config),
  templatesStore: (payload) => api.post('/comunicacao/templates', payload),
  templatesUpdate: (id, payload) => api.put(`/comunicacao/templates/${id}`, payload),
  templatesPreview: (id, payload) => api.post(`/comunicacao/templates/${id}/preview`, payload),

  // Requests
  requestsIndex: (params) => api.get('/comunicacao/requests', { params }),
  requestsShow: (id) => api.get(`/comunicacao/requests/${id}`),
  requestsCancel: (id) => api.post(`/comunicacao/requests/${id}/cancelar`),

  // Messages
  messagesIndex: (params) => api.get('/comunicacao/messages', { params }),
  messagesShow: (id) => api.get(`/comunicacao/messages/${id}`),
  messagesRetry: (id) => api.post(`/comunicacao/messages/${id}/reprocessar`),
};

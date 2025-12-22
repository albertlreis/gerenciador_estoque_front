import api from './apiEstoque';

export const comms = {
  // Templates
  templatesIndex: (params) => api.get('/comms/templates', { params }),
  templatesShow: (id, config) => api.get(`/comms/templates/${id}`, config),
  templatesStore: (payload) => api.post('/comms/templates', payload),
  templatesUpdate: (id, payload) => api.put(`/comms/templates/${id}`, payload),
  templatesPreview: (id, payload) => api.post(`/comms/templates/${id}/preview`, payload),

  // Requests
  requestsIndex: (params) => api.get('/comms/requests', { params }),
  requestsShow: (id) => api.get(`/comms/requests/${id}`),
  requestsCancel: (id) => api.post(`/comms/requests/${id}/cancel`),

  // Messages
  messagesIndex: (params) => api.get('/comms/messages', { params }),
  messagesShow: (id) => api.get(`/comms/messages/${id}`),
  messagesRetry: (id) => api.post(`/comms/messages/${id}/retry`),
};

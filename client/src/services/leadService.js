import apiClient from './apiClient';

export const getLeads = (params) => apiClient.get('/leads', { params });

export const createLead = (payload) => apiClient.post('/leads', payload);

export const updateLead = (id, payload) => apiClient.put(`/leads/${id}`, payload);

export const deleteLead = (id) => apiClient.delete(`/leads/${id}`);

export const assignLead = (id, assignedTo) =>
  apiClient.put(`/leads/${id}/assign`, { assignedTo });

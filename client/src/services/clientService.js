import apiClient from './apiClient';

export const getClients = () => apiClient.get('/clients');

export const getClientById = (id) => apiClient.get(`/clients/${id}`);

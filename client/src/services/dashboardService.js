import apiClient from './apiClient';

export const getAdminDashboard = () => apiClient.get('/dashboard/admin');

export const getBdaDashboard = () => apiClient.get('/dashboard/bda');

import apiClient from './apiClient';

export const getTeamMembers = () => apiClient.get('/users');

export const getMemberPerformance = (id) =>
  apiClient.get(`/users/${id}/performance`);

export const deactivateMember = (id) =>
  apiClient.put(`/users/${id}/deactivate`);

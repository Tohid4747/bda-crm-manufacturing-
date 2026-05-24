import apiClient from './apiClient';

export const getBdaUsers = () => apiClient.get('/users/bdas');

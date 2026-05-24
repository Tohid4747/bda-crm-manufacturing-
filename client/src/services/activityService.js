import apiClient from './apiClient';

export const createActivity = (payload) => apiClient.post('/activities', payload);

export const getActivitiesByLead = (leadId) =>
  apiClient.get(`/activities/lead/${leadId}`);

export const getUpcomingActivities = () => apiClient.get('/activities/upcoming');

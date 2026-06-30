import api from './api';

export const cleanAuditParams = (filters = {}) => Object.fromEntries(
  Object.entries(filters).filter(([, value]) => (
    value !== undefined
    && value !== null
    && value !== ''
    && value !== false
  ))
);

export const auditService = {
  async listEvents(filters) {
    const response = await api.get('/audit/events', {
      params: cleanAuditParams(filters),
    });
    return response.data;
  },

  async getEvent(eventId) {
    const response = await api.get(`/audit/events/${eventId}`);
    return response.data;
  },
};

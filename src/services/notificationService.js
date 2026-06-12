import api from './api';

export const notificationService = {
  async getMyNotifications(limit = 20, offset = 0) {
    const response = await api.get('/notifications', {
      params: { limit, offset },
    });
    return response.data;
  },

  async getNotificationById(id) {
    const response = await api.get(`/notifications/${id}`);
    return response.data;
  },
}

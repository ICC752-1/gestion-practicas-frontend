import api from './api';

export const notificationService = {
  async getMyNotifications(limit = 20, offset = 0) {
    const response = await api.get('/notifications', {
      params: { limit, offset },
    });
    if (Array.isArray(response.data)) {
      return response.data;
    }

    if (Array.isArray(response.data?.items)) {
      return response.data.items;
    }

    return [];
  },

  async getNotificationById(id) {
    const response = await api.get(`/notifications/${id}`);
    return response.data;
  },
}

import api from './api';

export const notificationService = {
  async getMyNotifications(limit = 20, offset = 0, params = {}) {
    const response = await api.get('/notifications', {
      params: { limit, offset, ...params },
    });
    return response.data;
  },

  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  async getNotificationById(id) {
    const response = await api.get(`/notifications/${id}`);
    return response.data;
  },

  async markAsRead(id) {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  async markSelectedAsRead(notificationIds) {
    const response = await api.patch('/notifications/read', {
      notification_ids: notificationIds,
    });
    return response.data;
  },

  async markAllAsRead() {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },
}

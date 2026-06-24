import { useCallback, useEffect, useState } from 'react';
import { notificationService } from '../services/notificationService';

const DEFAULT_REFRESH_MS = 5000;

export const useNotifications = (limit = 10, enabled = true) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!enabled || !localStorage.getItem('token')) {
      setNotifications([]);
      setUnreadCount(0);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await notificationService.getMyNotifications(limit);
      const items = Array.isArray(data) ? data : data?.items || [];
      const unread = Array.isArray(data)
        ? items.filter((notification) => !notification.is_read).length
        : data?.unread_count || 0;

      setNotifications(items);
      setUnreadCount(unread);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        setNotifications([]);
        setUnreadCount(0);
        setError(null);
        return;
      }

      // Fallo no bloqueante: el indicador simplemente no muestra datos
      setError(err.response?.data?.detail || err.message || 'Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  }, [enabled, limit]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      fetchNotifications();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [enabled, fetchNotifications]);

  useEffect(() => {
    if (!enabled) return undefined;

    const refreshOnFocus = () => {
      fetchNotifications();
    };

    const refreshOnVisible = () => {
      if (!document.hidden) {
        fetchNotifications();
      }
    };

    const intervalId = window.setInterval(fetchNotifications, DEFAULT_REFRESH_MS);

    window.addEventListener('focus', refreshOnFocus);
    document.addEventListener('visibilitychange', refreshOnVisible);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refreshOnFocus);
      document.removeEventListener('visibilitychange', refreshOnVisible);
    };
  }, [enabled, fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    if (unreadCount === 0) {
      return;
    }

    const previousNotifications = notifications;
    const previousUnreadCount = unreadCount;
    const readAt = new Date().toISOString();

    setNotifications((current) => current.map((notification) => ({
      ...notification,
      is_read: true,
      read_at: notification.read_at || readAt,
    })));
    setUnreadCount(0);

    try {
      const response = await notificationService.markAllAsRead();
      setUnreadCount(response.unread_count || 0);
    } catch (err) {
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
      setError(err.response?.data?.detail || err.message || 'Error al marcar notificaciones');
    }
  }, [notifications, unreadCount]);

  const markAsRead = useCallback(async (notificationId) => {
    const target = notifications.find((notification) => notification.id === notificationId);
    if (!target || target.is_read) {
      return;
    }

    const previousNotifications = notifications;
    const previousUnreadCount = unreadCount;
    const readAt = new Date().toISOString();

    setNotifications((current) => current.map((notification) => (
      notification.id === notificationId
        ? { ...notification, is_read: true, read_at: readAt }
        : notification
    )));
    setUnreadCount((current) => Math.max(0, current - 1));

    try {
      const response = await notificationService.markAsRead(notificationId);
      setUnreadCount(response.unread_count || 0);
    } catch (err) {
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
      setError(err.response?.data?.detail || err.message || 'Error al marcar notificación');
    }
  }, [notifications, unreadCount]);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAllAsRead,
    markAsRead,
    refresh: fetchNotifications,
  };
};

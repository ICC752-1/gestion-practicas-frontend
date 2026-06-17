import { useCallback, useEffect, useState } from 'react';
import { notificationService } from '../services/notificationService';

const LAST_SEEN_KEY = 'lastSeenNotificationId';
const DEFAULT_REFRESH_MS = 5000;

export const useNotifications = (limit = 10, enabled = true) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSeenId, setLastSeenId] = useState(
    () => Number(localStorage.getItem(LAST_SEEN_KEY)) || 0
  );

  const fetchNotifications = useCallback(async () => {
    if (!enabled || !localStorage.getItem('token')) {
      setNotifications([]);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await notificationService.getMyNotifications(limit);
      setNotifications(data);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        setNotifications([]);
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

    fetchNotifications();
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

  // Marca como vistas las notificaciones actuales (al abrir el panel)
  const markAsSeen = useCallback(() => {
    const latestId = notifications.reduce((max, n) => Math.max(max, n.id), 0);
    if (latestId > lastSeenId) {
      localStorage.setItem(LAST_SEEN_KEY, String(latestId));
      setLastSeenId(latestId);
    }
  }, [notifications, lastSeenId]);

  const unseenCount = notifications.filter((n) => n.id > lastSeenId).length;

  return {
    notifications,
    loading,
    error,
    unseenCount,
    markAsSeen,
    refresh: fetchNotifications,
  };
};

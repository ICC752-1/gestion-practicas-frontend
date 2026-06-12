import { useCallback, useEffect, useState } from 'react';
import { notificationService } from '../services/notificationService';

const LAST_SEEN_KEY = 'lastSeenNotificationId';

export const useNotifications = (limit = 10) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSeenId, setLastSeenId] = useState(
    () => Number(localStorage.getItem(LAST_SEEN_KEY)) || 0
  );

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationService.getMyNotifications(limit);
      setNotifications(data);
      setError(null);
    } catch (err) {
      // Fallo no bloqueante: el indicador simplemente no muestra datos
      setError(err.response?.data?.detail || err.message || 'Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

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

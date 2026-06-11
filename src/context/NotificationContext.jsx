import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useAuth } from './useAuth';
import { NotificationContext } from './notification-context';
import { notificationService } from '../services/notificationService';

const TOAST_DURATION_MS = 4500;
const getUserStorageId = (user) => user?.id || user?.email || null;

const toastStyles = {
  success: { icon: CheckCircle2, className: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  error: { icon: AlertCircle, className: 'border-red-200 bg-red-50 text-red-800' },
  info: { icon: Info, className: 'border-blue-200 bg-blue-50 text-blue-800' },
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = getUserStorageId(user);
  const [notificationState, setNotificationState] = useState({ userId: null, items: [] });
  const [toasts, setToasts] = useState([]);
  const notifications = useMemo(
    () => notificationState.userId === userId ? notificationState.items : [],
    [notificationState, userId],
  );
  const toastTimers = useRef(new Map());

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setNotificationState({ userId, items: notificationService.list(userId) });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [userId]);

  useEffect(() => () => {
    toastTimers.current.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const dismissToast = useCallback((toastId) => {
    setToasts((current) => current.filter((toast) => toast.id !== toastId));
    const timer = toastTimers.current.get(toastId);
    if (timer) window.clearTimeout(timer);
    toastTimers.current.delete(toastId);
  }, []);

  const showToast = useCallback(({ type = 'info', message }) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((current) => [...current, { id, type, message }]);
    const timer = window.setTimeout(() => dismissToast(id), TOAST_DURATION_MS);
    toastTimers.current.set(id, timer);
  }, [dismissToast]);

  const addNotification = useCallback((notification) => {
    if (!userId) return null;
    const nextNotifications = notificationService.add(userId, notification);
    setNotificationState({ userId, items: nextNotifications });
    return nextNotifications[0];
  }, [userId]);

  const markAsRead = useCallback((notificationId) => {
    if (!userId) return;
    setNotificationState({
      userId,
      items: notificationService.markAsRead(userId, notificationId),
    });
  }, [userId]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.readAt).length,
    [notifications],
  );

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    showToast,
    source: notificationService.source,
  }), [notifications, unreadCount, addNotification, markAsRead, showToast]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="fixed right-5 top-24 z-[100] flex w-[min(24rem,calc(100vw-2.5rem))] flex-col gap-3" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => {
          const style = toastStyles[toast.type] || toastStyles.info;
          const Icon = style.icon;
          return (
            <div key={toast.id} role={toast.type === 'error' ? 'alert' : 'status'} className={`flex items-start gap-3 rounded-2xl border p-4 shadow-lg ${style.className}`}>
              <Icon className="mt-0.5 shrink-0" size={20} />
              <p className="flex-1 text-sm font-semibold">{toast.message}</p>
              <button type="button" onClick={() => dismissToast(toast.id)} className="rounded-full p-1 hover:bg-black/5" aria-label="Cerrar mensaje">
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

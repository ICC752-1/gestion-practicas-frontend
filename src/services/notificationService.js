const NOTIFICATIONS_SOURCE =
  import.meta.env.VITE_NOTIFICATIONS_SOURCE || 'simulated';

const STORAGE_PREFIX = 'simulated_notifications';

const EVENT_CONTENT = {
  internship_registered: {
    title: 'Práctica registrada',
    message: ({ organization }) =>
      `Tu práctica${organization ? ` en ${organization}` : ''} fue registrada correctamente.`,
  },
  internship_approved: {
    title: 'Práctica aprobada',
    message: ({ organization }) =>
      `La práctica${organization ? ` en ${organization}` : ''} fue aprobada.`,
  },
  internship_rejected: {
    title: 'Práctica rechazada',
    message: ({ organization }) =>
      `La práctica${organization ? ` en ${organization}` : ''} fue rechazada.`,
  },
  internship_derived: {
    title: 'Práctica derivada',
    message: ({ organization }) =>
      `La práctica${organization ? ` en ${organization}` : ''} fue derivada a revisión.`,
  },
};

const buildStorageKey = (userId) => `${STORAGE_PREFIX}:${userId}`;

const readStoredNotifications = (userId) => {
  if (!userId || NOTIFICATIONS_SOURCE !== 'simulated') return [];

  try {
    const storedValue = localStorage.getItem(buildStorageKey(userId));
    const notifications = storedValue ? JSON.parse(storedValue) : [];
    return Array.isArray(notifications) ? notifications : [];
  } catch {
    return [];
  }
};

const persistNotifications = (userId, notifications) => {
  if (!userId || NOTIFICATIONS_SOURCE !== 'simulated') return;

  try {
    localStorage.setItem(buildStorageKey(userId), JSON.stringify(notifications));
  } catch {
    // The UI remains usable when browser storage is unavailable.
  }
};

const createId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const notificationService = {
  source: NOTIFICATIONS_SOURCE,

  list(userId) {
    return readStoredNotifications(userId);
  },

  add(userId, notification) {
    const notifications = readStoredNotifications(userId);
    const nextNotification = {
      id: notification.id || createId(),
      event: notification.event,
      title: notification.title,
      message: notification.message,
      referenceType: notification.referenceType || null,
      referenceId: notification.referenceId || null,
      createdAt: notification.createdAt || new Date().toISOString(),
      readAt: notification.readAt || null,
      source: 'simulated',
    };
    const nextNotifications = [nextNotification, ...notifications];

    persistNotifications(userId, nextNotifications);
    return nextNotifications;
  },

  markAsRead(userId, notificationId) {
    const notifications = readStoredNotifications(userId);
    const nextNotifications = notifications.map((notification) =>
      notification.id === notificationId && !notification.readAt
        ? { ...notification, readAt: new Date().toISOString() }
        : notification,
    );

    persistNotifications(userId, nextNotifications);
    return nextNotifications;
  },

  delete(userId, notificationId) {
    const notifications = readStoredNotifications(userId);
    const nextNotifications = notifications.filter(
      (notification) => notification.id !== notificationId,
    );

    persistNotifications(userId, nextNotifications);
    return nextNotifications;
  },

  createEvent(event, payload = {}) {
    const content = EVENT_CONTENT[event];

    if (!content) {
      throw new Error(`Unsupported notification event: ${event}`);
    }

    return {
      event,
      title: content.title,
      message: content.message(payload),
      referenceType: payload.referenceType || 'internship',
      referenceId: payload.referenceId || null,
    };
  },
};

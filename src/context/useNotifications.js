import { useContext } from 'react';
import { NotificationContext } from './notification-context';

export const useNotifications = () => useContext(NotificationContext);

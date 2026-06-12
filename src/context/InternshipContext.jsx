import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './useAuth';
import { useNotifications } from './useNotifications';
import { InternshipContext } from './internship-context';
import { internshipService } from '../services/internshipService';
import { notificationService } from '../services/notificationService';
import { useAutoRefresh } from '../hooks/useAutoRefresh';

const getUserStorageId = (user) => user?.id || user?.email || null;

export const InternshipProvider = ({ children }) => {
  const { user } = useAuth();
  const { addNotification, showToast } = useNotifications();
  const userId = getUserStorageId(user);
  const isStudent = user?.roles?.includes('Estudiante') ?? false;
  const [internshipState, setInternshipState] = useState({ userId: null, items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const refreshInProgress = useRef(false);
  const refreshQueued = useRef(false);
  const internships = useMemo(
    () => internshipState.userId === userId && isStudent ? internshipState.items : [],
    [internshipState, userId, isStudent],
  );

  const refreshInternships = useCallback(async ({ background = false, queueIfBusy = false } = {}) => {
    if (!userId || !isStudent) return;
    if (refreshInProgress.current) {
      if (queueIfBusy) refreshQueued.current = true;
      return;
    }

    refreshInProgress.current = true;
    let currentRequestIsBackground = background;

    try {
      do {
        refreshQueued.current = false;
        if (!currentRequestIsBackground) {
          setLoading(true);
          setError(null);
        }

        const nextInternships = await internshipService.getMyInternships();
        const changes = notificationService.detectInternshipStatusChanges(userId, nextInternships);

        setInternshipState({ userId, items: nextInternships });
        changes.forEach(({ notification }) => {
          addNotification(notification);
          showToast({ type: 'info', message: notification.message });
        });

        currentRequestIsBackground = true;
      } while (refreshQueued.current);
    } catch (err) {
      if (!background) setError(err.message || 'Error al cargar las prácticas');
    } finally {
      if (!background) setLoading(false);
      refreshInProgress.current = false;
    }
  }, [userId, isStudent, addNotification, showToast]);

  useEffect(() => {
    if (isStudent) refreshInternships();
  }, [isStudent, refreshInternships]);

  useAutoRefresh(() => refreshInternships({ background: true }));

  const getInternshipById = useCallback(
    (internshipId) => internships.find((internship) => String(internship.id) === String(internshipId)) || null,
    [internships],
  );

  const value = useMemo(() => ({
    internships,
    loading: isStudent ? loading : false,
    error: isStudent ? error : null,
    refreshInternships,
    getInternshipById,
  }), [internships, loading, error, isStudent, refreshInternships, getInternshipById]);

  return (
    <InternshipContext.Provider value={value}>
      {children}
    </InternshipContext.Provider>
  );
};

import { useCallback, useEffect, useState } from 'react';
import { coordinatorService } from '../services/coordinatorService';

const getErrorMessage = (error) => {
  if (error.response?.status === 403) {
    return 'Tu usuario no tiene permiso para consultar el dashboard administrativo.';
  }
  if (error.response?.status === 401) {
    return 'La sesión expiró. Inicia sesión nuevamente.';
  }
  return error.response?.data?.detail || error.message || 'Error al cargar el dashboard.';
};

export const useCoordinatorDashboard = (statusFilter = '') => {
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, practicesData] = await Promise.all([
        coordinatorService.getDashboardStats(),
        coordinatorService.getPractices(statusFilter),
      ]);
      setStats(statsData);
      setStudents(practicesData);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    stats,
    students,
    loading,
    error,
    refreshData: fetchDashboard,
  };
};

import { useState, useEffect } from 'react';
import { coordinatorService } from '../services/coordinatorService';

export const useCoordinatorState = () => {
  const [stats, setStats] = useState(null);
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCoordinatorData = async () => {
    setLoading(true);
    try {
      const [statsData, practicesData] = await Promise.all([
        coordinatorService.getDashboardStats(),
        coordinatorService.getPractices(),
      ]);
      setStats(statsData);
      setPractices(practicesData);
    } catch (err) {
      setError(err.message || 'Failed to fetch coordinator data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoordinatorData();
  }, []);

  return {
    stats,
    practices,
    loading,
    error,
    refreshData: fetchCoordinatorData,
  };
};

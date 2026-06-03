import { useState, useEffect } from 'react';
import { internshipService } from '../services/internshipService';

export const useCoordinatorState = () => {
  const [stats, setStats] = useState(null);
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCoordinatorData = async () => {
    setLoading(true);
    try {
      const [statsData, practicesData] = await Promise.all([
        internshipService.getInternshipStats(),
        internshipService.getInternships('submitted'),
      ]);
      setStats(statsData);
      setPractices(practicesData);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch coordinator data');
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

import { useState, useEffect } from 'react';
import { coordinatorService } from '../services/coordinatorService';

export const usePractice = (id) => {
  const [practice, setPractice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPractice = async () => {
    try {
      setLoading(true);
      const data = await coordinatorService.getPracticeById(id);
      setPractice(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al cargar la práctica');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPractice();
    }
  }, [id]);

  return { practice, loading, error, refresh: fetchPractice };
};

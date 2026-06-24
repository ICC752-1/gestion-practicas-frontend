import { useCallback, useEffect, useState } from 'react';
import { coordinatorService } from '../services/coordinatorService';

export const usePractice = (id) => {
  const [practice, setPractice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPractice = useCallback(async () => {
    try {
      setLoading(true);
      const data = await coordinatorService.getPracticeById(id);
      setPractice(data);
      setError(null);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Tu usuario no tiene permiso para consultar este detalle administrativo.');
      } else if (err.response?.status === 404) {
        setError('La práctica solicitada no existe.');
      } else {
        setError(err.response?.data?.detail || err.message || 'Error al cargar la práctica');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchPractice();
    }
  }, [fetchPractice, id]);

  return { practice, loading, error, refresh: fetchPractice };
};

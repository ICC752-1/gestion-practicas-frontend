import { useState, useEffect } from 'react';
import { coordinatorService } from '../services/coordinatorService';

export const useCoordinatorDashboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      // Según la tarea: GET /internships?status=submitted
      const data = await coordinatorService.getPractices('submitted');
      setStudents(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al cargar estudiantes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const updateStudentStatus = async (studentId, status) => {
    try {
      // Nota: internshipService no tiene update status aún en la descripción, 
      // pero usaremos el existente si es necesario o uno nuevo.
      // Por ahora mantengo la lógica de refresco.
      await fetchStudents();
    } catch (err) {
      setError(err.message || 'Error al actualizar estado');
    }
  };

  return {
    students,
    loading,
    error,
    updateStudentStatus,
    refreshData: fetchStudents
  };
};
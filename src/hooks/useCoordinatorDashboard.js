import { useState, useEffect } from 'react';
import { coordinatorService } from '../services/coordinatorService';

export const useCoordinatorDashboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await coordinatorService.getPractices();
        setStudents(data);
      } catch (err) {
        setError(err.message || 'Error al cargar estudiantes');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const updateStudentStatus = async (studentId, requirementId, status) => {
    try {
      await coordinatorService.updatePracticeStatus(studentId, requirementId, status);
      const data = await coordinatorService.getPractices();
      setStudents(data);
    } catch (err) {
      setError(err.message || 'Error al actualizar estado');
    }
  };

  return {
    students,
    loading,
    error,
    updateStudentStatus,
  };
};
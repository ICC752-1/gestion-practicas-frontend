import { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { coordinatorService } from '../services/coordinatorService';

export const useCoordinatorData = () => {
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, practicesData] = await Promise.all([
          coordinatorService.getDashboardStats(),
          coordinatorService.getPractices(),
        ]);
        setStats(statsData);
        setStudents(practicesData);
      } catch (err) {
        setError(err.message || 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const actions = [
    { title: 'Gestión de Prácticas', description: 'Aprobar o rechazar solicitudes', Icon: FileText },
    { title: 'Configurar Horarios', description: 'Gestionar horarios disponibles para entrevistas', Icon: Calendar },
  ];

  // Construye las stats cards con los datos reales del backend
  const statsCards = stats ? [
    { label: 'Total', value: String(stats.total_internships), Icon: Users, variant: 'default' },
    { label: 'En progreso', value: String(stats.internships_by_status?.find(s => s.status === 'En curso')?.total ?? 0), Icon: Clock, variant: 'progress' },
    { label: 'Pendientes', value: String(stats.internships_by_status?.find(s => s.status === 'Pendiente')?.total ?? 0), Icon: AlertTriangle, variant: 'alert' },
    { label: 'Completadas', value: String(stats.internships_by_status?.find(s => s.status === 'Finalizada')?.total ?? 0), Icon: CheckCircle, variant: 'success' },
  ] : [];

  return {
    stats: statsCards,
    actions,
    students,
    loading,
    error,
  };
};
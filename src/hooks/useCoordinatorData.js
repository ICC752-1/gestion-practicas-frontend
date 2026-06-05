import { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { coordinatorService } from '../services/coordinatorService';

export const useCoordinatorData = () => {
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, practicesData] = await Promise.all([
        coordinatorService.getDashboardStats(),
        coordinatorService.getPractices('submitted'),
      ]);
      setStats(statsData);
      setStudents(practicesData);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const actions = [
    { title: 'Gestión de Prácticas', description: 'Aprobar o rechazar solicitudes', Icon: FileText },
    { title: 'Configurar Horarios', description: 'Gestionar horarios disponibles para entrevistas', Icon: Calendar },
  ];

  // Construye las stats cards con los datos reales del backend
  // GET /internships/stats retorna conteos: { total, submitted, in_review, approved, rejected }
  const statsCards = stats ? [
    { label: 'Total', value: String(stats.total || 0), Icon: Users, variant: 'default' },
    { label: 'Pendientes', value: String(stats.submitted || 0), Icon: Clock, variant: 'alert' },
    { label: 'En Revisión', value: String(stats.in_review || 0), Icon: AlertTriangle, variant: 'progress' },
    { label: 'Aprobadas', value: String(stats.approved || 0), Icon: CheckCircle, variant: 'success' },
  ] : [];

  return {
    stats: statsCards,
    actions,
    students,
    loading,
    error,
    refreshData: fetchData
  };
};
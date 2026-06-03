import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCoordinatorState } from '../../hooks/useCoordinatorState';
import { StatCard } from '../coordinador/StatCard';
import Management from './Management';
import { Users, FileText, CheckCircle, Clock, Calendar, AlertCircle, RefreshCcw } from 'lucide-react';

const DashboardSkeleton = () => (
  <div className="p-6 space-y-6 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
      ))}
    </div>
    <div className="h-24 bg-gray-200 rounded-2xl w-full"></div>
    <div className="h-64 bg-gray-200 rounded-2xl w-full"></div>
  </div>
);

const Dashboard = ({ students = [] }) => {
  const { stats: apiStats, loading, error, refreshData, practices } = useCoordinatorState();
  const navigate = useNavigate();

  // Si la API de stats falla (devuelve 0 por el fallback 403), calculamos desde las prácticas cargadas
  const calculatedStats = React.useMemo(() => {
    const list = (practices && practices.length > 0) ? practices : (students || []);
    if (list.length === 0) return { total: 0, pending: 0, inReview: 0, approved: 0 };

    return {
      total: list.length,
      pending: list.filter(s => {
        const statusValue = typeof s.status === 'object' ? s.status?.title : s.status;
        const normalizedStatus = String(statusValue || '').toLowerCase();
        return normalizedStatus === 'pendiente' || normalizedStatus === 'submitted' || normalizedStatus === 'submited' || normalizedStatus === '';
      }).length,
      inReview: list.filter(s => {
        const statusValue = typeof s.status === 'object' ? s.status?.title : s.status;
        const normalizedStatus = String(statusValue || '').toLowerCase();
        return normalizedStatus === 'en revisión' || normalizedStatus === 'en revision' || normalizedStatus === 'in_review';
      }).length,
      approved: list.filter(s => {
        const statusValue = typeof s.status === 'object' ? s.status?.title : s.status;
        const normalizedStatus = String(statusValue || '').toLowerCase();
        return normalizedStatus === 'aprobada' || normalizedStatus === 'aprobado' || normalizedStatus === 'approved';
      }).length
    };
  }, [practices, students]);

  const stats = (apiStats && apiStats.total_internships > 0) ? {
    total: apiStats.total_internships,
    pending: apiStats.internships_by_status?.find(s => {
      const status = String(s.status || '').toLowerCase();
      return status === 'pendiente' || status === 'submitted' || status === 'submited';
    })?.total || 0,
    inReview: apiStats.internships_by_status?.find(s => {
      const status = String(s.status || '').toLowerCase();
      return status === 'en revisión' || status === 'en revision' || status === 'in_review';
    })?.total || 0,
    approved: apiStats.internships_by_status?.find(s => {
      const status = String(s.status || '').toLowerCase();
      return status === 'aprobada' || status === 'aprobado' || status === 'approved';
    })?.total || 0,
  } : calculatedStats;

  if (loading) return <DashboardSkeleton />;
  
  if (error) return (
    <div className="p-12 flex flex-col items-center justify-center space-y-4">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-gray-800">No se pudo cargar el dashboard</h2>
      <p className="text-gray-500">{error}</p>
      <button 
        onClick={refreshData}
        className="flex items-center gap-2 px-6 py-2 bg-[#B5305F] text-white rounded-xl hover:bg-opacity-90 transition-all"
      >
        <RefreshCcw size={18} />
        Reintentar
      </button>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total" 
          value={stats.total} 
          Icon={Users} 
          variant="default"
        />
        <StatCard 
          label="Pendientes" 
          value={stats.pending} 
          Icon={Clock} 
          variant="alert"
        />
        <StatCard 
          label="En Revisión" 
          value={stats.inReview} 
          Icon={AlertCircle} 
          variant="progress"
        />
        <StatCard 
          label="Aprobadas" 
          value={stats.approved} 
          Icon={CheckCircle} 
          variant="success"
        />
       </div>
       
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-center gap-6 text-left group"
        >
          <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:bg-[#B5305F] transition-colors">
            <FileText className="w-7 h-7 text-[#B5305F] group-hover:text-white transition-colors" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Gestión de Prácticas</h3>
            <p className="text-sm text-gray-400">Administra las solicitudes y estados</p>
          </div>
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/entrevistas')}
          className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-center gap-6 text-left group"
        >
          <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:bg-[#B5305F] transition-colors">
            <Calendar className="w-7 h-7 text-[#B5305F] group-hover:text-white transition-colors" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Configurar Horarios</h3>
            <p className="text-sm text-gray-400">Gestiona tus horarios disponibles para las entrevistas</p>
          </div>
        </motion.button>
      </div>
       
       <Management students={students} />
    </div>
  );
};

export default Dashboard;

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

const Dashboard = () => {
  const { stats, loading, error, refreshData } = useCoordinatorState();
  const navigate = useNavigate();

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
          value={stats?.total || 0} 
          Icon={Users} 
          variant="default"
        />
        <StatCard 
          label="Pendientes" 
          value={stats?.submitted || 0} 
          Icon={Clock} 
          variant="alert"
        />
        <StatCard 
          label="En Revisión" 
          value={stats?.in_review || 0} 
          Icon={AlertCircle} 
          variant="progress"
        />
        <StatCard 
          label="Aprobadas" 
          value={stats?.approved || 0} 
          Icon={CheckCircle} 
          variant="success"
        />
       </div>
       
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-center gap-6 text-left group"
        >git
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
       
       <Management />
    </div>
  );
};

export default Dashboard;

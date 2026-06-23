import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StatCard } from '../coordinador/StatCard';
import Management from './Management';
import { Users, FileText, CheckCircle, Clock, Calendar, AlertCircle, Mail } from 'lucide-react';

const getStatusTotal = (stats, titles) => {
  return (stats?.internships_by_status || [])
    .filter((item) => titles.includes(item.status))
    .reduce((total, item) => total + item.total, 0);
};

const Dashboard = ({
  students = [],
  stats: apiStats,
  statusFilter,
  onStatusFilterChange,
  pendingRequestsCount = 0,
}) => {
  const navigate = useNavigate();

  const stats = {
    total: apiStats?.total_internships || 0,
    pending: getStatusTotal(apiStats, ['Pendiente']),
    inReview: getStatusTotal(apiStats, ['En revisión', 'En revisión DIRAE']),
    approved: getStatusTotal(apiStats, ['Aprobada']),
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Solicitudes totales" 
          value={stats.total} 
          Icon={StatCard.Icon || Users} 
          variant="default"
        />
        <StatCard 
          label="Solicitudes pendientes" 
          value={stats.pending} 
          Icon={StatCard.Icon || Clock} 
          variant="alert"
        />
        <StatCard 
          label="Solicitudes en revisión" 
          value={stats.inReview} 
          Icon={StatCard.Icon || AlertCircle} 
          variant="progress"
        />
        <StatCard 
          label="Solicitudes aprobadas" 
          value={stats.approved} 
          Icon={StatCard.Icon || CheckCircle} 
          variant="success"
        />
       </div>
       
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => document.getElementById('management-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-center gap-6 text-left group"
        >
          <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:bg-[#B5305F] transition-colors">
            <FileText className="w-7 h-7 text-[#B5305F] group-hover:text-white transition-colors" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Gestión de solicitudes de práctica</h3>
            <p className="text-sm text-gray-400">Administra solicitudes y sus estados administrativos</p>
          </div>
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/entrevistas')}
          className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-center gap-6 text-left group relative"
        >
          {pendingRequestsCount > 0 && (
            <span className="absolute top-4 right-4 min-w-[22px] h-[22px] px-1.5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-white text-[11px] font-bold leading-none shadow-md">
              {pendingRequestsCount}
            </span>
          )}
          <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:bg-[#B5305F] transition-colors">
            <Calendar className="w-7 h-7 text-[#B5305F] group-hover:text-white transition-colors" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Agenda y Consultas</h3>
            <p className="text-sm text-gray-400">Revisa solicitudes de estudiantes, agenda citas directas y califica presentaciones</p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/cartas-presentacion')}
          className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-center gap-6 text-left group"
        >
          <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:bg-[#B5305F] transition-colors">
            <Mail className="w-7 h-7 text-[#B5305F] group-hover:text-white transition-colors" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Cartas de Presentación</h3>
            <p className="text-sm text-gray-400">Administra plantillas por tipo de práctica</p>
          </div>
        </motion.button>
      </div>
       
       <div id="management-section">
         <Management
           students={students}
           statusFilter={statusFilter}
           onStatusFilterChange={onStatusFilterChange}
         />
       </div>
    </div>
  );
};

export default Dashboard;

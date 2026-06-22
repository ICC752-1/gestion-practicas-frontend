import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StatCard } from '../coordinador/StatCard';
import Management from './Management';
import { useAuth } from '../../context/useAuth'; // Importamos el hook de autenticación
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
}) => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Extraemos el usuario para obtener su nombre

  // Construimos el nombre completo de forma segura
  const userName = user 
    ? `${user.first_name} ${user.last_name}`
    : "Coordinador/a";

  const stats = {
    total: apiStats?.total_internships || 0,
    pending: getStatusTotal(apiStats, ['Pendiente']),
    inReview: getStatusTotal(apiStats, ['En revisión', 'En revisión DIRAE']),
    approved: getStatusTotal(apiStats, ['Aprobada']),
  };

  return (
    <div className="pt-0 px-6 pb-6 space-y-6 w-full">
      
      {/* Title Section / Bienvenida */}
      <section className="animate-fade-in pl-2">
        <h2 className="text-[#d22864] font-bold text-3xl mb-1 tracking-tight">
          Panel de Control
        </h2>
        <p className="text-gray-500 text-lg font-medium tracking-tight">
          Bienvenido/a, <span className="font-semibold text-gray-700">{userName}</span> 👋
        </p>
      </section>

      {/* Grid de Métricas / StatCards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Solicitudes totales" 
          value={stats.total} 
          Icon={Users} 
          variant="default"
        />
        <StatCard 
          label="Solicitudes pendientes" 
          value={stats.pending} 
          Icon={Clock} 
          variant="alert"
        />
        <StatCard 
          label="Solicitudes en revisión" 
          value={stats.inReview} 
          Icon={AlertCircle} 
          variant="progress"
        />
        <StatCard 
          label="Solicitudes aprobadas" 
          value={stats.approved} 
          Icon={CheckCircle} 
          variant="success"
        />
      </div>
       
      {/* Botones de Gestión de Accesos Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-center gap-6 text-left group"
        >
          <div className="w-16 h-14 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:bg-[#B5305F] transition-colors flex-shrink-0">
            <FileText className="w-6 h-6 text-[#B5305F] group-hover:text-white transition-colors" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 leading-tight">Gestión de solicitudes de práctica</h3>
            <p className="text-sm text-gray-400 mt-0.5">Administra solicitudes y sus estados administrativos</p>
          </div>
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/entrevistas')}
          className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-center gap-6 text-left group"
        >
          <div className="w-16 h-14 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:bg-[#B5305F] transition-colors flex-shrink-0">
            <Calendar className="w-6 h-6 text-[#B5305F] group-hover:text-white transition-colors" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 leading-tight">Configurar Horarios</h3>
            <p className="text-sm text-gray-400 mt-0.5">Gestiona tus horarios disponibles para las entrevistas</p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/cartas-presentacion')}
          className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-center gap-6 text-left group"
        >
          <div className="w-16 h-14 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:bg-[#B5305F] transition-colors flex-shrink-0">
            <Mail className="w-6 h-6 text-[#B5305F] group-hover:text-white transition-colors" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 leading-tight">Cartas de Presentación</h3>
            <p className="text-sm text-gray-400 mt-0.5">Administra plantillas por tipo de práctica</p>
          </div>
        </motion.button>
      </div>
       
      {/* Sección de la Tabla */}
      <Management
        students={students}
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
      />
    </div>
  );
};

export default Dashboard;
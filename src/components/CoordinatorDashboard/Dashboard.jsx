import { motion } from 'framer-motion';
import { StatCard } from '../coordinador/StatCard';
import Management from './Management';
import { useAuth } from '../../context/useAuth';
import { Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const getStatusTotal = (stats, titles) => {
  return (stats?.internships_by_status || [])
    .filter((item) => titles.includes(item.status))
    .reduce((total, item) => total + item.total, 0);
};

const getEntryMotion = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  ...(delay > 0 ? { transition: { delay } } : {}),
});

const Dashboard = ({
  students = [],
  stats: apiStats,
  statusFilter,
  onStatusFilterChange,
}) => {

  const { user } = useAuth(); // Extraemos el usuario para obtener su nombre

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
      <motion.section
        className="pl-2"
        {...getEntryMotion()}
      >
        <h2 className="text-[#d22864] font-bold text-3xl mb-1 tracking-tight">
          Panel de Control
        </h2>
        <p className="text-gray-500 text-lg font-medium tracking-tight">
          Bienvenido/a, <span className="font-semibold text-gray-700">{userName}</span> 👋
        </p>
      </motion.section>

      {/* Grid de Métricas / StatCards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {[
          {
            label: 'Solicitudes totales',
            value: stats.total,
            Icon: StatCard.Icon || Users,
            variant: 'default',
          },
          {
            label: 'Solicitudes pendientes',
            value: stats.pending,
            Icon: StatCard.Icon || Clock,
            variant: 'alert',
          },
          {
            label: 'Solicitudes en revisión',
            value: stats.inReview,
            Icon: StatCard.Icon || AlertCircle,
            variant: 'progress',
          },
          {
            label: 'Solicitudes aprobadas',
            value: stats.approved,
            Icon: StatCard.Icon || CheckCircle,
            variant: 'success',
          },
        ].map((card, index) => (
          <motion.div
            key={card.label}
            {...getEntryMotion(0.08 + index * 0.06)}
          >
            <StatCard {...card} />
          </motion.div>
        ))}
       </div>
    
      {/* Sección de la Tabla envuelta con el id correspondiente para el scroll automático */}
      <motion.div
        id="management-section"
        {...getEntryMotion(0.36)}
      >

        <Management
          students={students}
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
        />
      </motion.div>
    </div>
  );
};

export default Dashboard;

import { StatCard } from '../coordinador/StatCard';
import Management from './Management';
import { useAuth } from '../../context/useAuth';
import { Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';

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
    
      {/* Sección de la Tabla envuelta con el id correspondiente para el scroll automático */}
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

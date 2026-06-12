import { UserHeader } from "../../components/Header/UserHeader";
import { Footer } from "../../components/Footer/Footer";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { getInternshipStatus } from "../../constants/internshipStatus";
import { useInternships } from "../../context/useInternships";
import {
  Building2,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  Loader2,
  RefreshCw,
  InboxIcon,
  Briefcase,
} from 'lucide-react';

// --- Constants ---
const STATUS_ICONS = {
  clock: Clock,
  approved: CheckCircle2,
  rejected: AlertCircle,
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-CL', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

// --- Practice Card ---
const PracticeSummaryCard = ({ internship, index }) => {
  const navigate = useNavigate();
  const statusId = internship.status_id;
  const statusStyle = getInternshipStatus(statusId);
  const StatusIcon = STATUS_ICONS[statusStyle.icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500 cursor-pointer group"
      onClick={() => navigate(`/seguimiento/${internship.id}`)}
    >
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div className="space-y-1 flex-1 min-w-0">
            <h3 className="text-xl font-black text-gray-900 tracking-tight truncate">
              {internship.internship_type}
            </h3>
            <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
              <Calendar size={14} />
              <span>{formatDate(internship.start_date)} — {formatDate(internship.end_date)}</span>
            </div>
          </div>
          <div className={`${statusStyle.color} text-white px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold shadow-lg flex-shrink-0`}>
            <StatusIcon size={16} />
            {statusStyle.label}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 bg-gray-50/80 p-3 rounded-2xl border border-gray-100/50">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#d22864] shadow-sm flex-shrink-0">
              <Building2 size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Empresa</p>
              <p className="text-sm font-bold text-gray-800 truncate">{internship.org_name || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-gray-50/80 p-3 rounded-2xl border border-gray-100/50">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#d22864] shadow-sm flex-shrink-0">
              <User size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Supervisor/a</p>
              <p className="text-sm font-bold text-gray-800 truncate">{internship.supervisor_name || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-gray-50/80 p-3 rounded-2xl border border-gray-100/50">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#d22864] shadow-sm flex-shrink-0">
              <Briefcase size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Modalidad</p>
              <p className="text-sm font-bold text-gray-800 truncate">{internship.modality || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-gray-50/80 p-3 rounded-2xl border border-gray-100/50">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#d22864] shadow-sm flex-shrink-0">
              <Clock size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Horario</p>
              <p className="text-sm font-bold text-gray-800 truncate">{internship.schedule || '-'}</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-end text-[#d22864] font-bold text-sm group-hover:gap-3 gap-2 transition-all">
          Ver detalle completo
          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
};

// --- Main ---
export const SeguimientoListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { internships, loading, error, refreshInternships } = useInternships();

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <UserHeader />

      <main className="max-w-5xl mx-auto w-full py-12 px-6 flex-grow">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h2 className="text-[#d22864] text-2xl md:text-3xl font-bold tracking-tight">
            Seguimiento de Prácticas
          </h2>
          <p className="text-gray-400 font-medium mt-1">
            {user?.first_name} {user?.last_name} — {internships.length} práctica{internships.length !== 1 ? 's' : ''}
          </p>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#d22864]" size={48} />
            <p className="text-gray-400 mt-4">Cargando tus prácticas...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 bg-red-50 rounded-3xl p-8">
            <AlertCircle className="text-red-500" size={48} />
            <p className="mt-4 text-red-600 font-medium text-center">{error}</p>
            <button
              onClick={() => refreshInternships()}
              className="mt-4 flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition-colors"
            >
              <RefreshCw size={18} />
              Reintentar
            </button>
          </div>
        ) : internships.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl p-8">
            <InboxIcon className="text-gray-300" size={48} />
            <p className="mt-4 text-gray-500 font-medium text-center">No tienes prácticas inscritas</p>
            <button
              onClick={() => navigate('/inscripcion')}
              className="mt-4 bg-[#d22864] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#b01e52] transition-colors"
            >
              Inscribirte ahora
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {internships.map((internship, index) => (
              <PracticeSummaryCard
                key={internship.id}
                internship={internship}
                index={index}
              />
            ))}
          </div>
        )}

        {/* Back */}
        <div className="flex justify-center mt-12 mb-20">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-[#d22864] text-white px-10 py-3 rounded-full font-bold hover:opacity-90 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
          >
            Volver al Dashboard
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SeguimientoListPage;
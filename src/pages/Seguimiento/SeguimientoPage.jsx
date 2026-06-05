import { UserHeader } from "../../components/Header/UserHeader";
import { Footer } from "../../components/Footer/Footer";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { internshipService } from "../../services/internshipService";
import { useState, useEffect } from "react";
import {
  UserCheck,
  FileEdit,
  FileCheck,
  Briefcase,
  Calendar,
  Video,
  CheckCircle2,
  Clock,
  Eye,
  XCircle,
  RefreshCw,
  InboxIcon
} from 'lucide-react';

const TimelineItem = ({ step, index, isLast }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex gap-6 relative"
    >
      {/* Line connecting items */}
      {!isLast && (
        <div className="absolute left-[19.5px] top-10 w-[2px] h-[calc(100%-24px)] bg-brand-medium" />
      )}

      {/* Circle / Icon */}
      <div className="flex flex-col items-center z-10">
        {step.isMajor ? (
          <div className="w-10 h-10 rounded-full border-2 border-brand-medium bg-white flex items-center justify-center text-brand-medium shadow-sm">
            {step.icon}
          </div>
        ) : (
          <div className="w-10 flex justify-center">
            <div className="w-5 h-5 rounded-full border-2 border-brand-medium bg-brand-medium/5" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 pb-10 ${step.isMajor ? 'pt-2' : 'pt-0.5'}`}>
        <h3 className={`font-semibold text-gray-800 ${step.isMajor ? 'text-base md:text-lg' : 'text-sm md:text-base italic'}`}>
          {step.title}
        </h3>
        {step.subtitle && (
          <p className="text-gray-400 text-xs md:text-sm mt-0.5">
            {step.subtitle}
          </p>
        )}
        {step.actor && (
          <p className="text-gray-400 text-xs md:text-sm mt-0.5">
            Por: {step.actor}
          </p>
        )}
        {step.date && (
          <p className="text-gray-400 text-xs md:text-sm mt-0.5">
            {step.date}
          </p>
        )}
      </div>
    </motion.div>
  );
};

const getStatusIcon = (statusTitle) => {
  const title = (statusTitle || '').toLowerCase();
  if (title.includes('aprobad') || title.includes('completad') || title.includes('aprobado')) {
    return <CheckCircle2 className="w-6 h-6" />;
  }
  if (title.includes('rechazad') || title.includes('rechazado')) {
    return <XCircle className="w-6 h-6" />;
  }
  if (title.includes('revisión') || title.includes('revision') || title.includes('revis')) {
    return <Eye className="w-6 h-6" />;
  }
  return <Clock className="w-6 h-6" />;
};

export const SeguimientoPage = () => {
  const navigate = useNavigate();
  const { internshipId } = useParams();
  const { user } = useAuth();

  const [tracking, setTracking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await internshipService.getInternshipTracking(internshipId);
        setTracking(data);
      } catch (err) {
        setError(err.message || 'Error al cargar el seguimiento');
      } finally {
        setLoading(false);
      }
    };

    if (internshipId) {
      fetchTracking();
    }
  }, [internshipId]);

  const timelineItems = tracking.map((entry) => ({
    id: entry.id,
    title: entry.new_status?.title || 'Cambio de estado',
    subtitle: entry.reason,
    isCompleted: true,
    isMajor: true,
    icon: getStatusIcon(entry.new_status?.title),
    actor: entry.actor ? `${entry.actor.first_name} ${entry.actor.last_name}` : 'Sistema',
    date: new Date(entry.changed_at).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }));

  const handleVolver = () => {
    navigate("/dashboard");
  };

  const handleRetry = () => {
    const fetchTracking = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await internshipService.getInternshipTracking(internshipId);
        setTracking(data);
      } catch (err) {
        setError(err.message || 'Error al cargar el seguimiento');
      } finally {
        setLoading(false);
      }
    };
    fetchTracking();
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <UserHeader />

      <main className="max-w-4xl mx-auto w-full py-12 px-6 flex-grow">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h2 className="text-brand-medium text-2xl md:text-3xl font-bold tracking-tight">
            Seguimiento de Práctica
          </h2>
          <p className="text-gray-400 font-medium mt-1">
            Estudiante: {user?.first_name || 'Usuario'}
          </p>
        </motion.div>

        {/* Timeline Container */}
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-16 mb-10 overflow-hidden relative border border-gray-100">
          <div className="max-w-xl mx-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-brand-medium border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 mt-4">Cargando seguimiento...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="text-red-500 mb-4">
                  <XCircle className="w-12 h-12" />
                </div>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 bg-brand-medium text-white px-6 py-2 rounded-full font-medium hover:bg-opacity-90 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reintentar
                </button>
              </div>
            ) : tracking.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="text-gray-300 mb-4">
                  <InboxIcon className="w-12 h-12" />
                </div>
                <p className="text-gray-500">No hay registros de seguimiento</p>
              </div>
            ) : (
              timelineItems.map((step, index) => (
                <TimelineItem
                  key={step.id}
                  step={step}
                  index={index}
                  isLast={index === timelineItems.length - 1}
                />
              ))
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center mb-20">
          <button
            onClick={handleVolver}
            className="bg-brand-medium text-white px-10 py-3 rounded-full font-bold hover:bg-opacity-90 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
          >
            Volver
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SeguimientoPage;
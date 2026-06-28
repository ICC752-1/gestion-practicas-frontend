import { UserHeader } from "../../components/Header/UserHeader";
import { Footer } from "../../components/Footer/Footer";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { internshipService } from "../../services/internshipService";
import { canUploadDocuments, documentService } from "../../services/documentService";
import { getInternshipAdministrativeProgress } from "../../constants/internshipProgress";
import { formatBenefitLabels } from "../../constants/benefits";
import { useCallback, useState, useEffect } from "react";
import { DocumentList } from "../../components/StudentDashboard/DocumentList";
import { DocumentUploadModal } from "../../components/StudentDashboard/DocumentUploadModal";
import { StudentRequestActions } from "../../components/StudentDashboard/StudentRequestActions";
import {
  Building2,
  User,
  Calendar,
  Clock,
  MapPin,
  Briefcase,
  Mail,
  Phone,
  CheckCircle2,
  Eye,
  XCircle,
  RefreshCw,
  InboxIcon,
  FileText,
  Shield,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const STATUS_LABELS = {
  1: 'Pendiente',
  2: 'En revisión DIRAE',
  3: 'En revisión',
  4: 'Solicitud Aprobada',
  5: 'Solicitud Rechazada'
};

const STATUS_STYLES = {
  cancelled: { color: 'bg-gray-500', text: 'text-gray-500', border: 'border-gray-200', bg: 'bg-gray-50' },
  final_passed: { color: 'bg-green-600', text: 'text-green-700', border: 'border-green-200', bg: 'bg-green-50' },
  final_failed: { color: 'bg-red-600', text: 'text-red-700', border: 'border-red-200', bg: 'bg-red-50' },
  in_progress: { color: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-200', bg: 'bg-blue-50' },
  1: { color: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-200', bg: 'bg-amber-50' },
  2: { color: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-200', bg: 'bg-purple-50' },
  3: { color: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-200', bg: 'bg-blue-50' },
  4: { color: 'bg-green-500', text: 'text-green-500', border: 'border-green-200', bg: 'bg-green-50' },
  5: { color: 'bg-red-500', text: 'text-red-500', border: 'border-red-200', bg: 'bg-red-50' },
};

const getStatusDisplay = (internship) => {
  if (internship?.is_cancelled) return { key: 'cancelled', label: 'Anulada' };
  if (internship?.completion_status === 'finalized') {
    if (internship?.final_result === 'failed') return { key: 'final_failed', label: 'Finalizada reprobada' };
    if (internship?.final_result === 'passed') return { key: 'final_passed', label: 'Finalizada aprobada' };
  }
  if (internship?.completion_status && internship.completion_status !== 'not_started') {
    return { key: 'in_progress', label: 'En ejecución' };
  }
  const key = internship?.status_id;
  return { key, label: STATUS_LABELS[key] || 'Desconocido' };
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-CL', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

const HISTORY_ACTION_TITLES = {
  admin_update: 'Corrección administrativa',
  cancel: 'Solicitud anulada',
  student_cancel: 'Solicitud anulada',
  student_update: 'Solicitud corregida',
};

const HISTORY_EVENT_TITLES = {
  internship_created: 'Solicitud registrada',
};

const HISTORY_DEFAULT_SUBTITLES = {
  admin_update: 'Corrección registrada por administración',
  internship_created: 'Creación inicial de solicitud de práctica',
  student_cancel: 'Anulación solicitada por el estudiante',
  student_update: 'Corrección enviada por el estudiante',
};

const getHistoryMetadata = (entry) => entry.metadata || entry.metadata_json || {};

const buildHistoryTitle = (entry) => {
  const metadata = getHistoryMetadata(entry);
  if (metadata.action && HISTORY_ACTION_TITLES[metadata.action]) return HISTORY_ACTION_TITLES[metadata.action];
  if (metadata.event && HISTORY_EVENT_TITLES[metadata.event]) return HISTORY_EVENT_TITLES[metadata.event];
  return entry.new_status?.title || 'Cambio de estado';
};

const buildHistorySubtitle = (entry) => {
  const metadata = getHistoryMetadata(entry);
  const reason = entry.reason?.trim();
  if (metadata.event) return reason || HISTORY_DEFAULT_SUBTITLES[metadata.event] || null;
  if (reason && metadata.action) return `Motivo: ${reason}`;
  if (reason) return reason;
  return HISTORY_DEFAULT_SUBTITLES[metadata.action] || null;
};

const getTimelineItemStyles = (status) => {
  switch (status) {
    case 'completed':
      return { border: 'border-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50', line: 'bg-emerald-500' };
    case 'current':
      return { border: 'border-blue-500', text: 'text-blue-600', bg: 'bg-blue-50 ring-4 ring-blue-100 animate-pulse', line: 'bg-blue-500' };
    case 'blocked':
      return { border: 'border-red-200', text: 'text-red-400', bg: 'bg-red-50', line: 'bg-red-200' };
    case 'pending':
    default:
      return { border: 'border-gray-200', text: 'text-gray-400', bg: 'bg-gray-50', line: 'bg-gray-200' };
  }
};

const TimelineItem = ({ step, index, isLast }) => {
  const styles = getTimelineItemStyles(step.status);
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex gap-6 relative items-start"
    >
      {!isLast && (
        <div className={`absolute left-[19.5px] top-10 w-[2px] h-[calc(100%-24px)] ${styles.line}`} />
      )}
      <div className="flex flex-col items-center z-10 flex-shrink-0 mt-0.5">
        <div className={`w-10 h-10 rounded-full border-2 ${styles.border} ${styles.bg} flex items-center justify-center ${styles.text} shadow-sm`}>
          {step.icon}
        </div>
      </div>
      <div className="flex-1 pb-10 pt-2 min-w-0">
        <h3 className={`font-semibold text-base md:text-lg leading-tight ${step.status === 'pending' || step.status === 'blocked' ? 'text-gray-400' : 'text-gray-800'}`}>
          {step.title}
        </h3>
        {step.subtitle && <p className="text-gray-400 text-xs md:text-sm mt-0.5">{step.subtitle}</p>}
        {step.actor && <p className="text-gray-400 text-xs md:text-sm mt-0.5">Por: {step.actor}</p>}
        {step.date && <p className="text-gray-400 text-xs md:text-sm mt-0.5">{step.date}</p>}
      </div>
    </motion.div>
  );
};

const getStatusIcon = (statusTitle) => {
  const title = (statusTitle || '').toLowerCase();
  if (title.includes('aprobad') || title.includes('completad')) return <CheckCircle2 className="w-5 h-5" />;
  if (title.includes('rechazad') || title.includes('anulad') || title.includes('reprobad')) return <XCircle className="w-5 h-5" />;
  if (title.includes('correcci') || title.includes('corregid') || title.includes('registrad')) return <FileText className="w-5 h-5" />;
  if (title.includes('revisión') || title.includes('revision') || title.includes('revis')) return <Eye className="w-5 h-5" />;
  return <Clock className="w-5 h-5" />;
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 bg-[#fff0f6] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon size={16} className="text-[#d22864]" />
    </div>
    <div>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</p>
      <p className="text-sm text-gray-800 font-semibold">{value || '-'}</p>
    </div>
  </div>
);

export const SeguimientoPage = () => {
  const navigate = useNavigate();
  const { internshipId } = useParams();
  const { user } = useAuth();

  const [internship, setInternship] = useState(null);
  const [tracking, setTracking] = useState([]);
  const [lifecycle, setLifecycle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOrgDetails, setShowOrgDetails] = useState(false);
  const [showSupervisorDetails, setShowSupervisorDetails] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [docsError, setDocsError] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [studentActions, setStudentActions] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setDocsError(null);
      const [internshipData, trackingData, lifecycleData, documentsData, actionData] = await Promise.all([
        internshipService.getInternshipById(internshipId),
        internshipService.getInternshipTracking(internshipId),
        internshipService.getInternshipLifecycle(internshipId).catch(() => null),
        documentService.getInternshipDocuments(internshipId),
        internshipService.getStudentActions(internshipId),
      ]);
      setInternship(internshipData);
      setTracking(trackingData);
      setLifecycle(lifecycleData);
      setDocuments(documentsData);
      setStudentActions(actionData);
    } catch (err) {
      const detail = err.response?.data?.detail;
      const message = typeof detail === 'string' ? detail : detail?.message || err.message || 'Error al cargar los datos';
      setError(message);
      setDocsError(message);
    } finally {
      setLoading(false);
    }
  }, [internshipId]);

  useEffect(() => {
    if (internshipId) fetchData();
  }, [fetchData, internshipId]);

  const timelineSource = lifecycle?.events?.length ? lifecycle.events : tracking;
  const timelineItems = timelineSource.map((entry) => {
    const isLifecycleEntry = Boolean(entry.type);
    const title = isLifecycleEntry ? entry.title : buildHistoryTitle(entry);
    const dateValue = entry.occurred_at || entry.changed_at;
    return {
      id: entry.id,
      title,
      subtitle: isLifecycleEntry ? entry.description : buildHistorySubtitle(entry),
      isMajor: true,
      icon: getStatusIcon(title),
      actor: entry.actor ? `${entry.actor.first_name} ${entry.actor.last_name}` : null,
      date: dateValue ? new Date(dateValue).toLocaleDateString('es-CL', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      }) : null,
      status: isLifecycleEntry ? entry.status : 'completed',
    };
  });

  let currentStatus;
  let currentStatusLabel;

  if (internship?.is_cancelled) {
    currentStatus = 'cancelled';
    currentStatusLabel = 'Anulada';
  } else if (lifecycle) {
    currentStatusLabel = lifecycle.current_step;
    if (lifecycle.progress_percentage >= 100) {
      currentStatus = internship?.final_result === 'failed' ? 'final_failed' : 'final_passed';
    } else if (lifecycle.progress_percentage > 35) {
      currentStatus = 'in_progress';
    } else {
      currentStatus = internship?.status_id || 1;
    }
  } else {
    const statusDisplay = getStatusDisplay(internship);
    currentStatus = statusDisplay.key;
    currentStatusLabel = statusDisplay.label;
  }

  const statusStyle = STATUS_STYLES[currentStatus] || STATUS_STYLES[1];
  const administrativeProgress = lifecycle
    ? { percentage: lifecycle.progress_percentage, label: lifecycle.current_step, color: lifecycle.progress_percentage >= 100 ? 'bg-green-500' : 'bg-[#d22864]' }
    : getInternshipAdministrativeProgress(internship);

  const fetchDocuments = async () => {
    try {
      setLoadingDocs(true);
      setDocsError(null);
      const data = await documentService.getInternshipDocuments(internshipId);
      setDocuments(data);
    } catch (err) {
      setDocsError('No se pudieron cargar los documentos. Intenta de nuevo.');
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      const blob = await documentService.downloadDocument(doc.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name || `${doc.document_type?.name || 'documento'}.${doc.extension || 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading document:", err);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este documento?")) return;
    try {
      await documentService.deleteDocument(docId);
      fetchDocuments();
    } catch (err) {
      console.error("Error deleting document:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <UserHeader />

      <main className="max-w-5xl mx-auto w-full py-10 px-6 flex-grow">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h2 className="text-[#d22864] text-2xl md:text-3xl font-bold tracking-tight">
            Seguimiento de Práctica
          </h2>
          <p className="text-gray-400 font-medium mt-1">
            Estudiante: {user?.first_name} {user?.last_name}
          </p>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#d22864] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 mt-4">Cargando información...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <XCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-gray-600 mb-4">{error}</p>
            <button onClick={fetchData} className="flex items-center gap-2 bg-[#d22864] text-white px-6 py-2 rounded-full font-medium hover:opacity-90 transition-all">
              <RefreshCw className="w-4 h-4" /> Reintentar
            </button>
          </div>
        ) : internship ? (
          <>
            {/* Status Banner */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-[2rem] p-6 mb-8 border ${statusStyle.border} ${statusStyle.bg}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full ${statusStyle.color} flex items-center justify-center text-white shadow-sm`}>
                    {currentStatusLabel.toLowerCase().includes('finalizad') || currentStatusLabel.toLowerCase().includes('aprobad') ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      getStatusIcon(currentStatusLabel)
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-0.5">Estado actual</p>
                    <p className={`text-xl font-bold ${statusStyle.text}`}>{currentStatusLabel}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-0.5">Tipo</p>
                  <p className="text-sm font-bold text-gray-800">{internship.internship_type}</p>
                </div>
              </div>
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between gap-4 text-xs font-bold text-gray-600">
                  <span>{lifecycle ? 'Avance de práctica' : administrativeProgress.label}</span>
                  <span className={administrativeProgress.percentage === 100 ? "text-green-600" : "text-gray-600"}>
                    {administrativeProgress.percentage}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-200/70">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${administrativeProgress.percentage === 100 ? 'bg-green-500' : administrativeProgress.color}`}
                    style={{ width: `${administrativeProgress.percentage}%` }}
                  />
                </div>
                {lifecycle && (
                  <p className="mt-2 text-xs font-semibold text-gray-400 italic">
                    {administrativeProgress.percentage === 100 ? "Proceso completado con éxito" : administrativeProgress.label}
                  </p>
                )}
              </div>
            </motion.div>

            {/* ✅ Student Request Actions — corregir o anular solicitud */}
            <StudentRequestActions
              internship={internship}
              actions={studentActions}
              onUpdated={fetchData}
            />

            {/* Practice Details */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 mb-8 border border-gray-100"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Briefcase size={20} className="text-[#d22864]" />
                Detalle de la Práctica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoRow icon={Calendar} label="Fecha de inicio" value={formatDate(internship.start_date)} />
                <InfoRow icon={Calendar} label="Fecha de término" value={formatDate(internship.end_date)} />
                <InfoRow icon={Clock} label="Horario" value={internship.schedule} />
                <InfoRow icon={Calendar} label="Días" value={internship.days} />
                <InfoRow icon={Briefcase} label="Modalidad" value={internship.modality} />
                <InfoRow icon={MapPin} label="Dirección práctica" value={internship.internship_address} />
                <InfoRow icon={Shield} label="Período" value={internship.internship_period} />
                <InfoRow icon={FileText} label="Seguro escolar" value={internship.has_school_insurance ? 'Sí' : 'No'} />
              </div>
              {internship.act_description && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-2">Actividades</p>
                  <p className="text-sm text-gray-700">{internship.act_description}</p>
                </div>
              )}
              {(internship.ben_description || internship.amount > 0) && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-6">
                  {internship.ben_description && (
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Beneficios</p>
                      <p className="text-sm text-gray-700">{formatBenefitLabels(internship.ben_description)}</p>
                    </div>
                  )}
                  {internship.amount > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Apoyo económico</p>
                      <p className="text-sm font-bold text-[#d22864]">${internship.amount?.toLocaleString('es-CL')}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Organization */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8 border border-gray-100 overflow-hidden"
            >
              <button
                onClick={() => setShowOrgDetails(!showOrgDetails)}
                className="w-full p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Building2 size={20} className="text-[#d22864]" />
                  Organización
                </h3>
                {showOrgDetails ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
              </button>
              {showOrgDetails && (
                <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InfoRow icon={Building2} label="Nombre" value={internship.org_name} />
                    <InfoRow icon={Briefcase} label="Sector" value={internship.sector} />
                    <InfoRow icon={MapPin} label="Dirección" value={internship.address} />
                    <InfoRow icon={MapPin} label="Ciudad" value={internship.city} />
                    <InfoRow icon={Phone} label="Teléfono" value={internship.org_phone} />
                    <InfoRow icon={FileText} label="Sitio web" value={internship.web} />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Supervisor */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8 border border-gray-100 overflow-hidden"
            >
              <button
                onClick={() => setShowSupervisorDetails(!showSupervisorDetails)}
                className="w-full p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <User size={20} className="text-[#d22864]" />
                  Supervisor/a
                </h3>
                {showSupervisorDetails ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
              </button>
              {showSupervisorDetails && (
                <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InfoRow icon={User} label="Nombre" value={internship.supervisor_name} />
                    <InfoRow icon={Briefcase} label="Profesión" value={internship.supervisor_profession} />
                    <InfoRow icon={Briefcase} label="Cargo" value={internship.supervisor_position} />
                    <InfoRow icon={Building2} label="Departamento" value={internship.supervisor_department} />
                    <InfoRow icon={Mail} label="Email" value={internship.supervisor_email} />
                    <InfoRow icon={Phone} label="Teléfono" value={internship.supervisor_phone} />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Documents */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 mb-8 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FileText size={20} className="text-[#d22864]" />
                  Documentos de la Práctica
                </h3>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  disabled={!canUploadDocuments(internship)}
                  className={`px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${
                    !canUploadDocuments(internship)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-[#d22864] text-white hover:bg-[#b01e52]'
                  }`}
                >
                  <FileText size={16} />
                  Subir nuevo
                </button>
              </div>
              <DocumentList
                documents={documents}
                loading={loadingDocs}
                error={docsError}
                onDownload={handleDownload}
                onDelete={handleDelete}
                canDelete={true}
              />
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-12 mb-10 border border-gray-100"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-2">
                <Clock size={20} className="text-[#d22864]" />
                Historial de Seguimiento
              </h3>
              {timelineItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <InboxIcon className="w-12 h-12 text-gray-300 mb-4" />
                  <p className="text-gray-500">No hay registros de seguimiento aún</p>
                </div>
              ) : (
                <div className="max-w-xl">
                  {timelineItems.map((step, index) => (
                    <TimelineItem
                      key={step.id}
                      step={step}
                      index={index}
                      isLast={index === timelineItems.length - 1}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <InboxIcon className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500">No se encontró la práctica</p>
          </div>
        )}

        {/* Back Button */}
        <div className="flex justify-center mt-6 mb-5">
          <button
            onClick={() => navigate("/seguimiento")}
            className="bg-[#d22864] text-white px-10 py-3 rounded-full font-bold hover:opacity-90 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
          >
            Volver a mis prácticas
          </button>
        </div>
      </main>

      <Footer />

      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        internships={internship ? [internship] : []}
        onDocumentUploaded={fetchData}
      />
    </div>
  );
};

export default SeguimientoPage;
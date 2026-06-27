import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import {
  Plus,
  Play,
  Upload,
  CheckCircle2,
  Clock,
  ClipboardCheck,
  Calendar,
  Building2,
  FileText,
  User,
  AlertCircle,
  Loader2,
  RefreshCw,
  MapPin,
  Briefcase,
  Shield,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserHeader } from "../../components/Header/UserHeader";
import { Footer } from "../../components/Footer/Footer";
import { useAuth } from "../../context/useAuth";
import { internshipService } from "../../services/internshipService";
import { schedulingService } from "../../services/schedulingService";
import { DocumentUploadModal } from "../../components/StudentDashboard/DocumentUploadModal";
import { canUploadDocuments, documentService } from "../../services/documentService";
import { dataPortabilityService } from "../../services/dataPortabilityService";
import {
  getInternshipAdministrativeProgress,
  getOverallInternshipProgress,
} from "../../constants/internshipProgress";
import { useToast } from "../../context/useToast";
import { useNotifications } from "../../hooks/useNotifications";

// --- Constants ---
const STATUS_LABELS = {
  1: 'Pendiente',
  2: 'En revisión DIRAE',
  3: 'En revisión',
  4: 'Solicitud Aprobada',
  5: 'Solicitud Rechazada'
};

const STATUS_STYLES = {
  cancelled: { color: 'bg-gray-500', text: 'text-gray-600', border: 'border-gray-200', bg: 'bg-gray-50', icon: <AlertCircle size={16} /> },
  final_passed: { color: 'bg-green-600', text: 'text-green-700', border: 'border-green-200', bg: 'bg-green-50', icon: <CheckCircle2 size={16} /> },
  final_failed: { color: 'bg-red-600', text: 'text-red-700', border: 'border-red-200', bg: 'bg-red-50', icon: <AlertCircle size={16} /> },
  in_progress: { color: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200', bg: 'bg-blue-50', icon: <Play size={16} /> },
  1: { color: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-200', bg: 'bg-amber-50', icon: <Clock size={16} /> },
  2: { color: 'bg-purple-500', text: 'text-purple-600', border: 'border-purple-200', bg: 'bg-purple-50', icon: <AlertCircle size={16} /> },
  3: { color: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200', bg: 'bg-blue-50', icon: <Clock size={16} /> },
  4: { color: 'bg-green-500', text: 'text-green-600', border: 'border-green-200', bg: 'bg-green-50', icon: <CheckCircle2 size={16} /> },
  5: { color: 'bg-red-500', text: 'text-red-600', border: 'border-red-200', bg: 'bg-red-50', icon: <AlertCircle size={16} /> },
};

const getStatusDisplay = (internship) => {
  if (internship?.is_cancelled) {
    return { key: 'cancelled', label: 'Anulada' };
  }

  if (internship?.completion_status === 'finalized') {
    if (internship?.final_result === 'failed') {
      return { key: 'final_failed', label: 'Finalizada reprobada' };
    }

    if (internship?.final_result === 'passed') {
      return { key: 'final_passed', label: 'Finalizada aprobada' };
    }
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
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const normalizeText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const findSlidesDocumentType = (documentTypes) => {
  const normalizedTarget = 'diapositivas de presentacion';
  return documentTypes.find((type) => normalizeText(type.name) === normalizedTarget)
    || documentTypes.find((type) => {
      const name = normalizeText(type.name);
      return name.includes('diapositiva') || name.includes('presentacion');
    });
};

const getUploadErrorMessage = (error) => {
  const detail = error?.response?.data?.detail;
  const translations = {
    'Document type not found': 'No se encontró el tipo de documento.',
    'Insufficient permissions': 'No tienes permisos para subir este documento.',
    'Cannot upload documents for an internship in terminal state: Aprobada':
      'No se pudo subir el archivo porque la práctica está aprobada y el tipo documental no permite nuevas cargas.',
    'Cannot upload documents for an internship in terminal state: Rechazada':
      'No se pueden subir documentos para una práctica rechazada.',
    'Cannot upload documents for an internship in terminal state: Reprobada':
      'No se pueden subir documentos para una práctica reprobada.',
  };

  if (typeof detail === 'string') {
    return translations[detail] || detail;
  }

  return detail?.message || error.message || 'No se pudo subir.';
};

const PRE_REGISTRATION_PATH = '/practicas/nueva/preinscripcion';
const SELF_EVALUATION_ENABLED_STATUSES = new Set([
  'pending_evaluations',
  'pending_presentation',
  'finalized',
]);
const SELF_EVALUATION_BUSINESS_DAYS_BEFORE_END = 5;

const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const businessWindowStart = (endDateStr, businessDays) => {
  const cursor = parseLocalDate(endDateStr);
  if (!cursor) return null;

  let remaining = businessDays;
  while (remaining > 0) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) {
      remaining -= 1;
      if (remaining === 0) {
        return cursor;
      }
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return cursor;
};

const isSelfEvaluationAvailable = (internship) => {
  if (!internship || internship.is_cancelled) return false;
  if (SELF_EVALUATION_ENABLED_STATUSES.has(internship.completion_status)) return true;
  if (internship.status_id !== 4) return false;

  const start = businessWindowStart(
    internship.end_date,
    SELF_EVALUATION_BUSINESS_DAYS_BEFORE_END,
  );
  if (!start) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today >= start;
};

// --- Sub-components ---

const StatusBadge = ({ internship }) => {
  const { key: statusKey, label } = getStatusDisplay(internship);
  const style = STATUS_STYLES[statusKey] || STATUS_STYLES[1];

  return (
    <div className={`${style.color} text-white px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold shadow-lg`}>
      {style.icon}
      {label}
    </div>
  );
};

const DetailChip = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
    <Icon size={14} className="text-[#d22864] flex-shrink-0" />
    <div className="min-w-0">
      <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400 leading-none">{label}</p>
      <p className="text-xs font-bold text-gray-800 truncate">{value || '-'}</p>
    </div>
  </div>
);

const PracticeCard = ({ internship, lifecycle }) => {
  const navigate = useNavigate();
  const progress = lifecycle
    ? {
        percentage: lifecycle.progress_percentage,
        label: lifecycle.current_step,
        color: lifecycle.progress_percentage >= 100 ? 'bg-green-500' : 'bg-[#d22864]',
      }
    : getInternshipAdministrativeProgress(internship);
  const canSelfEvaluate = isSelfEvaluationAvailable(internship);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#fff0f6] to-white p-6 pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="space-y-1 flex-1 min-w-0">
            <h3 className="text-xl font-black text-gray-900 tracking-tight truncate">
              {internship.internship_type}
            </h3>
            <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
              <Calendar size={14} />
              <span>{formatDate(internship.start_date)} — {formatDate(internship.end_date)}</span>
            </div>
          </div>
          <StatusBadge internship={internship} />
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-4 space-y-4">
        {/* Org + Supervisor row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        </div>

        {/* Chips row */}
        <div className="flex flex-wrap gap-2">
          <DetailChip icon={Briefcase} label="Modalidad" value={internship.modality} />
          <DetailChip icon={Shield} label="Período" value={internship.internship_period} />
          <DetailChip icon={Clock} label="Horario" value={internship.schedule} />
          <DetailChip icon={MapPin} label="Ubicación" value={internship.internship_address || internship.city} />
        </div>

        <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
          <div className="mb-2 flex items-center justify-between gap-4 text-xs font-bold">
            <span className="text-gray-600">{lifecycle ? 'Avance de práctica' : 'Avance administrativo'}</span>
            <span className="text-gray-500">{progress.percentage}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progress.color}`}
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">{progress.label}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-6 pt-2">
        <div className="grid grid-cols-1 gap-3">
          {lifecycle?.current_step === "Presentación final por agendar" ? (
            <button
              onClick={() => navigate(`/entrevistas?internshipId=${internship.id}&purpose=final_presentation`)}
              className="w-full py-3 rounded-2xl font-bold flex items-center justify-center gap-2 border border-[#d22864]/20 bg-[#fff0f6] text-[#d22864] hover:bg-[#ffe3ee] transition-all"
            >
              Agendar Presentación
              <Calendar size={18} />
            </button>
          ) : (
            <button
              onClick={() => navigate(`/autoevaluacion/${internship.id}`)}
              className={`w-full py-3 rounded-2xl font-bold flex items-center justify-center gap-2 border transition-all ${
                canSelfEvaluate
                  ? 'border-[#d22864]/20 bg-[#fff0f6] text-[#d22864] hover:bg-[#ffe3ee]'
                  : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              Autoevaluación
              <ClipboardCheck size={18} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const QuickAction = ({ icon: Icon, title, desc, onClick, primary, disabled, badge }) => (
  <motion.button
    whileHover={!disabled ? { y: -5, scale: 1.02 } : {}}
    onClick={!disabled ? onClick : undefined}
    className={`relative p-6 rounded-[2rem] text-left flex flex-col gap-4 transition-all duration-300 ${
      disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' :
      primary
        ? 'bg-[#d22864] text-white shadow-xl shadow-[#d22864]/20'
        : 'bg-white text-gray-900 shadow-lg shadow-gray-200/50 border border-gray-50 hover:border-[#d22864]/20'
    }`}
  >
    {badge ? (
      <span className="absolute top-4 right-4 min-w-[22px] h-[22px] px-1.5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-white text-[11px] font-bold leading-none shadow-md">
        {badge > 9 ? '9+' : badge}
      </span>
    ) : null}
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${primary && !disabled ? 'bg-white/20' : 'bg-[#d22864]/10 text-[#d22864]'}`}>
      <Icon size={24} />
    </div>
    <div>
      <h4 className="font-bold text-lg leading-tight">{title}</h4>
      <p className={`text-sm mt-1 ${primary && !disabled ? 'text-white/70' : 'text-gray-400'}`}>{desc}</p>
    </div>
  </motion.button>
);

// --- Main Component ---

export const StudentDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { notifications } = useNotifications(50, true);
  const [internships, setInternships] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [confirmingAppointmentId, setConfirmingAppointmentId] = useState(null);

  const fetchAppointments = async () => {
    try {
      const data = await schedulingService.getMyAppointments();
      // Filter scheduled final presentation appointments that are active
      const scheduledPresentations = data.filter(appt => 
        appt.purpose === 'final_presentation' && 
        appt.status === 'scheduled'
      );
      setAppointments(scheduledPresentations);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  const [lifecyclesById, setLifecyclesById] = useState({});
  const [generalConfig, setGeneralConfig] = useState({ general_consultations_enabled: false, active_coordinators: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [data, config] = await Promise.all([
        internshipService.getMyInternships(),
        schedulingService.getSchedulingConfig().catch(() => ({ general_consultations_enabled: false }))
      ]);
      
      setInternships(data);
      setGeneralConfig(config);

      const lifecycleEntries = await Promise.all(
        data.map(async (internship) => {
          try {
            const lifecycle = await internshipService.getInternshipLifecycle(internship.id);
            return [internship.id, lifecycle];
          } catch (error) {
            console.error('No se pudo cargar seguimiento de práctica:', error);
            return [internship.id, null];
          }
        })
      );
      setLifecyclesById(Object.fromEntries(lifecycleEntries));
    } catch (err) {
      setError(err.message || 'Error al cargar las prácticas');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUploaded = () => {
    // Podríamos recargar si mostramos lista de documentos en esta vista,
    // por ahora solo refrescamos la data general
    fetchInternships();
  };

  const handleDataPortabilityDownload = async () => {
    try {
      const { blob, filename } = await dataPortabilityService.downloadMyData({
        format: 'zip',
        includeDocuments: true,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showToast({
        type: 'success',
        title: 'Descarga iniciada',
        message: 'Se generó tu copia estructurada de datos y documentos.',
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'No se pudo generar la portabilidad',
        message: err?.response?.data?.detail || 'Intenta nuevamente.',
      });
    }
  };

  useEffect(() => {
    fetchInternships();
    fetchAppointments();
  }, []);

  const userName = user
    ? `${user.first_name} ${user.last_name}`
    : "Estudiante";
  const overallProgress = getOverallInternshipProgress(internships);

  const canUpload = internships.some(canUploadDocuments);

  const hasQualifyingInternship = internships.some(internship => {
    const lifecycle = lifecyclesById[internship.id];
    return !internship.is_cancelled &&
           internship.completion_status !== 'finalized' &&
           lifecycle?.self_evaluation_submitted &&
           lifecycle?.supervisor_evaluation_submitted;
  });

  const hasActiveCoordinators = Array.isArray(generalConfig?.active_coordinators)
    && generalConfig.active_coordinators.length > 0;

  const isSchedulingActionEnabled = hasActiveCoordinators || hasQualifyingInternship;

  const appointmentNotificationsCount = notifications.filter(
    (notification) => !notification.is_read && notification.event_type === 'appointment_scheduled'
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] font-sans selection:bg-[#d22864]/10 selection:text-[#d22864]">
      <UserHeader />

      <main className="flex-grow">
        {/* Welcome Section */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6"
            >
              <div>
                <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-none mb-3">
                  Hola, {userName} <span className="inline-block animate-bounce-slow">👋</span>
                </h2>
                <p className="text-gray-500 font-medium text-lg">
                  {internships.length > 0
                    ? `Tienes ${internships.length} práctica${internships.length > 1 ? 's' : ''} registrada${internships.length > 1 ? 's' : ''}.`
                    : 'No tienes prácticas inscritas aún.'}
                </p>
              </div>
              <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-black text-gray-400">Progreso total</p>
                    <p className="mt-1 text-sm font-bold text-gray-700">
                      {overallProgress.completedCount} de {overallProgress.requiredCount} prácticas aprobadas
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest font-black text-gray-400">Prácticas</p>
                    <span className="font-black text-3xl leading-none text-gray-900">{internships.length}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-[#d22864] transition-all duration-500"
                      style={{ width: `${overallProgress.percentage}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-sm font-black text-[#d22864]">
                    {overallProgress.percentage}%
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Solo las prácticas aprobadas o finalizadas aprobadas aportan al progreso total.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Practices List */}
            <div className="lg:col-span-2 space-y-8">
              {/* Active Appointments Widget */}
              {!loading && appointments.length > 0 && (
                <div className="space-y-4 mb-8">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    Presentaciones Agendadas
                    <span className="bg-[#fff0f6] text-[#d22864] text-[10px] px-2.5 py-1 rounded-md font-bold">{appointments.length} CITA(S)</span>
                  </h3>
                  {appointments.map((appt) => (
                    <div
                      key={appt.id}
                      className="bg-gradient-to-br from-white to-slate-50/50 rounded-[2rem] p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                    >
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="bg-[#d22864] text-white text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                            Presentación Final
                          </span>
                          {appt.is_confirmed ? (
                            <span className="text-emerald-700 bg-emerald-50 text-xs px-2.5 py-1 rounded-full border border-emerald-100 font-bold flex items-center gap-1">
                              <CheckCircle2 size={12} className="text-emerald-600" />
                              Asistencia Confirmada
                            </span>
                          ) : (
                            <span className="text-amber-700 bg-amber-50 text-xs px-2.5 py-1 rounded-full border border-amber-100 font-bold">
                              ⌛ Confirmación Pendiente
                            </span>
                          )}
                        </div>
                        <h4 className="text-lg font-black text-gray-900">
                          {appt.internship?.org_name || 'Mi Práctica'}
                        </h4>
                        <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                          <Calendar size={14} className="text-slate-400" />
                          <span>{formatDate(appt.date)} a las {appt.start_time?.substring(0, 5)} - {appt.end_time?.substring(0, 5)} hrs</span>
                        </p>
                        {appt.location && (
                          <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                            <MapPin size={14} className="text-slate-400" />
                            <span>Lugar/Enlace: <strong className="text-gray-700">{appt.location}</strong></span>
                          </p>
                        )}

                        {/* Diapositivas Info */}
                        <div className="pt-2">
                          {appt.document ? (
                            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 w-fit shadow-xs">
                              <FileText size={15} className="text-[#d22864] flex-shrink-0" />
                              <span className="text-xs font-semibold text-gray-700 max-w-[200px] truncate">{appt.document.name || 'Diapositivas'}</span>
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    const blob = await documentService.downloadDocument(appt.document.id);
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = appt.document.name || 'diapositivas.pptx';
                                    document.body.appendChild(a);
                                    a.click();
                                    window.URL.revokeObjectURL(url);
                                    document.body.removeChild(a);
                                  } catch (e) {
                                    showToast({ type: 'error', title: 'Error', message: 'No se pudo descargar.' });
                                  }
                                }}
                                className="text-gray-400 hover:text-[#d22864] transition p-1"
                                title="Descargar"
                              >
                                <Download size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-[#d22864] bg-[#d22864]/5 hover:bg-[#d22864]/10 border border-[#d22864]/20 rounded-xl px-3 py-2 transition shadow-xs">
                                <Upload size={13} />
                                <span>Subir Diapositivas</span>
                                <input
                                  type="file"
                                  accept=".ppt,.pptx,.pdf,.doc,.docx"
                                  className="sr-only"
                                  onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;
                                    try {
                                      const docTypes = await documentService.getDocumentTypes();
                                      const slidesType = findSlidesDocumentType(docTypes);
                                      if (!slidesType) throw new Error('No existe un tipo documental para diapositivas de presentación.');
                                      
                                      const uploadedDoc = await documentService.uploadDocument(appt.internship_id, slidesType.id, file);
                                      await schedulingService.updateAppointmentDocument(appt.id, uploadedDoc.id);
                                      showToast({ type: 'success', title: 'Éxito', message: 'Diapositivas vinculadas exitosamente.' });
                                      fetchAppointments();
                                    } catch (err) {
                                      showToast({ type: 'error', title: 'Error', message: getUploadErrorMessage(err) });
                                    }
                                  }}
                                />
                              </label>
                              <span className="text-[10px] text-gray-400 font-medium">Requerido para la presentación (PPT, PPTX o PDF)</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 items-end justify-center w-full md:w-auto">
                        {!appt.is_confirmed && (
                          <button
                            disabled={confirmingAppointmentId === appt.id}
                            onClick={async () => {
                              try {
                                setConfirmingAppointmentId(appt.id);
                                await schedulingService.confirmAppointment(appt.id);
                                showToast({ type: 'success', title: 'Asistencia confirmada', message: 'Has confirmado tu asistencia.' });
                                fetchAppointments();
                              } catch (err) {
                                showToast({ type: 'error', title: 'Error', message: 'No se pudo confirmar.' });
                              } finally {
                                setConfirmingAppointmentId(null);
                              }
                            }}
                            className="w-full md:w-auto flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl px-5 py-3 transition shadow-md shadow-emerald-600/10 active:scale-95 disabled:opacity-60"
                          >
                            {confirmingAppointmentId === appt.id ? (
                              <>
                                <RefreshCw size={13} className="animate-spin" />
                                Confirmando...
                              </>
                            ) : (
                              'Confirmar Asistencia'
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => navigate('/entrevistas')}
                          className="w-full md:w-auto text-xs font-bold text-gray-500 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 transition text-center"
                        >
                          Detalles en Agenda
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  Mis Prácticas
                  <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-1 rounded-md">{internships.length} TOTAL</span>
                </h3>
              </div>

              {loading && (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 size={48} className="text-[#d22864]" />
                  </motion.div>
                  <p className="mt-6 text-gray-500 font-bold uppercase tracking-widest text-sm">Cargando tus prácticas...</p>
                </div>
              )}

              {error && (
                <div className="flex flex-col items-center justify-center py-20 bg-red-50 rounded-[3rem] border border-red-100 px-6">
                  <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center text-red-500 mb-6 shadow-lg shadow-red-200/50">
                    <AlertCircle size={40} />
                  </div>
                  <h4 className="text-red-900 font-black text-xl mb-2 uppercase tracking-tight">¡Ups! Algo salió mal</h4>
                  <p className="text-red-600 text-center max-w-md font-medium mb-8">
                    {error}
                  </p>
                  <button
                    onClick={fetchInternships}
                    className="flex items-center gap-2 bg-red-500 text-white px-8 py-3 rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/30 active:scale-95"
                  >
                    <RefreshCw size={20} />
                    Intentar de nuevo
                  </button>
                </div>
              )}

              {!loading && !error && internships.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-200 px-10">
                  <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-300 mb-8 border border-gray-100">
                    <Briefcase size={48} />
                  </div>
                  <h4 className="text-gray-900 font-black text-2xl mb-3 uppercase tracking-tight text-center">No tienes prácticas registradas</h4>
                  <p className="text-gray-400 text-center max-w-sm font-medium mb-10 text-lg leading-relaxed">
                    Comienza inscribiendo tu práctica profesional para realizar el seguimiento.
                  </p>
                  <button
                    onClick={() => navigate(PRE_REGISTRATION_PATH)}
                    className="flex items-center gap-3 bg-[#d22864] text-white px-10 py-4 rounded-[1.5rem] font-bold shadow-2xl shadow-[#d22864]/30 hover:bg-[#b01e52] transition-all transform hover:-translate-y-1 active:scale-95"
                  >
                    <Plus size={24} />
                    Inscribir Nueva Práctica
                  </button>
                </div>
              )}

              {!loading && !error && internships.length > 0 && (
                <div className="space-y-6">
                  {internships.map((internship) => (
                    <PracticeCard
                      key={internship.id}
                      internship={internship}
                      lifecycle={lifecyclesById[internship.id]}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Side Actions & Widgets */}
            <div className="space-y-8">
              <h3 className="text-xl font-bold text-gray-900">Acciones Rápidas</h3>

              <div className="grid grid-cols-1 gap-4">
                <QuickAction
                  icon={Plus}
                  title="Nueva Inscripción"
                  desc="Comienza el proceso para tu próxima práctica"
                  onClick={() => navigate(PRE_REGISTRATION_PATH)}
                  primary={true}
                />
                <QuickAction
                  icon={Calendar}
                  title="Agendar horas y consultas"
                  desc={hasActiveCoordinators
                    ? "Solicita consultas generales o presentación final"
                    : "Solicita presentación final de tu práctica"}
                  onClick={() => navigate('/entrevistas')}
                  badge={appointmentNotificationsCount}
                />
                <QuickAction
                  icon={FileText}
                  title="Carta de Presentación"
                  desc="Genera o descarga tu carta opcional"
                  onClick={() => navigate('/cartas-presentacion')}
                />
                <QuickAction
                  icon={Upload}
                  title="Subir Documentos"
                  desc="Informes, certificados y evaluaciones"
                  onClick={() => setIsUploadModalOpen(true)}
                  disabled={!canUpload || internships.length === 0}
                />
                <QuickAction
                  icon={Download}
                  title="Portabilidad"
                  desc="Descarga tus datos y documentos"
                  onClick={handleDataPortabilityDownload}
                  disabled={internships.length === 0}
                />
              </div>

              {/* Help Widget */}
              <div className="bg-gradient-to-br from-[#d22864] to-[#972fa4] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-[#d22864]/20">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                <h4 className="text-xl font-bold mb-2">¿Necesitas ayuda?</h4>
                <p className="text-white/80 text-sm mb-6 leading-relaxed">
                  Revisa nuestra sección de preguntas frecuentes o contacta a tu encargado de prácticas.
                </p>
                <button
                  onClick={() => navigate('/faq')}
                  className="bg-white text-[#d22864] px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors w-full"
                >
                  Ir a FAQ
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />

      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        internships={internships}
        onDocumentUploaded={handleDocumentUploaded}
      />
    </div>
  );
};

export default StudentDashboardPage;

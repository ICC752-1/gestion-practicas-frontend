import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, User, Building, MapPin, FileText, History, MessageSquare, ShieldCheck, ShieldAlert, ChevronDown, ChevronUp, Calendar, Clock, Briefcase, Mail, Phone, DollarSign, Globe2 } from 'lucide-react';
import { UserHeader } from '../../components/Header/UserHeader';
import { Footer } from '../../components/Footer/Footer';
import { ActionButtons } from '../../components/coordinador/ActionButtons';
import { usePractice } from '../../hooks/usePractice';
import { useAuth } from '../../context/useAuth';
import { documentService } from '../../services/documentService';
import { AdminDocumentList } from '../../components/CoordinatorDashboard/AdminDocumentList';
import { internshipService } from '../../services/internshipService';
import { coordinatorService } from '../../services/coordinatorService';
import { getAdminBasePathForRoles, getDisplayRoleForRoles } from '../../services/roleRouting';
import { supervisorEvaluationService } from '../../services/supervisorEvaluationService';
import { formatBenefitLabels } from '../../constants/benefits';

// Componente para mostrar un detalle con ícono
const DetailItem = ({ icon: Icon, label, value, subValue }) => (
  <div>
    <div className="flex items-center text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
      <Icon className="w-4 h-4 mr-2" />
      <span>{label}</span>
    </div>
    <p className="text-lg font-medium text-gray-800">{value || 'No disponible'}</p>
    {subValue && <p className="text-gray-500">{subValue}</p>}
  </div>
);

const DetailSection = ({ icon: Icon, title, summary, isOpen, onToggle, children }) => (
  <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/40">
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-gray-50"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-white p-3 text-[#d22864] shadow-sm">
          <Icon size={22} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">{title}</h3>
          {summary && <p className="mt-0.5 text-sm font-medium text-gray-500">{summary}</p>}
        </div>
      </div>
      {isOpen ? <ChevronUp className="text-gray-400" size={20} /> : <ChevronDown className="text-gray-400" size={20} />}
    </button>
    {isOpen && (
      <div className="border-t border-gray-100 bg-white px-5 py-6">
        {children}
      </div>
    )}
  </div>
);

const formatDate = (date) => {
  if (!date) return null;

  return new Date(`${date}T00:00:00`).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatDateTime = (date) => {
  if (!date) return null;

  const value = String(date);
  return new Date(value.endsWith('Z') ? value : `${value}Z`).toLocaleString('es-CL');
};

const formatMoney = (amount) => {
  if (amount === null || amount === undefined) return null;

  return `$${Number(amount).toLocaleString('es-CL')}`;
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

const INSURANCE_STATUS_LABELS = {
  pending: 'Pendiente de validación',
  validated: 'Seguro validado',
  requires_exception: 'Requiere excepción',
  exception_authorized: 'Excepción autorizada',
  not_applicable: 'No aplica',
};

const INSURANCE_STATUS_DESCRIPTIONS = {
  pending: 'La solicitud aún requiere revisión administrativa del seguro escolar.',
  validated: 'El seguro escolar fue validado para esta solicitud de práctica.',
  requires_exception: 'La solicitud no cuenta con seguro validado y requiere una excepción administrativa.',
  exception_authorized: 'Existe una excepción administrativa autorizada para esta solicitud.',
  not_applicable: 'Administración marcó que esta solicitud no requiere validación de seguro.',
};

const getInsuranceBadgeClass = (status) => {
  if (status === 'validated') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  if (status === 'exception_authorized') return 'bg-blue-50 text-blue-700 border-blue-100';
  if (status === 'requires_exception') return 'bg-red-50 text-red-700 border-red-100';
  if (status === 'not_applicable') return 'bg-gray-50 text-gray-700 border-gray-200';
  return 'bg-amber-50 text-amber-700 border-amber-100';
};

const getHistoryMetadata = (entry) => entry.metadata || entry.metadata_json || {};

const buildHistoryTitle = (entry) => {
  const metadata = getHistoryMetadata(entry);

  if (metadata.action && HISTORY_ACTION_TITLES[metadata.action]) {
    return HISTORY_ACTION_TITLES[metadata.action];
  }

  if (metadata.event && HISTORY_EVENT_TITLES[metadata.event]) {
    return HISTORY_EVENT_TITLES[metadata.event];
  }

  return entry.new_status?.title || 'Estado desconocido';
};

const buildHistorySubtitle = (entry) => {
  const metadata = getHistoryMetadata(entry);
  const reason = entry.reason?.trim();

  if (metadata.event) {
    return reason || HISTORY_DEFAULT_SUBTITLES[metadata.event] || null;
  }

  if (reason && metadata.action) {
    return `Motivo: ${reason}`;
  }

  if (reason) {
    return reason;
  }

  return HISTORY_DEFAULT_SUBTITLES[metadata.action] || null;
};

export const PracticeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { practice, loading, error, refresh } = usePractice(id);

  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [docsError, setDocsError] = useState(null);
  const [tracking, setTracking] = useState([]);
  const [lifecycle, setLifecycle] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(true);
  const [supervisorInvite, setSupervisorInvite] = useState(null);
  const [supervisorInviteError, setSupervisorInviteError] = useState('');
  const [supervisorInviteLoading, setSupervisorInviteLoading] = useState(false);
  const [insuranceActionLoading, setInsuranceActionLoading] = useState(false);
  const [insuranceActionError, setInsuranceActionError] = useState('');
  const [insuranceActionSuccess, setInsuranceActionSuccess] = useState('');
  const [insuranceNotes, setInsuranceNotes] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    student: true,
    practice: true,
    organization: false,
    supervisor: false,
  });

  const fetchDocuments = useCallback(async () => {
    try {
      setLoadingDocs(true);
      setDocsError(null);
      const data = await documentService.getInternshipDocuments(id);
      setDocuments(data);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setDocsError("No se pudieron cargar los documentos del servidor.");
    } finally {
      setLoadingDocs(false);
    }
  }, [id]);

  const fetchTracking = useCallback(async () => {
    try {
      setTrackingLoading(true);
      const [data, lifecycleData] = await Promise.all([
        internshipService.getInternshipTracking(id),
        internshipService.getInternshipLifecycle(id).catch(() => null),
      ]);
      setTracking(data);
      setLifecycle(lifecycleData);
    } catch (err) {
      console.error('Error fetching tracking:', err);
    } finally {
      setTrackingLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchDocuments();
      fetchTracking();
    }
  }, [fetchDocuments, fetchTracking, id]);

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

  const handleActionSuccess = async () => {
    await refresh();
    await fetchTracking();
  };

  const toggleSection = (section) => {
    setExpandedSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  };

  const handleGenerateSupervisorInvitation = async () => {
    setSupervisorInviteLoading(true);
    setSupervisorInvite(null);
    setSupervisorInviteError('');

    try {
      const data = await supervisorEvaluationService.generateInvitation(id);
      setSupervisorInvite(data);
    } catch (err) {
      setSupervisorInviteError(
        err.response?.data?.detail || 'No se pudo generar la invitación del supervisor.'
      );
    } finally {
      setSupervisorInviteLoading(false);
    }
  };

  const getErrorMessage = (err, fallback) => (
    err.response?.data?.detail?.message ||
    err.response?.data?.detail ||
    err.response?.data?.message ||
    err.message ||
    fallback
  );

  const handleUpdateSchoolInsurance = async (status, successMessage) => {
    setInsuranceActionLoading(true);
    setInsuranceActionError('');
    setInsuranceActionSuccess('');

    try {
      await coordinatorService.updatePracticeSchoolInsurance(
        id,
        status,
        insuranceNotes.trim() || null
      );
      setInsuranceActionSuccess(successMessage);
      setInsuranceNotes('');
      await refresh();
    } catch (err) {
      setInsuranceActionError(
        getErrorMessage(err, 'No se pudo actualizar el seguro escolar.')
      );
    } finally {
      setInsuranceActionLoading(false);
    }
  };

  const handleAuthorizeSchoolInsuranceException = async () => {
    const reason = insuranceNotes.trim();
    if (!reason) {
      setInsuranceActionError('Debes indicar un motivo para autorizar la excepción.');
      setInsuranceActionSuccess('');
      return;
    }

    setInsuranceActionLoading(true);
    setInsuranceActionError('');
    setInsuranceActionSuccess('');

    try {
      await internshipService.grantInternshipException(
        id,
        'school_insurance',
        reason
      );
      setInsuranceActionSuccess('Excepción de seguro escolar autorizada para esta solicitud.');
      setInsuranceNotes('');
      await refresh();
    } catch (err) {
      setInsuranceActionError(
        getErrorMessage(err, 'No se pudo autorizar la excepción de seguro escolar.')
      );
    } finally {
      setInsuranceActionLoading(false);
    }
  };

  const userName = user ? `${user.first_name} ${user.last_name}` : "Encargado";
  const userRole = getDisplayRoleForRoles(user?.roles);
  const adminBasePath = getAdminBasePathForRoles(user?.roles);
  const canInviteSupervisor = user?.roles?.some((role) => (
    role === 'Encargado de practica' || role === 'Director de carrera'
  ));
  const isCareerDirector = user?.roles?.some((role) => role === 'Director de carrera');
  const canManageSchoolInsurance = Boolean(
    isCareerDirector && practice && !practice.is_cancelled
  );
  const practiceStatusTitle = practice?.status?.title || practice?.status || 'Pendiente';
  const insuranceStatus = practice?.insurance_status || 'pending';
  const insuranceStatusLabel = INSURANCE_STATUS_LABELS[insuranceStatus] || 'Pendiente de validación';
  const insuranceStatusDescription = INSURANCE_STATUS_DESCRIPTIONS[insuranceStatus] || INSURANCE_STATUS_DESCRIPTIONS.pending;
  const requiresExplicitInsurance = ['pending', 'requires_exception'].includes(insuranceStatus);
  const canGenerateSupervisorInvitation = Boolean(
    canInviteSupervisor && lifecycle?.can_generate_supervisor_invitation
  );
  const getSupervisorInvitationUnavailableMessage = () => {
    if (practice?.is_cancelled) return 'No disponible para solicitudes anuladas.';
    if (practiceStatusTitle !== 'Aprobada') return 'Disponible cuando la solicitud esté aprobada.';
    if (lifecycle?.supervisor_evaluation_submitted) return 'La evaluación del supervisor ya fue completada.';
    if (lifecycle && !lifecycle.self_evaluation_submitted) {
      return 'Disponible cuando el estudiante complete su autoevaluación.';
    }
    return '';
  };
  const supervisorInvitationUnavailableMessage = getSupervisorInvitationUnavailableMessage();

  // Usamos el estudiante que pasamos en la navegación desde StudentTable como fuente principal.
  // Si no está (ej. si el usuario entra directo a la URL), intentamos buscarlo en el practice.
  const studentFromState = location.state?.student;
  const studentData = studentFromState || practice?.student || practice?.user || practice;

  const studentName = studentData ? `${studentData.first_name || ''} ${studentData.last_name || ''}`.trim() : 'No disponible';
  const studentEmail = studentData?.email;
  const studentDegree = studentData?.degree || studentData?.cod_degree;

  const companyAddress = [practice?.address, practice?.city, practice?.region].filter(Boolean).join(', ');
  const currentStatusLabel = practice?.is_cancelled
    ? 'Anulada'
    : practiceStatusTitle;

  const getBadgeColor = (title) => {
    const t = (title || '').toLowerCase();
    if (t.includes('aprobad')) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (t.includes('rechazad') || t.includes('reprobad')) return 'bg-red-50 text-red-700 border-red-100';
    if (t.includes('anulad')) return 'bg-gray-50 text-gray-700 border-gray-200';
    if (t.includes('dirae')) return 'bg-blue-50 text-blue-700 border-blue-100';
    return 'bg-gray-50 text-gray-700 border-gray-100';
  };

  const getTimelineCircleColor = (title, status) => {
    if (status === 'completed') return 'border-emerald-500 bg-emerald-500';
    if (status === 'current') return 'border-[#d22864] bg-[#d22864]';
    if (status === 'blocked') return 'border-red-500 bg-red-500';
    const t = (title || '').toLowerCase();
    if (t.includes('aprobad')) return 'border-emerald-500 bg-emerald-500';
    if (t.includes('rechazad') || t.includes('reprobad') || t.includes('anulad')) return 'border-red-500 bg-red-500';
    if (t.includes('correcci') || t.includes('corregid') || t.includes('registrad')) return 'border-[#d22864] bg-[#d22864]';
    if (t.includes('dirae')) return 'border-blue-500 bg-blue-500';
    return 'border-gray-400 bg-gray-400';
  };

  const timelineEntries = lifecycle?.events?.length ? lifecycle.events : tracking;

  return (
    <div className="min-h-screen flex flex-col bg-ufro-bg">
      <UserHeader userName={userName} userRole={userRole} />

      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl animate-fade-in">
        <button
          onClick={() => navigate(adminBasePath)}
          className="flex items-center text-ufro-primary hover:underline mb-6 font-medium cursor-pointer"
        >
          <ArrowLeft className="mr-2" size={20} />
          Volver al Dashboard
        </button>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Detalle de solicitud de práctica</h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[30vh] space-y-4">
              <Loader2 className="w-12 h-12 text-ufro-primary animate-spin" />
              <p className="text-gray-500 font-medium">Cargando detalles de la práctica...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center min-h-[30vh] space-y-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-gray-500 text-center max-w-md">{error}</p>
            </div>
          ) : practice ? (
            <div className="space-y-8">
              <div className="space-y-4">
                <DetailSection
                  icon={User}
                  title="Estudiante"
                  summary={studentEmail || 'Datos del solicitante'}
                  isOpen={expandedSections.student}
                  onToggle={() => toggleSection('student')}
                >
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <DetailItem icon={User} label="Nombre" value={studentName} />
                    <DetailItem icon={Mail} label="Correo" value={studentEmail} />
                    <DetailItem icon={FileText} label="RUT" value={studentData?.rut} />
                    <DetailItem icon={Building} label="Carrera" value={studentDegree} />
                  </div>
                </DetailSection>

                <DetailSection
                  icon={Briefcase}
                  title="Solicitud y práctica"
                  summary={`${currentStatusLabel} · ${practice.internship_type || 'Tipo no especificado'}`}
                  isOpen={expandedSections.practice}
                  onToggle={() => toggleSection('practice')}
                >
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <div className="flex items-center text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        <span>Estado de solicitud</span>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getBadgeColor(currentStatusLabel)}`}>
                        {currentStatusLabel}
                      </span>
                    </div>
                    <DetailItem icon={Briefcase} label="Tipo de práctica" value={practice.internship_type} />
                    <DetailItem icon={Briefcase} label="Modalidad" value={practice.modality || practice.practice_type} />
                    <DetailItem icon={Calendar} label="Período académico" value={practice.internship_period} />
                    <DetailItem icon={Calendar} label="Fecha de inicio" value={formatDate(practice.start_date)} />
                    <DetailItem icon={Calendar} label="Fecha de término" value={formatDate(practice.end_date)} />
                    <DetailItem icon={Clock} label="Horario" value={practice.schedule} />
                    <DetailItem icon={Calendar} label="Días" value={practice.days} />
                    <DetailItem icon={MapPin} label="Dirección de práctica" value={practice.internship_address} />
                    <DetailItem icon={FileText} label="Fecha de registro" value={formatDateTime(practice.upload_date)} />
                    <DetailItem icon={ShieldAlert} label="Seguro escolar declarado" value={practice.has_school_insurance ? 'Sí' : 'No'} />
                    <DetailItem icon={FileText} label="Estado DIRAE" value={practice.dirae_status} />
                  </div>

                  {practice.act_description && (
                    <div className="mt-6 border-t border-gray-100 pt-5">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Actividades a realizar</p>
                      <p className="mt-2 text-sm leading-relaxed text-gray-700">{practice.act_description}</p>
                    </div>
                  )}

                  {(practice.ben_description || (practice.amount !== null && practice.amount !== undefined)) && (
                    <div className="mt-5 grid gap-5 border-t border-gray-100 pt-5 md:grid-cols-[1fr_220px]">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Beneficios</p>
                        <p className="mt-2 text-sm leading-relaxed text-gray-700">{formatBenefitLabels(practice.ben_description) || 'No informado'}</p>
                      </div>
                      <DetailItem icon={DollarSign} label="Apoyo económico" value={formatMoney(practice.amount)} />
                    </div>
                  )}
                </DetailSection>

                <DetailSection
                  icon={Building}
                  title="Organización"
                  summary={companyAddress || practice.org_name || 'Datos de la organización'}
                  isOpen={expandedSections.organization}
                  onToggle={() => toggleSection('organization')}
                >
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <DetailItem icon={Building} label="Nombre" value={practice.org_name} />
                    <DetailItem icon={Briefcase} label="Rubro" value={practice.sector} />
                    <DetailItem icon={MapPin} label="Dirección casa matriz" value={practice.address} />
                    <DetailItem icon={MapPin} label="Ciudad" value={practice.city} />
                    <DetailItem icon={Phone} label="Teléfono" value={practice.org_phone} />
                    <DetailItem icon={Globe2} label="Página web" value={practice.web} />
                  </div>
                </DetailSection>

                <DetailSection
                  icon={User}
                  title="Supervisor/a"
                  summary={practice.supervisor_email || 'Datos del supervisor externo'}
                  isOpen={expandedSections.supervisor}
                  onToggle={() => toggleSection('supervisor')}
                >
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <DetailItem icon={User} label="Nombre" value={practice.supervisor_name} />
                    <DetailItem icon={Briefcase} label="Profesión" value={practice.supervisor_profession} />
                    <DetailItem icon={Briefcase} label="Cargo" value={practice.supervisor_position} />
                    <DetailItem icon={Building} label="Departamento" value={practice.supervisor_department} />
                    <DetailItem icon={Mail} label="Correo" value={practice.supervisor_email} />
                    <DetailItem icon={Phone} label="Teléfono" value={practice.supervisor_phone} />
                  </div>
                </DetailSection>
              </div>

              {/* Seguro escolar */}
              <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex gap-3">
                    <div className="mt-1 rounded-2xl bg-white p-3 text-amber-600 shadow-sm">
                      {insuranceStatus === 'validated' || insuranceStatus === 'exception_authorized'
                        ? <ShieldCheck size={24} />
                        : <ShieldAlert size={24} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                        Seguro escolar de la solicitud
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-bold ${getInsuranceBadgeClass(insuranceStatus)}`}>
                          {insuranceStatusLabel}
                        </span>
                        {requiresExplicitInsurance && (
                          <span className="rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-bold text-amber-700">
                            Requiere revisión de Dirección de carrera
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{insuranceStatusDescription}</p>
                      {practice.insurance_validated_at && (
                        <p className="mt-1 text-xs font-semibold text-gray-500">
                          Última actualización: {new Date(practice.insurance_validated_at.endsWith('Z') ? practice.insurance_validated_at : practice.insurance_validated_at + 'Z').toLocaleString('es-CL')}
                        </p>
                      )}
                      {practice.insurance_notes && (
                        <p className="mt-2 rounded-xl border border-amber-100 bg-white px-3 py-2 text-sm text-gray-600">
                          {practice.insurance_notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {canManageSchoolInsurance && (
                  <div className="mt-5 space-y-4 border-t border-amber-100 pt-5">
                    <label className="block">
                      <span className="text-sm font-bold text-gray-700">Observación administrativa</span>
                      <textarea
                        value={insuranceNotes}
                        onChange={(event) => setInsuranceNotes(event.target.value)}
                        rows={3}
                        className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#d22864] focus:ring-2 focus:ring-[#d22864]/10"
                        placeholder="Ej.: seguro validado para esta solicitud, o motivo de la excepción."
                      />
                    </label>

                    {insuranceActionError && (
                      <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                        {insuranceActionError}
                      </p>
                    )}
                    {insuranceActionSuccess && (
                      <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                        {insuranceActionSuccess}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleUpdateSchoolInsurance('validated', 'Seguro escolar validado para esta solicitud.')}
                        disabled={insuranceActionLoading}
                        className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Validar seguro
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateSchoolInsurance('requires_exception', 'Solicitud marcada como pendiente de excepción de seguro escolar.')}
                        disabled={insuranceActionLoading}
                        className="rounded-xl bg-amber-600 px-4 py-3 text-sm font-bold text-white hover:bg-amber-700 disabled:opacity-50"
                      >
                        Requiere excepción
                      </button>
                      <button
                        type="button"
                        onClick={handleAuthorizeSchoolInsuranceException}
                        disabled={insuranceActionLoading}
                        className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        Autorizar excepción
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateSchoolInsurance('pending', 'Seguro escolar restablecido como pendiente de validación.')}
                        disabled={insuranceActionLoading}
                        className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Dejar pendiente
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Acciones administrativas */}
              <ActionButtons
                practice={practice}
                onActionSuccess={handleActionSuccess}
              />

              {canInviteSupervisor && (
                <div className="rounded-2xl border border-[#ffd6e5] bg-[#fff8fb] p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900">Evaluación del supervisor</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Genera o reenvía un enlace de un solo uso al correo registrado del supervisor.
                      </p>
                      {!canGenerateSupervisorInvitation && supervisorInvitationUnavailableMessage && (
                        <p className="mt-2 text-sm font-semibold text-[#b01e52]">
                          {supervisorInvitationUnavailableMessage}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateSupervisorInvitation}
                      disabled={supervisorInviteLoading || !canGenerateSupervisorInvitation}
                      className="rounded-xl bg-[#d22864] px-4 py-3 text-sm font-bold text-white hover:bg-[#b01e52] disabled:opacity-50"
                    >
                      {supervisorInviteLoading ? 'Generando...' : 'Generar invitación'}
                    </button>
                  </div>
                  {supervisorInviteError && (
                    <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                      {supervisorInviteError}
                    </p>
                  )}
                  {supervisorInvite?.demo_url && (
                    <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                      <p className="font-bold">Invitación generada en modo demo.</p>
                      <a className="mt-1 block break-all font-semibold underline" href={supervisorInvite.demo_url} target="_blank" rel="noreferrer">
                        {supervisorInvite.demo_url}
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Sección de Documentos */}
              <div className="border-t border-gray-100 pt-8 mt-8">
                <div className="flex items-center gap-2 mb-6">
                  <FileText className="text-ufro-primary" size={24} />
                  <h3 className="text-xl font-bold text-gray-800">Revisión de Documentos</h3>
                </div>
                <AdminDocumentList
                  documents={documents}
                  loading={loadingDocs}
                  error={docsError}
                  onStatusUpdated={fetchDocuments}
                  onDownload={handleDownload}
                />
              </div>

              {/* Historial / Timeline de Seguimiento */}
              <div className="border-t border-gray-100 pt-8 mt-8">
                <div className="flex items-center gap-2 mb-6">
                  <History className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-bold text-gray-800">
                    Historial de Seguimiento
                  </h3>
                </div>

                {trackingLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 text-ufro-primary animate-spin" />
                  </div>
                ) : timelineEntries.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl">
                    <p className="text-gray-400 text-sm font-medium">No hay registros de seguimiento para esta práctica.</p>
                  </div>
                ) : (
                  <div className="relative pl-6 border-l-2 border-gray-100 ml-3 space-y-6">
                    {timelineEntries.map((entry) => {
                      const isLifecycleEntry = Boolean(entry.type);
                      const historyTitle = isLifecycleEntry ? entry.title : buildHistoryTitle(entry);
                      const historySubtitle = isLifecycleEntry ? entry.description : buildHistorySubtitle(entry);
                      const dateValue = entry.occurred_at || entry.changed_at;
                      const dateStr = dateValue ? new Date(dateValue).toLocaleDateString('es-CL', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : null;

                      return (
                        <div key={entry.id} className="relative group">
                          {/* Circle on the left line */}
                          <div className={`absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full border-4 border-white shadow-sm transition-transform group-hover:scale-110 ${getTimelineCircleColor(historyTitle, entry.status)}`} />

                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-4">
                            <span className="font-bold text-gray-800 text-[15px]">
                              {historyTitle}
                            </span>
                            {dateStr && (
                              <span className="text-gray-400 text-xs font-semibold">
                                {dateStr}
                              </span>
                            )}
                          </div>

                          {entry.actor && (
                            <p className="text-gray-500 text-xs font-medium mt-0.5">
                              Por: {entry.actor.first_name} {entry.actor.last_name} ({entry.actor.email})
                            </p>
                          )}

                          {historySubtitle && (
                            <div className="mt-2 bg-gray-50/70 border border-gray-100 rounded-2xl p-4 flex gap-3 text-gray-600 text-sm font-medium italic shadow-inner">
                              <MessageSquare className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                              <p>{historySubtitle}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No se encontraron datos para esta práctica.
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

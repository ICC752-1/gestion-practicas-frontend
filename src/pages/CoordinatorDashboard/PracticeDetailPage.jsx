import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, User, Building, MapPin, FileText, History, MessageSquare } from 'lucide-react';
import { UserHeader } from '../../components/Header/UserHeader';
import { Footer } from '../../components/Footer/Footer';
import { ActionButtons } from '../../components/coordinador/ActionButtons';
import { usePractice } from '../../hooks/usePractice';
import { useAuth } from '../../context/useAuth';
import { documentService } from '../../services/documentService';
import { AdminDocumentList } from '../../components/CoordinatorDashboard/AdminDocumentList';
import { internshipService } from '../../services/internshipService';
import { getAdminBasePathForRoles, getDisplayRoleForRoles } from '../../services/roleRouting';
import { supervisorEvaluationService } from '../../services/supervisorEvaluationService';

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
  const [trackingLoading, setTrackingLoading] = useState(true);
  const [supervisorInvite, setSupervisorInvite] = useState(null);
  const [supervisorInviteError, setSupervisorInviteError] = useState('');
  const [supervisorInviteLoading, setSupervisorInviteLoading] = useState(false);

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
      const data = await internshipService.getInternshipTracking(id);
      setTracking(data);
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

  const userName = user ? `${user.first_name} ${user.last_name}` : "Encargado";
  const userRole = getDisplayRoleForRoles(user?.roles);
  const adminBasePath = getAdminBasePathForRoles(user?.roles);
  const canInviteSupervisor = user?.roles?.some((role) => (
    role === 'Encargado de practica' || role === 'Director de carrera'
  ));

  // Usamos el estudiante que pasamos en la navegación desde StudentTable como fuente principal.
  // Si no está (ej. si el usuario entra directo a la URL), intentamos buscarlo en el practice.
  const studentFromState = location.state?.student;
  const studentData = studentFromState || practice?.student || practice?.user || practice;

  const studentName = studentData ? `${studentData.first_name || ''} ${studentData.last_name || ''}`.trim() : 'No disponible';
  const studentEmail = studentData?.email;
  const studentDegree = studentData?.degree;

  const companyAddress = [practice?.address, practice?.city, practice?.region].filter(Boolean).join(', ');
  const currentStatusLabel = practice?.is_cancelled
    ? 'Anulada'
    : practice?.status?.title || practice?.status || 'Pendiente';

  const getBadgeColor = (title) => {
    const t = (title || '').toLowerCase();
    if (t.includes('aprobad')) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (t.includes('rechazad') || t.includes('reprobad')) return 'bg-red-50 text-red-700 border-red-100';
    if (t.includes('anulad')) return 'bg-gray-50 text-gray-700 border-gray-200';
    if (t.includes('dirae')) return 'bg-blue-50 text-blue-700 border-blue-100';
    return 'bg-gray-50 text-gray-700 border-gray-100';
  };

  const getTimelineCircleColor = (title) => {
    const t = (title || '').toLowerCase();
    if (t.includes('aprobad')) return 'border-emerald-500 bg-emerald-500';
    if (t.includes('rechazad') || t.includes('reprobad') || t.includes('anulad')) return 'border-red-500 bg-red-500';
    if (t.includes('correcci') || t.includes('corregid') || t.includes('registrad')) return 'border-[#d22864] bg-[#d22864]';
    if (t.includes('dirae')) return 'border-blue-500 bg-blue-500';
    return 'border-gray-400 bg-gray-400';
  };

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
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Detalle de Práctica Administrativa</h2>

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
              {/* Sección de Estudiante */}
              <div className="p-6 rounded-2xl bg-gray-50/50 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailItem icon={User} label="Estudiante" value={studentName} subValue={studentEmail} />
                  <DetailItem icon={Building} label="Carrera" value={studentDegree} />
                </div>
              </div>

              {/* Sección de Empresa */}
              <div className="p-6 rounded-2xl bg-gray-50/50 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailItem icon={Building} label="Empresa / Organización" value={practice.org_name} />
                  <DetailItem icon={MapPin} label="Ubicación" value={companyAddress} />
                </div>
              </div>

              {/* Sección de Práctica */}
              <div className="border-t border-gray-100 pt-8 mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Estado</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getBadgeColor(currentStatusLabel)}`}>
                    {currentStatusLabel}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Tipo / Modalidad</h3>
                  <p className="text-lg font-medium text-gray-800">
                    {practice.modality || practice.practice_type || 'No especificado'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Fechas</h3>
                  <p className="text-gray-800 text-sm mt-1">
                    <span className="font-medium">Inicio:</span> {practice.start_date || 'No definida'} <br />
                    <span className="font-medium">Término:</span> {practice.end_date || 'No definida'}
                  </p>
                </div>
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
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateSupervisorInvitation}
                      disabled={supervisorInviteLoading || practice.is_cancelled}
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
                ) : tracking.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl">
                    <p className="text-gray-400 text-sm font-medium">No hay registros de seguimiento para esta práctica.</p>
                  </div>
                ) : (
                  <div className="relative pl-6 border-l-2 border-gray-100 ml-3 space-y-6">
                    {tracking.map((entry) => {
                      const historyTitle = buildHistoryTitle(entry);
                      const historySubtitle = buildHistorySubtitle(entry);
                      const dateStr = new Date(entry.changed_at).toLocaleDateString('es-CL', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });

                      return (
                        <div key={entry.id} className="relative group">
                          {/* Circle on the left line */}
                          <div className={`absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full border-4 border-white shadow-sm transition-transform group-hover:scale-110 ${getTimelineCircleColor(historyTitle)}`} />

                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-4">
                            <span className="font-bold text-gray-800 text-[15px]">
                              {historyTitle}
                            </span>
                            <span className="text-gray-400 text-xs font-semibold">
                              {dateStr}
                            </span>
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

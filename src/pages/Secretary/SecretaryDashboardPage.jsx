import { useCallback, useDeferredValue, useState, useEffect, useMemo } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Download,
  Eye,
  FileSearch,
  FileText,
  History,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  ShieldAlert,
  UploadCloud,
  Building2,
  User,
} from 'lucide-react';
import { UserHeader } from '../../components/Header/UserHeader';
import { Footer } from '../../components/Footer/Footer';
import { documentService } from '../../services/documentService';
import { internshipService } from '../../services/internshipService';
import { selfEvaluationService } from '../../services/selfEvaluationService';
import { supervisorEvaluationService } from '../../services/supervisorEvaluationService';
import { useToast } from '../../context/useToast';

const DOCUMENT_STATUS = {
  uploaded: { label: 'Cargado', className: 'bg-amber-50 text-amber-700 border-amber-100' },
  observed: { label: 'Observado', className: 'bg-purple-50 text-purple-700 border-purple-100' },
  approved: { label: 'Aprobado', className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  deleted: { label: 'Eliminado', className: 'bg-gray-50 text-gray-600 border-gray-100' },
};

const COMPLETION_STATUS = {
  not_started: 'No iniciada',
  in_progress: 'En ejecución',
  pending_evaluations: 'Evaluaciones pendientes',
  pending_presentation: 'Presentación pendiente',
  finalized: 'Finalizada',
};

const FINAL_RESULT = {
  pending: 'Pendiente',
  passed: 'Aprobada',
  failed: 'Reprobada',
};

const DIRAE_STATUS = {
  not_started: { label: 'No iniciado', className: 'bg-gray-50 text-gray-700 border-gray-200/60' },
  in_review: { label: 'En revisión local', className: 'bg-sky-50 text-sky-800 border-sky-200/50' },
  observed: { label: 'Observado para rectificación', className: 'bg-purple-50 text-purple-800 border-purple-200/50' },
  ready: { label: 'Listo para exportar', className: 'bg-emerald-50 text-emerald-800 border-emerald-200/50' },
  exported: { label: 'Enviado a DIRAE', className: 'bg-[#fff0f6] text-[#b01a4e] border-[#fcc2d7]/50' },
};

const PACKAGE_REASONS = {
  internship_not_approved: 'La solicitud de práctica aún no está aprobada.',
  practice_not_finalized: 'La práctica aún no está finalizada.',
  dirae_not_ready: 'El expediente DIRAE no está listo para exportación.',
  missing_required_documents: 'Faltan documentos requeridos aprobados.',
  observed_documents_pending: 'Hay documentos observados pendientes de corrección.',
  sensitive_document_restricted: 'El expediente contiene documentos sensibles restringidos para Secretaría.',
};

const allowedUploadExtensions = ['pdf', 'docx', 'jpg', 'png', 'zip'];
const SECRETARY_PAGE_SIZE_OPTIONS = [10, 20, 50];
const DEFAULT_SECRETARY_INBOX_STATS = {
  total: 0,
  not_started: 0,
  in_review: 0,
  observed: 0,
  ready: 0,
  exported: 0,
};
const SECRETARY_SORT_OPTIONS = [
  { value: 'upload_date:desc', label: 'Más recientes' },
  { value: 'upload_date:asc', label: 'Más antiguos' },
  { value: 'student_name:asc', label: 'Estudiante A-Z' },
  { value: 'student_name:desc', label: 'Estudiante Z-A' },
  { value: 'organization:asc', label: 'Organización A-Z' },
  { value: 'dirae_status:asc', label: 'Estado DIRAE' },
];

// --- Constants for evaluations ---
const SUPERVISOR_CRITERIA_LABELS = {
  technical_performance: { label: 'Desempeño técnico', desc: 'Aplica conocimientos y herramientas acordes a las tareas asignadas.' },
  responsibility: { label: 'Responsabilidad', desc: 'Cumple horarios, compromisos y entregas solicitadas.' },
  communication: { label: 'Comunicación', desc: 'Informa avances, dificultades y requerimientos con claridad.' },
  teamwork: { label: 'Trabajo en equipo', desc: 'Se integra adecuadamente con el equipo laboral.' },
  autonomy: { label: 'Autonomía y aprendizaje', desc: 'Aprende, propone soluciones y ejecuta tareas con supervisión.' },
};

const RECOMMENDATION_LABELS = {
  recommended: 'Recomendado',
  recommended_with_observations: 'Recomendado con observaciones',
  not_recommended: 'No recomendado',
};


const formatDate = (value) => {
  if (!value) return 'Sin fecha';
  // Date-only strings (YYYY-MM-DD) are treated as local calendar dates
  return new Date(value + 'T00:00:00').toLocaleDateString('es-CL');
};

// Parses a UTC-naive datetime string from the backend by appending 'Z' so JS
// correctly interprets it as UTC before converting to local time for display.
const parseUTCDateTime = (value) => {
  if (!value) return null;
  // If it already has timezone info, use as-is
  if (value.endsWith('Z') || value.includes('+') || (value.includes('-') && value.lastIndexOf('-') > 10)) {
    return new Date(value);
  }
  return new Date(value + 'Z');
};

const formatDateTime = (value) => {
  if (!value) return 'Sin fecha';
  const d = parseUTCDateTime(value);
  if (!d || isNaN(d)) return 'Sin fecha';
  return d.toLocaleString('es-CL');
};

const getStatusTitle = (internship) => {
  if (!internship) return 'Sin cargar';
  return internship.status?.title || internship.status || `Estado ${internship.status_id || 'sin definir'}`;
};

const getErrorMessage = (error, fallback) => {
  const detail = error.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (detail?.message) return detail.message;
  return error.response?.data?.message || fallback;
};

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(link);
};

const buildDocumentFileName = (document) => (
  document.file_name || `${document.document_type?.name || 'documento'}.${document.extension || 'pdf'}`
);

const isAdministrativeUploadType = (documentType) => (
  documentType.category === 'Administrativo' && !documentType.is_sensitive
);

const getDiraeActionErrorMessage = (error, fallback) => {
  const detail = error.response?.data?.detail;
  if (Array.isArray(detail)) {
    const emailError = detail.find((item) => item.loc?.includes('dirae_email'));
    if (emailError) return 'Ingresa un correo DIRAE válido.';
  }
  const internshipErrors = detail?.internships || [];
  const allReasons = internshipErrors.flatMap((item) => item.reasons || []);
  const uniqueReasons = [...new Set(allReasons)];
  const readableReasons = uniqueReasons
    .map((reason) => PACKAGE_REASONS[reason] || reason)
    .join(' ');

  return (
    readableReasons ||
    (typeof detail?.message === 'string' ? detail.message : null) ||
    getErrorMessage(error, fallback)
  );
};

const getStudentFullName = (student) => {
  if (!student) return 'Estudiante sin nombre';
  return `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Estudiante sin nombre';
};

const getStudentIdentifier = (student) => {
  if (!student) return 'Sin matrícula';
  return student.enrollment || student.rut || 'Sin matrícula';
};

const getStudentIdentifierLabel = (student) => {
  if (!student) return 'Matrícula';
  return student.enrollment ? 'Matrícula' : 'RUT';
};

export const SecretaryDashboardPage = () => {
  const { showToast } = useToast();
  const [internshipIdInput, setInternshipIdInput] = useState('');
  const [activeInternshipId, setActiveInternshipId] = useState(null);
  const [internship, setInternship] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [packageData, setPackageData] = useState(null);
  const [diraeTracking, setDiraeTracking] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState('');
  const [documentStatusFilter, setDocumentStatusFilter] = useState('all');
  const [documentTypeFilter, setDocumentTypeFilter] = useState('all');
  const [documentSearch, setDocumentSearch] = useState('');
  const deferredDocumentSearch = useDeferredValue(documentSearch);
  const [reviewDocumentId, setReviewDocumentId] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('approved');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [updatingDocumentId, setUpdatingDocumentId] = useState(null);
  const [reopenComment, setReopenComment] = useState('');
  const [diraeActionLoading, setDiraeActionLoading] = useState('');
  const [uploadDocumentTypeId, setUploadDocumentTypeId] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [exportError, setExportError] = useState('');
  const [emailDialog, setEmailDialog] = useState({ open: false, internshipIds: [] });
  const [diraeEmail, setDiraeEmail] = useState('');
  const [diraeEmailMessage, setDiraeEmailMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [selfEvaluationForm, setSelfEvaluationForm] = useState(null);
  const [supervisorEvaluation, setSupervisorEvaluation] = useState(null);
  const [activeTab, setActiveTab] = useState('documents');

  // Estados para Bandeja de Entrada Global
  const [allInternships, setAllInternships] = useState([]);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [globalSearch, setGlobalSearch] = useState('');
  const deferredGlobalSearch = useDeferredValue(globalSearch);
  const [degreeFilter, setDegreeFilter] = useState('all');
  const [diraeStatusFilter, setDiraeStatusFilter] = useState('all');
  const [globalTotal, setGlobalTotal] = useState(0);
  const [globalStats, setGlobalStats] = useState(DEFAULT_SECRETARY_INBOX_STATS);
  const [globalDegrees, setGlobalDegrees] = useState([]);
  const [globalLimit, setGlobalLimit] = useState(10);
  const [globalOffset, setGlobalOffset] = useState(0);
  const [globalSortBy, setGlobalSortBy] = useState('upload_date');
  const [globalSortDir, setGlobalSortDir] = useState('desc');

  const loadAllInternships = useCallback(async () => {
    setGlobalLoading(true);
    setPageError('');
    try {
      const response = await internshipService.getSecretaryDiraeInbox({
        limit: globalLimit,
        offset: globalOffset,
        search: deferredGlobalSearch.trim(),
        degree: degreeFilter === 'all' ? undefined : degreeFilter,
        dirae_status: diraeStatusFilter === 'all' ? undefined : diraeStatusFilter,
        sort_by: globalSortBy,
        sort_dir: globalSortDir,
      });
      const nextItems = response.items || [];
      setAllInternships(nextItems);
      setGlobalTotal(response.total || 0);
      setGlobalStats(response.stats || DEFAULT_SECRETARY_INBOX_STATS);
      setGlobalDegrees(response.degrees || []);
      setSelectedIds((currentIds) => (
        currentIds.filter((id) => nextItems.some((item) => item.id === id))
      ));
    } catch (error) {
      console.error("Failed to load internships for secretary dashboard", error);
      setPageError(getErrorMessage(error, 'No se pudo cargar el listado de expedientes.'));
    } finally {
      setGlobalLoading(false);
    }
  }, [
    deferredGlobalSearch,
    degreeFilter,
    diraeStatusFilter,
    globalLimit,
    globalOffset,
    globalSortBy,
    globalSortDir,
  ]);

  useEffect(() => {
    loadAllInternships();
  }, [loadAllInternships]);

  const uniqueDegrees = useMemo(() => {
    return [...new Set(globalDegrees.filter(Boolean))];
  }, [globalDegrees]);

  const filteredInternships = allInternships;

  const readyIdsInCurrentFilter = useMemo(() => {
    return filteredInternships.filter(item => item.dirae_status === 'ready').map(item => item.id);
  }, [filteredInternships]);

  const allReadySelected = useMemo(() => {
    if (readyIdsInCurrentFilter.length === 0) return false;
    return readyIdsInCurrentFilter.every(id => selectedIds.includes(id));
  }, [readyIdsInCurrentFilter, selectedIds]);

  const toggleSelectedId = useCallback((id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  }, []);

  const pageStart = globalTotal === 0 ? 0 : globalOffset + 1;
  const pageEnd = Math.min(globalOffset + globalLimit, globalTotal);
  const currentPage = Math.floor(globalOffset / globalLimit) + 1;
  const totalPages = Math.max(1, Math.ceil(globalTotal / globalLimit));
  const selectedSortValue = `${globalSortBy}:${globalSortDir}`;

  const activeDiraeStatus = packageData?.dirae_status || internship?.dirae_status || 'not_started';
  const diraeStatus = DIRAE_STATUS[activeDiraeStatus] || DIRAE_STATUS.not_started;
  const student = packageData?.student;
  const searchText = deferredDocumentSearch.trim().toLowerCase();
  const filteredDocuments = documents.filter((document) => {
    const statusMatches = documentStatusFilter === 'all' || document.status === documentStatusFilter;
    const typeMatches = documentTypeFilter === 'all' || String(document.type_id) === documentTypeFilter;
    const searchMatches = !searchText
      || document.file_name?.toLowerCase().includes(searchText)
      || document.document_type?.name?.toLowerCase().includes(searchText)
      || document.review_comment?.toLowerCase().includes(searchText);

    return statusMatches && typeMatches && searchMatches;
  });
  const uploadableTypes = documentTypes.filter(isAdministrativeUploadType);

  const loadExpediente = async (internshipId) => {
    setLoading(true);
    setPageError('');
    setExportError('');
    setReviewError('');
    setUploadError('');

    try {
      const [internshipData, documentsData, packageResponse, trackingData, typesData] = await Promise.all([
        internshipService.getInternshipById(internshipId),
        documentService.getInternshipDocuments(internshipId),
        documentService.getDocumentPackage(internshipId),
        internshipService.getDiraeTracking(internshipId),
        documentService.getDocumentTypes(),
      ]);

      setActiveInternshipId(internshipId);
      setInternship(internshipData);
      setDocuments(documentsData);
      setPackageData(packageResponse);
      setDiraeTracking(trackingData);
      setDocumentTypes(typesData);
      setActiveTab('documents');

      // Cargar autoevaluación
      try {
        const selfForm = await selfEvaluationService.getForm(internshipId);
        setSelfEvaluationForm(selfForm);
      } catch (err) {
        console.warn("Could not load self evaluation", err);
        setSelfEvaluationForm(null);
      }

      // Cargar evaluación del supervisor
      try {
        const superEval = await supervisorEvaluationService.getEvaluation(internshipId);
        setSupervisorEvaluation(superEval);
      } catch (err) {
        console.warn("Could not load supervisor evaluation", err);
        setSupervisorEvaluation(null);
      }
    } catch (error) {
      setPageError(getErrorMessage(error, 'No se pudo cargar el expediente solicitado.'));
      setInternship(null);
      setDocuments([]);
      setPackageData(null);
      setDiraeTracking([]);
      setSelfEvaluationForm(null);
      setSupervisorEvaluation(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshActiveExpediente = async () => {
    if (!activeInternshipId) return;
    await loadExpediente(activeInternshipId);
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    const normalizedId = internshipIdInput.trim();
    if (!normalizedId) {
      setPageError('Ingresa el ID de una práctica para consultar su expediente.');
      return;
    }

    await loadExpediente(normalizedId);
  };

  const handleDownloadDocument = async (document) => {
    try {
      const blob = await documentService.downloadDocument(document.id);
      downloadBlob(blob, buildDocumentFileName(document));
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Descarga rechazada',
        message: getErrorMessage(error, 'No se pudo descargar el documento.'),
      });
    }
  };

  const openReview = (document) => {
    setReviewDocumentId(document.id);
    setReviewStatus(document.status === 'observed' ? 'observed' : 'approved');
    setReviewComment(document.review_comment || '');
    setReviewError('');
  };

  const handleDocumentReview = async (documentId) => {
    const comment = reviewComment.trim();
    if (reviewStatus === 'observed' && !comment) {
      setReviewError('Debes ingresar un comentario para observar el documento.');
      return;
    }

    setUpdatingDocumentId(documentId);
    setReviewError('');
    try {
      await documentService.updateDocumentStatus(documentId, {
        status: reviewStatus,
        comment: comment || null,
      });
      showToast({
        type: 'success',
        title: 'Revisión registrada',
        message: reviewStatus === 'approved' ? 'Documento aprobado.' : 'Documento observado con comentario.',
      });
      setReviewDocumentId(null);
      setReviewComment('');
      await refreshActiveExpediente();
      await loadAllInternships();
    } catch (error) {
      setReviewError(getErrorMessage(error, 'No se pudo registrar la revisión.'));
    } finally {
      setUpdatingDocumentId(null);
    }
  };

  const handleExportPdf = async (ids = null) => {
    const idsToExport = ids || (activeInternshipId ? [activeInternshipId] : []);
    if (idsToExport.length === 0) return;
    setDiraeActionLoading('export');
    setExportError('');

    try {
      const exportResponse = await documentService.exportDiraeDocumentPackages(idsToExport);
      downloadBlob(exportResponse.blob, exportResponse.filename);
      showToast({
        type: 'success',
        title: 'Exportación local generada',
        message: 'El PDF fue generado y el/los expediente(s) marcado(s) como enviado(s) a DIRAE.',
      });
      setSelectedIds([]);
      await refreshActiveExpediente();
      await loadAllInternships();
    } catch (error) {
      console.error('Error exporting DIRAE PDF:', error);
      setExportError(getDiraeActionErrorMessage(error, 'No se pudo exportar el expediente.'));
    } finally {
      setDiraeActionLoading('');
    }
  };

  const openDiraeEmailDialog = (ids = null) => {
    const idsToSend = ids?.length ? ids : (activeInternshipId ? [activeInternshipId] : []);
    if (idsToSend.length === 0) return;
    setEmailDialog({ open: true, internshipIds: idsToSend });
    setEmailError('');
  };

  const closeDiraeEmailDialog = () => {
    if (diraeActionLoading === 'email') return;
    setEmailDialog({ open: false, internshipIds: [] });
    setEmailError('');
    setDiraeEmailMessage('');
  };

  const handleEmailDiraePackage = async (event) => {
    event.preventDefault();
    const normalizedEmail = diraeEmail.trim();
    if (!normalizedEmail) {
      setEmailError('Ingresa el correo de DIRAE para enviar el expediente.');
      return;
    }

    setDiraeActionLoading('email');
    setEmailError('');
    setExportError('');
    try {
      const result = await documentService.emailDiraeDocumentPackages({
        internshipIds: emailDialog.internshipIds,
        diraeEmail: normalizedEmail,
        message: diraeEmailMessage,
      });
      const statusMessage = result.notification_status === 'simulated'
        ? 'El envío quedó registrado en modo simulado. Configura SMTP real para despacho efectivo.'
        : result.notification_status === 'sent'
          ? 'El correo fue enviado a DIRAE con el PDF adjunto.'
          : 'La notificación quedó registrada, pero el envío SMTP falló. Revisa la configuración de correo.';

      showToast({
        type: result.notification_status === 'failed' ? 'error' : 'success',
        title: result.notification_status === 'failed' ? 'Correo no enviado' : 'Expediente enviado',
        message: statusMessage,
      });
      setSelectedIds([]);
      setEmailDialog({ open: false, internshipIds: [] });
      setEmailError('');
      setDiraeEmailMessage('');
      await refreshActiveExpediente();
      await loadAllInternships();
    } catch (error) {
      setEmailError(getDiraeActionErrorMessage(error, 'No se pudo enviar el expediente por correo.'));
    } finally {
      setDiraeActionLoading('');
    }
  };

  const handleMarkReady = async () => {
    if (!activeInternshipId) return;

    setDiraeActionLoading('ready');
    setExportError('');
    try {
      await internshipService.markDiraeReady(activeInternshipId);
      showToast({
        type: 'success',
        title: 'Expediente listo',
        message: 'El expediente quedó marcado como listo para envío a DIRAE.',
      });
      await refreshActiveExpediente();
      await loadAllInternships();
    } catch (error) {
      setExportError(getErrorMessage(error, 'No se pudo marcar el expediente como listo.'));
    } finally {
      setDiraeActionLoading('');
    }
  };

  const handleReopen = async () => {
    if (!activeInternshipId) return;
    const comment = reopenComment.trim();
    if (!comment) {
      setExportError('Ingresa un motivo para reabrir el expediente.');
      return;
    }

    setDiraeActionLoading('reopen');
    setExportError('');
    try {
      await internshipService.reopenDiraeRectification(activeInternshipId, comment);
      setReopenComment('');
      showToast({
        type: 'success',
        title: 'Expediente reabierto',
        message: 'El expediente quedó observado para rectificación documental.',
      });
      await refreshActiveExpediente();
      await loadAllInternships();
    } catch (error) {
      setExportError(getErrorMessage(error, 'No se pudo reabrir el expediente.'));
    } finally {
      setDiraeActionLoading('');
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    setUploadError('');
    if (!activeInternshipId) return;
    if (!uploadDocumentTypeId || !uploadFile) {
      setUploadError('Selecciona un tipo administrativo y un archivo.');
      return;
    }

    const extension = uploadFile.name.split('.').pop()?.toLowerCase();
    if (!allowedUploadExtensions.includes(extension)) {
      setUploadError('Formato no permitido. Usa PDF, DOCX, JPG, PNG o ZIP.');
      return;
    }

    if (uploadFile.size > 10 * 1024 * 1024) {
      setUploadError('El archivo supera el máximo permitido de 10MB.');
      return;
    }

    setUploading(true);
    try {
      await documentService.uploadDocument(activeInternshipId, uploadDocumentTypeId, uploadFile);
      setUploadDocumentTypeId('');
      setUploadFile(null);
      showToast({
        type: 'success',
        title: 'Documento adjuntado',
        message: 'El documento administrativo fue cargado al expediente.',
      });
      await refreshActiveExpediente();
      await loadAllInternships();
    } catch (error) {
      setUploadError(getErrorMessage(error, 'No se pudo adjuntar el documento.'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-ufro-bg">
      <UserHeader />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl space-y-6">
        {!packageData && (
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {/* CAMBIADO A lg:items-center PARA CENTRAR VERTICALMENTE EL BUSCADOR */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#d22864]">
                Panel Secretaría
              </p>
              <h1 className="text-2xl font-black text-gray-950 tracking-tight">
                Expedientes documentales DIRAE
              </h1>
              <p className="text-sm font-medium text-gray-500 max-w-2xl">
                Bandeja documental para preparar expedientes, revisar adjuntos, gestionar rectificaciones y generar archivos de envío a DIRAE.
              </p>
              <p className="text-xs font-semibold text-sky-700 pt-0.5">
                Usa la búsqueda por ID para un expediente específico o la bandeja inferior para filtros y exportación en lote.
              </p>
            </div>

            {/* Formulario alineado perfectamente al centro sin márgenes forzados */}
            <form onSubmit={handleSearch} className="flex w-full gap-2 lg:max-w-md shrink-0">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={internshipIdInput}
                  onChange={(event) => setInternshipIdInput(event.target.value)}
                  placeholder="ID de práctica"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 px-4 pl-9 text-sm font-bold text-gray-800 outline-none transition focus:border-[#d22864]/30 focus:bg-white"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#d22864] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Consultar
              </button>
            </form>
          </div>
        </section>
      )}

        {pageError && (
          <section className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-bold text-red-700">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{pageError}</p>
            </div>
          </section>
        )}

        {loading && (
          <section className="mt-6 flex items-center justify-center rounded-xl border border-gray-100 bg-white py-12 shadow-sm">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#d22864]" />
              <p className="mt-3 text-xs font-black uppercase tracking-widest text-gray-500">
                Cargando expediente
              </p>
            </div>
          </section>
        )}

        {!loading && packageData && (
          <section className="space-y-4">
            <button
              type="button"
              onClick={() => {
                setActiveInternshipId(null);
                setPackageData(null);
                setInternship(null);
                setSelectedIds([]);
                loadAllInternships();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-black text-gray-600 transition hover:border-[#d22864]/20 hover:bg-[#fff0f6] hover:text-[#d22864]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver a la bandeja
            </button>

            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="space-y-4">
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Expediente #{activeInternshipId}
                    </p>
                    <h2 className="mt-1 text-xl font-black text-gray-900">
                      {packageData.internship.organization || internship?.org_name || 'Organización no registrada'}
                    </h2>
                    <p className="text-xs font-semibold text-gray-500">
                      {getStudentFullName(student)} · {getStudentIdentifierLabel(student)}: {getStudentIdentifier(student)} · {student?.email || 'correo no disponible'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={refreshActiveExpediente}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-black text-gray-600 transition hover:bg-gray-50"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Actualizar
                  </button>
                </div>

                <div className="mt-4 grid gap-2 md:grid-cols-4">
                  <StatusCard label="Estado de solicitud" value={packageData.status || getStatusTitle(internship)} />
                  <StatusCard label="Estado de práctica" value={COMPLETION_STATUS[internship?.completion_status] || 'Sin dato'} />
                  <StatusCard label="Resultado final" value={FINAL_RESULT[internship?.final_result] || 'Sin dato'} />
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Expediente DIRAE
                    </p>
                    <span className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-black ${diraeStatus.className}`}>
                      {diraeStatus.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('documents')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                    activeTab === 'documents'
                      ? 'border-[#d22864] text-[#d22864]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Documentos del expediente
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('registration')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                    activeTab === 'registration'
                      ? 'border-[#d22864] text-[#d22864]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Ficha de Inscripción
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('evaluations')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                    activeTab === 'evaluations'
                      ? 'border-[#d22864] text-[#d22864]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Evaluaciones
                </button>
              </div>

              {activeTab === 'documents' && (
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#d22864]">
                        Documentos del expediente
                      </p>
                    <h3 className="text-sm font-black text-gray-900">
                      Revisión documental
                    </h3>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[400px]">
                    <input
                      value={documentSearch}
                      onChange={(event) => setDocumentSearch(event.target.value)}
                      placeholder="Buscar documento"
                      className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold outline-none focus:border-[#d22864]/30 sm:col-span-1"
                    />
                    <select
                      value={documentTypeFilter}
                      onChange={(event) => setDocumentTypeFilter(event.target.value)}
                      className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold outline-none focus:border-[#d22864]/30"
                    >
                      <option value="all">Todos los tipos</option>
                      {documentTypes.map((type) => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                    <select
                      value={documentStatusFilter}
                      onChange={(event) => setDocumentStatusFilter(event.target.value)}
                      className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold outline-none focus:border-[#d22864]/30"
                    >
                      <option value="all">Todos los estados</option>
                      <option value="uploaded">Cargado</option>
                      <option value="approved">Aprobado</option>
                      <option value="observed">Observado</option>
                    </select>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {filteredDocuments.length === 0 && (
                    <EmptyState
                      icon={<FileText className="h-8 w-8" />}
                      title="No hay documentos con estos filtros"
                      message="Si el expediente contiene documentos sensibles, el backend los omite para Secretaría."
                    />
                  )}

                  {filteredDocuments.map((document) => (
                    <DocumentCard
                      key={document.id}
                      document={document}
                      isReviewing={reviewDocumentId === document.id}
                      isUpdating={updatingDocumentId === document.id}
                      reviewStatus={reviewStatus}
                      reviewComment={reviewComment}
                      reviewError={reviewError}
                      onDownload={() => handleDownloadDocument(document)}
                      onOpenReview={() => openReview(document)}
                      onReviewStatusChange={setReviewStatus}
                      onReviewCommentChange={(value) => {
                        setReviewComment(value);
                        setReviewError('');
                      }}
                      onSaveReview={() => handleDocumentReview(document.id)}
                    />
                  ))}
                </div>
              </div>
              )}

              {/* Pestaña 2: Ficha de Inscripción */}
              {activeTab === 'registration' && (
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#d22864]">Ficha de inscripción</p>
                    <h3 className="text-sm font-black text-gray-900">Datos registrados de la práctica</h3>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3 rounded-xl bg-gray-50/70 p-4 border border-gray-100">
                      <h4 className="font-bold text-gray-800 border-b border-gray-200 pb-1.5 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 size={14} className="text-[#d22864]" />
                        Organización / Empresa
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="block text-[10px] font-bold text-gray-400">Nombre</span>
                          <span className="font-semibold text-gray-800">{internship?.org_name || '-'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-gray-400">Dirección</span>
                          <span className="font-semibold text-gray-800">{internship?.internship_address || '-'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-gray-400">Ciudad</span>
                          <span className="font-semibold text-gray-800">{internship?.city || '-'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-gray-400">Teléfono</span>
                          <span className="font-semibold text-gray-800">{internship?.org_phone || 'No registrado'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 rounded-xl bg-gray-50/70 p-4 border border-gray-100">
                      <h4 className="font-bold text-gray-800 border-b border-gray-200 pb-1.5 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <User size={14} className="text-[#d22864]" />
                        Supervisor/a de Práctica
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="block text-[10px] font-bold text-gray-400">Nombre</span>
                          <span className="font-semibold text-gray-800">{internship?.supervisor_name || '-'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-gray-400">Correo Electrónico</span>
                          <span className="font-semibold text-gray-800">{internship?.supervisor_email || '-'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-gray-400">Teléfono</span>
                          <span className="font-semibold text-gray-800">{internship?.supervisor_phone || 'No registrado'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-gray-400">Cargo / Función</span>
                          <span className="font-semibold text-gray-800">{internship?.supervisor_role || 'No registrado'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 rounded-xl bg-gray-50/70 p-4 border border-gray-100 md:col-span-2">
                      <h4 className="font-bold text-gray-800 border-b border-gray-200 pb-1.5 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <FileText size={14} className="text-[#d22864]" />
                        Detalles del Proceso
                      </h4>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs">
                        <div>
                          <span className="block text-[10px] font-bold text-gray-400">Tipo de Práctica</span>
                          <span className="font-semibold text-gray-800">{internship?.internship_type || '-'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-gray-400">Modalidad</span>
                          <span className="font-semibold text-gray-800">{internship?.modality || '-'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-gray-400">Período</span>
                          <span className="font-semibold text-gray-800">{internship?.internship_period || '-'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-gray-400">Horario de Trabajo</span>
                          <span className="font-semibold text-gray-800">{internship?.schedule || '-'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-gray-400">Horas Semanales</span>
                          <span className="font-semibold text-gray-800">{internship?.working_hours || '-'} hrs</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-gray-400">Fechas</span>
                          <span className="font-semibold text-gray-800">
                            {internship?.start_date ? formatDate(internship.start_date) : '-'} — {internship?.end_date ? formatDate(internship.end_date) : '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pestaña 3: Evaluaciones */}
              {activeTab === 'evaluations' && (
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#d22864]">Evaluaciones del proceso</p>
                    <h3 className="text-sm font-black text-gray-900">Autoevaluación del estudiante y evaluación del supervisor</h3>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="space-y-3 rounded-xl bg-gray-50/70 p-4 border border-gray-100">
                      <h4 className="font-bold text-gray-800 border-b border-gray-200 pb-1.5 text-xs uppercase tracking-wider flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <User size={14} className="text-[#d22864]" />
                          Autoevaluación
                        </span>
                        {selfEvaluationForm?.evaluation ? (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5 font-bold uppercase">Entregada</span>
                        ) : (
                          <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 font-bold uppercase">Pendiente</span>
                        )}
                      </h4>

                      {selfEvaluationForm?.evaluation ? (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            {selfEvaluationForm.criteria?.map((criterion) => {
                              const score = selfEvaluationForm.evaluation.responses[criterion.key];
                              return (
                                <div key={criterion.key} className="bg-white p-2.5 rounded-lg border border-gray-100 flex items-center justify-between gap-3 text-xs">
                                  <div className="min-w-0">
                                    <p className="font-bold text-gray-800">{criterion.label}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{criterion.description}</p>
                                  </div>
                                  <span className="bg-[#fff0f6] text-[#d22864] font-black h-7 w-7 rounded-lg flex items-center justify-center text-xs shadow-xs flex-shrink-0">{score || '-'}</span>
                                </div>
                              );
                            })}
                          </div>
                          {selfEvaluationForm.evaluation.observations && (
                            <div className="bg-white p-2.5 rounded-lg border border-gray-100 text-xs">
                              <span className="block font-bold text-gray-400 uppercase tracking-wide mb-0.5">Observaciones:</span>
                              <p className="text-gray-600 italic">“{selfEvaluationForm.evaluation.observations}”</p>
                            </div>
                          )}
                          <div className="text-[10px] text-gray-400 font-semibold">
                            Envío: {selfEvaluationForm.evaluation.submitted_at ? formatDateTime(selfEvaluationForm.evaluation.submitted_at) : '-'}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs font-semibold text-gray-500 italic text-center py-6">El estudiante aún no ha completado la autoevaluación.</p>
                      )}
                    </div>

                    <div className="space-y-3 rounded-xl bg-gray-50/70 p-4 border border-gray-100">
                      <h4 className="font-bold text-gray-800 border-b border-gray-200 pb-1.5 text-xs uppercase tracking-wider flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Building2 size={14} className="text-[#d22864]" />
                          Evaluación del supervisor
                        </span>
                        {supervisorEvaluation ? (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5 font-bold uppercase">Entregada</span>
                        ) : (
                          <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 font-bold uppercase">Pendiente</span>
                        )}
                      </h4>

                      {supervisorEvaluation ? (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            {Object.entries(SUPERVISOR_CRITERIA_LABELS).map(([key, info]) => {
                              const score = supervisorEvaluation.criteria_scores[key];
                              return (
                                <div key={key} className="bg-white p-2.5 rounded-lg border border-gray-100 flex items-center justify-between gap-3 text-xs">
                                  <div className="min-w-0">
                                    <p className="font-bold text-gray-800">{info.label}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{info.desc}</p>
                                  </div>
                                  <span className="bg-[#fff0f6] text-[#d22864] font-black h-7 w-7 rounded-lg flex items-center justify-center text-xs shadow-xs flex-shrink-0">{score || '-'}</span>
                                </div>
                              );
                            })}
                          </div>

                          <div className="bg-white p-2.5 rounded-lg border border-gray-100 text-xs space-y-1.5">
                            <div>
                              <span className="block font-bold text-gray-400 uppercase tracking-wide mb-0.5">Recomendación:</span>
                              <span className={`inline-flex rounded-full px-2 py-0.5 font-bold text-[10px] ${
                                supervisorEvaluation.recommendation === 'recommended' ? 'bg-green-50 text-green-700' :
                                supervisorEvaluation.recommendation === 'recommended_with_observations' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
                              }`}>
                                {RECOMMENDATION_LABELS[supervisorEvaluation.recommendation] || supervisorEvaluation.recommendation}
                              </span>
                            </div>
                            {supervisorEvaluation.observations && (
                              <div>
                                <span className="block font-bold text-gray-400 uppercase tracking-wide mb-0.5">Observaciones:</span>
                                <p className="text-gray-600 italic">“{supervisorEvaluation.observations}”</p>
                              </div>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-400 font-semibold">
                            {supervisorEvaluation.supervisor_name_snapshot} ({supervisorEvaluation.supervisor_email_snapshot})<br />
                            Envío: {supervisorEvaluation.submitted_at ? formatDateTime(supervisorEvaluation.submitted_at) : '-'}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs font-semibold text-gray-500 italic text-center py-6">El supervisor aún no ha completado la evaluación.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>

            <aside className="space-y-6">
              <DiraePackagePanel
                packageData={packageData}
                exportError={exportError}
                actionLoading={diraeActionLoading}
                reopenComment={reopenComment}
                onReopenCommentChange={setReopenComment}
                onMarkReady={handleMarkReady}
                onReopen={handleReopen}
                onExport={handleExportPdf}
                onEmail={() => openDiraeEmailDialog()}
              />

              <AdministrativeUploadPanel
                uploadableTypes={uploadableTypes}
                selectedTypeId={uploadDocumentTypeId}
                uploadFile={uploadFile}
                uploadError={uploadError}
                uploading={uploading}
                onTypeChange={setUploadDocumentTypeId}
                onFileChange={setUploadFile}
                onSubmit={handleUpload}
              />

              <TrackingPanel tracking={diraeTracking} />
            </aside>
            </div>
          </section>
        )}

        {!loading && !activeInternshipId && (
          <section className="space-y-5">
            <div className="grid grid-cols-2 gap-2 xl:grid-cols-5">
              <SecretaryInboxStatCard label="Resultados" value={globalTotal} helper="según filtros" />
              <SecretaryInboxStatCard label="En revisión local" value={globalStats.in_review} helper="en preparación" />
              <SecretaryInboxStatCard label="Observados" value={globalStats.observed} helper="requieren corrección" />
              <SecretaryInboxStatCard label="Listos DIRAE" value={globalStats.ready} helper="exportables" tone="success" />
              <SecretaryInboxStatCard label="Enviados DIRAE" value={globalStats.exported} helper="ya enviados" tone="accent" />
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-5">
              {/* Encabezado alineado perfectamente en el centro vertical */}
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between border-b border-gray-100 pb-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#d22864]">
                    Bandeja documental
                  </p>
                  <h2 className="mt-0.5 text-base font-black text-gray-900">
                    Preparación para envío a DIRAE
                  </h2>
                  <p className="text-xs font-semibold text-gray-400 mt-0.5">
                    Mostrando {pageStart}-{pageEnd} de {globalTotal} expedientes.
                  </p>
                </div>

                {/* Botones laterales */}
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={loadAllInternships}
                    disabled={globalLoading}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 transition hover:bg-gray-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${globalLoading ? 'animate-spin' : ''}`} />
                    Actualizar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportPdf(selectedIds)}
                    disabled={selectedIds.length === 0 || diraeActionLoading === 'export'}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#d22864] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:opacity-90"
                  >
                    {diraeActionLoading === 'export' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                    PDF DIRAE ({selectedIds.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => openDiraeEmailDialog(selectedIds)}
                    disabled={selectedIds.length === 0 || diraeActionLoading === 'email'}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#d22864]/20 bg-white px-3 py-1.5 text-xs font-bold text-[#d22864] shadow-sm transition hover:bg-[#fff0f6]"
                  >
                    {diraeActionLoading === 'email' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
                    Email ({selectedIds.length})
                  </button>
                </div>
              </div>

              {/* Grid de Filtros Homogéneos y con Estilo Consistente */}
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-[2fr_1.2fr_1.2fr_1fr_auto]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <input
                    value={globalSearch}
                    onChange={(event) => {
                      setGlobalSearch(event.target.value);
                      setGlobalOffset(0);
                      setSelectedIds([]);
                    }}
                    placeholder="Buscar por estudiante, matrícula, RUT u organización"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2 px-3 pl-8 text-xs font-semibold text-gray-700 outline-none transition focus:border-[#d22864]/30 focus:bg-white"
                  />
                </div>

                {/* Selects suavizados con font-semibold y color equilibrado */}
                <select
                  value={degreeFilter}
                  onChange={(event) => {
                    setDegreeFilter(event.target.value);
                    setGlobalOffset(0);
                    setSelectedIds([]);
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold text-gray-700 outline-none transition focus:bg-white cursor-pointer"
                >
                  <option value="all">Todas las carreras</option>
                  {uniqueDegrees.map((deg) => (
                    <option key={deg} value={deg}>{deg}</option>
                  ))}
                </select>

                <select
                  value={diraeStatusFilter}
                  onChange={(event) => {
                    setDiraeStatusFilter(event.target.value);
                    setGlobalOffset(0);
                    setSelectedIds([]);
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold text-gray-700 outline-none transition focus:bg-white cursor-pointer"
                >
                  <option value="all">Todos los estados DIRAE</option>
                  <option value="not_started">No iniciado</option>
                  <option value="in_review">En revisión local</option>
                  <option value="observed">Observado</option>
                  <option value="ready">Listo para exportar</option>
                  <option value="exported">Enviado a DIRAE</option>
                </select>

                <select
                  value={selectedSortValue}
                  onChange={(event) => {
                    const [nextSortBy, nextSortDir] = event.target.value.split(':');
                    setGlobalSortBy(nextSortBy);
                    setGlobalSortDir(nextSortDir);
                    setGlobalOffset(0);
                    setSelectedIds([]);
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold text-gray-700 outline-none transition focus:bg-white cursor-pointer"
                >
                  {SECRETARY_SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>

                <select
                  value={globalLimit}
                  onChange={(event) => {
                    setGlobalLimit(Number(event.target.value));
                    setGlobalOffset(0);
                    setSelectedIds([]);
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold text-gray-700 outline-none transition focus:bg-white cursor-pointer"
                >
                  {SECRETARY_PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>{size} por pág.</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
              {globalLoading ? (
                <div className="py-12 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#d22864]" />
                  <p className="mt-2 text-xs font-black uppercase tracking-widest text-gray-400">Cargando bandeja documental...</p>
                </div>
              ) : filteredInternships.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <FileText className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="mt-3 text-xs font-black uppercase tracking-wider text-gray-500">No se encontraron expedientes</p>
                  <p className="mt-1 text-[10px] text-gray-400">Ajusta los filtros o revisa si existen prácticas finalizadas o en preparación DIRAE.</p>
                </div>
              ) : (
                <>
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[1000px] table-fixed border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/60 text-[11px] font-black uppercase tracking-wider text-gray-400">
                        <th className="py-3.5 px-4 w-12 text-center align-middle">
                          <SelectionCheckbox
                            disabled={readyIdsInCurrentFilter.length === 0}
                            checked={allReadySelected}
                            onChange={() => {
                              if (allReadySelected) {
                                setSelectedIds(prev => prev.filter(id => !readyIdsInCurrentFilter.includes(id)));
                              } else {
                                setSelectedIds(prev => [...new Set([...prev, ...readyIdsInCurrentFilter])]);
                              }
                            }}
                            ariaLabel="Seleccionar todos los expedientes listos para exportar"
                          />
                        </th>
                        <th className="py-3.5 px-4 text-left align-middle w-[24%]">Estudiante</th>
                        <th className="py-3.5 px-4 text-left align-middle w-[18%]">Carrera</th>
                        <th className="py-3.5 px-4 text-left align-middle w-[22%]">Organización / Tipo</th>
                        <th className="py-3.5 px-4 text-center align-middle w-[14%]">Estado Práctica</th>
                        <th className="py-3.5 px-4 text-center align-middle w-[12%]">Expediente DIRAE</th>
                        <th className="py-3.5 px-4 text-center align-middle w-[10%]">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {filteredInternships.map((item) => {
                        const diraeStatusInfo = DIRAE_STATUS[item.dirae_status] || DIRAE_STATUS.not_started;
                        const isSelectable = item.dirae_status === 'ready';

                        return (
                          <tr key={item.id} className="hover:bg-gray-50/40 transition-colors group">
                            {/* Checkbox */}
                            <td className="py-4 px-4 text-center align-middle">
                              <SelectionCheckbox
                                disabled={!isSelectable}
                                checked={isSelectable && selectedIds.includes(item.id)}
                                onChange={() => {
                                  if (isSelectable) toggleSelectedId(item.id);
                                }}
                                ariaLabel={`Seleccionar expediente ${item.id}`}
                              />
                            </td>

                            {/* Estudiante */}
                            <td className="py-4 px-4 text-left align-middle">
                              <div className="space-y-0.5">
                                <p className="font-bold text-gray-900 text-sm tracking-tight leading-snug">
                                  {getStudentFullName(item.student)}
                                </p>
                                <p className="text-xs font-medium text-gray-400">
                                  #{item.id} <span className="text-gray-300">·</span> {getStudentIdentifierLabel(item.student)}: {getStudentIdentifier(item.student)}
                                </p>
                              </div>
                            </td>

                            {/* Carrera */}
                            <td className="py-4 px-4 text-left align-middle">
                              <span className="text-xs text-gray-600 font-semibold leading-relaxed block">
                                {item.student?.degree || 'Sin carrera'}
                              </span>
                            </td>

                            {/* Organización / Tipo */}
                            <td className="py-4 px-4 text-left align-middle">
                              <div className="space-y-0.5">
                                <p className="font-bold text-gray-800 text-sm tracking-tight leading-snug line-clamp-2">
                                  {item.org_name}
                                </p>
                                <p className="text-xs font-medium text-gray-400">
                                  {item.internship_type}
                                </p>
                              </div>
                            </td>

                            {/* Estado Práctica */}
                            <td className="py-4 px-4 text-center align-middle">
                              <div className="flex flex-wrap items-center justify-center gap-1.5">
                                <span className="inline-flex items-center rounded-full bg-gray-50 border border-gray-200 px-2.5 py-0.5 text-[11px] font-bold text-gray-600">
                                  {COMPLETION_STATUS[item.completion_status] || item.completion_status}
                                </span>
                                {item.final_result === 'passed' && (
                                  <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                                    Aprobada
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Expediente DIRAE */}
                            <td className="py-4 px-4 text-center align-middle">
                              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wide transition-colors ${diraeStatusInfo.className}`}>
                                {diraeStatusInfo.label}
                              </span>
                            </td>

                            {/* Acción */}
                            <td className="py-4 px-4 text-center align-middle">
                              <button
                                type="button"
                                onClick={() => loadExpediente(item.id)}
                                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-bold text-gray-700 shadow-xs transition-all hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 active:bg-gray-100"
                              >
                                <Eye className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                Revisar
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                  <div className="space-y-2 p-3 lg:hidden">
                    {filteredInternships.map((item) => {
                      const isSelectable = item.dirae_status === 'ready';
                      return (
                        <SecretaryInboxMobileCard
                          key={item.id}
                          internship={item}
                          selected={selectedIds.includes(item.id)}
                          selectable={isSelectable}
                          onToggle={() => {
                            if (!isSelectable) return;
                            toggleSelectedId(item.id);
                          }}
                          onReview={() => loadExpediente(item.id)}
                        />
                      );
                    })}
                  </div>

                  <SecretaryPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageStart={pageStart}
                    pageEnd={pageEnd}
                    total={globalTotal}
                    onPrevious={() => {
                      setGlobalOffset(Math.max(0, globalOffset - globalLimit));
                      setSelectedIds([]);
                    }}
                    onNext={() => {
                      setGlobalOffset(globalOffset + globalLimit);
                      setSelectedIds([]);
                    }}
                    previousDisabled={globalOffset === 0}
                    nextDisabled={globalOffset + globalLimit >= globalTotal}
                  />
                </>
              )}
            </div>
          </section>
        )}
      </main>
      {emailDialog.open && (
        <DiraeEmailModal
          email={diraeEmail}
          message={diraeEmailMessage}
          error={emailError}
          packageCount={emailDialog.internshipIds.length}
          loading={diraeActionLoading === 'email'}
          onEmailChange={setDiraeEmail}
          onMessageChange={setDiraeEmailMessage}
          onClose={closeDiraeEmailDialog}
          onSubmit={handleEmailDiraePackage}
        />
      )}
      <Footer />
    </div>
  );
};

const SecretaryInboxStatCard = ({ label, value, helper, tone = 'default' }) => {
  const toneClass = {
    default: {
      card: 'bg-white text-gray-900 border-gray-200',
      number: 'text-gray-950',
      label: 'text-gray-400'
    },
    success: {
      card: 'bg-emerald-50/60 text-emerald-800 border-emerald-100',
      number: 'text-emerald-700',
      label: 'text-emerald-600'
    },
    accent: {
      card: 'bg-[#fff0f6] text-[#8B1D46] border-[#fcc2d7]',
      number: 'text-[#d22864]',
      label: 'text-[#8B1D46]/80'
    },
  }[tone];

  return (
    // Se aumentó a p-4 y se eliminó cualquier altura fija innecesaria
    <div className={`rounded-xl border p-4 shadow-sm transition-all flex flex-col justify-between ${toneClass.card}`}>
      <div>
        <p className={`text-[10px] font-black uppercase tracking-widest ${toneClass.label}`}>
          {label}
        </p>
        {/* El número ahora toma el color protagónico según el estado */}
        <p className={`mt-1.5 text-2xl font-black tracking-tight ${toneClass.number}`}>
          {value}
        </p>
      </div>
      <p className="text-[10px] font-bold opacity-60 mt-1">
        {helper}
      </p>
    </div>
  );
};

const SelectionCheckbox = ({
  checked,
  disabled = false,
  onChange,
  ariaLabel,
  className = '',
}) => (
  <label
    className={`inline-flex h-5 w-5 items-center justify-center ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'} ${className}`}
  >
    <input
      type="checkbox"
      disabled={disabled}
      checked={checked}
      onChange={onChange}
      aria-label={ariaLabel}
      className="peer sr-only"
    />
    <span className="flex h-5 w-5 items-center justify-center rounded-md border border-gray-300 bg-white text-white shadow-sm transition peer-focus-visible:ring-2 peer-focus-visible:ring-[#d22864]/35 peer-focus-visible:ring-offset-2 peer-checked:border-[#d22864] peer-checked:bg-[#d22864]">
      {checked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
    </span>
  </label>
);

const SecretaryInboxMobileCard = ({
  internship,
  selected,
  selectable,
  onToggle,
  onReview,
}) => {
  const diraeStatusInfo = DIRAE_STATUS[internship.dirae_status] || DIRAE_STATUS.not_started;
  const student = internship.student;

  return (
    <article className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            #{internship.id}
          </p>
          <h3 className="text-sm font-black text-gray-900">{getStudentFullName(student)}</h3>
          <p className="text-xs font-semibold text-gray-500">
            {getStudentIdentifierLabel(student)}: {getStudentIdentifier(student)}
          </p>
        </div>
        <SelectionCheckbox
          disabled={!selectable}
          checked={selectable && selected}
          onChange={onToggle}
          ariaLabel={`Seleccionar expediente ${internship.id}`}
          className="mt-1"
        />
      </div>

      <div className="mt-3 grid gap-2 text-xs">
        <div className="rounded-lg bg-gray-50 p-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Carrera</p>
          <p className="font-bold text-gray-800">{student?.degree || 'Sin carrera'}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Organización</p>
          <p className="font-bold text-gray-800">{internship.org_name}</p>
          <p className="text-[10px] font-semibold text-gray-500">{internship.internship_type}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-600">
            {COMPLETION_STATUS[internship.completion_status] || internship.completion_status}
          </span>
          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${diraeStatusInfo.className}`}>
            {diraeStatusInfo.label}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onReview}
        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-[10px] font-black text-white transition hover:bg-[#d22864]"
      >
        <Eye className="h-3 w-3" />
        Revisar expediente
      </button>
    </article>
  );
};

const SecretaryPagination = ({
  currentPage,
  totalPages,
  pageStart,
  pageEnd,
  total,
  onPrevious,
  onNext,
  previousDisabled,
  nextDisabled,
}) => (
  <div className="flex flex-col gap-2 border-t border-gray-100 bg-gray-50/70 px-4 py-3 text-xs font-bold text-gray-500 sm:flex-row sm:items-center sm:justify-between">
    <span>
      Página {currentPage} de {totalPages} · {pageStart}-{pageEnd} de {total}
    </span>
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onPrevious}
        disabled={previousDisabled}
        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-black text-gray-600 transition hover:border-[#d22864]/20 hover:text-[#d22864] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Anterior
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-black text-gray-600 transition hover:border-[#d22864]/20 hover:text-[#d22864] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Siguiente
      </button>
    </div>
  </div>
);

const DiraeEmailModal = ({
  email,
  message,
  error,
  packageCount,
  loading,
  onEmailChange,
  onMessageChange,
  onClose,
  onSubmit,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 px-4 py-6 backdrop-blur-sm">
    <div className="w-full max-w-lg rounded-xl border border-gray-100 bg-white p-5 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#d22864]">
            Envío a DIRAE
          </p>
          <h2 className="mt-0.5 text-lg font-black text-gray-900">
            Enviar expediente por email
          </h2>
          <p className="mt-1 text-xs font-semibold text-gray-500">
            Se enviarán {packageCount} expediente{packageCount === 1 ? '' : 's'} en PDF.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="rounded-lg bg-gray-50 px-2.5 py-1.5 text-[10px] font-black text-gray-500 transition hover:bg-gray-100 disabled:opacity-50"
        >
          Cerrar
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <label className="block">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            Correo DIRAE
          </span>
          <input
            type="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            placeholder="dirae@ufrontera.cl"
            className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-[#d22864]/30 focus:bg-white"
          />
        </label>
        <label className="block">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            Nota opcional
          </span>
          <textarea
            value={message}
            onChange={(event) => onMessageChange(event.target.value)}
            placeholder="Agrega una observación breve para DIRAE si corresponde."
            className="mt-1 h-24 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-[#d22864]/30 focus:bg-white"
          />
        </label>

        {error && (
          <div className="rounded-lg border border-red-100 bg-red-50 p-2.5 text-xs font-bold text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-black text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#d22864] px-4 py-2 text-xs font-black text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
            Enviar a DIRAE
          </button>
        </div>
      </form>
    </div>
  </div>
);

const StatusCard = ({ label, value }) => (
  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 h-full flex flex-col justify-between min-h-[72px]">
    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-tight mb-2">
      {label}
    </p>
    <p className="text-xs font-black text-gray-900 mt-auto">
      {value}
    </p>
  </div>
);

const EmptyState = ({ icon, title, message }) => (
  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-gray-400">
    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
      {icon}
    </div>
    <p className="mt-3 text-xs font-black uppercase tracking-widest text-gray-500">{title}</p>
    <p className="mt-1 text-[10px] font-semibold text-gray-400">{message}</p>
  </div>
);

const DocumentCard = ({
  document,
  isReviewing,
  isUpdating,
  reviewStatus,
  reviewComment,
  reviewError,
  onDownload,
  onOpenReview,
  onReviewStatusChange,
  onReviewCommentChange,
  onSaveReview,
}) => {
  const status = DOCUMENT_STATUS[document.status] || DOCUMENT_STATUS.uploaded;

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff0f6] text-[#d22864]">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-gray-900">{document.document_type?.name || 'Documento'}</h4>
            <p className="text-xs font-semibold text-gray-400">
              {document.file_name} · {formatDate(document.upload_date)}
            </p>
            <span className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${status.className}`}>
              {status.label}
            </span>
          </div>
        </div>

        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={onDownload}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 text-[10px] font-black text-gray-600 transition hover:bg-[#fff0f6] hover:text-[#d22864]"
          >
            <Download className="h-3.5 w-3.5" />
            Descargar
          </button>
          <button
            type="button"
            onClick={onOpenReview}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#d22864] px-3 py-1.5 text-[10px] font-black text-white transition hover:opacity-90"
          >
            <Eye className="h-3.5 w-3.5" />
            Revisar
          </button>
        </div>
      </div>

      {document.review_comment && (
        <div className="mt-3 rounded-xl bg-gray-50 p-3 text-xs font-semibold text-gray-600">
          Último comentario: “{document.review_comment}”
        </div>
      )}

      {isReviewing && (
        <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onReviewStatusChange('approved')}
              className={`rounded-lg p-2 text-xs font-black ${reviewStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-emerald-700'}`}
            >
              Aprobar
            </button>
            <button
              type="button"
              onClick={() => onReviewStatusChange('observed')}
              className={`rounded-lg p-2 text-xs font-black ${reviewStatus === 'observed' ? 'bg-purple-100 text-purple-800' : 'bg-white text-purple-700'}`}
            >
              Observar
            </button>
          </div>
          <textarea
            value={reviewComment}
            onChange={(event) => onReviewCommentChange(event.target.value)}
            placeholder="Comentario de revisión"
            className="mt-2 h-20 w-full resize-none rounded-lg border border-gray-100 bg-white p-2.5 text-xs font-semibold text-gray-800 outline-none focus:border-[#d22864]/30"
          />
          {reviewError && <p className="mt-1.5 text-xs font-bold text-red-600">{reviewError}</p>}
          <button
            type="button"
            onClick={onSaveReview}
            disabled={isUpdating}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-black text-white disabled:opacity-60"
          >
            {isUpdating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Guardar revisión
          </button>
        </div>
      )}
    </div>
  );
};

const DiraePackagePanel = ({
  packageData,
  exportError,
  actionLoading,
  reopenComment,
  onReopenCommentChange,
  onMarkReady,
  onReopen,
  onExport,
  onEmail,
}) => {
  const canMarkReady = ['in_review', 'observed'].includes(packageData.dirae_status);
  const isReady = packageData.dirae_status === 'ready';
  const isExported = packageData.dirae_status === 'exported';

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#d22864]">Expediente DIRAE</p>
          <h3 className="mt-1 text-lg font-black text-gray-900">Preparación para envío</h3>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-black ${packageData.exportable ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {packageData.exportable ? 'Exportable' : 'No exportable'}
        </span>
      </div>

      {packageData.reasons.length > 0 && (
        <div className="mt-4 space-y-2">
          {packageData.reasons.map((reason) => (
            <div key={reason} className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-bold text-red-700">
              {PACKAGE_REASONS[reason] || reason}
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 grid gap-3">
        {/* CORREGIDO: Asegura el mapeo correcto con PackageItem */}
        {packageData.required_documents.map((item) => (
          <PackageItem key={item.type_id} item={item} required />
        ))}
        {packageData.optional_documents.map((item) => (
          <PackageItem key={item.type_id} item={item} />
        ))}
      </div>

      {exportError && (
        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-bold text-red-700">
          {exportError}
        </div>
      )}

      <div className="mt-5 space-y-3">
        <button
          type="button"
          onClick={() => onExport()}
          disabled={!packageData.exportable || actionLoading === 'export'}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#d22864] px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {actionLoading === 'export' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Generar PDF para DIRAE
        </button>
        <button
          type="button"
          onClick={onEmail}
          disabled={!packageData.exportable || actionLoading === 'email'}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#d22864]/20 bg-white px-4 py-3 text-sm font-black text-[#d22864] transition hover:bg-[#fff0f6] disabled:cursor-not-allowed disabled:border-gray-100 disabled:bg-gray-100 disabled:text-gray-400"
        >
          {actionLoading === 'email' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          Enviar expediente por email
        </button>

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs font-black uppercase tracking-widest text-gray-500">
            Preparación DIRAE
          </p>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-gray-600">
            Al abrir el expediente queda en revisión local. Al terminar la revisión, márcalo como listo para habilitar la generación o envío del PDF a DIRAE.
          </p>
          <button
            type="button"
            onClick={onMarkReady}
            disabled={!canMarkReady || actionLoading === 'ready'}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-black text-white transition hover:bg-[#d22864] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {actionLoading === 'ready' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {isExported
              ? 'Expediente enviado a DIRAE'
              : isReady
                ? 'Expediente listo para envío'
                : 'Marcar listo para envío'}
          </button>
        </div>
        <ActionBox
          label="Reabrir para rectificación"
          placeholder="Motivo de reapertura"
          value={reopenComment}
          loading={actionLoading === 'reopen'}
          onChange={onReopenCommentChange}
          onSubmit={onReopen}
          icon={<RefreshCw className="h-4 w-4" />}
          submitLabel="Reabrir expediente"
        />
      </div>
    </section>
  );
};

const PackageItem = ({ item, required = false }) => (
  <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3">
    <div>
      <p className="text-sm font-black text-gray-800">{item.type_name}</p>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
        {required ? 'Requerido' : 'Opcional'}
      </p>
    </div>
    {item.status === 'approved' ? (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
        <CheckCircle2 className="h-3 w-3" /> Aprobado
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
        <AlertCircle className="h-3 w-3" /> Faltante
      </span>
    )}
  </div>
);

const ActionBox = ({ label, placeholder, value, loading, onChange, onSubmit, icon, submitLabel = 'Confirmar acción' }) => (
  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
    <p className="text-xs font-black uppercase tracking-widest text-gray-500">{label}</p>
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="mt-2 h-20 w-full resize-none rounded-xl border border-gray-100 bg-white p-3 text-sm font-semibold text-gray-800 outline-none focus:border-[#d22864]/30"
    />
    <button
      type="button"
      onClick={onSubmit}
      disabled={loading}
      className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-3 py-2 text-xs font-black text-white disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {submitLabel}
    </button>
  </div>
);

const AdministrativeUploadPanel = ({
  uploadableTypes,
  selectedTypeId,
  uploadFile,
  uploadError,
  uploading,
  onTypeChange,
  onFileChange,
  onSubmit,
}) => (
  <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
    <div className="flex gap-2">
      <ShieldAlert className="mt-0.5 h-4 w-4 text-[#d22864]" />
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-[#d22864]">Adjunto administrativo</p>
        <p className="text-xs font-semibold text-gray-500">
          Solo documentos administrativos no sensibles.
        </p>
      </div>
    </div>

    <form onSubmit={onSubmit} className="mt-3 space-y-2">
      <select
        value={selectedTypeId}
        onChange={(event) => onTypeChange(event.target.value)}
        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold outline-none focus:border-[#d22864]/30"
      >
        <option value="">Tipo documental administrativo</option>
        {uploadableTypes.map((type) => (
          <option key={type.id} value={type.id}>{type.name}</option>
        ))}
      </select>
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-3 text-xs font-bold text-gray-500 transition hover:bg-white">
        <UploadCloud className="h-4 w-4" />
        {uploadFile ? uploadFile.name : 'Seleccionar archivo'}
        <input
          type="file"
          className="hidden"
          accept=".pdf,.docx,.jpg,.png,.zip"
          onChange={(event) => onFileChange(event.target.files?.[0] || null)}
        />
      </label>
      {uploadError && <p className="text-xs font-bold text-red-600">{uploadError}</p>}
      <button
        type="submit"
        disabled={uploading}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-xs font-black text-white disabled:opacity-60"
      >
        {uploading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        Adjuntar documento
      </button>
    </form>
  </section>
);

const TrackingPanel = ({ tracking }) => (
  <details className="group rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <History className="h-4 w-4 text-[#d22864]" />
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#d22864]">Historial DIRAE</p>
          <h3 className="text-sm font-black text-gray-900">Trazabilidad técnica</h3>
        </div>
      </div>
      <span className="rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-black text-gray-500 transition group-open:bg-[#fff0f6] group-open:text-[#d22864]">
        Ver historial
      </span>
    </summary>

    <p className="mt-2 text-xs font-semibold leading-relaxed text-gray-500">
      Registro local de cambios del estado DIRAE. La auditoría completa queda centralizada en Superadmin.
    </p>

    <div className="mt-3 space-y-2">
      {tracking.length === 0 && (
        <p className="rounded-lg bg-gray-50 p-3 text-xs font-bold text-gray-500">
          Aún no hay cambios registrados en el expediente DIRAE.
        </p>
      )}
      {tracking.map((entry) => (
        <div key={entry.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
          <p className="text-xs font-black text-gray-900">
            {DIRAE_STATUS[entry.previous_status]?.label || 'Sin estado'} → {DIRAE_STATUS[entry.new_status]?.label || entry.new_status}
          </p>
          <p className="mt-1 text-[10px] font-semibold text-gray-500">
            {formatDateTime(entry.changed_at)} · {entry.actor?.email || 'actor no disponible'}
          </p>
          {entry.reason && <p className="mt-1.5 text-xs font-semibold text-gray-600">“{entry.reason}”</p>}
        </div>
      ))}
    </div>
  </details>
);

export default SecretaryDashboardPage;

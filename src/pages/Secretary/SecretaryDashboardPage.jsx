import { useDeferredValue, useState, useEffect, useMemo } from 'react';
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
  RefreshCw,
  Search,
  Send,
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
  not_started: { label: 'No iniciado', className: 'bg-gray-100 text-gray-700' },
  in_review: { label: 'En revisión local', className: 'bg-sky-50 text-sky-700' },
  observed: { label: 'Observado para rectificación', className: 'bg-purple-50 text-purple-700' },
  ready: { label: 'Listo para exportar', className: 'bg-emerald-50 text-emerald-700' },
  exported: { label: 'Expediente exportado a DIRAE', className: 'bg-[#fff0f6] text-[#d22864]' },
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
  return new Date(value).toLocaleDateString('es-CL');
};

const formatDateTime = (value) => {
  if (!value) return 'Sin fecha';
  return new Date(value).toLocaleString('es-CL');
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
  const [deriveComment, setDeriveComment] = useState('');
  const [reopenComment, setReopenComment] = useState('');
  const [diraeActionLoading, setDiraeActionLoading] = useState('');
  const [uploadDocumentTypeId, setUploadDocumentTypeId] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [exportError, setExportError] = useState('');
  const [selfEvaluationForm, setSelfEvaluationForm] = useState(null);
  const [supervisorEvaluation, setSupervisorEvaluation] = useState(null);
  const [activeTab, setActiveTab] = useState('documents');

  // Estados para Bandeja de Entrada Global
  const [allInternships, setAllInternships] = useState([]);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [globalSearch, setGlobalSearch] = useState('');
  const [degreeFilter, setDegreeFilter] = useState('all');
  const [diraeStatusFilter, setDiraeStatusFilter] = useState('all');

  const loadAllInternships = async () => {
    setGlobalLoading(true);
    setPageError('');
    try {
      const data = await internshipService.getInternships();
      const filtered = data.filter(item => 
        item.completion_status === 'finalized' || item.dirae_status !== 'not_started'
      );
      setAllInternships(filtered);
    } catch (error) {
      console.error("Failed to load internships for secretary dashboard", error);
      setPageError(getErrorMessage(error, 'No se pudo cargar el listado de expedientes.'));
    } finally {
      setGlobalLoading(false);
    }
  };

  useEffect(() => {
    loadAllInternships();
  }, []);

  const uniqueDegrees = useMemo(() => {
    return [...new Set(allInternships.map(item => item.student?.degree).filter(Boolean))];
  }, [allInternships]);

  const filteredInternships = useMemo(() => {
    return allInternships.filter(item => {
      const studentName = item.student ? `${item.student.first_name} ${item.student.last_name}` : '';
      const matchesSearch = !globalSearch.trim() ||
        studentName.toLowerCase().includes(globalSearch.toLowerCase()) ||
        item.student?.rut?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        String(item.id).includes(globalSearch) ||
        item.org_name?.toLowerCase().includes(globalSearch.toLowerCase());

      const matchesDegree = degreeFilter === 'all' || item.student?.degree === degreeFilter;
      const matchesDirae = diraeStatusFilter === 'all' || item.dirae_status === diraeStatusFilter;

      return matchesSearch && matchesDegree && matchesDirae;
    });
  }, [allInternships, globalSearch, degreeFilter, diraeStatusFilter]);

  const readyIdsInCurrentFilter = useMemo(() => {
    return filteredInternships.filter(item => item.dirae_status === 'ready').map(item => item.id);
  }, [filteredInternships]);

  const allReadySelected = useMemo(() => {
    if (readyIdsInCurrentFilter.length === 0) return false;
    return readyIdsInCurrentFilter.every(id => selectedIds.includes(id));
  }, [readyIdsInCurrentFilter, selectedIds]);

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

  const handleExportCsv = async (ids = null) => {
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
        message: 'El CSV fue generado y el/los expediente(s) marcado(s) como exportado(s) localmente.',
      });
      setSelectedIds([]);
      await refreshActiveExpediente();
      await loadAllInternships();
    } catch (error) {
      console.error('Error exporting DIRAE CSV:', error);
      const detail = error.response?.data?.detail;
      const reasons = detail?.internships?.[0]?.reasons || [];
      const readableReasons = reasons.map((reason) => PACKAGE_REASONS[reason] || reason).join(' ');
      setExportError(readableReasons || getErrorMessage(error, 'No se pudo exportar el expediente.'));
    } finally {
      setDiraeActionLoading('');
    }
  };

  const handleDerive = async () => {
    if (!activeInternshipId) return;
    const comment = deriveComment.trim();
    if (!comment) {
      setExportError('Ingresa un motivo para iniciar la revisión local DIRAE.');
      return;
    }

    setDiraeActionLoading('derive');
    setExportError('');
    try {
      await internshipService.deriveInternship(activeInternshipId, comment);
      setDeriveComment('');
      showToast({
        type: 'success',
        title: 'Revisión DIRAE iniciada',
        message: 'El estado del expediente DIRAE cambió a revisión local.',
      });
      await refreshActiveExpediente();
      await loadAllInternships();
    } catch (error) {
      setExportError(getErrorMessage(error, 'No se pudo iniciar la revisión DIRAE.'));
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
      <main className="flex-grow container mx-auto max-w-7xl px-4 py-8">
        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff0f6] text-[#d22864]">
                <FileSearch size={32} />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-wider text-[#d22864]">
                  Panel Secretaría
                </p>
                <h1 className="mt-2 text-3xl font-black text-gray-900">
                  Expedientes documentales DIRAE
                </h1>
                <p className="mt-2 max-w-3xl text-sm font-medium text-gray-500">
                  Operación documental por ID de práctica. Secretaría revisa documentos,
                  gestiona rectificaciones y genera exportaciones locales sin aprobar ni
                  rechazar solicitudes académicas.
                </p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  value={internshipIdInput}
                  onChange={(event) => setInternshipIdInput(event.target.value)}
                  placeholder="ID de práctica"
                  className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-3 pl-12 pr-4 text-sm font-bold text-gray-800 outline-none transition focus:border-[#d22864]/30 focus:bg-white"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#d22864] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#d22864]/20 transition hover:opacity-90 disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Consultar
              </button>
            </form>
          </div>

          <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm font-semibold text-sky-800">
            Bandeja de entrada global para Secretaría de Carrera. Desde aquí puede listar, buscar,
            filtrar y exportar expedientes a DIRAE en lote. Por políticas del backend,
            los documentos de carácter confidencial/sensible no se listan ni descargan para este rol.
          </div>
        </section>

        {pageError && (
          <section className="mt-6 rounded-3xl border border-red-100 bg-red-50 p-5 text-sm font-bold text-red-700">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5" />
              <p>{pageError}</p>
            </div>
          </section>
        )}

        {loading && (
          <section className="mt-8 flex items-center justify-center rounded-3xl border border-gray-100 bg-white py-20 shadow-sm">
            <div className="text-center">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#d22864]" />
              <p className="mt-4 text-sm font-black uppercase tracking-widest text-gray-500">
                Cargando expediente
              </p>
            </div>
          </section>
        )}

        {!loading && packageData && (
          <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="space-y-6">
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveInternshipId(null);
                        setPackageData(null);
                        setInternship(null);
                        setSelectedIds([]);
                        loadAllInternships();
                      }}
                      className="mb-3 inline-flex items-center gap-1 text-xs font-black text-gray-500 hover:text-[#d22864] transition"
                    >
                      <ArrowLeft className="h-3 w-3" />
                      Volver a la bandeja
                    </button>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                      Expediente #{activeInternshipId}
                    </p>
                    <h2 className="mt-2 text-2xl font-black text-gray-900">
                      {packageData.internship.organization || internship?.org_name || 'Organización no registrada'}
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-gray-500">
                      {student?.first_name} {student?.last_name} · {student?.rut || 'RUT no disponible'} · {student?.email || 'correo no disponible'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={refreshActiveExpediente}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-2 text-sm font-black text-gray-700 transition hover:bg-white"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Actualizar
                  </button>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-4">
                  <StatusCard label="Estado de solicitud" value={packageData.status || getStatusTitle(internship)} />
                  <StatusCard label="Estado de práctica" value={COMPLETION_STATUS[internship?.completion_status] || 'Sin dato'} />
                  <StatusCard label="Resultado final" value={FINAL_RESULT[internship?.final_result] || 'Sin dato'} />
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Expediente DIRAE
                    </p>
                    <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-black ${diraeStatus.className}`}>
                      {diraeStatus.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="mt-6 flex border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('documents')}
                  className={`px-6 py-3 text-sm font-bold border-b-2 transition ${
                    activeTab === 'documents'
                      ? 'border-[#d22864] text-[#d22864]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Documentos y Diapositivas
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('registration')}
                  className={`px-6 py-3 text-sm font-bold border-b-2 transition ${
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
                  className={`px-6 py-3 text-sm font-bold border-b-2 transition ${
                    activeTab === 'evaluations'
                      ? 'border-[#d22864] text-[#d22864]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Evaluaciones
                </button>
              </div>

              {activeTab === 'documents' && (
                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-[#d22864]">
                        Documentos visibles para Secretaría
                      </p>
                    <h3 className="mt-1 text-xl font-black text-gray-900">
                      Revisión documental
                    </h3>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[500px]">
                    <input
                      value={documentSearch}
                      onChange={(event) => setDocumentSearch(event.target.value)}
                      placeholder="Buscar documento"
                      className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-2 text-sm font-semibold outline-none focus:border-[#d22864]/30 sm:col-span-1"
                    />
                    <select
                      value={documentTypeFilter}
                      onChange={(event) => setDocumentTypeFilter(event.target.value)}
                      className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-2 text-sm font-bold outline-none focus:border-[#d22864]/30"
                    >
                      <option value="all">Todos los tipos</option>
                      {documentTypes.map((type) => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                    <select
                      value={documentStatusFilter}
                      onChange={(event) => setDocumentStatusFilter(event.target.value)}
                      className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-2 text-sm font-bold outline-none focus:border-[#d22864]/30"
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
                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-[#d22864]">Ficha de inscripción</p>
                    <h3 className="mt-1 text-xl font-black text-gray-900">Datos registrados de la práctica</h3>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Sección Empresa */}
                    <div className="space-y-4 rounded-2xl bg-gray-50/70 p-5 border border-gray-100">
                      <h4 className="font-bold text-gray-800 border-b border-gray-200 pb-2 text-sm uppercase tracking-wider flex items-center gap-2">
                        <Building2 size={16} className="text-[#d22864]" />
                        Organización / Empresa
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="block text-xs font-bold text-gray-400">Nombre</span>
                          <span className="font-semibold text-gray-800">{internship?.org_name || '-'}</span>
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-gray-400">Dirección</span>
                          <span className="font-semibold text-gray-800">{internship?.internship_address || '-'}</span>
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-gray-400">Ciudad</span>
                          <span className="font-semibold text-gray-800">{internship?.city || '-'}</span>
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-gray-400">Teléfono</span>
                          <span className="font-semibold text-gray-800">{internship?.org_phone || 'No registrado'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Sección Supervisor */}
                    <div className="space-y-4 rounded-2xl bg-gray-50/70 p-5 border border-gray-100">
                      <h4 className="font-bold text-gray-800 border-b border-gray-200 pb-2 text-sm uppercase tracking-wider flex items-center gap-2">
                        <User size={16} className="text-[#d22864]" />
                        Supervisor/a de Práctica
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="block text-xs font-bold text-gray-400">Nombre</span>
                          <span className="font-semibold text-gray-800">{internship?.supervisor_name || '-'}</span>
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-gray-400">Correo Electrónico</span>
                          <span className="font-semibold text-gray-800">{internship?.supervisor_email || '-'}</span>
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-gray-400">Teléfono</span>
                          <span className="font-semibold text-gray-800">{internship?.supervisor_phone || 'No registrado'}</span>
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-gray-400">Cargo / Función</span>
                          <span className="font-semibold text-gray-800">{internship?.supervisor_role || 'No registrado'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Sección Detalles de Práctica */}
                    <div className="space-y-4 rounded-2xl bg-gray-50/70 p-5 border border-gray-100 md:col-span-2">
                      <h4 className="font-bold text-gray-800 border-b border-gray-200 pb-2 text-sm uppercase tracking-wider flex items-center gap-2">
                        <FileText size={16} className="text-[#d22864]" />
                        Detalles del Proceso
                      </h4>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
                        <div>
                          <span className="block text-xs font-bold text-gray-400">Tipo de Práctica</span>
                          <span className="font-semibold text-gray-800">{internship?.internship_type || '-'}</span>
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-gray-400">Modalidad</span>
                          <span className="font-semibold text-gray-800">{internship?.modality || '-'}</span>
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-gray-400">Período</span>
                          <span className="font-semibold text-gray-800">{internship?.internship_period || '-'}</span>
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-gray-400">Horario de Trabajo</span>
                          <span className="font-semibold text-gray-800">{internship?.schedule || '-'}</span>
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-gray-400">Horas Semanales</span>
                          <span className="font-semibold text-gray-800">{internship?.working_hours || '-'} hrs</span>
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-gray-400">Fechas</span>
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
                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-[#d22864]">Evaluaciones del Proceso</p>
                    <h3 className="mt-1 text-xl font-black text-gray-900">Autoevaluación Estudiante y Evaluación Supervisor</h3>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Autoevaluación Alumno */}
                    <div className="space-y-4 rounded-2xl bg-gray-50/70 p-5 border border-gray-100">
                      <h4 className="font-bold text-gray-800 border-b border-gray-200 pb-2 text-sm uppercase tracking-wider flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <User size={16} className="text-[#d22864]" />
                          Autoevaluación Alumno
                        </span>
                        {selfEvaluationForm?.evaluation ? (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-0.5 font-bold uppercase">
                            Entregada
                          </span>
                        ) : (
                          <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5 font-bold uppercase">
                            Pendiente
                          </span>
                        )}
                      </h4>

                      {selfEvaluationForm?.evaluation ? (
                        <div className="space-y-4">
                          <div className="space-y-3">
                            {selfEvaluationForm.criteria?.map((criterion) => {
                              const score = selfEvaluationForm.evaluation.responses[criterion.key];
                              return (
                                <div key={criterion.key} className="bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between gap-4 text-xs">
                                  <div className="min-w-0">
                                    <p className="font-bold text-gray-800">{criterion.label}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{criterion.description}</p>
                                  </div>
                                  <span className="bg-[#fff0f6] text-[#d22864] font-black h-8 w-8 rounded-lg flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                                    {score || '-'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          {selfEvaluationForm.evaluation.observations && (
                            <div className="bg-white p-3 rounded-xl border border-gray-100 text-xs">
                              <span className="block font-bold text-gray-400 uppercase tracking-wide mb-1">Observaciones / Comentarios:</span>
                              <p className="text-gray-600 italic">“{selfEvaluationForm.evaluation.observations}”</p>
                            </div>
                          )}
                          <div className="text-[10px] text-gray-400 font-semibold">
                            Fecha de envío: {selfEvaluationForm.evaluation.submitted_at ? formatDateTime(selfEvaluationForm.evaluation.submitted_at) : '-'}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm font-semibold text-gray-500 italic text-center py-8">
                          El estudiante aún no ha completado la autoevaluación.
                        </p>
                      )}
                    </div>

                    {/* Evaluación Supervisor */}
                    <div className="space-y-4 rounded-2xl bg-gray-50/70 p-5 border border-gray-100">
                      <h4 className="font-bold text-gray-800 border-b border-gray-200 pb-2 text-sm uppercase tracking-wider flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Building2 size={16} className="text-[#d22864]" />
                          Evaluación Supervisor
                        </span>
                        {supervisorEvaluation ? (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-0.5 font-bold uppercase">
                            Entregada
                          </span>
                        ) : (
                          <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5 font-bold uppercase">
                            Pendiente
                          </span>
                        )}
                      </h4>

                      {supervisorEvaluation ? (
                        <div className="space-y-4">
                          <div className="space-y-3">
                            {Object.entries(SUPERVISOR_CRITERIA_LABELS).map(([key, info]) => {
                              const score = supervisorEvaluation.criteria_scores[key];
                              return (
                                <div key={key} className="bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between gap-4 text-xs">
                                  <div className="min-w-0">
                                    <p className="font-bold text-gray-800">{info.label}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{info.desc}</p>
                                  </div>
                                  <span className="bg-[#fff0f6] text-[#d22864] font-black h-8 w-8 rounded-lg flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                                    {score || '-'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          <div className="bg-white p-3 rounded-xl border border-gray-100 text-xs space-y-2">
                            <div>
                              <span className="block font-bold text-gray-400 uppercase tracking-wide mb-1">Recomendación:</span>
                              <span className={`inline-flex rounded-full px-2.5 py-0.5 font-bold ${
                                supervisorEvaluation.recommendation === 'recommended' ? 'bg-green-50 text-green-700' :
                                supervisorEvaluation.recommendation === 'recommended_with_observations' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
                              }`}>
                                {RECOMMENDATION_LABELS[supervisorEvaluation.recommendation] || supervisorEvaluation.recommendation}
                              </span>
                            </div>
                            {supervisorEvaluation.observations && (
                              <div>
                                <span className="block font-bold text-gray-400 uppercase tracking-wide mb-1">Observaciones / Comentarios:</span>
                                <p className="text-gray-600 italic">“{supervisorEvaluation.observations}”</p>
                              </div>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-400 font-semibold">
                            Evaluador: {supervisorEvaluation.supervisor_name_snapshot} ({supervisorEvaluation.supervisor_email_snapshot})<br />
                            Fecha de envío: {supervisorEvaluation.submitted_at ? formatDateTime(supervisorEvaluation.submitted_at) : '-'}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm font-semibold text-gray-500 italic text-center py-8">
                          El supervisor aún no ha completado la evaluación de la práctica.
                        </p>
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
                deriveComment={deriveComment}
                reopenComment={reopenComment}
                onDeriveCommentChange={setDeriveComment}
                onReopenCommentChange={setReopenComment}
                onDerive={handleDerive}
                onReopen={handleReopen}
                onExport={handleExportCsv}
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
        )}

        {!loading && !activeInternshipId && (
          <section className="mt-8 space-y-6">
            {/* Filtros de la bandeja global */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center flex-1">
                <div className="relative max-w-md w-full">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    placeholder="Buscar por estudiante, RUT u organización"
                    className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-2.5 pl-10 pr-4 text-xs font-semibold text-gray-800 outline-none focus:border-[#d22864]/30 focus:bg-white transition"
                  />
                </div>
                <select
                  value={degreeFilter}
                  onChange={(e) => setDegreeFilter(e.target.value)}
                  className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-xs font-bold outline-none focus:border-[#d22864]/30"
                >
                  <option value="all">Todas las carreras</option>
                  {uniqueDegrees.map((deg) => (
                    <option key={deg} value={deg}>{deg}</option>
                  ))}
                </select>
                <select
                  value={diraeStatusFilter}
                  onChange={(e) => setDiraeStatusFilter(e.target.value)}
                  className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-xs font-bold outline-none focus:border-[#d22864]/30"
                >
                  <option value="all">Todos los estados DIRAE</option>
                  <option value="not_started">No iniciado</option>
                  <option value="in_review">En revisión local</option>
                  <option value="observed">Observado</option>
                  <option value="ready">Listo para exportar</option>
                  <option value="exported">Exportado a DIRAE</option>
                </select>
              </div>

              {/* Botón de exportación masiva */}
              <button
                type="button"
                onClick={() => handleExportCsv(selectedIds)}
                disabled={selectedIds.length === 0 || diraeActionLoading === 'export'}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#d22864] px-5 py-3 text-xs font-black text-white shadow-md shadow-[#d22864]/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
              >
                {diraeActionLoading === 'export' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                Exportar Lote ({selectedIds.length})
              </button>
            </div>

            {/* Listado / Tabla */}
            <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              {globalLoading ? (
                <div className="py-20 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#d22864]" />
                  <p className="mt-3 text-xs font-black uppercase tracking-widest text-gray-400">Cargando bandeja global...</p>
                </div>
              ) : filteredInternships.length === 0 ? (
                <div className="py-20 text-center text-gray-400">
                  <FileText className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-4 text-sm font-black uppercase tracking-wider text-gray-500">No se encontraron expedientes</p>
                  <p className="mt-1 text-xs text-gray-400">Asegúrate de que existan prácticas finalizadas o en revisión local.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/55 text-[10px] font-black uppercase tracking-wider text-gray-400">
                        <th className="py-4 px-6 w-12">
                          <input
                            type="checkbox"
                            disabled={readyIdsInCurrentFilter.length === 0}
                            checked={allReadySelected}
                            onChange={() => {
                              if (allReadySelected) {
                                setSelectedIds(prev => prev.filter(id => !readyIdsInCurrentFilter.includes(id)));
                              } else {
                                setSelectedIds(prev => [...new Set([...prev, ...readyIdsInCurrentFilter])]);
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-[#d22864] focus:ring-[#d22864]"
                          />
                        </th>
                        <th className="py-4 px-6">ID / Estudiante</th>
                        <th className="py-4 px-6">Carrera</th>
                        <th className="py-4 px-6">Organización / Tipo</th>
                        <th className="py-4 px-6">Estado Práctica</th>
                        <th className="py-4 px-6">Expediente DIRAE</th>
                        <th className="py-4 px-6 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {filteredInternships.map((item) => {
                        const diraeStatusInfo = DIRAE_STATUS[item.dirae_status] || DIRAE_STATUS.not_started;
                        const isSelectable = item.dirae_status === 'ready';

                        return (
                          <tr key={item.id} className="hover:bg-gray-50/50 transition">
                            <td className="py-4 px-6">
                              <input
                                type="checkbox"
                                disabled={!isSelectable}
                                checked={selectedIds.includes(item.id)}
                                onChange={() => {
                                  setSelectedIds(prev =>
                                    prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
                                  );
                                }}
                                className="h-4 w-4 rounded border-gray-300 text-[#d22864] focus:ring-[#d22864] disabled:opacity-40 disabled:cursor-not-allowed"
                              />
                            </td>
                            <td className="py-4 px-6">
                              <div>
                                <p className="font-bold text-gray-900">{item.student ? `${item.student.first_name} ${item.student.last_name}` : 'Estudiante sin nombre'}</p>
                                <p className="text-xs text-gray-400 mt-0.5">ID: #{item.id} · RUT: {item.student?.rut || 'Sin RUT'}</p>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-xs text-gray-500 font-semibold">{item.student?.degree || 'Sin carrera'}</span>
                            </td>
                            <td className="py-4 px-6">
                              <div>
                                <p className="font-bold text-gray-800">{item.org_name}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{item.internship_type}</p>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div>
                                <span className="inline-flex rounded-full bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-600">
                                  {COMPLETION_STATUS[item.completion_status] || item.completion_status}
                                </span>
                                {item.final_result === 'passed' && (
                                  <span className="ml-1 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Aprobada</span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${diraeStatusInfo.className}`}>
                                {diraeStatusInfo.label}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <button
                                type="button"
                                onClick={() => loadExpediente(item.id)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-gray-50 hover:bg-[#fff0f6] hover:text-[#d22864] px-4 py-2 text-xs font-black text-gray-700 transition"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                Revisar
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

const StatusCard = ({ label, value }) => (
  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
    <p className="mt-2 text-sm font-black text-gray-900">{value}</p>
  </div>
);

const EmptyState = ({ icon, title, message }) => (
  <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-400">
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
      {icon}
    </div>
    <p className="mt-4 text-sm font-black uppercase tracking-widest text-gray-500">{title}</p>
    <p className="mt-2 text-xs font-semibold text-gray-400">{message}</p>
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
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff0f6] text-[#d22864]">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-black text-gray-900">{document.document_type?.name || 'Documento'}</h4>
            <p className="mt-1 text-xs font-semibold text-gray-400">
              {document.file_name} · {formatDate(document.upload_date)}
            </p>
            <span className={`mt-3 inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${status.className}`}>
              {status.label}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onDownload}
            className="inline-flex items-center gap-2 rounded-2xl bg-gray-50 px-4 py-2 text-sm font-black text-gray-700 transition hover:bg-[#fff0f6] hover:text-[#d22864]"
          >
            <Download className="h-4 w-4" />
            Descargar
          </button>
          <button
            type="button"
            onClick={onOpenReview}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#d22864] px-4 py-2 text-sm font-black text-white transition hover:opacity-90"
          >
            <Eye className="h-4 w-4" />
            Revisar
          </button>
        </div>
      </div>

      {document.review_comment && (
        <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-sm font-semibold text-gray-600">
          Último comentario: “{document.review_comment}”
        </div>
      )}

      {isReviewing && (
        <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onReviewStatusChange('approved')}
              className={`rounded-2xl p-3 text-sm font-black ${reviewStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-emerald-700'}`}
            >
              Aprobar
            </button>
            <button
              type="button"
              onClick={() => onReviewStatusChange('observed')}
              className={`rounded-2xl p-3 text-sm font-black ${reviewStatus === 'observed' ? 'bg-purple-100 text-purple-800' : 'bg-white text-purple-700'}`}
            >
              Observar
            </button>
          </div>
          <textarea
            value={reviewComment}
            onChange={(event) => onReviewCommentChange(event.target.value)}
            placeholder="Comentario de revisión"
            className="mt-3 h-24 w-full resize-none rounded-2xl border border-gray-100 bg-white p-3 text-sm font-semibold outline-none focus:border-[#d22864]/30"
          />
          {reviewError && <p className="mt-2 text-sm font-bold text-red-600">{reviewError}</p>}
          <button
            type="button"
            onClick={onSaveReview}
            disabled={isUpdating}
            className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-gray-900 px-4 py-2 text-sm font-black text-white disabled:opacity-60"
          >
            {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
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
  deriveComment,
  reopenComment,
  onDeriveCommentChange,
  onReopenCommentChange,
  onDerive,
  onReopen,
  onExport,
}) => (
  <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-[#d22864]">Paquete DIRAE</p>
        <h3 className="mt-1 text-xl font-black text-gray-900">Exportabilidad local</h3>
      </div>
      <span className={`rounded-full px-3 py-1 text-xs font-black ${packageData.exportable ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
        {packageData.exportable ? 'Exportable' : 'No exportable'}
      </span>
    </div>

    {packageData.reasons.length > 0 && (
      <div className="mt-4 space-y-2">
        {packageData.reasons.map((reason) => (
          <div key={reason} className="rounded-2xl border border-red-100 bg-red-50 p-3 text-sm font-bold text-red-700">
            {PACKAGE_REASONS[reason] || reason}
          </div>
        ))}
      </div>
    )}

    <div className="mt-5 grid gap-3">
      {packageData.required_documents.map((item) => (
        <PackageItem key={item.type_id} item={item} required />
      ))}
      {packageData.optional_documents.map((item) => (
        <PackageItem key={item.type_id} item={item} />
      ))}
    </div>

    {exportError && (
      <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-3 text-sm font-bold text-red-700">
        {exportError}
      </div>
    )}

    <div className="mt-5 space-y-3">
      <button
        type="button"
        onClick={onExport}
        disabled={!packageData.exportable || actionLoading === 'export'}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#d22864] px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {actionLoading === 'export' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        Exportar CSV local
      </button>

      <ActionBox
        label="Iniciar revisión local DIRAE"
        placeholder="Motivo de derivación"
        value={deriveComment}
        loading={actionLoading === 'derive'}
        onChange={onDeriveCommentChange}
        onSubmit={onDerive}
        icon={<Send className="h-4 w-4" />}
      />
      <ActionBox
        label="Reabrir para rectificación"
        placeholder="Motivo de reapertura"
        value={reopenComment}
        loading={actionLoading === 'reopen'}
        onChange={onReopenCommentChange}
        onSubmit={onReopen}
        icon={<RefreshCw className="h-4 w-4" />}
      />
    </div>
  </section>
);

const PackageItem = ({ item, required = false }) => (
  <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 p-3">
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

const ActionBox = ({ label, placeholder, value, loading, onChange, onSubmit, icon }) => (
  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
    <p className="text-xs font-black uppercase tracking-widest text-gray-500">{label}</p>
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="mt-2 h-20 w-full resize-none rounded-xl border border-gray-100 bg-white p-3 text-sm font-semibold outline-none focus:border-[#d22864]/30"
    />
    <button
      type="button"
      onClick={onSubmit}
      disabled={loading}
      className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-3 py-2 text-xs font-black text-white disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      Ejecutar
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
  <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
    <div className="flex gap-3">
      <ShieldAlert className="mt-1 h-5 w-5 text-[#d22864]" />
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-[#d22864]">Adjunto administrativo</p>
        <p className="mt-1 text-sm font-semibold text-gray-500">
          Secretaría solo puede adjuntar tipos administrativos no sensibles autorizados por backend.
        </p>
      </div>
    </div>

    <form onSubmit={onSubmit} className="mt-4 space-y-3">
      <select
        value={selectedTypeId}
        onChange={(event) => onTypeChange(event.target.value)}
        className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-bold outline-none focus:border-[#d22864]/30"
      >
        <option value="">Tipo documental administrativo</option>
        {uploadableTypes.map((type) => (
          <option key={type.id} value={type.id}>{type.name}</option>
        ))}
      </select>
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm font-bold text-gray-500 transition hover:bg-white">
        <UploadCloud className="h-5 w-5" />
        {uploadFile ? uploadFile.name : 'Seleccionar archivo'}
        <input
          type="file"
          className="hidden"
          accept=".pdf,.docx,.jpg,.png,.zip"
          onChange={(event) => onFileChange(event.target.files?.[0] || null)}
        />
      </label>
      {uploadError && <p className="text-sm font-bold text-red-600">{uploadError}</p>}
      <button
        type="submit"
        disabled={uploading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 py-3 text-sm font-black text-white disabled:opacity-60"
      >
        {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
        Adjuntar documento
      </button>
    </form>
  </section>
);

const TrackingPanel = ({ tracking }) => (
  <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
    <div className="flex items-center gap-3">
      <History className="h-5 w-5 text-[#d22864]" />
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-[#d22864]">Historial DIRAE</p>
        <h3 className="text-lg font-black text-gray-900">Trazabilidad local</h3>
      </div>
    </div>

    <div className="mt-4 space-y-3">
      {tracking.length === 0 && (
        <p className="rounded-2xl bg-gray-50 p-4 text-sm font-bold text-gray-500">
          Aún no hay cambios registrados en el expediente DIRAE.
        </p>
      )}
      {tracking.map((entry) => (
        <div key={entry.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-sm font-black text-gray-900">
            {DIRAE_STATUS[entry.previous_status]?.label || 'Sin estado'} → {DIRAE_STATUS[entry.new_status]?.label || entry.new_status}
          </p>
          <p className="mt-1 text-xs font-semibold text-gray-500">
            {formatDateTime(entry.changed_at)} · {entry.actor?.email || 'actor no disponible'}
          </p>
          {entry.reason && <p className="mt-2 text-sm font-semibold text-gray-600">“{entry.reason}”</p>}
        </div>
      ))}
    </div>
  </section>
);

export default SecretaryDashboardPage;

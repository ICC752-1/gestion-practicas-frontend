import { useDeferredValue, useState } from 'react';
import {
  AlertCircle,
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
} from 'lucide-react';
import { UserHeader } from '../../components/Header/UserHeader';
import { Footer } from '../../components/Footer/Footer';
import { documentService } from '../../services/documentService';
import { internshipService } from '../../services/internshipService';
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
  const [exportabilityFilter, setExportabilityFilter] = useState('all');
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

  const activeDiraeStatus = packageData?.dirae_status || internship?.dirae_status || 'not_started';
  const diraeStatus = DIRAE_STATUS[activeDiraeStatus] || DIRAE_STATUS.not_started;
  const student = packageData?.student;
  const packageMatchesExportability = exportabilityFilter === 'all'
    || (exportabilityFilter === 'exportable' && packageData?.exportable)
    || (exportabilityFilter === 'blocked' && packageData && !packageData.exportable);
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
    } catch (error) {
      setPageError(getErrorMessage(error, 'No se pudo cargar el expediente solicitado.'));
      setInternship(null);
      setDocuments([]);
      setPackageData(null);
      setDiraeTracking([]);
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
    } catch (error) {
      setReviewError(getErrorMessage(error, 'No se pudo registrar la revisión.'));
    } finally {
      setUpdatingDocumentId(null);
    }
  };

  const handleExportCsv = async () => {
    if (!activeInternshipId) return;
    setDiraeActionLoading('export');
    setExportError('');

    try {
      const exportResponse = await documentService.exportDiraeDocumentPackages([activeInternshipId]);
      downloadBlob(exportResponse.blob, exportResponse.filename);
      showToast({
        type: 'success',
        title: 'Exportación local generada',
        message: 'El CSV fue generado y el expediente quedó marcado como exportado localmente.',
      });
      await refreshActiveExpediente();
    } catch (error) {
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
            El backend actual no entrega listado global para Secretaría. Esta vista opera
            expedientes por ID y consume la política backend: documentos sensibles no se
            listan ni descargan para este rol.
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

        {!loading && packageData && packageMatchesExportability && (
          <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="space-y-6">
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
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
                  <div className="grid gap-2 sm:grid-cols-4 lg:min-w-[680px]">
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
                    <select
                      value={exportabilityFilter}
                      onChange={(event) => setExportabilityFilter(event.target.value)}
                      className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-2 text-sm font-bold outline-none focus:border-[#d22864]/30"
                    >
                      <option value="all">Exportabilidad</option>
                      <option value="exportable">Exportable</option>
                      <option value="blocked">No exportable</option>
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

        {!loading && packageData && !packageMatchesExportability && (
          <section className="mt-8 rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-black uppercase tracking-widest text-gray-400">
              El expediente cargado no coincide con el filtro de exportabilidad seleccionado.
            </p>
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

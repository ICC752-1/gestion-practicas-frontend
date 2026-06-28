import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  UploadCloud,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  FileCheck,
  ChevronDown,
  Info
} from 'lucide-react';
import {
  canUploadDocuments,
  documentService,
  getUploadableDocumentTypes,
} from '../../services/documentService';

export const DocumentUploadModal = ({
  isOpen,
  onClose,
  internships,
  documentsByInternship = {},
  onDocumentUploaded,
}) => {
  const [documentTypes, setDocumentTypes] = useState([]);
  const [selectedInternshipId, setSelectedInternshipId] = useState('');
  const [selectedDocumentTypeId, setSelectedDocumentTypeId] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingTypes, setFetchingTypes] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const defaultInternshipId = useMemo(
    () => (internships.length === 1 ? internships[0].id : ''),
    [internships]
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedInternshipId(defaultInternshipId);
      setSelectedDocumentTypeId('');
      setFile(null);
      setLoading(false);
      setError(null);
      setSuccess(false);

      const fetchDocumentTypes = async () => {
      try {
        setFetchingTypes(true);
        const types = await documentService.getDocumentTypes();
        setDocumentTypes(types);
      } catch (err) {
        setError('No se pudieron cargar los tipos de documento.');
        console.error('Error fetching document types:', err);
      } finally {  {/* <-- AQUÍ: Ya corregido de "fill/ly" a "finally" */}
        setFetchingTypes(false);
      }
    };
      fetchDocumentTypes();
    }
  }, [defaultInternshipId, isOpen]);

  const getDocumentsForInternship = useMemo(
    () => (id) => (
      documentsByInternship[String(id)]
      || documentsByInternship[id]
      || []
    ),
    [documentsByInternship]
  );

  const selectedInternship = useMemo(
    () => internships.find((internship) => (
      String(internship.id) === String(selectedInternshipId)
    )),
    [internships, selectedInternshipId]
  );
  const selectedInternshipDocuments = useMemo(
    () => (
      selectedInternship
        ? getDocumentsForInternship(selectedInternship.id)
        : []
    ),
    [getDocumentsForInternship, selectedInternship]
  );
  const uploadableDocumentTypes = useMemo(
    () => (selectedInternship
      ? getUploadableDocumentTypes(
          selectedInternship,
          documentTypes,
          selectedInternshipDocuments
        )
      : documentTypes),
    [documentTypes, selectedInternship, selectedInternshipDocuments]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!selectedInternshipId) {
      setError('Debes seleccionar una práctica.');
      return;
    }
    if (!selectedDocumentTypeId) {
      setError('Debes seleccionar el tipo de documento.');
      return;
    }
    if (!file) {
      setError('Debes seleccionar un archivo para subir.');
      return;
    }

    // Validar tamaño del archivo (Máximo 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError('El archivo es demasiado grande. El tamaño máximo permitido es 10MB.');
      return;
    }

    // Validar formato del archivo
    const allowedExtensions = ['pdf', 'docx', 'jpg', 'png', 'zip'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      setError('Formato no permitido. Solo se aceptan PDF, DOCX, JPG, PNG o ZIP.');
      return;
    }

    const isInternshipClosed = (id) => {
      const internship = internships.find(i => i.id === parseInt(id) || i.id === id);
      const internshipDocuments = getDocumentsForInternship(id);
      return internship && !canUploadDocuments(internship, internshipDocuments);
    };

    if (isInternshipClosed(selectedInternshipId)) {
      setError('La práctica seleccionada no permite nuevos documentos.');
      return;
    }

    const selectedTypeIsUploadable = uploadableDocumentTypes.some((type) => (
      String(type.id) === String(selectedDocumentTypeId)
    ));
    if (!selectedTypeIsUploadable) {
      setError('El tipo de documento seleccionado no está disponible para esta práctica.');
      return;
    }

    setLoading(true);
    try {
      await documentService.uploadDocument(selectedInternshipId, selectedDocumentTypeId, file);
      setSuccess(true);
      if (onDocumentUploaded) onDocumentUploaded();
    } catch (err) {
      const detail = err.response?.data?.detail;
      const serverMessage = typeof detail === 'string'
        ? detail
        : detail?.message || err.response?.data?.message || err.response?.data?.error;

      if (err.response?.status === 403) {
        setError('No tienes permisos para realizar esta acción o la práctica no permite más documentos.');
      } else if (err.response?.status === 413) {
        setError('El archivo es demasiado grande para el servidor.');
      } else if (err.response?.status === 401) {
        setError('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
      } else if (err.response?.status === 400) {
        setError(serverMessage || 'Los datos enviados no son válidos.');
      } else if (err.response?.status === 404) {
        setError('No se encontró la práctica o el tipo de documento especificado.');
      } else {
        setError(serverMessage || 'Hubo un problema al subir el documento. Inténtalo de nuevo.');
      }
      console.error('Error uploading document:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white w-full max-w-xl max-h-[calc(100vh-3rem)] rounded-[2rem] shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#fff0f6] to-white px-8 py-5 border-b border-gray-100 flex justify-between items-center flex-shrink-0 rounded-t-[2rem]">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight leading-tight">
              Subir Documento
            </h2>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Completa los datos para tu entrega
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

          {/* Cuerpo del Formulario */}
          <div className="p-6 overflow-y-auto flex-grow">
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-6 text-center"
              >
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="text-green-500" size={36} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">¡Documento Recibido!</h3>
                <p className="text-sm text-gray-500 font-medium max-w-xs mx-auto mb-6">
                  Tu archivo se ha subido correctamente y está pendiente de revisión.
                </p>
                <button
                  onClick={onClose}
                  className="bg-[#d22864] text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-[#d22864]/20 hover:bg-[#b01e52] transition-all cursor-pointer"
                >
                  Entendido
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Internship Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 ml-1">Práctica Asociada</label>
                  <div className="relative">
                    <select
                      value={selectedInternshipId}
                      onChange={(e) => {
                        setSelectedInternshipId(e.target.value);
                        setSelectedDocumentTypeId('');
                      }}
                      disabled={loading || internships.length === 0}
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-[#d22864]/20 focus:bg-white rounded-xl px-4 py-3 text-sm text-gray-900 font-medium appearance-none transition-all outline-none disabled:opacity-50 cursor-pointer"
                    >
                      <option value="">Selecciona tu práctica</option>
                      {internships.map((int) => {
                        const isDisabled = !canUploadDocuments(
                          int,
                          getDocumentsForInternship(int.id)
                        );
                        return (
                          <option
                            key={int.id}
                            value={int.id}
                            disabled={isDisabled}
                          >
                            {int.internship_type} — {int.org_name} {isDisabled ? '(Finalizada)' : ''}
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  </div>
                  {internships.length === 0 && (
                    <p className="text-xs text-amber-600 font-medium flex items-center gap-1.5 ml-1 mt-1">
                      <AlertCircle size={14} />
                      No tienes prácticas activeis para subir documentos
                    </p>
                  )}
                </div>

                {/* Document Type Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 ml-1">Tipo de Documento</label>
                  <div className="relative">
                    <select
                      value={selectedDocumentTypeId}
                      onChange={(e) => setSelectedDocumentTypeId(e.target.value)}
                      disabled={loading || fetchingTypes}
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-[#d22864]/20 focus:bg-white rounded-xl px-4 py-3 text-sm text-gray-900 font-medium appearance-none transition-all outline-none disabled:opacity-50 cursor-pointer"
                    >
                      <option value="">{fetchingTypes ? 'Cargando tipos...' : '¿Qué documento vas a subir?'}</option>
                      {uploadableDocumentTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    {fetchingTypes ? (
                      <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-[#d22864] animate-spin" size={18} />
                    ) : (
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    )}
                  </div>
                </div>

                {/* File Upload Area */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 ml-1">Archivo</label>
                  <div
                    className={`relative border-2 border-dashed rounded-2xl p-5 transition-all ${
                      file
                        ? 'border-green-200 bg-green-50/30'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100/50 hover:border-[#d22864]/30'
                    }`}
                  >
                    <input
                      type="file"
                      id="file-upload"
                      onChange={(e) => setFile(e.target.files[0])}
                      disabled={loading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${
                        file ? 'bg-green-100 text-green-600' : 'bg-white text-[#d22864] shadow-sm'
                      }`}>
                        {file ? <FileCheck size={24} /> : <UploadCloud size={24} />}
                      </div>
                      {file ? (
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-gray-900 truncate max-w-[220px]">
                            {file.name}
                          </p>
                          <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">
                            Archivo seleccionado
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-gray-900">
                            Haz clic o arrastra para subir
                          </p>
                          <p className="text-[11px] text-gray-400 font-medium">
                            PDF, DOCX, JPG, PNG o ZIP (Max. 10MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2.5 p-3 bg-red-50 rounded-xl text-red-700 border border-red-100"
                  >
                    <AlertCircle className="flex-shrink-0 mt-0.5" size={16} />
                    <p className="text-xs font-medium">{error}</p>
                  </motion.div>
                )}

                {/* Info Note */}
                <div className="flex items-start gap-2.5 px-3 py-2.5 bg-blue-50/50 rounded-xl text-blue-700/80">
                  <Info className="flex-shrink-0 mt-0.5" size={14} />
                  <p className="text-[10px] font-medium leading-normal">
                    Recuerda que los documentos deben ser legibles. Una vez aprobados por el encargado, no podrán ser modificados.
                  </p>
                </div>

                {/* Actions Footer */}
                <div className="flex gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 px-4 py-3 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading || internships.length === 0}
                    className="flex-[1.5] bg-[#d22864] text-white px-4 py-3 rounded-xl font-bold text-sm shadow-md shadow-[#d22864]/10 hover:bg-[#b01e52] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        <span>Subiendo...</span>
                      </>
                    ) : (
                      <>
                        <FileText size={16} />
                        <span>Confirmar Entrega</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
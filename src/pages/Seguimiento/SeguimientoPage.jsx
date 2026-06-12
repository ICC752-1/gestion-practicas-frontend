import { UserHeader } from "../../components/Header/UserHeader";
import { Footer } from "../../components/Footer/Footer";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { internshipService } from "../../services/internshipService";
import { documentService } from "../../services/documentService";
import { useState, useEffect } from "react";
import { DocumentList } from "../../components/StudentDashboard/DocumentList";
import { DocumentUploadModal } from "../../components/StudentDashboard/DocumentUploadModal";
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
  DollarSign,
  Shield,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// --- Status Labels ---
const STATUS_LABELS = {
  1: 'Pendiente',
  2: 'En revisión',
  3: 'Aprobada',
  4: 'Rechazada',
  5: 'En revisión DIRAE'
};

const STATUS_STYLES = {
  1: { color: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-200', bg: 'bg-amber-50' },
  2: { color: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-200', bg: 'bg-blue-50' },
  3: { color: 'bg-green-500', text: 'text-green-500', border: 'border-green-200', bg: 'bg-green-50' },
  4: { color: 'bg-red-500', text: 'text-red-500', border: 'border-red-200', bg: 'bg-red-50' },
  5: { color: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-200', bg: 'bg-purple-50' },
};

// --- Helpers ---
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// --- Timeline Item ---
const TimelineItem = ({ step, index, isLast }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex gap-6 relative"
    >
      {!isLast && (
        <div className="absolute left-[19.5px] top-10 w-[2px] h-[calc(100%-24px)] bg-[#d22864]" />
      )}
      <div className="flex flex-col items-center z-10">
        <div className="w-10 h-10 rounded-full border-2 border-[#d22864] bg-white flex items-center justify-center text-[#d22864] shadow-sm">
          {step.icon}
        </div>
      </div>
      <div className="flex-1 pb-10 pt-2">
        <h3 className="font-semibold text-gray-800 text-base md:text-lg">{step.title}</h3>
        {step.subtitle && <p className="text-gray-400 text-xs md:text-sm mt-0.5">{step.subtitle}</p>}
        {step.actor && <p className="text-gray-400 text-xs md:text-sm mt-0.5">Por: {step.actor}</p>}
        {step.date && <p className="text-gray-400 text-xs md:text-sm mt-0.5">{step.date}</p>}
      </div>
    </motion.div>
  );
};

// --- Status Icon ---
const getStatusIcon = (statusTitle) => {
  const title = (statusTitle || '').toLowerCase();
  if (title.includes('aprobad') || title.includes('completad')) return <CheckCircle2 className="w-5 h-5" />;
  if (title.includes('rechazad')) return <XCircle className="w-5 h-5" />;
  if (title.includes('revisión') || title.includes('revision') || title.includes('revis')) return <Eye className="w-5 h-5" />;
  return <Clock className="w-5 h-5" />;
};

// --- Info Row ---
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

// --- Main Component ---
export const SeguimientoPage = () => {
  const navigate = useNavigate();
  const { internshipId } = useParams();
  const { user } = useAuth();

  const [internship, setInternship] = useState(null);
  const [tracking, setTracking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOrgDetails, setShowOrgDetails] = useState(false);
  const [showSupervisorDetails, setShowSupervisorDetails] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [docsError, setDocsError] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setDocsError(null);

        const [internshipData, trackingData, documentsData] = await Promise.all([
          internshipService.getIntershipById(internshipId),
          internshipService.getInternshipTracking(internshipId),
          documentService.getInternshipDocuments(internshipId)
        ]);

        setInternship(internshipData);
        setTracking(trackingData);
        setDocuments(documentsData);
      } catch (err) {
        setError(err.message || 'Error al cargar los datos');
        setDocsError(err.message || 'Error al cargar los documentos');
      } finally {
        setLoading(false);
      }
    };

    if (internshipId) {
      fetchData();
    }
  }, [internshipId]);

  const timelineItems = tracking.map((entry) => ({
    id: entry.id,
    title: entry.new_status?.title || 'Cambio de estado',
    subtitle: entry.reason,
    isMajor: true,
    icon: getStatusIcon(entry.new_status?.title),
    actor: entry.actor ? `${entry.actor.first_name} ${entry.actor.last_name}` : 'Sistema',
    date: new Date(entry.changed_at).toLocaleDateString('es-CL', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }));

  const currentStatus = internship?.status_id;
  const statusStyle = STATUS_STYLES[currentStatus] || STATUS_STYLES[1];

  const handleRetry = () => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setDocsError(null);
        const [internshipData, trackingData, documentsData] = await Promise.all([
          internshipService.getIntershipById(internshipId),
          internshipService.getInternshipTracking(internshipId),
          documentService.getInternshipDocuments(internshipId)
        ]);
        setInternship(internshipData);
        setTracking(trackingData);
        setDocuments(documentsData);
      } catch (err) {
        setError(err.message || 'Error al cargar los datos');
        setDocsError(err.message || 'Error al cargar los documentos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  };

  const fetchDocuments = async () => {
    try {
      setLoadingDocs(true);
      setDocsError(null);
      const data = await documentService.getInternshipDocuments(internshipId);
      setDocuments(data);
    } catch (err) {
      console.error("Error fetching documents:", err);
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
      a.download = doc.filename || `${doc.document_type?.name || 'documento'}.pdf`;
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

      <main className="max-w-5xl mx-auto w-full py-12 px-6 flex-grow">
        {/* Title */}
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
            <button onClick={handleRetry} className="flex items-center gap-2 bg-[#d22864] text-white px-6 py-2 rounded-full font-medium hover:opacity-90 transition-all">
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
                  <div className={`w-12 h-12 rounded-full ${statusStyle.color} flex items-center justify-center text-white`}>
                    {getStatusIcon(STATUS_LABELS[currentStatus])}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Estado actual</p>
                    <p className={`text-xl font-bold ${statusStyle.text}`}>
                      {STATUS_LABELS[currentStatus] || 'Desconocido'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Tipo</p>
                  <p className="text-sm font-bold text-gray-800">{internship.internship_type}</p>
                </div>
              </div>
            </motion.div>

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

              {/* Activities */}
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
                      <p className="text-sm text-gray-700">{internship.ben_description}</p>
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
                  disabled={internship?.status_id === 3 || internship?.status_id === 4}
                  className={`px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${
                    internship?.status_id === 3 || internship?.status_id === 4
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

              {tracking.length === 0 ? (
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
        <div className="flex justify-center mb-20">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-[#d22864] text-white px-10 py-3 rounded-full font-bold hover:opacity-90 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
          >
            Volver al Dashboard
          </button>
        </div>
      </main>

      <Footer />

      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        internships={internship ? [internship] : []}
        onDocumentUploaded={fetchDocuments}
      />
    </div>
  );
};

export default SeguimientoPage;
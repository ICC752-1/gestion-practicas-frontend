import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Inbox
} from 'lucide-react';

const STATUS_CONFIG = {
  uploaded: { label: 'Cargado', color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
  approved: { label: 'Aprobado', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 },
  observed: { label: 'Observado', color: 'text-purple-600', bg: 'bg-purple-50', icon: AlertCircle },
};

export const DocumentList = ({
  documents,
  loading,
  error,
  onDownload,
  onDelete,
  canDelete = false
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-10 h-10 text-[#d22864]" />
        </motion.div>
        <p className="text-gray-500 text-sm font-bold mt-4 uppercase tracking-widest">Cargando documentos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-red-50 rounded-[2rem] border border-red-100">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-500 mb-4">
          <AlertCircle size={32} />
        </div>
        <p className="text-red-900 font-bold uppercase tracking-tight text-center px-6">{error}</p>
        <p className="text-red-500 text-xs mt-2 font-medium">Por favor, intenta recargar la página</p>
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-300 mb-4">
          <Inbox size={32} />
        </div>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No hay documentos subidos aún</p>
        <p className="text-gray-400 text-[10px] mt-1 font-medium italic text-center px-6">
          Sube tus certificados, informes y evaluaciones para iniciar el proceso de revisión.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {documents.map((doc) => {
        const status = STATUS_CONFIG[doc.status] || STATUS_CONFIG.uploaded;
        const StatusIcon = status.icon;

        return (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col gap-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 bg-[#fff0f6] rounded-2xl flex items-center justify-center text-[#d22864] flex-shrink-0">
                  <FileText size={24} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-gray-900 truncate text-sm">
                    {doc.document_type?.name || 'Documento'}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    Subido el {doc.upload_date ? new Date(doc.upload_date).toLocaleDateString('es-CL') : 'Fecha no disponible'}
                  </p>
                </div>
            </div>
            <div className={`px-3 py-1 rounded-full flex items-center gap-1.5 ${status.bg} ${status.color}`}>
                <StatusIcon size={12} />
                <span className="text-[10px] font-black uppercase tracking-tight">{status.label}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-auto">
              <button
                onClick={() => onDownload(doc)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-50 text-gray-600 hover:bg-[#d22864]/5 hover:text-[#d22864] font-bold text-xs transition-colors"
              >
                <Download size={14} />
                Descargar
              </button>
              {canDelete && doc.status !== 'approved' && (
                <button
                  onClick={() => onDelete(doc.id)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  title="Eliminar documento"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            {doc.review_comment && (
              <p className="rounded-xl bg-purple-50 px-3 py-2 text-xs font-medium text-purple-800">
                {doc.review_comment}
              </p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/useAuth';
import { 
  FileText, 
  Download, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Loader2,
  AlertCircle,
  MessageSquare,
  ChevronDown,
  Clock
} from 'lucide-react';
import { documentService } from '../../services/documentService';

const STATUS_CONFIG = {
  1: { label: 'Pendiente', color: 'text-amber-500', bg: 'bg-amber-50', icon: Clock },
  2: { label: 'Aprobado', color: 'text-green-500', bg: 'bg-green-50', icon: CheckCircle },
  3: { label: 'Rechazado', color: 'text-red-500', bg: 'bg-red-50', icon: XCircle },
  4: { label: 'Observado', color: 'text-purple-500', bg: 'bg-purple-50', icon: Eye },
};

export const AdminDocumentList = ({ 
  documents, 
  loading, 
  error,
  onStatusUpdated,
  onDownload 
}) => {
  const { user } = useAuth();
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [comment, setComment] = useState('');
  const [showStatusMenu, setShowStatusMenu] = useState(null);

  const allowedRoles = [
    "Encargado de practica",
    "Director de carrera",
    "Coordinador",
    "Coordinador FICA",
    "Secretaria de Carrera"
  ];

  const canReview = user?.roles?.some(role => allowedRoles.includes(role));

  const handleStatusChange = async (docId, newStatusId) => {
    try {
      setUpdatingId(docId);
      await documentService.updateDocumentStatus(docId, { 
        status_id: newStatusId,
        comment: newStatusId === 1 ? '' : comment // Solo enviar comentario si no es volver a pendiente
      });
      setShowStatusMenu(null);
      setComment('');
      if (onStatusUpdated) onStatusUpdated();
    } catch (err) {
      console.error("Error updating document status:", err);
      alert("Error al actualizar el estado del documento");
    } finally {
      setUpdatingId(null);
    }
  };

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
        <p className="text-red-500 text-xs mt-2 font-medium">Error al recuperar la información del servidor</p>
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-300 mb-4">
          <FileText size={32} />
        </div>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No hay documentos cargados</p>
        <p className="text-gray-400 text-[10px] mt-1 font-medium italic text-center px-6">
          El estudiante aún no ha subido archivos para esta práctica.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => {
        const status = STATUS_CONFIG[doc.status_id] || STATUS_CONFIG[1];
        const StatusIcon = status.icon;
        const isUpdating = updatingId === doc.id;

        return (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Info del Documento */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-14 h-14 bg-[#fff0f6] rounded-2xl flex items-center justify-center text-[#d22864] flex-shrink-0">
                  <FileText size={28} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-gray-900 truncate text-base">
                    {doc.document_type?.name || 'Documento'}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                      {doc.uploaded_at || doc.created_at ? new Date(doc.uploaded_at || doc.created_at).toLocaleDateString() : 'Fecha no disponible'}
                    </p>
                    <div className={`px-3 py-0.5 rounded-full flex items-center gap-1.5 ${status.bg} ${status.color}`}>
                      <StatusIcon size={12} />
                      <span className="text-[10px] font-black uppercase tracking-tight">{status.label}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onDownload(doc)}
                  className="p-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-[#d22864]/5 hover:text-[#d22864] transition-colors"
                  title="Descargar"
                >
                  <Download size={20} />
                </button>

                {canReview && (
                  <div className="relative">
                    <button
                      onClick={() => setShowStatusMenu(showStatusMenu === doc.id ? null : doc.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                        showStatusMenu === doc.id ? 'bg-gray-900 text-white' : 'bg-[#d22864] text-white hover:opacity-90 shadow-lg shadow-[#d22864]/20'
                      }`}
                    >
                      {isUpdating ? <Loader2 size={18} className="animate-spin" /> : 'Revisar'}
                      <ChevronDown size={16} />
                    </button>

                    <AnimatePresence>
                      {showStatusMenu === doc.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                        >
                          <div className="p-4 space-y-3">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Cambiar Estado</p>
                            <div className="grid grid-cols-1 gap-1">
                              <button
                                onClick={() => handleStatusChange(doc.id, 2)}
                                className="flex items-center gap-3 w-full p-2.5 rounded-xl text-green-600 hover:bg-green-50 font-bold text-sm transition-colors"
                              >
                                <CheckCircle size={18} /> Aprobar
                              </button>
                              <button
                                onClick={() => handleStatusChange(doc.id, 3)}
                                className="flex items-center gap-3 w-full p-2.5 rounded-xl text-red-600 hover:bg-red-50 font-bold text-sm transition-colors"
                              >
                                <XCircle size={18} /> Rechazar
                              </button>
                              <button
                                onClick={() => handleStatusChange(doc.id, 4)}
                                className="flex items-center gap-3 w-full p-2.5 rounded-xl text-purple-600 hover:bg-purple-50 font-bold text-sm transition-colors"
                              >
                                <Eye size={18} /> Observar
                              </button>
                            </div>
                            
                            {(doc.status_id === 3 || doc.status_id === 4 || showStatusMenu === doc.id) && (
                              <div className="pt-2 border-t border-gray-50">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 block mb-2">Comentario / Motivo</label>
                                <textarea
                                  value={comment}
                                  onChange={(e) => setComment(e.target.value)}
                                  placeholder="Escribe el motivo del rechazo u observación..."
                                  className="w-full bg-gray-50 border-none rounded-xl p-3 text-xs font-medium focus:ring-1 focus:ring-[#d22864]/20 resize-none h-20"
                                />
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>

            {/* Comentario actual si existe */}
            {doc.comment && (
              <div className="mt-4 p-4 bg-gray-50 rounded-2xl flex gap-3 items-start border border-gray-100/50">
                <MessageSquare size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Último Comentario</p>
                  <p className="text-sm text-gray-600 font-medium italic">"{doc.comment}"</p>
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, CheckCircle2, AlertTriangle, ArrowRightLeft } from 'lucide-react';

const COMMENT_MAX_LENGTH = 1000;

export const ActionModal = ({
  isOpen,
  onClose,
  onConfirm,
  actionType,
  isLoading,
  approveStartsReview = false,
}) => {
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if ((actionType === 'reject' || actionType === 'derive') && !comment.trim()) {
      return;
    }
    onConfirm(comment);
    setComment('');
  };

  const actionLabels = {
    approve: approveStartsReview ? 'Enviar a revisión' : 'Aprobar solicitud',
    reject: 'Rechazar solicitud',
    derive: 'Derivar solicitud',
  };

  const actionColors = {
    approve: 'text-emerald-600',
    reject: 'text-red-600',
    derive: 'text-blue-600',
  };

  const buttonColors = {
    approve: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
    reject: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    derive: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
  };

  const icons = {
    approve: <CheckCircle2 className="w-10 h-10 text-emerald-600" />,
    reject: <AlertTriangle className="w-10 h-10 text-red-600" />,
    derive: <ArrowRightLeft className="w-10 h-10 text-blue-600" />,
  };

  const actionDescriptions = {
    approve: approveStartsReview
      ? 'La solicitud pasará de Pendiente a En revisión. Esta acción no constituye la aprobación final de la práctica.'
      : '¿Está seguro de que desea aprobar esta solicitud? La práctica quedará habilitada administrativamente para continuar su ejecución.',
    reject: 'Esta acción rechazará la solicitud de forma definitiva. Es obligatorio que ingrese un motivo claro para el rechazo.',
    derive: 'Esta acción derivará la solicitud a revisión por la Dirección de Registro Académico Estudiantil (DIRAE). Es obligatorio ingresar un motivo.',
  };

  const isCommentRequired = actionType === 'reject' || actionType === 'derive';
  const isCommentTooLong = comment.length > COMMENT_MAX_LENGTH;
  const isConfirmDisabled = isLoading || isCommentTooLong || (isCommentRequired && !comment.trim());

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white rounded-[28px] p-8 w-full max-w-[520px] shadow-2xl border border-gray-100 flex flex-col relative animate-fade-up">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">
              {icons[actionType]}
            </div>
            <div>
              <h3 className={`text-2xl font-bold tracking-tight ${actionColors[actionType]}`}>
                {actionLabels[actionType]}
              </h3>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mt-0.5">Acción Administrativa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer text-gray-500 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="mb-6 flex-grow">
          <p className="text-gray-600 text-[15px] leading-relaxed mb-6 font-medium">
            {actionDescriptions[actionType]}
          </p>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700 flex justify-between">
              <span>Motivo / Comentario</span>
              {isCommentRequired ? (
                <span className="text-red-500 text-xs font-semibold">Obligatorio</span>
              ) : (
                <span className="text-gray-400 text-xs font-semibold">Opcional</span>
              )}
            </label>
            <textarea
              disabled={isLoading}
              maxLength={COMMENT_MAX_LENGTH}
              className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#d22864]/30 focus:border-[#d22864] outline-none transition-all resize-none h-32 text-gray-800 placeholder-gray-400 text-sm font-medium shadow-inner"
              placeholder={isCommentRequired ? "Escriba el motivo detallado aquí..." : "Comentario u observaciones de la aprobación (opcional)..."}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="flex items-center justify-between gap-3 text-xs font-semibold">
              <span className={isCommentTooLong ? 'text-red-600' : 'text-gray-400'}>
                Máximo {COMMENT_MAX_LENGTH} caracteres.
              </span>
              <span className={comment.length >= COMMENT_MAX_LENGTH ? 'text-red-600' : 'text-gray-400'}>
                {comment.length}/{COMMENT_MAX_LENGTH}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-12 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className={`flex-1 h-12 text-white rounded-xl font-bold active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${buttonColors[actionType]}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <span>Confirmar</span>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

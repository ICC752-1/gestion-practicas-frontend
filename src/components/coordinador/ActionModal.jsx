import React, { useState } from 'react';
import { X } from 'lucide-react';

export const ActionModal = ({ isOpen, onClose, onConfirm, actionType }) => {
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if ((actionType === 'reject' || actionType === 'derive') && !comment.trim()) {
      alert('El comentario es obligatorio para esta acción.');
      return;
    }
    onConfirm(comment);
    setComment('');
  };

  const actionLabels = {
    approve: 'Aprobar Práctica',
    reject: 'Rechazar Práctica',
    derive: 'Derivar Práctica',
  };

  const actionColors = {
    approve: 'text-green-600',
    reject: 'text-red-600',
    derive: 'text-blue-600',
  };

  const buttonColors = {
    approve: 'bg-green-600 hover:bg-green-700',
    reject: 'bg-red-600 hover:bg-red-700',
    derive: 'bg-blue-600 hover:bg-blue-700',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-[30px] p-8 w-full max-w-[550px] shadow-xl animate-fade-up">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-2xl font-bold ${actionColors[actionType]}`}>
            {actionLabels[actionType]}
          </h3>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer text-gray-600"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="mb-8">
          <p className="text-gray-700 text-lg mb-4">
            {actionType === 'approve' 
              ? '¿Está seguro de que desea aprobar esta práctica?' 
              : 'Por favor, proporcione un motivo para esta acción.'}
          </p>
          
          {(actionType === 'reject' || actionType === 'derive') && (
            <textarea
              className="w-full p-4 border border-gray-300 rounded-[20px] focus:ring-2 focus:ring-[#d22864] focus:border-transparent outline-none transition-all resize-none h-32"
              placeholder="Escriba aquí el motivo..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 h-14 bg-gray-100 text-gray-700 rounded-[20px] font-bold hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 h-14 text-white rounded-[20px] font-bold transition-opacity shadow-md cursor-pointer ${buttonColors[actionType]}`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

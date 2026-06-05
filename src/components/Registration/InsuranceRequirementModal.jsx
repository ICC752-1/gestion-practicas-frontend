import { AlertTriangle, X } from 'lucide-react';

export const InsuranceRequirementModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-[30px] p-8 w-full max-w-[550px] shadow-xl animate-fade-up">
        
        {/* Header con botón cerrar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#fff0f6] rounded-full flex items-center justify-center">
              <AlertTriangle className="text-[#d22864]" size={28} />
            </div>
            <h3 className="text-2xl font-bold text-[#d22864]">
              Requisitos pendientes
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer text-gray-600"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mensaje */}
        <div className="mb-8">
          <p className="text-gray-700 text-lg leading-relaxed">
            Para registrar una práctica de <span className="font-bold text-[#d22864]">verano o invierno</span> es obligatorio contar con <span className="font-bold">seguro escolar</span>.
          </p>
          
          <div className="mt-6 p-4 bg-[#fff0f6] border border-[#ffdeeb] rounded-[20px]">
            <p className="text-gray-700 text-base">
              Debes completar previamente la inducción y validación del seguro escolar antes de continuar con el registro.
            </p>
          </div>
        </div>

        {/* Botón de acción */}
        <div className="flex">
          <button
            onClick={onClose}
            className="flex-1 h-14 bg-[#d22864] text-white rounded-[20px] font-bold hover:opacity-90 transition-opacity shadow-md cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
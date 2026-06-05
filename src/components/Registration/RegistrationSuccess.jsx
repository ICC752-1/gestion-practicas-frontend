import { Check, Mail, FileText, Calendar, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { InternshipSummaryCard } from './InternshipSummaryCard';

export const RegistrationSuccess = ({ internshipId, uploadDate, status = 'Pendiente de revisión', internshipData }) => {
  const [showDetail, setShowDetail] = useState(false);

  const formattedDate = uploadDate
    ? new Date(uploadDate).toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-[800px]">
      <div className="bg-white rounded-[40px] shadow-[0px_4px_30px_#00000015] p-12 w-full flex flex-col items-center">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-[#d22864] rounded-full flex items-center justify-center mb-8 shadow-lg">
          <Check size={56} className="text-white" strokeWidth={3} />
        </div>

        <h2 className="text-4xl font-bold text-[#d22864] text-center mb-4">
          ¡Solicitud registro de práctica enviada exitosamente!
        </h2>

        <p className="text-gray-600 text-xl text-center mb-10">
          Tu solicitud de práctica ha sido recibida y será revisada por el coordinador de prácticas
        </p>

        {/* Datos de la práctica */}
        <div className="flex gap-4 mb-10 flex-wrap justify-center">
          {internshipId && (
            <div className="bg-gray-50 border border-gray-200 rounded-[20px] px-6 py-4 text-center min-w-[140px]">
              <p className="text-sm text-gray-500 mb-1">N° de práctica</p>
              <p className="text-2xl font-bold text-black">#{internshipId}</p>
            </div>
          )}
          {formattedDate && (
            <div className="bg-gray-50 border border-gray-200 rounded-[20px] px-6 py-4 text-center min-w-[140px]">
              <p className="text-sm text-gray-500 mb-1">Fecha de registro</p>
              <p className="text-lg font-bold text-black">{formattedDate}</p>
            </div>
          )}
          <div className="bg-[#fff0f6] border border-[#ffdeeb] rounded-[20px] px-6 py-4 text-center min-w-[140px]">
            <p className="text-sm text-gray-500 mb-1">Estado</p>
            <p className="text-lg font-bold text-[#d22864]">{status}</p>
          </div>
        </div>

        {/* Botón Ver mi práctica */}
        {internshipId && (
          <button
            onClick={() => setShowDetail((prev) => !prev)}
            className="flex items-center gap-3 mb-10 h-14 px-8 bg-[#d22864] text-white text-xl font-bold rounded-[20px] hover:opacity-90 transition-opacity shadow-md cursor-pointer"
          >
            {showDetail ? 'Ocultar detalle' : 'Ver mi práctica'}
            <ChevronDown
              size={22}
              className={`transition-transform duration-200 ${showDetail ? 'rotate-180' : ''}`}
            />
          </button>
        )}

        {/* Next Steps Card */}
        <div className="bg-[#fff0f6] border border-[#ffdeeb] rounded-[30px] p-10 w-full max-w-[600px]">
          <h3 className="text-3xl font-bold text-black mb-8">Próximos pasos:</h3>
          <div className="space-y-8">
            <div className="flex items-start gap-5">
              <div className="mt-1"><Mail className="text-[#d22864]" size={32} /></div>
              <div>
                <h4 className="text-xl font-bold text-black">1. Recibirás un correo de confirmación</h4>
                <p className="text-gray-700 text-lg">Te enviaremos un email con los detalles de tu solicitud</p>
              </div>
            </div>
            <div className="flex items-start gap-5">
              <div className="mt-1"><FileText className="text-[#d22864]" size={32} /></div>
              <div>
                <h4 className="text-xl font-bold text-black">2. Revisión del coordinador</h4>
                <p className="text-gray-700 text-lg">Te notificaremos cuando sea revisada</p>
              </div>
            </div>
            <div className="flex items-start gap-5">
              <div className="mt-1"><Calendar className="text-[#d22864]" size={32} /></div>
              <div>
                <h4 className="text-xl font-bold text-black">3. Agendar entrevista</h4>
                <p className="text-gray-700 text-lg">Al finalizar tu práctica, podrás agendar tu entrevista de aprobación</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card de detalle — aparece al hacer click */}
      {showDetail && (
        <InternshipSummaryCard 
          internshipData={internshipData} 
          onClose={() => setShowDetail(false)}
        />
      )}
    </div>
  );
};
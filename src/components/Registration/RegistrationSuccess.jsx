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

        <h2 className="text-3xl font-bold text-[#d22864] text-center mb-4">
          ¡Solicitud de registro de práctica enviada exitosamente!
        </h2>

        <p className="text-gray-600 text-xl text-center mb-10">
          Tu solicitud de práctica ha sido recibida y será revisada por el encargado de prácticas
        </p>

        {/* Datos de la práctica */}
        <div className="flex gap-4 mb-10 flex-wrap justify-center">
          {internshipId && (
            <div className="bg-gray-50 border border-gray-200 rounded-[20px] px-6 py-4 text-center min-w-[140px]">
              <p className="text-sm text-gray-500 mb-1">N° de práctica</p>
              <p className="text-2xl font-bold text-black">{internshipId}</p>
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
        <div className="bg-[#fff0f6] border border-[#ffdeeb] rounded-[24px] p-6 sm:p-8 w-full max-w-[540px] shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Próximos pasos:</h3>
          <div className="space-y-5">
            
            <div className="flex items-start gap-3.5">
              <div className="mt-0.5 flex-shrink-0">
                <Mail className="text-[#d22864]" size={20} />
              </div>
              <div className="flex flex-col gap-0.5">
                <h4 className="text-sm sm:text-base font-semibold text-gray-950">1. Recibirás un correo de confirmación</h4>
                <p className="text-gray-600 text-xs sm:text-sm font-normal">Te enviaremos un email con los detalles de tu solicitud.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="mt-0.5 flex-shrink-0">
                <FileText className="text-[#d22864]" size={20} />
              </div>
              <div className="flex flex-col gap-0.5">
                <h4 className="text-sm sm:text-base font-semibold text-gray-950">2. Revisión de la solicitud</h4>
                <p className="text-gray-600 text-xs sm:text-sm font-normal">Coordinación y/o dirección revisará la solicitud de práctica.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="mt-0.5 flex-shrink-0">
                <Check className="text-[#d22864]" size={20} />
              </div>
              <div className="flex flex-col gap-0.5">
                <h4 className="text-sm sm:text-base font-semibold text-gray-950">3. Ejecución de la práctica</h4>
                <p className="text-gray-600 text-xs sm:text-sm font-normal">Si la solicitud es aprobada, podrás realizar la práctica en la organización registrada.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="mt-0.5 flex-shrink-0">
                <FileText className="text-[#d22864]" size={20} />
              </div>
              <div className="flex flex-col gap-0.5">
                <h4 className="text-sm sm:text-base font-semibold text-gray-950">4. Autoevaluación y evaluación del supervisor a estudiante</h4>
                <p className="text-gray-600 text-xs sm:text-sm font-normal">Cinco días hábiles antes del término se habilitará tu autoevaluación; al enviarla, el supervisor recibirá su enlace de evaluación.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="mt-0.5 flex-shrink-0">
                <Calendar className="text-[#d22864]" size={20} />
              </div>
              <div className="flex flex-col gap-0.5">
                <h4 className="text-sm sm:text-base font-semibold text-gray-950">5. Presentación y cierre</h4>
                <p className="text-gray-600 text-xs sm:text-sm font-normal">Con las evaluaciones listas, podrás agendar la presentación final para cerrar la práctica.</p>
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

import { Check, Mail, FileText, Calendar } from 'lucide-react';

export const RegistrationSuccess = () => {
  return (
    <div className="bg-white rounded-[40px] shadow-[0px_4px_30px_#00000015] p-12 w-full max-w-[800px] flex flex-col items-center">
      {/* Success Icon */}
      <div className="w-24 h-24 bg-[##d22864] rounded-full flex items-center justify-center mb-8 shadow-lg">
        <Check size={56} className="text-white" strokeWidth={3} />
      </div>

      <h2 className="text-4xl font-bold text-[#d22864] text-center mb-4">
        ¡Solicitud registro de practica enviada exitosamente!
      </h2>
      
      <p className="text-gray-600 text-xl text-center mb-12">
        Tu solicitud de práctica ha sido recibida y será revisada por el coordinador de prácticas
      </p>

      {/* Next Steps Card */}
      <div className="bg-[#fff0f6] border border-[#ffdeeb] rounded-[30px] p-10 w-full max-w-[600px]">
        <h3 className="text-3xl font-bold text-black mb-8">Próximos pasos:</h3>
        
        <div className="space-y-8">
          <div className="flex items-start gap-5">
            <div className="mt-1">
              <Mail className="text-[#d22864]" size={32} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-black">1. Recibirás un correo de confirmación</h4>
              <p className="text-gray-700 text-lg">Te enviaremos un email con los detalles de tu solicitud</p>
            </div>
          </div>

          <div className="flex items-start gap-5">
            <div className="mt-1">
              <FileText className="text-[#d22864]" size={32} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-black">2. Revisión del coordinador</h4>
              <p className="text-gray-700 text-lg">Te enviaremos cuando sea revisada</p>
            </div>
          </div>

          <div className="flex items-start gap-5">
            <div className="mt-1">
              <Calendar className="text-[#d22864]" size={32} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-black">3. Agendar entrevista</h4>
              <p className="text-gray-700 text-lg">Al finalizar tu práctica, podrás agendar tu entrevista de aprobación</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

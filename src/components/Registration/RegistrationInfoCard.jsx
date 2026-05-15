import { CheckCircle2 } from 'lucide-react';

export const RegistrationInfoCard = ({ 
  title = "Información del Proceso", 
  description = "Complete los datos solicitados para continuar con su registro de práctica.", 
  icon: Icon, 
  checklist = [] 
}) => {
  return (
    <div className="bg-[#fff0f6] border border-[#ffdeeb] rounded-2xl p-8 w-full max-w-[650px] shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        {Icon && <Icon className="text-[#d22864]" size={42} strokeWidth={1.5} />}
        <h3 className="font-bold text-black text-xl">{title}</h3>
      </div>
      
      <p className="text-gray-700 text-base leading-relaxed mb-6">
        {description}
      </p>

      {checklist && checklist.length > 0 && (
        <ul className="space-y-4">
          {checklist.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle2 className="text-[#d22864] mt-0.5 shrink-0" size={24} strokeWidth={2.5} />
              <span className="text-gray-800 text-base font-medium">{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};



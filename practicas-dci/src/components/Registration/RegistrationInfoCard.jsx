import { UserCircle2, CheckCircle2 } from 'lucide-react';

export const RegistrationInfoCard = () => {
  const checklist = [
    "Verifique que su correo está actualizado",
    "Use su correo institucional (@ufromail.cl)",
    "Asegúrese de tener un número de contacto válido"
  ];

  return (
    <div className="bg-[#fff0f6] border border-[#ffdeeb] rounded-2xl p-8 w-full max-w-[650px] shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <UserCircle2 className="text-[#b13168]" size={42} strokeWidth={1.5} />
        <h3 className="font-bold text-black text-xl">Información Personal</h3>
      </div>
      
      <p className="text-gray-700 text-base leading-relaxed mb-6">
        Complete sus datos personales y de contacto. Esta información será utilizada para comunicarnos con usted durante el periodo de práctica.
      </p>

      <ul className="space-y-4">
        {checklist.map((item, index) => (
          <li key={index} className="flex items-start gap-3">
            <CheckCircle2 className="text-[#b13168] mt-0.5 shrink-0" size={24} strokeWidth={2.5} />
            <span className="text-gray-800 text-base font-medium">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

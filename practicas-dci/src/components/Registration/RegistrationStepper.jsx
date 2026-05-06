import { User, Building2, UserRound, ClipboardList, FileText } from 'lucide-react';

const steps = [
  { id: 1, label: "Información personal", icon: User },
  { id: 2, label: "Información de la Organización", icon: Building2 },
  { id: 3, label: "Información del Supervisor/a", icon: UserRound },
  { id: 4, label: "Detalles de la práctica", icon: ClipboardList },
  { id: 5, label: "Actividades a Realizar", icon: FileText },
];

export const RegistrationStepper = ({ currentStep = 1 }) => {
  return (
    <div className="w-full py-8 px-4 flex justify-center">
      <div className="flex items-start max-w-5xl w-full">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center group relative min-w-[120px]">
              {/* Icon Circle */}
              <div 
                className={`
                  w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-300
                  ${step.id <= currentStep 
                    ? "border-[#b13168] bg-white text-[#b13168] shadow-md scale-110" 
                    : "border-gray-300 bg-white text-gray-400"}
                `}
              >
                <step.icon size={32} strokeWidth={step.id === currentStep ? 2.5 : 2} />
              </div>

              {/* Label */}
              <span 
                className={`
                  mt-3 text-[11px] font-bold text-center leading-tight max-w-[100px] transition-colors duration-300
                  ${step.id <= currentStep ? "text-[#b13168]" : "text-gray-400"}
                `}
              >
                {step.label}
              </span>

              {/* Active Dot indicator below label like in image */}
              {step.id === currentStep && (
                <div className="absolute -bottom-2 w-1.5 h-1.5 bg-[#b13168] rounded-full"></div>
              )}
            </div>

            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-[2px] bg-gray-300 mx-4 mt-8 transition-colors duration-300">
                <div 
                  className="h-full bg-[#b13168] transition-all duration-500" 
                  style={{ width: step.id < currentStep ? "100%" : "0%" }}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

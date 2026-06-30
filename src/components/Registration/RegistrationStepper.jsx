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
    <div className="w-full py-6 md:py-8 px-2 md:px-4 flex justify-center overflow-x-auto selection:bg-transparent">
      <div className="flex items-start justify-between max-w-5xl w-full min-w-[320px]">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-1 items-start last:flex-none">
            {/* Contenedor del Icono y Texto */}
            <div className="flex flex-col items-center flex-1 relative min-w-0">
              
              {/* Icon Circle */}
              <div 
                className={`
                  w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 z-10
                  ${step.id <= currentStep 
                    ? "border-[#d22864] bg-white text-[#d22864] shadow-md scale-105 md:scale-110" 
                    : "border-gray-300 bg-white text-gray-400"}
                `}
              >
                <step.icon 
                  strokeWidth={step.id === currentStep ? 2.5 : 2} 
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8"
                />
              </div>

              {/* Label */}
              <span 
                className={`
                  mt-2 text-[8px] sm:text-[10px] md:text-[11px] font-bold text-center leading-tight w-full max-w-[65px] sm:max-w-[85px] md:max-w-[110px] block break-normal transition-colors duration-300
                  ${step.id <= currentStep ? "text-[#d22864]" : "text-gray-400"}
                `}
              >
                {step.label}
              </span>

              {/* Active Dot indicator below label */}
              {step.id === currentStep && (
                <div className="absolute -bottom-3 w-1.5 h-1.5 bg-[#d22864] rounded-full"></div>
              )}
            </div>

            {/* Connecting Line - Perfectamente centrada en base al tamaño del círculo */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-[2px] bg-gray-300 mx-1 sm:mx-2 md:mx-4 transform translate-y-5 sm:translate-y-6 md:translate-y-8 transition-colors duration-300">
                <div 
                  className="h-full bg-[#d22864] transition-all duration-500"
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
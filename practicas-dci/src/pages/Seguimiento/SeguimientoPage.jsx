import { UserHeader } from "../../components/Header/UserHeader";
import { Footer } from "../../components/Footer/Footer";
import { motion } from "motion/react";
import { 
  UserCheck, 
  FileEdit, 
  FileCheck, 
  Briefcase, 
  Calendar, 
  Video, 
  CheckCircle2, 
  Clock
} from 'lucide-react';

const TIMELINE_STEPS = [
  {
    id: 'induction',
    title: 'Inducción obligatoria',
    isMajor: true,
    isCompleted: true,
    icon: <UserCheck className="w-6 h-6" />,
  },
  {
    id: 'capsule',
    title: 'Cápsula de Interculturalidad',
    isCompleted: true,
  },
  {
    id: 'law1',
    title: 'Ley 16744, primera parte',
    isCompleted: true,
  },
  {
    id: 'law2',
    title: 'Ley 16744, segunda parte',
    isCompleted: true,
  },
  {
    id: 'quiz',
    title: 'Cuestionario de inducción obligatoria',
    isCompleted: true,
  },
  {
    id: 'form-sent',
    title: 'Formulario de práctica I enviado',
    subtitle: 'Tu formulario de práctica I ha sido recibido correctamente',
    isMajor: true,
    isCompleted: true,
    icon: <FileEdit className="w-6 h-6" />,
  },
  {
    id: 'approval',
    title: 'Supervisor o director aprobó el registro',
    isCompleted: true,
  },
  {
    id: 'registration',
    title: 'Registro de Práctica I',
    subtitle: 'Tu práctica fue registrada con éxito. Descarga tu Seguro escolar aquí',
    isMajor: true,
    isCompleted: true,
    icon: <FileCheck className="w-6 h-6" />,
  },
  {
    id: 'execution',
    title: 'Ejecución Práctica I',
    isMajor: true,
    isCompleted: true,
    icon: <div className="relative"><Briefcase className="w-6 h-6" /><Clock className="w-3 h-3 absolute -bottom-1 -right-1 bg-white rounded-full" /></div>,
  },
  {
    id: 'self-eval',
    title: 'Autoevaluación (5 días antes termino de práctica)',
    isCompleted: true,
  },
  {
    id: 'supervisor-eval',
    title: 'Evaluación supervisor',
    isCompleted: true,
  },
  {
    id: 'term-execution',
    title: 'Termino Ejecución Práctica I',
    isMajor: true,
    isCompleted: true,
    icon: <div className="relative"><Briefcase className="w-6 h-6" /><Clock className="w-3 h-3 absolute -bottom-1 -right-1 bg-white rounded-full" /></div>,
  },
  {
    id: 'schedule-interview',
    title: 'Agendar Entrevista Coordinador de Prácticas',
    isMajor: true,
    isCompleted: true,
    icon: <Calendar className="w-6 h-6" />,
  },
  {
    id: 'interview-done',
    title: 'Entrevista con Coordinador Realizada',
    isMajor: true,
    isCompleted: true,
    icon: <Video className="w-6 h-6" />,
  },
  {
    id: 'approved',
    title: 'Práctica I aprobada con éxito',
    isMajor: true,
    isCompleted: true,
    icon: <CheckCircle2 className="w-6 h-6" />,
  },
];

const TimelineItem = ({ step, index, isLast }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex gap-6 relative"
    >
      {/* Line connecting items */}
      {!isLast && (
        <div className="absolute left-[19.5px] top-10 w-[2px] h-[calc(100%-24px)] bg-brand-medium" />
      )}

      {/* Circle / Icon */}
      <div className="flex flex-col items-center z-10">
        {step.isMajor ? (
          <div className="w-10 h-10 rounded-full border-2 border-brand-medium bg-white flex items-center justify-center text-brand-medium shadow-sm">
            {step.icon}
          </div>
        ) : (
          <div className="w-10 flex justify-center">
            <div className="w-5 h-5 rounded-full border-2 border-brand-medium bg-brand-medium/5" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 pb-10 ${step.isMajor ? 'pt-2' : 'pt-0.5'}`}>
        <h3 className={`font-semibold text-gray-800 ${step.isMajor ? 'text-base md:text-lg' : 'text-sm md:text-base italic'}`}>
          {step.title}
        </h3>
        {step.subtitle && (
          <p className="text-gray-400 text-xs md:text-sm mt-0.5">
            {step.subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export const SeguimientoPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <UserHeader />
      
      <main className="max-w-4xl mx-auto w-full py-12 px-6 flex-grow">
        {/* Title Section */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h2 className="text-brand-medium text-2xl md:text-3xl font-bold tracking-tight">
            Seguimiento de Práctica I
          </h2>
          <p className="text-gray-400 font-medium mt-1">
            Estudiante: María Gómez
          </p>
        </motion.div>

        {/* Timeline Container */}
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-16 mb-10 overflow-hidden relative border border-gray-100">
          <div className="max-w-xl mx-auto">
            {TIMELINE_STEPS.map((step, index) => (
              <TimelineItem 
                key={step.id} 
                step={step} 
                index={index} 
                isLast={index === TIMELINE_STEPS.length - 1} 
              />
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center mb-20">
          <button className="bg-brand-medium text-white px-10 py-3 rounded-full font-bold hover:bg-opacity-90 transition-all transform hover:scale-105 active:scale-95 shadow-lg">
            Volver
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SeguimientoPage;

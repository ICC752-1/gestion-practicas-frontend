import React from 'react';
import { motion } from "framer-motion";
import { 
  Plus, 
  Play, 
  Upload, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  ClipboardCheck,
  Calendar,
  Building2,
  User,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserHeader } from "../../components/Header/UserHeader";
import { Footer } from "../../components/Footer/Footer";
import { useAuth } from "../../context/useAuth";

// --- Sub-components ---

const StatusBadge = ({ status }) => {
  const configs = {
    'Aprobada': { color: 'bg-green-500', icon: <CheckCircle2 size={16} /> },
    'Inscripción en revisión': { color: 'bg-amber-500', icon: <Clock size={16} /> },
    'Pendiente Autoevaluación': { color: 'bg-[#d22864]', icon: <AlertCircle size={16} />, animate: true },
    'En Proceso': { color: 'bg-blue-500', icon: <Play size={16} /> },
  };

  const config = configs[status] || configs['En Proceso'];

  return (
    <div className={`${config.color} text-white px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold shadow-lg shadow-${config.color.split('-')[1]}-500/20 ${config.animate ? 'animate-pulse' : ''}`}>
      {config.icon}
      {status}
    </div>
  );
};

const PracticeCard = ({ title, company, supervisor, startDate, endDate, status, showEvalButton }) => {
  const navigate = useNavigate();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 group hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-[5rem] -mr-10 -mt-10 group-hover:bg-[#d22864]/5 transition-colors duration-500"></div>
      
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8 relative z-10">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h3>
          <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
            <Calendar size={14} />
            <span>{startDate} — {endDate}</span>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 relative z-10">
        <div className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#d22864] shadow-sm">
            <Building2 size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Empresa</p>
            <p className="text-gray-800 font-bold">{company}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#d22864] shadow-sm">
            <User size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Supervisor</p>
            <p className="text-gray-800 font-bold">{supervisor}</p>
          </div>
        </div>
      </div>

      {showEvalButton && (
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/autoevaluacion')}
          className="w-full bg-[#d22864] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#d22864]/30 hover:bg-[#b01e52] transition-all relative z-10"
        >
          <ClipboardCheck size={20} />
          Realizar Autoevaluación
          <ArrowRight size={18} />
        </motion.button>
      )}
    </motion.div>
  );
};

const QuickAction = ({ icon: Icon, title, desc, onClick, primary }) => (
  <motion.button
    whileHover={{ y: -5, scale: 1.02 }}
    onClick={onClick}
    className={`p-6 rounded-[2rem] text-left flex flex-col gap-4 transition-all duration-300 ${
      primary 
      ? 'bg-[#d22864] text-white shadow-xl shadow-[#d22864]/20' 
      : 'bg-white text-gray-900 shadow-lg shadow-gray-200/50 border border-gray-50 hover:border-[#d22864]/20'
    }`}
  >
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${primary ? 'bg-white/20' : 'bg-[#d22864]/10 text-[#d22864]'}`}>
      <Icon size={24} />
    </div>
    <div>
      <h4 className="font-bold text-lg leading-tight">{title}</h4>
      <p className={`text-sm mt-1 ${primary ? 'text-white/70' : 'text-gray-400'}`}>{desc}</p>
    </div>
  </motion.button>
);

// --- Main Component ---

export const StudentDashboardPage = () => {
  const navigate = useNavigate();
    const { user } = useAuth();

    const userName = user
        ? `${user.first_name} ${user.last_name}`
        : "Estudiante";

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] font-sans selection:bg-[#d22864]/10 selection:text-[#d22864]">
      <UserHeader />
      
      <main className="flex-grow">
        {/* Welcome Section */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6"
            >
              <div>
                  <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-none mb-3">
                      Hola, {userName} <span className="inline-block animate-bounce-slow">👋</span>
                  </h2>
                <p className="text-gray-500 font-medium text-lg">
                  Tienes una práctica pendiente de autoevaluación.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1">Progreso Total</p>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                      <div className="h-full bg-green-500 w-1/2 rounded-full"></div>
                    </div>
                    <span className="font-black text-gray-900">50%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* Practices List */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  Mis Prácticas
                  <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-1 rounded-md">2 TOTAL</span>
                </h3>
              </div>

              <PracticeCard 
                title="Práctica I"
                company="Software Company"
                supervisor="Roberto Sáez"
                startDate="15 Mar 2026"
                endDate="15 May 2026"
                status="Pendiente Autoevaluación"
                showEvalButton={true}
              />

              <PracticeCard 
                title="Práctica II"
                company="Tech Solutions Corp"
                supervisor="Ana Martínez"
                startDate="01 Ago 2026"
                endDate="30 Oct 2026"
                status="Inscripción en revisión"
                showEvalButton={false}
              />
            </div>

            {/* Side Actions & Widgets */}
            <div className="space-y-8">
              <h3 className="text-xl font-bold text-gray-900">Acciones Rápidas</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <QuickAction 
                  icon={Plus} 
                  title="Nueva Inscripción" 
                  desc="Comienza el proceso para tu próxima práctica"
                  onClick={() => navigate('/inscripcion')}
                  primary={true}
                />
                <QuickAction 
                  icon={Play} 
                  title="Ver Seguimiento" 
                  desc="Revisa el estado de tus procesos actuales"
                  onClick={() => navigate('/seguimiento')}
                />
                <QuickAction 
                  icon={Upload} 
                  title="Subir Documentos" 
                  desc="Informes, certificados y evaluaciones"
                  onClick={() => {}}
                />
              </div>

              {/* Help Widget */}
              <div className="bg-gradient-to-br from-[#d22864] to-[#972fa4] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-[#d22864]/20">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                <h4 className="text-xl font-bold mb-2">¿Necesitas ayuda?</h4>
                <p className="text-white/80 text-sm mb-6 leading-relaxed">
                  Revisa nuestra sección de preguntas frecuentes o contacta a tu coordinador.
                </p>
                <button 
                  onClick={() => navigate('/faq')}
                  className="bg-white text-[#d22864] px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors w-full"
                >
                  Ir a FAQ
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StudentDashboardPage;

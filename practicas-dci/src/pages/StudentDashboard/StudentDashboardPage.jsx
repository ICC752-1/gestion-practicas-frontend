import { motion } from "framer-motion";
import { 
  Plus, 
  Play, 
  Upload, 
  CheckCircle2, 
  Clock 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserHeader } from "../../components/Header/UserHeader";
import { Footer } from "../../components/Footer/Footer";

function InfoField({ label, value }) {
  return (
    <div className="space-y-1">
      <span className="text-sm font-medium text-gray-400 block ml-4">{label}</span>
      <div className="bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-gray-700 text-xl font-medium">
        {value}
      </div>
    </div>
  );
}

function ActionCard({ icon, title, description, onClick }) {
  return (
    <motion.button 
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="bg-white p-10 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-gray-50 text-left space-y-6 group transition-all cursor-pointer"
    >
      <div className="bg-brand-medium text-white w-20 h-20 rounded-2xl flex items-center justify-center p-4">
        {icon}
      </div>
      <div className="space-y-2">
        <h4 className="text-2xl font-bold text-gray-900">{title}</h4>
        <p className="text-gray-400 text-lg leading-tight">{description}</p>
      </div>
    </motion.button>
  );
}

export const StudentDashboardPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#f3f3f3] min-h-screen flex flex-col relative overflow-x-hidden">
      <UserHeader />
      <main className="flex-grow flex flex-col w-full bg-white">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="max-w-7xl mx-auto py-12 px-6 space-y-12 w-full"
        >
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-brand-medium">Panel Estudiante</h2>
            <p className="text-xl text-brand-light font-medium opacity-80">Bienvenido/a, María Gómez</p>
          </div>

          <div className="space-y-8">
            {/* Practice I */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_4px_30px_rgba(0,0,0,0.04)] border border-gray-100 relative">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <h3 className="text-3xl font-bold text-brand-dark text-center md:text-left flex-grow">
                  Estado de la Práctica I
                </h3>
                <div className="bg-brand-medium text-white px-6 py-2 rounded-full flex items-center gap-2 font-bold shadow-md">
                  <CheckCircle2 size={20} />
                  Aprobada
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <InfoField label="Empresa" value="Software Company" />
                <InfoField label="Supervisor" value="Roberto Sáez" />
                <InfoField label="Fecha Inicio" value="15/03/2026" />
                <InfoField label="Fecha Termino" value="15/05/2026" />
              </div>
            </div>

            {/* Practice II */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_4px_30px_rgba(0,0,0,0.04)] border border-gray-100 relative">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <h3 className="text-3xl font-bold text-brand-dark text-center md:text-left flex-grow">
                  Estado de la Práctica II
                </h3>
                <div className="bg-brand-medium text-white px-6 py-2 rounded-full flex items-center gap-2 font-bold shadow-md opacity-90">
                  <Clock size={20} />
                  Inscripción en revisión
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <InfoField label="Empresa" value="Software Company" />
                <InfoField label="Supervisor" value="Roberto Sáez" />
                <InfoField label="Fecha Inicio" value="01/08/2026" />
                <InfoField label="Fecha Termino" value="30/10/2026" />
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
            <ActionCard 
              icon={<Plus size={48} />} 
              title="Inscribir práctica" 
              description="Registra una práctica aquí" 
              onClick={() => navigate("/inscripcion")}
            />
            <ActionCard 
              icon={<Play size={48} />} 
              title="Ver seguimiento" 
              description="Revisa el progreso de tu práctica" 
              onClick={() => navigate("/seguimiento")}
            />
            <ActionCard 
              icon={<Upload size={48} />} 
              title="Subir Documentos" 
              description="Cargar informes y evaluaciones" 
              onClick={() => {}}
            />
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default StudentDashboardPage;

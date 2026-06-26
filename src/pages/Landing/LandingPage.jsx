import { motion } from "framer-motion";
import { FileEdit, MapPin, ListChecks, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";

export const LandingPage = () => {
  const navigate = useNavigate();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="bg-[#f3f3f3] min-h-screen flex flex-col relative overflow-x-hidden">
      <Header />
      <main className="flex-grow flex flex-col w-full bg-white">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Hero Section */}
          <section className="bg-brand-medium text-white py-24 px-6 relative overflow-hidden">
            <div className="max-w-4xl mx-auto text-center relative z-10">
              <motion.h2 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-4xl md:text-5xl font-bold mb-6 tracking-tight"
              >
                Sistema de gestión de prácticas FICA
              </motion.h2>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed"
              >
                Plataforma integral para estudiantes, encargados y supervisores que facilita 
                todo el proceso de prácticas de manera digital y eficiente.
              </motion.p>
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <button 
                  onClick={() => navigate("/login")}
                  className="w-full sm:w-auto bg-white text-brand-dark px-10 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg cursor-pointer"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => navigate("/requisitos")}
                  className="w-full sm:w-auto bg-white text-brand-dark px-10 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg cursor-pointer"
                >
                  Ver Requisitos
                </button>
              </motion.div>
            </div>
          </section>

          {/* How it Works Section */}
          <section className="py-24 px-6 bg-gray-50/50">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h3 className="text-4xl font-bold text-brand-medium mb-4">¿Cómo funciona el proceso?</h3>
                <p className="text-lg text-brand-medium italic opacity-80">Nuestro sistema simplifica cada etapa del proceso de prácticas</p>
              </div>

              <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              >
                {[
                  { icon: <FileEdit className="text-brand-medium" size={48} />, title: "Inscripción", desc: "Inscribe tu práctica de forma digital con todos los documentos requeridos" },
                  { icon: <MapPin className="text-brand-medium" size={48} />, title: "Seguimiento", desc: "Revisa el estado de tu práctica y recibe notificaciones en tiempo real" },
                  { icon: <ListChecks className="text-brand-medium" size={48} />, title: "Evaluación", desc: "Supervisores pueden evaluar directamente desde la plataforma" },
                  { icon: <CheckCircle2 className="text-brand-medium" size={48} />, title: "Aprobación", desc: "Completa tu proceso de práctica y obtén tu certificación de forma ágil" }
                ].map((card, idx) => (
                  <motion.div key={idx} variants={itemVariants} className="bg-white p-8 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-50 flex flex-col items-center text-center transition-transform hover:-translate-y-1">
                    <div className="mb-6 p-4 rounded-2xl bg-brand-medium/5">{card.icon}</div>
                    <h4 className="text-2xl font-bold text-brand-medium mb-4">{card.title}</h4>
                    <p className="text-gray-600 leading-relaxed text-sm">{card.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Info columns */}
          <section className="bg-brand-medium py-20 px-6 text-white">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32">
              <motion.div initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }}>
                <h3 className="text-2xl font-bold mb-8">Para Estudiantes</h3>
                <ul className="space-y-6">
                  {["Inscribe tu práctica de forma rápida y sencilla", "Sube y gestiona todos tus documentos en un solo lugar", "Recibe notificaciones sobre el estado de tu práctica", "Accede a preguntas frecuentes y soporte"].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-4">
                      <div className="mt-1 bg-white rounded-full p-1 text-brand-medium shrink-0"><CheckCircle2 size={16} fill="currentColor" className="text-white" /></div>
                      <span className="text-lg opacity-90">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div initial={{ x: 20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }}>
                <h3 className="text-2xl font-bold mb-8">Para Encargados y Supervisores</h3>
                <ul className="space-y-6">
                  {["Gestiona todas las prácticas desde un panel centralizado", "Revisa y aprueba documentos de manera eficiente", "Completa evaluaciones directamente en la plataforma", "Genera reportes y estadísticas en tiempo real"].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-4">
                      <div className="mt-1 bg-white rounded-full p-1 text-brand-medium shrink-0"><CheckCircle2 size={16} fill="currentColor" className="text-white" /></div>
                      <span className="text-lg opacity-90">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </section>

          <section className="py-24 px-6 text-center bg-white">
            <h3 className="text-4xl font-bold text-brand-medium mb-6">¿Listo para comenzar?</h3>
            <p className="text-xl text-brand-medium italic mb-12 opacity-80 max-w-3xl mx-auto">
              Inicia sesión para acceder a tu panel personalizado o revisa los requisitos para comenzar tu práctica profesional
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto bg-brand-medium text-white px-12 py-3 rounded-md font-bold hover:bg-brand-dark transition-all transform hover:scale-105 cursor-pointer"
              >
                Iniciar Sesión
              </button>
              <button 
                onClick={() => navigate("/faq")}
                className="w-full sm:w-auto bg-brand-medium text-white px-12 py-3 rounded-md font-bold hover:bg-brand-dark transition-all transform hover:scale-105 cursor-pointer"
              >
                Preguntas frecuentes
              </button>
            </div>
          </section>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;

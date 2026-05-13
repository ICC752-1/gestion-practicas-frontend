import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown } from "lucide-react";
import { Header } from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";

export const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const categories = ["Requisitos", "Proceso", "Documentos", "Duración", "Modalidad"];
  
  return (
    <div className="bg-[#f3f3f3] min-h-screen flex flex-col relative overflow-x-hidden">
      <Header />
      <main className="flex-grow flex flex-col w-full bg-white">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="max-w-7xl mx-auto py-16 px-6 grow w-full"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-brand-medium mb-4">Preguntas Frecuentes</h2>
            <p className="text-lg text-brand-medium opacity-80">
              Encuentra respuestas a las preguntas más comunes sobre prácticas profesionales
            </p>
          </div>

          <div className="max-w-3xl mx-auto mb-12 relative">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="text-gray-400" size={24} />
            </div>
            <input 
              type="text" 
              placeholder="Buscar en preguntas frecuentes..."
              className="w-full pl-14 pr-6 py-5 rounded-full border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-medium focus:border-transparent text-lg"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {categories.map((cat) => (
              <button 
                key={cat}
                className="px-8 py-2.5 rounded-full bg-brand-medium text-white font-semibold hover:bg-brand-dark transition-colors shadow-sm cursor-pointer"
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="max-w-5xl mx-auto space-y-4 mb-24">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="border border-gray-100 rounded-[2rem] overflow-hidden bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                <button 
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  className="w-full px-10 py-8 flex items-center justify-between text-left group cursor-pointer"
                >
                  <div className="space-y-4">
                    <span className="inline-block px-4 py-1 bg-brand-medium text-white text-xs font-bold rounded-lg uppercase tracking-wider">
                      Categoría
                    </span>
                    <h4 className="text-2xl font-bold text-brand-medium group-hover:text-brand-dark transition-colors">
                      ¿Pregunta frecuente?
                    </h4>
                  </div>
                  <motion.div
                    animate={{ rotate: openIndex === idx ? 180 : 0 }}
                    className="text-brand-medium"
                  >
                    <ChevronDown size={32} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openIndex === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-10 pb-10 text-gray-600 leading-relaxed border-t border-gray-50 pt-6">
                        Aquí va la respuesta detallada a la pregunta frecuente. Este sistema está diseñado para facilitar 
                        el acceso a la información relevante para estudiantes, supervisores y coordinadores en cada etapa 
                        del proceso de práctica profesional.
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div className="max-w-5xl mx-auto mb-12">
            <div className="bg-brand-medium text-white py-16 px-10 rounded-[2.5rem] text-center shadow-xl">
              <h3 className="text-3xl font-bold mb-4">¿No encontraste lo que buscabas?</h3>
              <p className="text-lg opacity-90 mb-10 italic">
                Contáctanos y con gusto te ayudaremos con tus dudas
              </p>
              <button className="bg-white text-brand-medium px-12 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg cursor-pointer">
                Ir al soporte
              </button>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQPage;

import { Calendar, CheckCircle2, Video } from "lucide-react";
import { motion } from "framer-motion";

import { Header } from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";

export const RequirementsPage = () => {
  const practice1Reqs = [
    { title: "Requisito 1", icon: <Calendar className="text-brand-medium" size={24} /> },
    { title: "Requisito 2", icon: <CheckCircle2 className="text-brand-medium" size={24} /> },
    { title: "Requisito 3", icon: <Video className="text-brand-medium" size={24} /> },
  ];

  const practice2Reqs = [
    { title: "Requisito 1", icon: <Calendar className="text-brand-medium" size={24} /> },
    { title: "Requisito 2", icon: <CheckCircle2 className="text-brand-medium" size={24} /> },
    { title: "Requisito 3", icon: <Video className="text-brand-medium" size={24} /> },
  ];

  return (
    <div className="bg-[#f3f3f3] min-h-screen flex flex-col overflow-x-hidden">
      <Header />

      <main className="flex-grow flex flex-col w-full bg-white">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto py-16 px-6 grow w-full"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-brand-medium mb-4">
              Requisitos para tu Práctica
            </h2>

            <p className="text-lg text-brand-medium opacity-80 italic">
              Revisa si cuentas con todo lo necesario para comenzar tu práctica
            </p>
          </div>

          <div className="bg-pink-50 border border-pink-100 rounded-[2rem] p-8 mb-10 shadow-sm">
            <h3 className="text-2xl font-bold text-brand-medium mb-6">
              Información Importante
            </h3>

            <div className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100">
              <div className="w-14 h-14 bg-brand-medium rounded-xl flex items-center justify-center text-white shrink-0">
                <Calendar size={26} />
              </div>

              <span className="text-lg font-semibold text-gray-700">
                Contenido de información
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div className="bg-white rounded-[2rem] p-10 border border-gray-100 shadow-sm">
              <h3 className="text-2xl font-bold text-brand-medium mb-8">
                Requisitos Práctica 1
              </h3>

              <div className="space-y-4">
                {practice1Reqs.map((req, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-5 border border-gray-100 rounded-2xl hover:border-brand-medium/30 transition-all bg-gray-50/40"
                  >
                    <div className="w-10 h-10 flex items-center justify-center shrink-0">
                      {req.icon}
                    </div>

                    <span className="font-bold text-gray-700">
                      {req.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-10 border border-gray-100 shadow-sm">
              <h3 className="text-2xl font-bold text-brand-medium mb-8">
                Requisitos Práctica 2
              </h3>

              <div className="space-y-4">
                {practice2Reqs.map((req, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-5 border border-gray-100 rounded-2xl hover:border-brand-medium/30 transition-all bg-gray-50/40"
                  >
                    <div className="w-10 h-10 flex items-center justify-center shrink-0">
                      {req.icon}
                    </div>

                    <span className="font-bold text-gray-700">
                      {req.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-14 bg-brand-medium rounded-[2.5rem] p-12 text-center text-white shadow-xl">
            <h3 className="text-3xl font-bold mb-4">
              ¿Cumples con todos los requisitos?
            </h3>

            <p className="opacity-90 italic mb-10 text-lg">
              Si cumples con todos los requisitos obligatorios ya estás listo
              para inscribir tu práctica
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-brand-medium font-bold px-12 py-4 rounded-xl hover:bg-gray-100 transition-colors shadow-lg">
                Inscribir Práctica
              </button>

              <button className="border-2 border-white text-white font-bold px-12 py-4 rounded-xl hover:bg-white/10 transition-colors">
                Ver preguntas frecuentes
              </button>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default RequirementsPage;
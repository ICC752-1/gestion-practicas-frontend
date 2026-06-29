import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, ChevronDown } from "lucide-react";
import { Header } from "../../components/Header/Header";
import { UserHeader } from "../../components/Header/UserHeader";
import { Footer } from "../../components/Footer/Footer";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";
import { getRedirectPathForRoles } from "../../services/roleRouting";

const SUPPORT_EMAIL = "secretaria.vincfica@ufrontera.cl";

const faqItems = [
  {
    id: 1,
    category: "Requisitos",
    question: "¿Quiénes pueden registrar una solicitud de práctica?",
    answer: "Pueden registrar solicitudes los estudiantes autenticados que cumplan con los requisitos académicos definidos por la carrera y que no tengan una solicitud vigente bloqueante para el mismo tipo de práctica.",
  },
  {
    id: 2,
    category: "Proceso",
    question: "¿Qué ocurre después de enviar mi solicitud?",
    answer: "La solicitud queda en estado pendiente para revisión administrativa. Luego puede pasar a revisión, aprobación, rechazo o derivación documental, según corresponda al flujo definido por la unidad académica.",
  },
  {
    id: 3,
    category: "Documentos",
    question: "¿Dónde puedo subir los documentos de mi práctica?",
    answer: "Los documentos se cargan desde el panel del estudiante o desde el detalle de la práctica. El sistema permite revisar el estado de cada archivo y corregir documentos observados cuando el flujo lo permite.",
  },
  {
    id: 4,
    category: "Documentos",
    question: "¿Qué pasa si un documento es observado?",
    answer: "Cuando un documento es observado, el sistema muestra el comentario de revisión para que puedas cargar una versión corregida. La revisión final queda a cargo de los roles administrativos autorizados.",
  },
  {
    id: 5,
    category: "Duración",
    question: "¿La duración de la práctica se valida automáticamente?",
    answer: "El sistema registra las fechas informadas y permite su revisión durante el proceso. La validación académica o administrativa depende de los criterios de la carrera y de la revisión realizada por los encargados correspondientes.",
  },
  {
    id: 6,
    category: "Modalidad",
    question: "¿Puedo registrar prácticas presenciales, remotas o híbridas?",
    answer: "Sí. Al completar la solicitud debes indicar la modalidad correspondiente y los datos de la organización. Esa información queda disponible para revisión y seguimiento administrativo.",
  },
  {
    id: 7,
    category: "Proceso",
    question: "¿Cómo consulto el estado de mi práctica?",
    answer: "Puedes revisar el estado desde tu dashboard o desde la sección de seguimiento. Allí se muestra el avance de la solicitud, documentos asociados y acciones disponibles según el estado actual.",
  },
  {
    id: 8,
    category: "Requisitos",
    question: "¿Qué sucede con el seguro escolar en periodos fuera del calendario regular?",
    answer: "Las prácticas fuera del periodo académico regular pueden requerir validación explícita del seguro escolar o una excepción administrativa antes de su aprobación final.",
  },
];

const normalizeText = (value) => (
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
);

export const FAQPage = () => {
  const [openQuestionId, setOpenQuestionId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todas");
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const categories = ["Todas", ...new Set(faqItems.map((item) => item.category))];
  const backPath = isAuthenticated
    ? getRedirectPathForRoles(user?.roles)
    : "/landing";
  const normalizedSearchTerm = normalizeText(searchTerm.trim());
  const filteredFaqs = faqItems.filter((item) => {
    const matchesCategory = activeCategory === "Todas" || item.category === activeCategory;
    const searchableText = normalizeText(`${item.category} ${item.question} ${item.answer}`);

    return matchesCategory && searchableText.includes(normalizedSearchTerm);
  });

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    setOpenQuestionId(null);
  };
  
  return (
    <div className="bg-[#f3f3f3] min-h-screen flex flex-col relative overflow-x-hidden">
      {isAuthenticated ? <UserHeader /> : <Header />}
      <main className="flex-grow flex flex-col w-full bg-white">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="max-w-7xl mx-auto py-3 px-6 grow w-full"
        >
          <div className="mb-12">
          <button
            type="button"
            onClick={() => navigate(backPath)}
            className="mb-8 inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-brand-medium transition hover:underline"
          >
            <ArrowLeft size={18} />
            Volver
          </button>

          <div className="text-center">
            <h2 className="text-4xl font-bold text-brand-medium mb-4">Preguntas Frecuentes</h2>
            <p className="text-lg text-brand-medium opacity-80">
              Encuentra respuestas a las preguntas más comunes sobre prácticas profesionales
            </p>
          </div>
          </div>

          <div className="max-w-3xl mx-auto mb-12 relative">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="text-gray-400" size={24} />
            </div>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar en preguntas frecuentes..."
              aria-label="Buscar en preguntas frecuentes"
              className="w-full pl-14 pr-6 py-5 rounded-full border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-medium focus:border-transparent text-lg"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {categories.map((cat) => (
              <button 
                key={cat}
                type="button"
                onClick={() => handleCategoryClick(cat)}
                className={`px-8 py-2.5 rounded-full font-semibold transition-colors shadow-sm cursor-pointer ${
                  activeCategory === cat
                  ? "bg-white text-brand-dark border border-brand-dark shadow-md"
                  : "bg-brand-medium text-white hover:bg-brand-dark"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="max-w-5xl mx-auto space-y-4 mb-24">
            {filteredFaqs.map((item) => (
              <div key={item.id} className="border border-gray-100 rounded-[2rem] overflow-hidden bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                <button 
                  type="button"
                  onClick={() => setOpenQuestionId(openQuestionId === item.id ? null : item.id)}
                  className="w-full px-10 py-8 flex items-center justify-between text-left group cursor-pointer"
                >
                  <div className="space-y-4">
                    <span className="inline-block px-4 py-1 bg-brand-medium text-white text-xs font-bold rounded-lg uppercase tracking-wider">
                      {item.category}
                    </span>
                    <h4 className="text-2xl font-bold text-brand-medium group-hover:text-brand-dark transition-colors">
                      {item.question}
                    </h4>
                  </div>
                  <motion.div
                    animate={{ rotate: openQuestionId === item.id ? 180 : 0 }}
                    className="text-brand-medium"
                  >
                    <ChevronDown size={32} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openQuestionId === item.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-10 pb-10 text-gray-600 leading-relaxed border-t border-gray-50 pt-0">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            {filteredFaqs.length === 0 && (
              <div className="rounded-[2rem] border border-gray-100 bg-white px-10 py-12 text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                <p className="text-xl font-bold text-brand-medium">No encontramos preguntas para tu búsqueda.</p>
                <p className="mt-3 text-gray-600">Intenta con otra palabra clave o selecciona otra categoría.</p>
              </div>
            )}
          </div>

          <div className="max-w-5xl mx-auto mb-12">
            <div className="bg-brand-medium text-white py-16 px-10 rounded-[2.5rem] text-center shadow-xl">
              <h3 className="text-3xl font-bold mb-4">¿No encontraste lo que buscabas?</h3>
              <p className="text-lg opacity-90 mb-6 italic">
                Contáctanos y con gusto te ayudaremos con tus dudas
              </p>

              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="inline-flex bg-white text-brand-medium px-12 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg cursor-pointer"
              >

                Ir al soporte
              </a>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQPage;

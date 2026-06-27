import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FileText,
  HelpCircle,
  PlayCircle,
  ShieldCheck,
} from 'lucide-react';
import { Header } from '../../components/Header/Header';
import { UserHeader } from '../../components/Header/UserHeader';
import { Footer } from '../../components/Footer/Footer';
import { useAuth } from '../../context/useAuth';


const requirementCards = [
  {
    icon: PlayCircle,
    title: 'Inducción obligatoria',
    description: 'Antes de registrar una práctica debes revisar el material vigente y aprobar el cuestionario de inducción publicado por la coordinación.',
  },
  {
    icon: ShieldCheck,
    title: 'Seguro escolar',
    description: 'El sistema informa si existe seguro escolar registrado o una excepción administrativa. Para prácticas fuera del periodo regular puede requerirse validación adicional.',
  },
  {
    icon: FileText,
    title: 'Documentos de respaldo',
    description: 'Durante el proceso se podrán solicitar documentos como formulario de inscripción, carta de aceptación, seguro escolar u otros antecedentes según el estado de la solicitud.',
  },
  {
    icon: ClipboardList,
    title: 'Solicitud vigente',
    description: 'No puedes mantener más de una solicitud vigente para el mismo tipo de práctica. Si ya existe una solicitud bloqueante, debes revisar ese registro antes de crear otra.',
  },
];

const processSteps = [
  'Revisa esta información antes de iniciar el registro.',
  'Ingresa a la preinscripción y valida tu estado institucional.',
  'Completa y aprueba la inducción obligatoria si está pendiente.',
  'Continúa al formulario de solicitud cuando el sistema lo habilite.',
  'Carga o corrige documentos cuando el flujo administrativo lo solicite.',
];

export const RequirementsPage = () => {
  const { isAuthenticated } = useAuth();
  const primaryActionPath = isAuthenticated ? '/practicas/nueva/preinscripcion' : '/login';
  const primaryActionLabel = isAuthenticated ? 'Ir a preinscripción' : 'Iniciar sesión';
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f3f3f3] font-sans">
      {isAuthenticated ? <UserHeader /> : <Header />}

      <main className="bg-white">
        {/* Botón volver */}
          <div className="max-w-7xl mx-auto py-3 px-6 w-full">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-[#d22864] font-semibold hover:underline text-2xl"
          >
            ←
          </button>
        </div>

        <section className="mx-auto max-w-7xl px-6 py-6">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-black uppercase tracking-wider text-[#d22864]">
              Antes de registrar tu práctica
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-brand-medium md:text-5xl">
              Requisitos e inducción estudiantil
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-gray-600">
              Este apartado centraliza los requisitos que el sistema valida durante la preinscripción. La inducción es obligatoria y debe aprobarse antes de acceder al formulario de solicitud.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to={primaryActionPath}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#d22864] px-7 py-3 font-black text-white shadow-lg shadow-[#d22864]/20 transition hover:bg-[#b01e52]"
              >
                {primaryActionLabel}
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/faq"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#d22864] px-7 py-3 font-black text-[#d22864] transition hover:bg-[#d22864] hover:text-white"
              >
                Ver preguntas frecuentes
                <HelpCircle size={18} />
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-6 pb-16 md:grid-cols-2 xl:grid-cols-4">
          {requirementCards.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="mb-5 inline-flex rounded-2xl bg-[#d22864]/10 p-3 text-[#d22864]">
                <Icon size={28} />
              </div>
              <h2 className="text-xl font-black text-gray-800">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{description}</p>
            </article>
          ))}
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="grid grid-cols-1 gap-8 rounded-[2.5rem] bg-[#f8f8f8] p-6 md:p-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-wider text-[#d22864]">
                Flujo esperado
              </p>
              <h2 className="mt-3 text-3xl font-black text-gray-950">
                La inducción se completa antes del formulario
              </h2>
              <p className="mt-4 text-base leading-relaxed text-gray-600">
                Al iniciar una nueva práctica, el sistema abre primero la preinscripción. En esa etapa se muestran el estado de inducción, seguro escolar y otros bloqueos antes de permitir el registro formal.
              </p>
            </div>

            <ol className="space-y-4">
              {processSteps.map((step, index) => (
                <li key={step} className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#d22864] text-sm font-black text-white">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-bold text-gray-950">{step}</p>
                    {index === 2 && (
                      <p className="mt-1 text-sm text-gray-500">
                        Si la versión activa cambia, el sistema puede solicitar repetir el cuestionario.
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-800">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 flex-shrink-0" size={24} />
              <p className="text-sm font-semibold leading-relaxed">
                Completar estos pasos no aprueba automáticamente la práctica. La aprobación final depende de la revisión administrativa y académica correspondiente.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default RequirementsPage;

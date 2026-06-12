import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FileText,
  Loader2,
  PlayCircle,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { UserHeader } from '../../components/Header/UserHeader';
import { Footer } from '../../components/Footer/Footer';
import { internshipService } from '../../services/internshipService';

const FORM_PATH = '/practicas/nueva/formulario';

const getApiErrorMessage = (error) => {
  if (!error.response) {
    return 'No se pudo conectar con el servidor. Intenta nuevamente en unos minutos.';
  }

  const detail = error.response.data?.detail;
  if (typeof detail === 'string') return detail;
  if (detail?.message) return detail.message;
  if (Array.isArray(detail)) return detail.map((item) => item.msg).join(', ');

  if (error.response.status === 403) {
    return 'Tu cuenta no tiene permisos para realizar esta acción.';
  }

  return 'No se pudo cargar la información de preinscripción.';
};

const canRegisterFromEligibility = (eligibility) => {
  if (!eligibility) return false;
  if (typeof eligibility.can_register === 'boolean') return eligibility.can_register;
  return !eligibility.blocked;
};

const getEmbedUrl = (videoUrl) => {
  try {
    const url = new URL(videoUrl);
    const host = url.hostname.replace('www.', '');

    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const watchId = url.searchParams.get('v');
      if (watchId) return `https://www.youtube.com/embed/${watchId}`;

      const [, route, id] = url.pathname.split('/');
      if ((route === 'embed' || route === 'shorts') && id) {
        return `https://www.youtube.com/embed/${id}`;
      }
    }

    if (host === 'vimeo.com') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }

    if (host === 'player.vimeo.com') {
      return videoUrl;
    }
  } catch {
    return null;
  }

  return null;
};

const normalizeOptions = (options) => {
  if (Array.isArray(options)) {
    return options.map((option, index) => ({
      key: String(index),
      label: String(option),
    }));
  }

  return Object.entries(options || {}).map(([key, value]) => ({
    key,
    label: String(value),
  }));
};

const StatusPanel = ({ icon: Icon, title, description, tone = 'gray' }) => {
  const tones = {
    green: 'border-green-200 bg-green-50 text-green-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    red: 'border-red-200 bg-red-50 text-red-700',
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    gray: 'border-gray-200 bg-white text-gray-700',
  };

  return (
    <div className={`rounded-2xl border p-5 ${tones[tone]}`}>
      <div className="flex items-start gap-3">
        <Icon size={24} className="mt-1 flex-shrink-0" />
        <div>
          <h3 className="font-black text-gray-900">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};

const VideoCard = ({ video }) => {
  const embedUrl = getEmbedUrl(video.video_url);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="font-bold text-gray-900">{video.title}</h4>
        <a
          href={video.video_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-sm font-bold text-[#d22864] hover:underline"
        >
          Abrir
          <ExternalLink size={14} />
        </a>
      </div>

      {embedUrl ? (
        <iframe
          className="aspect-video w-full rounded-xl border border-gray-100"
          src={embedUrl}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 text-center">
          <PlayCircle className="text-gray-400" size={40} />
          <p className="mt-3 text-sm font-semibold text-gray-600">
            Este video se abre como enlace externo.
          </p>
        </div>
      )}
    </div>
  );
};

export const PreRegistrationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [eligibility, setEligibility] = useState(null);
  const [induction, setInduction] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const [attemptError, setAttemptError] = useState(null);
  const [attemptResult, setAttemptResult] = useState(null);
  const [submittingAttempt, setSubmittingAttempt] = useState(false);
  const [continuing, setContinuing] = useState(false);

  const questions = useMemo(() => {
    return [...(induction?.questions || [])].sort((a, b) => a.order - b.order);
  }, [induction]);

  const videos = useMemo(() => {
    return [...(induction?.videos || [])].sort((a, b) => a.order - b.order);
  }, [induction]);

  const canContinue = canRegisterFromEligibility(eligibility);

  const loadPreRegistration = async () => {
    setLoading(true);
    setLoadingError(null);
    setAttemptError(null);

    try {
      const [eligibilityData, inductionData] = await Promise.all([
        internshipService.getRegistrationEligibility(),
        internshipService.getInductionContent(),
      ]);

      setEligibility(eligibilityData);
      setInduction(inductionData);
    } catch (error) {
      setLoadingError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPreRegistration();
  }, []);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: answer,
    }));
    setAttemptError(null);
    setAttemptResult(null);
  };

  const handleSubmitAttempt = async (event) => {
    event.preventDefault();
    setAttemptError(null);
    setAttemptResult(null);

    const unansweredQuestions = questions.filter((question) => !answers[question.id]);
    if (unansweredQuestions.length > 0) {
      setAttemptError('Responde todas las preguntas antes de enviar el cuestionario.');
      return;
    }

    setSubmittingAttempt(true);

    try {
      const result = await internshipService.submitInductionAttempt(answers);
      setAttemptResult(result);

      if (result.passed) {
        const eligibilityData = await internshipService.getRegistrationEligibility();
        setEligibility(eligibilityData);
      }
    } catch (error) {
      setAttemptError(getApiErrorMessage(error));
    } finally {
      setSubmittingAttempt(false);
    }
  };

  const handleContinue = async () => {
    setContinuing(true);
    setLoadingError(null);

    try {
      const latestEligibility = await internshipService.getRegistrationEligibility();
      setEligibility(latestEligibility);

      if (canRegisterFromEligibility(latestEligibility)) {
        navigate(FORM_PATH);
      } else {
        setLoadingError(latestEligibility.next_step || 'Aún existen prerrequisitos pendientes.');
      }
    } catch (error) {
      setLoadingError(getApiErrorMessage(error));
    } finally {
      setContinuing(false);
    }
  };

  const insuranceStatus = eligibility?.has_school_insurance
    ? {
      icon: CheckCircle2,
      title: 'Seguro escolar registrado',
      description: 'El registro institucional indica que el requisito de seguro escolar está cumplido.',
      tone: 'green',
    }
    : eligibility?.has_school_insurance_exception
      ? {
        icon: ShieldCheck,
        title: 'Excepción administrativa aplicada',
        description: 'Existe una excepción vigente para continuar sin presentar este requisito como cumplido.',
        tone: 'blue',
      }
      : {
        icon: XCircle,
        title: 'Seguro escolar pendiente',
        description: 'La institución aún no registra el cumplimiento del seguro escolar.',
        tone: 'amber',
      };

  const inductionStatus = eligibility?.has_induction
    ? {
      icon: CheckCircle2,
      title: 'Inducción aprobada',
      description: 'Puedes continuar al formulario de inscripción.',
      tone: 'green',
    }
    : {
      icon: ClipboardList,
      title: 'Inducción pendiente',
      description: 'Revisa el contenido y aprueba el cuestionario para habilitar el formulario.',
      tone: 'amber',
    };

  return (
    <div className="min-h-screen bg-[#f3f3f3] font-sans">
      <UserHeader />

      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-wider text-[#d22864]">
            Nueva inscripción
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950 md:text-4xl">
            Preinscripción de práctica
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-gray-600">
            Completa los prerrequisitos institucionales antes de ingresar al formulario de práctica.
          </p>
        </div>

        {location.state?.reason === 'eligibility-blocked' && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 flex-shrink-0" size={22} />
              <p className="text-sm font-semibold">
                Debes resolver los prerrequisitos pendientes antes de enviar el formulario.
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl bg-white shadow-sm">
            <Loader2 className="animate-spin text-[#d22864]" size={44} />
            <p className="mt-4 font-semibold text-gray-600">Cargando preinscripción...</p>
          </div>
        ) : loadingError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <AlertCircle className="mx-auto text-red-500" size={48} />
            <h2 className="mt-4 text-2xl font-black text-red-900">No se pudo validar la preinscripción</h2>
            <p className="mx-auto mt-3 max-w-2xl text-red-700">{loadingError}</p>
            <button
              type="button"
              onClick={loadPreRegistration}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700"
            >
              <RefreshCw size={18} />
              Reintentar
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
            <section className="space-y-8">
              <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
                <div className="mb-6 flex items-start gap-4">
                  <div className="rounded-2xl bg-[#d22864]/10 p-3 text-[#d22864]">
                    <FileText size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-950">Carta de presentación</h2>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      La carta de presentación es un antecedente opcional en esta etapa y no bloquea el avance al formulario.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
                <div className="mb-6 flex items-start gap-4">
                  <div className="rounded-2xl bg-[#d22864]/10 p-3 text-[#d22864]">
                    <PlayCircle size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-950">
                      {induction?.title || 'Inducción obligatoria'}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      {induction?.description || 'No hay una descripción publicada para la inducción activa.'}
                    </p>
                  </div>
                </div>

                {eligibility?.has_induction ? (
                  <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-green-800">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 flex-shrink-0" size={24} />
                      <div>
                        <p className="font-black">Cuestionario aprobado</p>
                        <p className="mt-1 text-sm">La inducción figura como cumplida en el registro institucional.</p>
                      </div>
                    </div>
                  </div>
                ) : induction ? (
                  <div className="space-y-8">
                    {videos.length > 0 && (
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        {videos.map((video) => (
                          <VideoCard key={video.id} video={video} />
                        ))}
                      </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmitAttempt}>
                      <div>
                        <h3 className="text-xl font-black text-gray-950">Cuestionario</h3>
                        <p className="mt-1 text-sm text-gray-600">
                          Puntaje mínimo de aprobación: {induction.min_score} respuesta{induction.min_score === 1 ? '' : 's'} correcta{induction.min_score === 1 ? '' : 's'}.
                        </p>
                      </div>

                      {questions.map((question, index) => (
                        <fieldset key={question.id} className="rounded-2xl border border-gray-200 p-5">
                          <legend className="px-1 text-base font-black text-gray-950">
                            {index + 1}. {question.question_text}
                          </legend>
                          <div className="mt-4 space-y-3">
                            {normalizeOptions(question.options).map((option) => (
                              <label
                                key={option.key}
                                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                                  answers[question.id] === option.key
                                    ? 'border-[#d22864] bg-[#fff0f6]'
                                    : 'border-gray-200 bg-white hover:border-[#d22864]/40'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`question-${question.id}`}
                                  value={option.key}
                                  checked={answers[question.id] === option.key}
                                  onChange={() => handleAnswerChange(question.id, option.key)}
                                  className="mt-1 h-4 w-4 rounded-full border border-gray-400"
                                />
                                <span className="text-sm font-semibold text-gray-700">{option.label}</span>
                              </label>
                            ))}
                          </div>
                        </fieldset>
                      ))}

                      {attemptError && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                          {attemptError}
                        </div>
                      )}

                      {attemptResult && (
                        <div className={`rounded-xl border p-4 text-sm font-semibold ${
                          attemptResult.passed
                            ? 'border-green-200 bg-green-50 text-green-700'
                            : 'border-amber-200 bg-amber-50 text-amber-700'
                        }`}
                        >
                          Puntaje obtenido: {attemptResult.score}. {attemptResult.passed ? 'Inducción aprobada.' : 'Debes intentarlo nuevamente.'}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={submittingAttempt || questions.length === 0}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#d22864] px-6 py-3 font-bold text-white hover:bg-[#b01e52] disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        {submittingAttempt ? <Loader2 className="animate-spin" size={18} /> : <ClipboardList size={18} />}
                        Enviar cuestionario
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 flex-shrink-0" size={24} />
                      <div>
                        <p className="font-black">No hay inducción publicada</p>
                        <p className="mt-1 text-sm">La preinscripción queda bloqueada hasta que exista contenido activo.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <aside className="space-y-5">
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-black text-gray-950">Estado institucional</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  La habilitación del formulario depende de la validación institucional de los requisitos.
                </p>

                <div className="mt-6 space-y-4">
                  <StatusPanel {...insuranceStatus} />
                  <StatusPanel {...inductionStatus} />
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-black text-gray-950">Siguiente paso</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {eligibility?.next_step || 'Completa los prerrequisitos para continuar.'}
                </p>

                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!canContinue || continuing}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#d22864] px-5 py-4 font-black text-white shadow-lg shadow-[#d22864]/20 hover:bg-[#b01e52] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
                >
                  {continuing ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                  Continuar al formulario
                </button>

                {!canContinue && (
                  <p className="mt-3 text-center text-xs font-semibold text-gray-500">
                    El botón se habilita cuando no existan bloqueos activos.
                  </p>
                )}
              </div>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PreRegistrationPage;

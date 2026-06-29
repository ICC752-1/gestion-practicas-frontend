import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
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

const formatAttemptDate = (isoDate) => {
  if (!isoDate) return '';
  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/.test(isoDate);
  const normalizedDate = hasTimezone ? isoDate : `${isoDate}Z`;

  return new Date(normalizedDate).toLocaleString('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
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
      key: String(option || index),
      label: String(option),
    }));
  }

  if (Array.isArray(options?.choices)) {
    return options.choices.map((option, index) => ({
      key: String(option || index),
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
    green: {
      panel: 'border-emerald-200 bg-emerald-50/80',
      icon: 'bg-white text-emerald-600 ring-emerald-200',
      description: 'text-emerald-800',
    },
    amber: {
      panel: 'border-amber-200 bg-amber-50/80',
      icon: 'bg-white text-amber-600 ring-amber-200',
      description: 'text-amber-800',
    },
    red: {
      panel: 'border-red-200 bg-red-50/80',
      icon: 'bg-white text-red-600 ring-red-200',
      description: 'text-red-800',
    },
    blue: {
      panel: 'border-sky-200 bg-sky-50/80',
      icon: 'bg-white text-sky-600 ring-sky-200',
      description: 'text-sky-800',
    },
    gray: {
      panel: 'border-gray-200 bg-gray-50',
      icon: 'bg-white text-gray-600 ring-gray-200',
      description: 'text-gray-600',
    },
  };
  const toneStyles = tones[tone] ?? tones.gray;

  return (
    <div className={`rounded-xl border p-4 ${toneStyles.panel}`}>
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-sm ring-1 ${toneStyles.icon}`}>
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-black text-gray-900">{title}</h3>
          <p className={`mt-1 text-xs font-medium leading-5 ${toneStyles.description}`}>
            {description}
          </p>
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

const QuestionList = ({
  questions,
  answers,
  onAnswerChange,
  readOnly = false,
  feedbackByQuestion = {},
}) => (
  <div className="space-y-6">
    {questions.map((question, index) => {
      const feedback = feedbackByQuestion[String(question.id)];
      const selectedAnswer = readOnly && feedback
        ? feedback.selected_answer
        : answers[question.id];

      return (
        <fieldset key={question.id} className="rounded-2xl border border-gray-200 bg-white p-5">
          <legend className="px-1 text-base font-black text-gray-950">
            {index + 1}. {question.question_text}
          </legend>
          <div className="mt-4 space-y-3">
            {normalizeOptions(question.options).map((option) => {
              const isSelected = selectedAnswer === option.key;
              const isCorrectOption = readOnly
                && feedback?.correct_answer === option.key;
              const isCorrectSelection = isSelected && feedback?.is_correct;
              const isIncorrectSelection = isSelected
                && feedback
                && !feedback.is_correct;

              const optionStyle = readOnly
                ? isCorrectSelection || isCorrectOption
                  ? 'cursor-default border-emerald-300 bg-emerald-50'
                  : isIncorrectSelection
                    ? 'cursor-default border-red-300 bg-red-50'
                    : 'cursor-default border-gray-200 bg-gray-50'
                : isSelected
                  ? 'cursor-pointer border-[#d22864] bg-[#fff0f6]'
                  : 'cursor-pointer border-gray-200 bg-white hover:border-[#d22864]/40';

              const indicatorStyle = isCorrectSelection
                ? 'border-emerald-600 bg-emerald-600'
                : isIncorrectSelection
                  ? 'border-red-600 bg-red-600'
                  : isSelected
                    ? 'border-[#d22864] bg-[#d22864]'
                    : 'border-gray-300 bg-white';

              return (
                <label
                  key={option.key}
                  className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${optionStyle}`}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option.key}
                    checked={isSelected}
                    disabled={readOnly}
                    onChange={() => onAnswerChange(question.id, option.key)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${indicatorStyle}`}
                  >
                    <span className={`h-2 w-2 rounded-full bg-white ${isSelected ? 'block' : 'hidden'}`} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-gray-700">{option.label}</span>
                    <span className="flex flex-wrap items-center gap-2">
                      {isCorrectSelection && (
                        <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-700">
                          <CheckCircle2 size={14} />
                          Tu respuesta correcta
                        </span>
                      )}
                      {isIncorrectSelection && (
                        <span className="inline-flex items-center gap-1 text-xs font-black text-red-700">
                          <XCircle size={14} />
                          Tu respuesta
                        </span>
                      )}
                      {isCorrectOption && !isSelected && (
                        <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-700">
                          <CheckCircle2 size={14} />
                          Respuesta correcta
                        </span>
                      )}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
          {readOnly && feedback?.selected_answer == null && (
            <p className="mt-3 text-xs font-bold text-amber-700">
              No se registró una respuesta para esta pregunta.
            </p>
          )}
        </fieldset>
      );
    })}
  </div>
);

export const PreRegistrationPage = ({
  embedded = false,
  formPath = FORM_PATH,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [eligibility, setEligibility] = useState(null);
  const [induction, setInduction] = useState(null);
  const [attemptFeedback, setAttemptFeedback] = useState(null);
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

  const feedbackByQuestion = useMemo(() => {
    return Object.fromEntries(
      (attemptFeedback?.answers || []).map((answer) => [
        String(answer.question_id),
        answer,
      ]),
    );
  }, [attemptFeedback]);

  const loadPreRegistration = async () => {
    setLoading(true);
    setLoadingError(null);
    setAttemptError(null);

    try {
      const [eligibilityData, inductionData, feedbackData] = await Promise.all([
        internshipService.getRegistrationEligibility(),
        internshipService.getInductionContent(),
        internshipService.getLatestPassedInductionFeedback().catch(() => null),
      ]);

      setEligibility(eligibilityData);
      setInduction(inductionData);
      setAttemptFeedback(feedbackData);
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
        const [eligibilityData, feedbackData] = await Promise.all([
          internshipService.getRegistrationEligibility(),
          internshipService.getLatestPassedInductionFeedback(),
        ]);
        setEligibility(eligibilityData);
        setAttemptFeedback(feedbackData);
      }
    } catch (error) {
      setAttemptError(getApiErrorMessage(error));
    } finally {
      setSubmittingAttempt(false);
    }
  };

  const handleContinue = async () => {
    if (eligibility?.has_induction !== true || eligibility?.can_create_request === false) {
      return;
    }

    setContinuing(true);
    navigate(formPath);
  };

  const canContinue = eligibility?.has_induction === true
    && eligibility?.can_create_request !== false;

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
      description: 'Este prerrequisito está cumplido y puedes continuar al formulario.',
      tone: 'green',
    }
    : eligibility?.requires_retake
      ? {
        icon: ClipboardList,
        title: 'Inducción por repetir',
        description: 'La versión activa exige aprobar nuevamente el cuestionario antes de continuar.',
        tone: 'amber',
      }
    : {
      icon: ClipboardList,
      title: 'Inducción pendiente',
      description: 'Debes aprobar el cuestionario antes de acceder al formulario de solicitud.',
      tone: 'amber',
    };

  return (
    <div className={embedded ? "font-sans" : "min-h-screen bg-[#f3f3f3] font-sans"}>
      {!embedded && <UserHeader />}

      <main className={embedded ? "w-full" : "mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-10"}>
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-wider text-[#d22864]">
            Nueva inscripción
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950 md:text-4xl">
            Preinscripción de práctica
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-gray-600">
            Revisa los prerrequisitos institucionales y completa la inducción. La inducción
            aprobada habilita el acceso al formulario de solicitud.
          </p>
          <Link
            to="/requisitos"
            className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[#d22864] hover:underline"
          >
            Ver explicación de requisitos e inducción
            <ExternalLink size={15} />
          </Link>
        </div>

        {location.state?.reason === 'eligibility-blocked' && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 flex-shrink-0" size={22} />
              <p className="text-sm font-semibold">
                Existen prerrequisitos pendientes. Completa la inducción antes de continuar
                al formulario.
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
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
            <section className="space-y-6">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
                <div className="mb-6 flex items-start gap-4">
                  <div className="rounded-2xl bg-[#d22864]/10 p-3 text-[#d22864]">
                    <FileText size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-950">Carta de presentación</h2>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      La carta de presentación es un antecedente opcional en esta etapa y no bloquea el avance al formulario.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate(embedded ? '/dashboard/cartas-presentacion' : '/cartas-presentacion')}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#d22864] px-4 py-3 text-sm font-black text-white transition hover:bg-[#b01e52]"
                    >
                      Gestionar carta
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
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

                {induction ? (
                  <div className="space-y-8">
                    {eligibility?.has_induction && (
                      <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-green-800">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 flex-shrink-0" size={24} />
                          <div>
                            <p className="font-black">Inducción aprobada</p>
                            <p className="mt-1 text-sm">La inducción figura como cumplida en el registro institucional.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {videos.length > 0 && (
                      <div>
                        <div className="mb-4">
                          <h3 className="text-xl font-black text-gray-950">Videos de inducción</h3>
                          <p className="mt-1 text-sm text-gray-600">
                            El material permanece disponible para volver a consultarlo.
                          </p>
                        </div>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                          {videos.map((video) => (
                            <VideoCard key={video.id} video={video} />
                          ))}
                        </div>
                      </div>
                    )}

                    {eligibility?.has_induction ? (
                      <details className="group rounded-2xl border border-gray-200 bg-gray-50">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
                          <div>
                            <h3 className="font-black text-gray-950">Cuestionario de inducción</h3>
                            <p className="mt-1 text-sm text-gray-600">
                              {attemptFeedback
                                ? `Aprobado con ${attemptFeedback.score} de ${attemptFeedback.answers.length} respuestas correctas.`
                                : 'Aprobado. Puedes desplegarlo para consultar sus preguntas.'}
                            </p>
                          </div>
                          <ChevronDown
                            size={20}
                            className="shrink-0 text-gray-500 transition-transform group-open:rotate-180"
                          />
                        </summary>
                        <div className="border-t border-gray-200 p-5">
                          {attemptFeedback ? (
                            <p className="mb-5 text-xs font-bold text-gray-500">
                              Intento realizado el {formatAttemptDate(attemptFeedback.attempted_at)}.
                            </p>
                          ) : (
                            <p className="mb-5 text-sm font-medium text-gray-600">
                              No hay respuestas guardadas para la versión activa de esta inducción.
                            </p>
                          )}
                          {questions.length > 0 ? (
                            <QuestionList
                              questions={questions}
                              answers={answers}
                              onAnswerChange={handleAnswerChange}
                              readOnly
                              feedbackByQuestion={feedbackByQuestion}
                            />
                          ) : (
                            <p className="text-sm font-medium text-gray-600">
                              Esta versión no tiene preguntas disponibles para consulta.
                            </p>
                          )}
                        </div>
                      </details>
                    ) : (
                      <form className="space-y-6" onSubmit={handleSubmitAttempt}>
                        <div>
                          <h3 className="text-xl font-black text-gray-950">Cuestionario</h3>
                          <p className="mt-1 text-sm text-gray-600">
                            Puntaje mínimo de aprobación: {induction.min_score} respuesta{induction.min_score === 1 ? '' : 's'} correcta{induction.min_score === 1 ? '' : 's'}.
                          </p>
                        </div>

                        <QuestionList
                          questions={questions}
                          answers={answers}
                          onAnswerChange={handleAnswerChange}
                        />

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
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 flex-shrink-0" size={24} />
                      <div>
                        <p className="font-black">No hay inducción publicada</p>
                        <p className="mt-1 text-sm">No es posible continuar al formulario hasta que exista contenido publicado y aprobado.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <aside className="space-y-5 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                    <ShieldCheck size={21} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-gray-950">Estado institucional</h2>
                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      Requisitos considerados al formalizar la práctica.
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <StatusPanel {...insuranceStatus} />
                  <StatusPanel {...inductionStatus} />
                </div>
              </div>

              <div className="rounded-2xl border border-[#d22864]/20 bg-[#fff8fb] p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#d22864] shadow-sm ring-1 ring-[#d22864]/15">
                    <ArrowRight size={21} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-gray-950">Siguiente paso</h2>
                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      {eligibility?.next_step || 'Puedes registrar la solicitud y completar los requisitos pendientes.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={continuing || !canContinue}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#d22864] px-5 py-3.5 font-black text-white shadow-lg shadow-[#d22864]/20 hover:bg-[#b01e52] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
                >
                  {continuing ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                  Continuar al formulario
                </button>

                {!canContinue && (
                  <p className="mt-3 text-center text-xs font-semibold text-amber-700">
                    Aprueba la inducción para habilitar este paso.
                  </p>
                )}

                {eligibility?.blocked && canContinue && (
                  <p className="mt-3 text-center text-xs font-semibold text-gray-500">
                    Los bloqueos informados se aplicarán al aprobar o formalizar la práctica.
                  </p>
                )}
              </div>
            </aside>
          </div>
        )}
      </main>

      {!embedded && <Footer />}
    </div>
  );
};

export default PreRegistrationPage;

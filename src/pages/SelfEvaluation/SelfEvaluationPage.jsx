import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  ClipboardCheck,
  Loader2,
  RefreshCw,
  Save,
  Send,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { UserHeader } from '../../components/Header/UserHeader';
import { Footer } from '../../components/Footer/Footer';
import { RatingMatrix } from '../../components/Evaluation/RatingMatrix';
import { useToast } from '../../context/useToast';
import { internshipService } from '../../services/internshipService';
import { selfEvaluationService } from '../../services/selfEvaluationService';

const ENABLED_COMPLETION_STATUSES = new Set([
  'pending_evaluations',
  'pending_presentation',
  'finalized',
]);
const SELF_EVALUATION_BUSINESS_DAYS_BEFORE_END = 5;

const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const businessWindowStart = (endDateStr, businessDays) => {
  const cursor = parseLocalDate(endDateStr);
  if (!cursor) return null;

  let remaining = businessDays;
  while (remaining > 0) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) {
      remaining -= 1;
      if (remaining === 0) {
        return cursor;
      }
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return cursor;
};

const isSelfEvaluationAvailable = (internship) => {
  if (!internship || internship.is_cancelled) return false;
  if (ENABLED_COMPLETION_STATUSES.has(internship.completion_status)) return true;
  if (internship.status_id !== 4) return false;

  const start = businessWindowStart(
    internship.end_date,
    SELF_EVALUATION_BUSINESS_DAYS_BEFORE_END,
  );
  if (!start) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today >= start;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const statusCopy = {
  not_enabled: {
    title: 'Autoevaluación aún no habilitada',
    message: 'La autoevaluación se habilita al cierre de la práctica.',
  },
  not_started: {
    title: 'Lista para completar',
    message: 'Puedes guardar un borrador y enviarla cuando termines.',
  },
  draft: {
    title: 'Borrador guardado',
    message: 'Continúa desde tu último avance.',
  },
  reopened: {
    title: 'Autoevaluación reabierta',
    message: 'Puedes corregir tus respuestas y volver a enviarla.',
  },
  submitted: {
    title: 'Autoevaluación enviada',
    message: 'Tus respuestas quedaron registradas y bloqueadas.',
  },
};

const buildSections = (criteria) => {
  const grouped = criteria.reduce((acc, criterion) => {
    const key = criterion.section || 'General';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push({
      id: criterion.key,
      text: criterion.label,
    });
    return acc;
  }, {});

  return Object.entries(grouped).map(([section, questions]) => ({
    id: section,
    title: section,
    questions,
  }));
};

const buildObservationText = (strengths, weaknesses) => {
  const parts = [];
  if (strengths.trim()) {
    parts.push(`Fortalezas: ${strengths.trim()}`);
  }
  if (weaknesses.trim()) {
    parts.push(`Áreas de mejora: ${weaknesses.trim()}`);
  }
  return parts.join('\n\n') || null;
};

const parseObservationText = (value) => {
  if (!value) {
    return { strengths: '', weaknesses: '' };
  }

  const strengthsMatch = value.match(/Fortalezas:\s*([\s\S]*?)(?:\n\nÁreas de mejora:|$)/);
  const weaknessesMatch = value.match(/Áreas de mejora:\s*([\s\S]*)$/);

  return {
    strengths: strengthsMatch?.[1]?.trim() || value,
    weaknesses: weaknessesMatch?.[1]?.trim() || '',
  };
};

const PracticeSelector = ({ internships, loading, error, onRefresh }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-2xl bg-white p-10 border border-gray-100">
        <Loader2 className="animate-spin text-[#d22864]" />
        <span className="font-bold text-gray-600">Cargando prácticas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
        <AlertCircle className="mx-auto mb-3 text-red-600" size={32} />
        <p className="font-bold text-red-900">{error}</p>
        <button
          onClick={onRefresh}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-bold text-white"
        >
          <RefreshCw size={18} />
          Reintentar
        </button>
      </div>
    );
  }

  if (internships.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
        <ClipboardCheck className="mx-auto mb-4 text-gray-300" size={44} />
        <h3 className="text-xl font-black text-gray-900">No tienes prácticas registradas</h3>
        <p className="mt-2 text-gray-500">La autoevaluación se asocia a una práctica real.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {internships.map((internship) => {
        const isEnabled = isSelfEvaluationAvailable(internship);
        return (
          <div
            key={internship.id}
            className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-[#d22864]">
                {internship.internship_type}
              </p>
              <h3 className="mt-1 text-lg font-black text-gray-900">{internship.org_name}</h3>
              <p className="mt-1 text-sm font-medium text-gray-500">
                {formatDate(internship.start_date)} - {formatDate(internship.end_date)}
              </p>
            </div>
            <button
              onClick={() => navigate(`/autoevaluacion/${internship.id}`)}
              className={`rounded-xl px-5 py-3 font-bold transition-colors ${
                isEnabled
                  ? 'bg-[#d22864] text-white hover:bg-[#b01e52]'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isEnabled ? 'Completar autoevaluación' : 'Ver estado'}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export const SelfEvaluationPage = () => {
  const { internshipId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [internships, setInternships] = useState([]);
  const [selectorLoading, setSelectorLoading] = useState(false);
  const [selectorError, setSelectorError] = useState(null);
  const [formState, setFormState] = useState(null);
  const [loading, setLoading] = useState(Boolean(internshipId));
  const [saving, setSaving] = useState(false);
  const [ratings, setRatings] = useState({});
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const sections = useMemo(
    () => buildSections(formState?.criteria || []),
    [formState?.criteria],
  );
  const requiredKeys = useMemo(
    () => (formState?.criteria || []).filter((item) => item.required).map((item) => item.key),
    [formState?.criteria],
  );
  const completedCount = requiredKeys.filter((key) => ratings[key]).length;
  const progress = requiredKeys.length
    ? Math.round((completedCount / requiredKeys.length) * 100)
    : 0;
  const evaluation = formState?.evaluation;
  const currentStatus = formState?.status || 'not_started';
  const isSubmitted = currentStatus === 'submitted';
  const isEnabled = Boolean(formState?.enabled) && !isSubmitted;

  const loadInternships = async () => {
    try {
      setSelectorLoading(true);
      setSelectorError(null);
      const data = await internshipService.getMyInternships();
      setInternships(data);
    } catch (error) {
      setSelectorError(error?.response?.data?.detail || 'No se pudieron cargar tus prácticas.');
    } finally {
      setSelectorLoading(false);
    }
  };

  const loadForm = async () => {
    if (!internshipId) return;
    try {
      setLoading(true);
      const data = await selfEvaluationService.getForm(internshipId);
      setFormState(data);
      setRatings(data.evaluation?.responses || {});
      const parsed = parseObservationText(data.evaluation?.observations);
      setStrengths(parsed.strengths);
      setWeaknesses(parsed.weaknesses);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'No se pudo cargar la autoevaluación',
        message: error?.response?.data?.detail || 'Intenta nuevamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (internshipId) {
      loadForm();
    } else {
      loadInternships();
    }
  }, [internshipId]);

  const updateRating = (qid, val) => {
    if (!isEnabled) return;
    setFeedbackMessage(null);
    setRatings((prev) => ({
      ...prev,
      [qid]: val,
    }));
  };

  const persist = async (submit = false) => {
    if (!internshipId || !formState) return;
    if (submit && completedCount < requiredKeys.length) {
      setFeedbackMessage({
        type: 'warning',
        title: 'Faltan respuestas',
        message: 'Completa todos los criterios requeridos antes de enviar.',
      });
      showToast({
        type: 'warning',
        title: 'Faltan respuestas',
        message: 'Completa todos los criterios requeridos antes de enviar.',
      });
      return;
    }

    try {
      setSaving(true);
      const payload = {
        responses: ratings,
        observations: buildObservationText(strengths, weaknesses),
        expected_updated_at: evaluation?.updated_at || null,
      };
      const saved = submit
        ? await selfEvaluationService.submit(internshipId, payload)
        : await selfEvaluationService.saveDraft(internshipId, payload);
      const successFeedback = {
        type: submit ? 'success' : 'info',
        title: submit ? 'Autoevaluación enviada' : 'Borrador guardado',
        message: submit
          ? 'Tus respuestas quedaron registradas correctamente.'
          : 'Puedes continuar más tarde sin perder cambios.',
      };

      setFormState((prev) => ({
        ...prev,
        status: saved.status,
        evaluation: saved,
      }));
      setFeedbackMessage(successFeedback);
      showToast(successFeedback);
    } catch (error) {
      const detail = error?.response?.data?.detail;
      const message = typeof detail === 'string'
        ? detail
        : detail?.message || 'No se pudo completar la operación.';
      setFeedbackMessage({
        type: error?.response?.status === 409 ? 'warning' : 'error',
        title: error?.response?.status === 409 ? 'Conflicto de actualización' : 'Error',
        message,
      });
      showToast({
        type: error?.response?.status === 409 ? 'warning' : 'error',
        title: error?.response?.status === 409 ? 'Conflicto de actualización' : 'Error',
        message,
      });
      if (error?.response?.status === 409) {
        await loadForm();
      }
    } finally {
      setSaving(false);
    }
  };

  if (!internshipId) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <UserHeader />
        <main className="mx-auto w-full max-w-5xl flex-grow px-6 py-12">
          <header className="mb-8">
            <p className="text-sm font-black uppercase tracking-widest text-[#d22864]">
              Autoevaluación
            </p>
            <h2 className="mt-2 text-3xl font-black text-gray-900">
              Selecciona una práctica
            </h2>
            <p className="mt-2 text-gray-500">
              La autoevaluación se completa sobre una práctica ya habilitada en etapa final.
            </p>
          </header>
          <PracticeSelector
            internships={internships}
            loading={selectorLoading}
            error={selectorError}
            onRefresh={loadInternships}
          />
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <UserHeader />
        <main className="flex flex-grow items-center justify-center">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-8 py-6 shadow-sm">
            <Loader2 className="animate-spin text-[#d22864]" />
            <span className="font-bold text-gray-600">Cargando autoevaluación...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!formState) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <UserHeader />
        <main className="mx-auto w-full max-w-3xl flex-grow px-6 py-16">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
            <AlertCircle className="mx-auto mb-3 text-red-600" size={36} />
            <h2 className="text-xl font-black text-red-900">No se pudo cargar la autoevaluación</h2>
            <button
              onClick={loadForm}
              className="mt-6 rounded-xl bg-red-600 px-6 py-3 font-bold text-white"
            >
              Intentar nuevamente
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const copy = statusCopy[currentStatus] || statusCopy.not_started;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <UserHeader />

      <main className="mx-auto w-full max-w-5xl flex-grow px-6 py-10">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-8 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-gray-600 shadow-sm border border-gray-100 hover:text-[#d22864]"
        >
          <ArrowLeft size={18} />
          Volver al dashboard
        </button>

        <header className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-[#d22864]">
                {formState.internship.internship_type}
              </p>
              <h2 className="mt-2 text-3xl font-black text-gray-900">
                Autoevaluación de práctica
              </h2>
              <p className="mt-2 text-gray-500">
                {formState.internship.org_name} · {formatDate(formState.internship.start_date)} - {formatDate(formState.internship.end_date)}
              </p>
            </div>
            <div className={`rounded-2xl px-4 py-3 text-sm font-bold ${
              isSubmitted
                ? 'bg-green-50 text-green-700'
                : formState.enabled
                  ? 'bg-[#fff0f6] text-[#d22864]'
                  : 'bg-amber-50 text-amber-700'
            }`}>
              {copy.title}
            </div>
          </div>
          <p className="mt-4 text-sm font-medium text-gray-500">
            {formState.reason || copy.message}
          </p>
        </header>

        {feedbackMessage && (
          <div className={`mb-8 rounded-2xl border p-5 text-sm font-semibold ${
            feedbackMessage.type === 'success'
              ? 'border-emerald-100 bg-emerald-50 text-emerald-800'
              : feedbackMessage.type === 'warning'
                ? 'border-amber-100 bg-amber-50 text-amber-800'
                : feedbackMessage.type === 'error'
                  ? 'border-red-100 bg-red-50 text-red-800'
                  : 'border-blue-100 bg-blue-50 text-blue-800'
          }`}>
            <div className="flex gap-3">
              {feedbackMessage.type === 'success' ? <CheckCircle className="shrink-0" /> : <AlertCircle className="shrink-0" />}
              <div>
                <h3 className="font-black">{feedbackMessage.title}</h3>
                <p className="mt-1">{feedbackMessage.message}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center justify-between text-sm font-bold">
            <span className="text-gray-600">Progreso de respuestas requeridas</span>
            <span className="text-[#d22864]">{completedCount}/{requiredKeys.length}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <motion.div
              className="h-full rounded-full bg-[#d22864]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {!formState.enabled && (
          <div className="mb-8 rounded-2xl border border-amber-100 bg-amber-50 p-6 text-amber-800">
            <div className="flex gap-3">
              <AlertCircle className="shrink-0" />
              <div>
                <h3 className="font-black">Todavía no puedes completar esta autoevaluación</h3>
                <p className="mt-1 text-sm font-medium">{formState.reason}</p>
              </div>
            </div>
          </div>
        )}

        <div className={isEnabled ? '' : 'pointer-events-none opacity-70'}>
          <div className="space-y-6">
            {sections.map((section) => (
              <RatingMatrix
                key={section.id}
                title={section.title}
                questions={section.questions}
                currentRatings={ratings}
                onRate={updateRating}
              />
            ))}
          </div>

          <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-black text-gray-900">Reflexión final</h3>
            <div className="mt-5 grid gap-5">
              <label className="block">
                <span className="text-sm font-bold text-gray-700">Fortalezas identificadas</span>
                <textarea
                  value={strengths}
                  onChange={(event) => setStrengths(event.target.value)}
                  disabled={!isEnabled}
                  className="mt-2 h-32 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-800 focus:border-[#d22864] focus:outline-none focus:ring-2 focus:ring-[#d22864]/20"
                  placeholder="Describe fortalezas, aprendizajes y logros relevantes."
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-gray-700">Áreas de mejora</span>
                <textarea
                  value={weaknesses}
                  onChange={(event) => setWeaknesses(event.target.value)}
                  disabled={!isEnabled}
                  className="mt-2 h-32 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-800 focus:border-[#d22864] focus:outline-none focus:ring-2 focus:ring-[#d22864]/20"
                  placeholder="Describe desafíos o aspectos que quieres fortalecer."
                />
              </label>
            </div>
          </section>
        </div>

        <footer className="mt-10 flex flex-col gap-3 border-t border-gray-200 pt-8 sm:flex-row sm:justify-end">
          <button
            onClick={() => persist(false)}
            disabled={!isEnabled || saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-gray-700 shadow-sm border border-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Guardar borrador
          </button>
          <button
            onClick={() => persist(true)}
            disabled={!isEnabled || saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#d22864] px-6 py-3 font-bold text-white shadow-lg shadow-[#d22864]/20 hover:bg-[#b01e52] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitted ? <CheckCircle size={18} /> : <Send size={18} />}
            Enviar autoevaluación
          </button>
        </footer>
      </main>

      <Footer />
    </div>
  );
};

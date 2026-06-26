import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle, CheckCircle, Loader2, Send } from 'lucide-react';

import { Footer } from '../../components/Footer/Footer';
import { RatingMatrix } from '../../components/Evaluation/RatingMatrix';
import { supervisorEvaluationService } from '../../services/supervisorEvaluationService';

const recommendationOptions = [
  { value: 'recommended', label: 'Recomiendo aprobar la práctica' },
  { value: 'recommended_with_observations', label: 'Recomiendo aprobar con observaciones' },
  { value: 'not_recommended', label: 'No recomiendo aprobar' },
];

const buildSections = (criteria) => {
  const grouped = criteria.reduce((acc, criterion) => {
    const section = criterion.section || 'Evaluación del supervisor a estudiante';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push({
      id: criterion.key,
      text: criterion.description
        ? `${criterion.label}: ${criterion.description}`
        : criterion.label,
    });
    return acc;
  }, {});

  return Object.entries(grouped).map(([section, questions]) => ({
    id: section,
    title: section,
    questions,
  }));
};

const getErrorMessage = (error) => {
  if (error?.response?.status === 410) {
    return 'El enlace de evaluación expiró. Solicite un nuevo enlace a la coordinación.';
  }
  if (error?.response?.status === 409) {
    return error?.response?.data?.detail || 'El enlace ya fue usado, revocado o la práctica no está disponible.';
  }
  if (error?.response?.status === 404) {
    return 'El enlace de evaluación no existe o no es válido.';
  }
  return error?.response?.data?.detail || 'No se pudo cargar la evaluación.';
};

export const SupervisorEvaluationPage = () => {
  const { token } = useParams();
  const [formData, setFormData] = useState(null);
  const [scores, setScores] = useState({});
  const [observations, setObservations] = useState('');
  const [recommendation, setRecommendation] = useState('recommended');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const sections = useMemo(
    () => buildSections(formData?.criteria || []),
    [formData?.criteria],
  );
  const requiredKeys = useMemo(
    () => (formData?.criteria || []).map((criterion) => criterion.key),
    [formData?.criteria],
  );
  const completedCount = requiredKeys.filter((key) => scores[key]).length;
  const progress = requiredKeys.length
    ? Math.round((completedCount / requiredKeys.length) * 100)
    : 0;
  const allScoresCompleted = requiredKeys.length > 0 && completedCount === requiredKeys.length;

  useEffect(() => {
    let ignore = false;

    const loadForm = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await supervisorEvaluationService.getPublicEvaluationForm(token);
        if (ignore) return;
        setFormData(data);
        setScores(Object.fromEntries(data.criteria.map((criterion) => [criterion.key, null])));
      } catch (err) {
        if (!ignore) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadForm();

    return () => {
      ignore = true;
    };
  }, [token]);

  const updateScore = (criterionKey, value) => {
    setScores((current) => ({ ...current, [criterionKey]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!allScoresCompleted) {
      setError('Debe responder todos los criterios antes de enviar la evaluación.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await supervisorEvaluationService.submitPublicEvaluation(token, {
        criteria_scores: Object.fromEntries(
          Object.entries(scores).map(([key, value]) => [key, Number(value)])
        ),
        observations: observations.trim() || null,
        recommendation,
      });
      setSubmitted(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <main className="mx-auto w-full max-w-5xl flex-grow px-6 py-10">
        <header className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-black uppercase tracking-widest text-[#d22864]">
            Evaluación del supervisor a estudiante
          </p>
          <h1 className="mt-2 text-3xl font-black text-gray-900">
            Evaluación de práctica
          </h1>
          <p className="mt-2 text-gray-500">
            Complete este formulario una sola vez. El enlace no requiere inicio de sesión y queda inutilizado después del envío.
          </p>
        </header>

        {loading && (
          <div className="flex items-center justify-center gap-3 rounded-2xl bg-white px-8 py-10 font-bold text-gray-600 shadow-sm">
            <Loader2 className="animate-spin text-[#d22864]" />
            Cargando formulario...
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-semibold text-red-700">
            <div className="flex gap-3">
              <AlertCircle className="shrink-0" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {submitted && (
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-10 text-center">
            <CheckCircle className="mx-auto text-emerald-600" size={44} />
            <h2 className="mt-4 text-2xl font-black text-emerald-800">Evaluación enviada</h2>
            <p className="mt-3 text-emerald-700">Gracias. La evaluación fue registrada correctamente.</p>
          </div>
        )}

        {!loading && formData && !submitted && (
          <form onSubmit={handleSubmit}>
            <section className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs font-black uppercase text-gray-400">Organización</p>
                  <p className="mt-1 font-bold text-gray-900">{formData.org_name}</p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs font-black uppercase text-gray-400">Estudiante</p>
                  <p className="mt-1 font-bold text-gray-900">{formData.student_name}</p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs font-black uppercase text-gray-400">Tipo</p>
                  <p className="mt-1 font-bold text-gray-900">{formData.internship_type}</p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs font-black uppercase text-gray-400">Supervisor/a</p>
                  <p className="mt-1 font-bold text-gray-900">{formData.supervisor_name}</p>
                </div>
              </div>
            </section>

            <section className="mb-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-2 flex items-center justify-between text-sm font-bold">
                <span className="text-gray-600">Progreso de respuestas requeridas</span>
                <span className="text-[#d22864]">{completedCount}/{requiredKeys.length}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-[#d22864] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </section>

            <div className="space-y-6">
              {sections.map((section) => (
                <RatingMatrix
                  key={section.id}
                  title={section.title}
                  questions={section.questions}
                  currentRatings={scores}
                  onRate={updateScore}
                />
              ))}
            </div>

            <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <label className="block">
                <span className="text-sm font-black text-gray-700">Recomendación final</span>
                <select
                  value={recommendation}
                  onChange={(event) => setRecommendation(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#d22864]"
                >
                  {recommendationOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>

              <label className="mt-6 block">
                <span className="text-sm font-black text-gray-700">Observaciones</span>
                <textarea
                  value={observations}
                  onChange={(event) => setObservations(event.target.value)}
                  rows="5"
                  className="mt-2 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#d22864]"
                  placeholder="Ingrese comentarios relevantes para el cierre de la práctica."
                />
              </label>
            </section>

            <footer className="mt-10 flex justify-end border-t border-gray-200 pt-8">
              <button
                type="submit"
                disabled={saving || !allScoresCompleted}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#d22864] px-6 py-3 font-bold text-white shadow-lg shadow-[#d22864]/20 hover:bg-[#b01e52] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                Enviar evaluación
              </button>
            </footer>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SupervisorEvaluationPage;

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Footer } from '../../components/Footer/Footer';
import { supervisorEvaluationService } from '../../services/supervisorEvaluationService';

const recommendationOptions = [
  { value: 'recommended', label: 'Recomiendo aprobar la práctica' },
  { value: 'recommended_with_observations', label: 'Recomiendo aprobar con observaciones' },
  { value: 'not_recommended', label: 'No recomiendo aprobar' },
];

const getErrorMessage = (error) => {
  if (error?.response?.status === 410) {
    return 'El enlace de evaluación expiró. Solicite un nuevo enlace a la coordinación.';
  }
  if (error?.response?.status === 409) {
    return 'El enlace ya fue usado, revocado o la práctica no está disponible.';
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

  useEffect(() => {
    let ignore = false;

    const loadForm = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await supervisorEvaluationService.getPublicEvaluationForm(token);
        if (ignore) {
          return;
        }
        setFormData(data);
        setScores(Object.fromEntries(data.criteria.map((criterion) => [criterion.key, ''])));
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

  const handleSubmit = async (event) => {
    event.preventDefault();
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

  const allScoresCompleted = formData?.criteria?.every((criterion) => scores[criterion.key]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow mx-auto w-full max-w-4xl px-4 py-10">
        <section className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100">
          <p className="text-sm font-black uppercase tracking-wide text-[#d22864]">Evaluación supervisor</p>
          <h1 className="mt-3 text-3xl font-black text-gray-900">Evaluación de práctica</h1>
          <p className="mt-3 text-gray-600">
            Complete este formulario una sola vez. El enlace no requiere inicio de sesión y queda inutilizado después del envío.
          </p>
        </section>

        {loading && (
          <div className="mt-6 rounded-2xl bg-white p-8 text-center font-semibold text-gray-500 shadow-sm">
            Cargando formulario...
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {submitted && (
          <div className="mt-6 rounded-3xl border border-emerald-100 bg-emerald-50 p-8 text-center">
            <h2 className="text-2xl font-black text-emerald-800">Evaluación enviada</h2>
            <p className="mt-3 text-emerald-700">Gracias. La evaluación fue registrada correctamente.</p>
          </div>
        )}

        {!loading && formData && !submitted && (
          <form onSubmit={handleSubmit} className="mt-6 rounded-3xl bg-white p-8 shadow-sm border border-gray-100">
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

            <div className="mt-8 space-y-5">
              {formData.criteria.map((criterion) => (
                <fieldset key={criterion.key} className="rounded-2xl border border-gray-100 p-5">
                  <legend className="px-1 font-black text-gray-900">{criterion.label}</legend>
                  <p className="mt-1 text-sm text-gray-500">{criterion.description}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <label key={score} className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-gray-700">
                        <input
                          type="radio"
                          name={criterion.key}
                          value={score}
                          checked={scores[criterion.key] === String(score)}
                          onChange={(event) => setScores((current) => ({ ...current, [criterion.key]: event.target.value }))}
                          required
                        />
                        {score}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>

            <label className="mt-6 block">
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
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#d22864]"
                placeholder="Ingrese comentarios relevantes para el cierre de la práctica."
              />
            </label>

            <button
              type="submit"
              disabled={saving || !allScoresCompleted}
              className="mt-8 w-full rounded-xl bg-[#d22864] px-5 py-3 text-sm font-black text-white hover:bg-[#b01e52] disabled:opacity-50"
            >
              {saving ? 'Enviando...' : 'Enviar evaluación'}
            </button>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SupervisorEvaluationPage;

import { useCallback, useEffect, useState } from 'react';
import { Footer } from '../../components/Footer/Footer';
import { UserHeader } from '../../components/Header/UserHeader';
import { useAuth } from '../../context/useAuth';
import {
  CAREER_DIRECTOR_ROLE,
  FICA_ROLE,
  PRACTICE_MANAGER_ROLE,
  SECRETARY_ROLE,
  STUDENT_ROLE,
  SUPERADMIN_ROLE,
  SUPERVISOR_ROLE,
  getDisplayRoleForRoles,
} from '../../services/roleRouting';
import { inductionAdminService } from '../../services/inductionAdminService';

const emptyVideo = { title: '', video_url: '', order: 1 };
const emptyQuestion = {
  question_text: '',
  options: { a: '', b: '' },
  correct_answer: 'a',
  order: 1,
};

const initialForm = {
  title: '',
  description: '',
  min_score: 1,
  requires_retake: false,
  videos: [{ ...emptyVideo }],
  questions: [{ ...emptyQuestion }],
};

const normalizeDetailToForm = (version) => ({
  title: version.title || '',
  description: version.description || '',
  min_score: version.min_score || 1,
  requires_retake: Boolean(version.requires_retake),
  videos: version.videos?.length ? version.videos.map(({ title, video_url, order }) => ({ title, video_url, order })) : [{ ...emptyVideo }],
  questions: version.questions?.length
    ? version.questions.map(({ question_text, options, correct_answer, order }) => ({ question_text, options, correct_answer, order }))
    : [{ ...emptyQuestion }],
});

const getErrorMessage = (error) => error?.response?.data?.detail || 'No se pudo completar la acción.';

const roleEvidence = [
  { role: PRACTICE_MANAGER_ROLE, access: 'permitido', note: 'Crea, edita y publica versiones.' },
  { role: CAREER_DIRECTOR_ROLE, access: 'permitido', note: 'Crea, edita y publica versiones.' },
  { role: SECRETARY_ROLE, access: 'bloqueado', note: 'No administra inducción.' },
  { role: STUDENT_ROLE, access: 'bloqueado', note: 'Solo rinde inducción publicada.' },
  { role: SUPERVISOR_ROLE, access: 'bloqueado', note: 'No opera este módulo.' },
  { role: FICA_ROLE, access: 'bloqueado', note: 'Sin contrato de administración.' },
  { role: SUPERADMIN_ROLE, access: 'bloqueado', note: 'Gestión de usuarios, no inducción.' },
];

const countByStatus = (versions, status) => (
  versions.filter((version) => version.status === status).length
);

export const InductionAdminPage = () => {
  const { user } = useAuth();
  const userName = user ? `${user.first_name} ${user.last_name}` : 'Administrador';
  const userRole = getDisplayRoleForRoles(user?.roles);
  const [versions, setVersions] = useState([]);
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const selectedVersion = versions.find((version) => version.id === selectedVersionId);
  const isEditingDraft = selectedVersion?.status === 'draft';
  const activeVersion = versions.find((version) => version.is_active);
  const draftCount = countByStatus(versions, 'draft');
  const publishedCount = countByStatus(versions, 'published');

  const loadVersions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await inductionAdminService.listVersions();
      setVersions(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadVersions();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadVersions]);

  const handleSelectVersion = async (version) => {
    setSelectedVersionId(version.id);
    setError('');
    setMessage('');
    try {
      const detail = await inductionAdminService.getVersion(version.id);
      setForm(normalizeDetailToForm(detail));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleFieldChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const updateVideo = (index, field, value) => {
    setForm((current) => ({
      ...current,
      videos: current.videos.map((video, itemIndex) => (
        itemIndex === index ? { ...video, [field]: field === 'order' ? Number(value) : value } : video
      )),
    }));
  };

  const updateQuestion = (index, field, value) => {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((question, itemIndex) => (
        itemIndex === index ? { ...question, [field]: field === 'order' ? Number(value) : value } : question
      )),
    }));
  };

  const updateQuestionOption = (questionIndex, optionKey, value) => {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((question, itemIndex) => (
        itemIndex === questionIndex
          ? { ...question, options: { ...question.options, [optionKey]: value } }
          : question
      )),
    }));
  };

  const buildPayload = () => ({
    ...form,
    min_score: Number(form.min_score),
    videos: form.videos.filter((video) => video.title || video.video_url),
    questions: form.questions,
  });

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const payload = buildPayload();
      const saved = isEditingDraft
        ? await inductionAdminService.updateDraft(selectedVersionId, payload)
        : await inductionAdminService.createDraft(payload);
      setSelectedVersionId(saved.id);
      setForm(normalizeDetailToForm(saved));
      setMessage(isEditingDraft ? 'Borrador actualizado.' : 'Borrador creado.');
      await loadVersions();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedVersionId || !window.confirm('¿Publicar esta versión como activa?')) {
      return;
    }
    setSaving(true);
    setError('');
    try {
      const published = await inductionAdminService.publish(selectedVersionId);
      setForm(normalizeDetailToForm(published));
      setMessage('Versión publicada y activada.');
      await loadVersions();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = async () => {
    if (!selectedVersionId || !window.confirm('¿Descartar este borrador?')) {
      return;
    }
    setSaving(true);
    setError('');
    try {
      await inductionAdminService.discardDraft(selectedVersionId);
      setSelectedVersionId(null);
      setForm(initialForm);
      setMessage('Borrador descartado.');
      await loadVersions();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <UserHeader userName={userName} userRole={userRole} />
      <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-8">
        <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <p className="text-sm font-black uppercase tracking-wide text-[#d22864]">Inducción</p>
          <h1 className="mt-3 text-3xl font-black text-gray-900">Administración de contenido</h1>
          <p className="mt-3 max-w-3xl text-gray-600">
            Crea borradores, valida preguntas y publica una única versión activa para nuevos intentos.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Acceso actual</p>
              <p className="mt-2 text-sm font-black text-gray-900">{userRole}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Borradores</p>
              <p className="mt-2 text-2xl font-black text-gray-900">{draftCount}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Publicadas</p>
              <p className="mt-2 text-2xl font-black text-gray-900">{publishedCount}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Repetición activa</p>
              <p className="mt-2 text-sm font-black text-gray-900">
                {activeVersion?.requires_retake ? 'Sí, estudiantes deben repetir' : 'No exigida'}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[#d22864]">Evidencia de acceso</p>
              <h2 className="mt-1 text-xl font-black text-gray-900">Roles autorizados para administrar inducción</h2>
            </div>
            <p className="text-sm font-semibold text-gray-500">
              La ruta frontend permite solo Encargado y Director; backend mantiene el 403 para el resto.
            </p>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {roleEvidence.map((item) => (
              <div key={item.role} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-gray-900">{item.role}</p>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${item.access === 'permitido' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {item.access}
                  </span>
                </div>
                <p className="mt-2 text-xs font-semibold text-gray-500">{item.note}</p>
              </div>
            ))}
          </div>
        </section>

        {error && <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
        {message && <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">{message}</div>}

        <section className="mt-6 grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-black text-gray-900">Versiones</h2>
              <button type="button" onClick={() => { setSelectedVersionId(null); setForm(initialForm); }} className="rounded-xl bg-gray-900 px-3 py-2 text-xs font-bold text-white">
                Nuevo
              </button>
            </div>
            <div className="mt-5 space-y-3">
              {loading && <p className="text-sm font-semibold text-gray-500">Cargando...</p>}
              {!loading && versions.length === 0 && <p className="text-sm font-semibold text-gray-500">No hay versiones creadas.</p>}
              {versions.map((version) => (
                <button
                  key={version.id}
                  type="button"
                  onClick={() => handleSelectVersion(version)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${selectedVersionId === version.id ? 'border-[#d22864] bg-[#fff8fb]' : 'border-gray-100 hover:border-[#d22864]/50'}`}
                >
                  <p className="font-black text-gray-900">{version.title}</p>
                  <p className="mt-1 text-xs font-bold uppercase text-gray-400">{version.status}{version.is_active ? ' · activa' : ''}</p>
                  <p className="mt-2 text-xs text-gray-500">Puntaje mínimo: {version.min_score}</p>
                  {version.requires_retake && (
                    <p className="mt-2 rounded-full bg-[#fff0f6] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#d22864]">
                      requires_retake=true
                    </p>
                  )}
                </button>
              ))}
            </div>
          </aside>

          <form onSubmit={handleSave} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-black text-gray-900">{isEditingDraft ? 'Editar borrador' : selectedVersion ? 'Vista publicada' : 'Nuevo borrador'}</h2>
                {selectedVersion && selectedVersion.status !== 'draft' && <p className="mt-1 text-sm text-gray-500">Las versiones publicadas no se editan. Crea un nuevo borrador para cambios.</p>}
                {selectedVersion && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-gray-600">
                      {selectedVersion.status}
                    </span>
                    {selectedVersion.is_active && (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                        versión activa
                      </span>
                    )}
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${form.requires_retake ? 'bg-[#fff0f6] text-[#d22864]' : 'bg-gray-100 text-gray-500'}`}>
                      requires_retake={String(form.requires_retake)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {isEditingDraft && <button type="button" onClick={handlePublish} disabled={saving} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Publicar</button>}
                {isEditingDraft && <button type="button" onClick={handleDiscard} disabled={saving} className="rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-600 disabled:opacity-50">Descartar</button>}
              </div>
            </div>

            <fieldset disabled={selectedVersion && selectedVersion.status !== 'draft'} className="mt-6 space-y-5 disabled:opacity-70">
              <input name="title" value={form.title} onChange={handleFieldChange} required placeholder="Título" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#d22864]" />
              <textarea name="description" value={form.description} onChange={handleFieldChange} rows="3" placeholder="Descripción" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#d22864]" />
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-bold text-gray-700">
                  Puntaje mínimo
                  <input name="min_score" type="number" min="1" value={form.min_score} onChange={handleFieldChange} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#d22864]" />
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700">
                  <input name="requires_retake" type="checkbox" checked={form.requires_retake} onChange={handleFieldChange} />
                  Exigir repetición al publicar
                </label>
              </div>

              <div className="rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-gray-900">Videos</h3>
                  <button type="button" onClick={() => setForm((current) => ({ ...current, videos: [...current.videos, { ...emptyVideo, order: current.videos.length + 1 }] }))} className="text-sm font-bold text-[#d22864]">Agregar video</button>
                </div>
                <div className="mt-4 space-y-3">
                  {form.videos.map((video, index) => (
                    <div key={index} className="grid gap-3 md:grid-cols-[80px_1fr_1fr]">
                      <input type="number" min="0" value={video.order} onChange={(event) => updateVideo(index, 'order', event.target.value)} className="rounded-xl border border-gray-200 px-3 py-2" />
                      <input value={video.title} onChange={(event) => updateVideo(index, 'title', event.target.value)} placeholder="Título video" className="rounded-xl border border-gray-200 px-3 py-2" />
                      <input value={video.video_url} onChange={(event) => updateVideo(index, 'video_url', event.target.value)} placeholder="https://..." className="rounded-xl border border-gray-200 px-3 py-2" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-gray-900">Preguntas</h3>
                  <button type="button" onClick={() => setForm((current) => ({ ...current, questions: [...current.questions, { ...emptyQuestion, order: current.questions.length + 1 }] }))} className="text-sm font-bold text-[#d22864]">Agregar pregunta</button>
                </div>
                <div className="mt-4 space-y-5">
                  {form.questions.map((question, index) => (
                    <div key={index} className="rounded-2xl bg-gray-50 p-4">
                      <div className="grid gap-3 md:grid-cols-[80px_1fr]">
                        <input type="number" min="0" value={question.order} onChange={(event) => updateQuestion(index, 'order', event.target.value)} className="rounded-xl border border-gray-200 px-3 py-2" />
                        <input value={question.question_text} onChange={(event) => updateQuestion(index, 'question_text', event.target.value)} placeholder="Enunciado" className="rounded-xl border border-gray-200 px-3 py-2" />
                      </div>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        {Object.entries(question.options).map(([key, value]) => (
                          <input key={key} value={value} onChange={(event) => updateQuestionOption(index, key, event.target.value)} placeholder={`Opción ${key}`} className="rounded-xl border border-gray-200 px-3 py-2" />
                        ))}
                      </div>
                      <label className="mt-3 block text-sm font-bold text-gray-700">
                        Respuesta correcta
                        <select value={question.correct_answer} onChange={(event) => updateQuestion(index, 'correct_answer', event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2">
                          {Object.keys(question.options).map((key) => <option key={key} value={key}>{key}</option>)}
                        </select>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </fieldset>

            {(!selectedVersion || selectedVersion.status === 'draft') && (
              <button type="submit" disabled={saving} className="mt-6 w-full rounded-xl bg-[#d22864] px-5 py-3 text-sm font-black text-white hover:bg-[#b01e52] disabled:opacity-50">
                {saving ? 'Guardando...' : isEditingDraft ? 'Guardar borrador' : 'Crear borrador'}
              </button>
            )}
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default InductionAdminPage;

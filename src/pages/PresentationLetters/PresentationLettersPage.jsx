import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Mail,
  RefreshCw,
  Save,
  Send,
} from 'lucide-react';
import { UserHeader } from '../../components/Header/UserHeader';
import { Footer } from '../../components/Footer/Footer';
import { useAuth } from '../../context/useAuth';
import { useToast } from '../../context/useToast';
import { normalizeRoleNames } from '../../services/roleRouting';
import {
  downloadPresentationLetterBlob,
  presentationLetterService,
} from '../../services/presentationLetterService';

const PRACTICE_TYPES = [
  'Práctica de Estudio I',
  'Práctica de Estudio II',
];

const VARIABLES = [
  '{{student_name}}',
  '{{student_identifier}}',
  '{{practice_type}}',
  '{{current_date}}',
  '{{minimum_hours}}',
  '{{learning_outcomes}}',
];

const DIRECTOR_ROLE = 'Director de carrera';
const TEMPLATE_READER_ROLES = new Set([
  'Encargado de practica',
  'Director de carrera',
  'Secretaria de Carrera',
]);

const DEFAULT_TEMPLATE_FORM = {
  title: '',
  subtitle: '',
  base_intro: '',
  student_presentation_template: '',
  practice_description: '',
  minimum_hours: 168,
  learning_outcomes: '',
  insurance_clause: '',
  closing_text: '',
  signature_name: '',
  signature_role: '',
  signature_institution: '',
  is_active: true,
};

const getErrorMessage = (error) => {
  const detail = error?.response?.data?.detail;

  if (typeof detail === 'string') return detail;
  if (detail?.message) return detail.message;
  if (Array.isArray(detail)) return detail.map((item) => item.msg).join(', ');

  return 'No se pudo completar la operación.';
};

const formatDateTime = (value) => {
  if (!value) return '-';

  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

const toTemplateForm = (template) => ({
  title: template?.title || '',
  subtitle: template?.subtitle || '',
  base_intro: template?.base_intro || '',
  student_presentation_template: template?.student_presentation_template || '',
  practice_description: template?.practice_description || '',
  minimum_hours: template?.minimum_hours || 168,
  learning_outcomes: Array.isArray(template?.learning_outcomes)
    ? template.learning_outcomes.join('\n')
    : '',
  insurance_clause: template?.insurance_clause || '',
  closing_text: template?.closing_text || '',
  signature_name: template?.signature_name || '',
  signature_role: template?.signature_role || '',
  signature_institution: template?.signature_institution || '',
  is_active: template?.is_active ?? true,
});

const buildTemplatePayload = (form) => ({
  ...form,
  minimum_hours: Number(form.minimum_hours),
  learning_outcomes: form.learning_outcomes
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean),
});

const StudentLetterCard = ({ letter, onDownload, downloadingId }) => (
  <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-black text-gray-950">{letter.practice_type}</h3>
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-700">
            <CheckCircle2 size={13} />
            Generada
          </span>
        </div>
        <p className="mt-1 text-sm font-semibold text-gray-500">
          {letter.generated_file_name}
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-gray-400">
          <span>Creada: {formatDateTime(letter.created_at)}</span>
          <span>Envío: {letter.sent_at ? formatDateTime(letter.sent_at) : 'registrado en modo local'}</span>
        </div>
      </div>

      <button
        type="button"
        disabled={downloadingId === letter.id}
        onClick={() => onDownload(letter)}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#d22864] px-4 py-3 text-sm font-black text-white transition hover:bg-[#b01e52] disabled:opacity-60"
      >
        {downloadingId === letter.id ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
        Descargar
      </button>
    </div>
  </article>
);

const StudentView = ({
  letters,
  loading,
  onRefresh,
  onGenerate,
  onDownload,
  generating,
  downloadingId,
}) => {
  const [practiceType, setPracticeType] = useState(PRACTICE_TYPES[0]);

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="space-y-5">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-start gap-3">
            <div className="rounded-2xl bg-[#d22864]/10 p-3 text-[#d22864]">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-950">Generar carta</h3>
              <p className="mt-1 text-sm text-gray-500">
                Selecciona el tipo de práctica. El sistema genera el PDF y registra el envío a tu correo.
              </p>
            </div>
          </div>

          <label className="text-sm font-bold text-gray-700">
            Tipo de práctica
            <select
              value={practiceType}
              onChange={(event) => setPracticeType(event.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 outline-none focus:border-[#d22864]"
            >
              {PRACTICE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            disabled={generating}
            onClick={() => onGenerate(practiceType)}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#d22864] px-4 py-3 font-black text-white transition hover:bg-[#b01e52] disabled:opacity-60"
          >
            {generating ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            Generar carta de presentación
          </button>
        </section>

        <section className="rounded-2xl border border-[#d22864]/10 bg-[#fff0f6] p-5 text-sm text-[#8B1D46]">
          <h3 className="font-black">Regla de uso</h3>
          <p className="mt-2 leading-relaxed">
            La carta es opcional. No bloquea inducción, inscripción, aprobación,
            agenda ni seguimiento de práctica.
          </p>
        </section>
      </aside>

      <section className="min-w-0 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black text-gray-950">Mis cartas generadas</h2>
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-black text-gray-700 shadow-sm ring-1 ring-gray-100 transition hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            Actualizar
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl bg-white shadow-sm">
            <Loader2 className="animate-spin text-[#d22864]" size={42} />
            <p className="mt-4 text-sm font-bold text-gray-500">Cargando cartas...</p>
          </div>
        ) : letters.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
            <Mail className="mx-auto text-gray-300" size={44} />
            <h3 className="mt-4 text-lg font-black text-gray-900">
              Aún no tienes cartas generadas
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Cuando generes una carta, quedará disponible para descarga desde esta sección.
            </p>
          </div>
        ) : (
          letters.map((letter) => (
            <StudentLetterCard
              key={letter.id}
              letter={letter}
              onDownload={onDownload}
              downloadingId={downloadingId}
            />
          ))
        )}
      </section>
    </div>
  );
};

const TemplateEditor = ({
  selectedType,
  onSelectedTypeChange,
  form,
  onFormChange,
  onSave,
  loading,
  saving,
  canEdit,
}) => {
  const updateField = (field, value) => onFormChange({ ...form, [field]: value });

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="space-y-5">
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-black text-gray-950">Plantilla por práctica</h3>
          <label className="mt-4 block text-sm font-bold text-gray-700">
            Tipo de práctica
            <select
              value={selectedType}
              onChange={(event) => onSelectedTypeChange(event.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 outline-none focus:border-[#d22864]"
            >
              {PRACTICE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-wide text-gray-500">
            Variables disponibles
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {VARIABLES.map((variable) => (
              <code
                key={variable}
                className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-bold text-gray-700"
              >
                {variable}
              </code>
            ))}
          </div>
        </section>
      </aside>

      <section className="min-w-0 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        {loading ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center">
            <Loader2 className="animate-spin text-[#d22864]" size={42} />
            <p className="mt-4 text-sm font-bold text-gray-500">Cargando plantilla...</p>
          </div>
        ) : (
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              onSave();
            }}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-bold text-gray-700">
                Título
                <input
                  value={form.title}
                  onChange={(event) => updateField('title', event.target.value)}
                  disabled={!canEdit}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 outline-none focus:border-[#d22864] disabled:bg-gray-50"
                  required
                />
              </label>
              <label className="text-sm font-bold text-gray-700">
                Subtítulo
                <input
                  value={form.subtitle}
                  onChange={(event) => updateField('subtitle', event.target.value)}
                  disabled={!canEdit}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 outline-none focus:border-[#d22864] disabled:bg-gray-50"
                  required
                />
              </label>
            </div>

            <label className="block text-sm font-bold text-gray-700">
              Introducción/base
              <textarea
                rows={3}
                value={form.base_intro}
                onChange={(event) => updateField('base_intro', event.target.value)}
                disabled={!canEdit}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 outline-none focus:border-[#d22864] disabled:bg-gray-50"
                required
              />
            </label>

            <label className="block text-sm font-bold text-gray-700">
              Presentación del estudiante
              <textarea
                rows={3}
                value={form.student_presentation_template}
                onChange={(event) => updateField('student_presentation_template', event.target.value)}
                disabled={!canEdit}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 outline-none focus:border-[#d22864] disabled:bg-gray-50"
                required
              />
            </label>

            <label className="block text-sm font-bold text-gray-700">
              Descripción específica de práctica
              <textarea
                rows={4}
                value={form.practice_description}
                onChange={(event) => updateField('practice_description', event.target.value)}
                disabled={!canEdit}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 outline-none focus:border-[#d22864] disabled:bg-gray-50"
                required
              />
            </label>

            <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
              <label className="text-sm font-bold text-gray-700">
                Horas mínimas
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={form.minimum_hours}
                  onChange={(event) => updateField('minimum_hours', event.target.value)}
                  disabled={!canEdit}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 outline-none focus:border-[#d22864] disabled:bg-gray-50"
                  required
                />
              </label>
              <label className="text-sm font-bold text-gray-700">
                Aprendizajes esperados
                <textarea
                  rows={5}
                  value={form.learning_outcomes}
                  onChange={(event) => updateField('learning_outcomes', event.target.value)}
                  disabled={!canEdit}
                  placeholder="Un aprendizaje por línea"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 outline-none focus:border-[#d22864] disabled:bg-gray-50"
                  required
                />
              </label>
            </div>

            <label className="block text-sm font-bold text-gray-700">
              Cláusula de seguro
              <textarea
                rows={3}
                value={form.insurance_clause}
                onChange={(event) => updateField('insurance_clause', event.target.value)}
                disabled={!canEdit}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 outline-none focus:border-[#d22864] disabled:bg-gray-50"
                required
              />
            </label>

            <label className="block text-sm font-bold text-gray-700">
              Cierre
              <textarea
                rows={3}
                value={form.closing_text}
                onChange={(event) => updateField('closing_text', event.target.value)}
                disabled={!canEdit}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 outline-none focus:border-[#d22864] disabled:bg-gray-50"
                required
              />
            </label>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="text-sm font-bold text-gray-700">
                Firma
                <input
                  value={form.signature_name}
                  onChange={(event) => updateField('signature_name', event.target.value)}
                  disabled={!canEdit}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 outline-none focus:border-[#d22864] disabled:bg-gray-50"
                  required
                />
              </label>
              <label className="text-sm font-bold text-gray-700">
                Cargo
                <input
                  value={form.signature_role}
                  onChange={(event) => updateField('signature_role', event.target.value)}
                  disabled={!canEdit}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 outline-none focus:border-[#d22864] disabled:bg-gray-50"
                  required
                />
              </label>
              <label className="text-sm font-bold text-gray-700">
                Institución
                <input
                  value={form.signature_institution}
                  onChange={(event) => updateField('signature_institution', event.target.value)}
                  disabled={!canEdit}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 outline-none focus:border-[#d22864] disabled:bg-gray-50"
                  required
                />
              </label>
            </div>

            {canEdit ? (
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#d22864] px-5 py-3 text-sm font-black text-white transition hover:bg-[#b01e52] disabled:opacity-60"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Guardar plantilla
              </button>
            ) : (
              <p className="rounded-xl bg-gray-50 px-4 py-3 text-sm font-bold text-gray-500">
                Solo el Director de carrera puede editar plantillas.
              </p>
            )}
          </form>
        )}
      </section>
    </div>
  );
};

export const PresentationLettersPanel = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const roleNames = useMemo(() => normalizeRoleNames(user?.roles), [user]);
  const isStudent = roleNames.includes('Estudiante');
  const canReadTemplates = roleNames.some((role) => TEMPLATE_READER_ROLES.has(role));
  const canEditTemplates = roleNames.includes(DIRECTOR_ROLE);
  const [letters, setLetters] = useState([]);
  const [lettersLoading, setLettersLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [selectedType, setSelectedType] = useState(PRACTICE_TYPES[0]);
  const [templateForm, setTemplateForm] = useState(DEFAULT_TEMPLATE_FORM);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  const loadLetters = useCallback(async () => {
    if (!isStudent) return;
    setLettersLoading(true);
    try {
      const data = await presentationLetterService.getMyLetters();
      setLetters(data);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'No se pudieron cargar las cartas',
        message: getErrorMessage(error),
      });
    } finally {
      setLettersLoading(false);
    }
  }, [isStudent, showToast]);

  const loadTemplate = useCallback(async () => {
    if (!canReadTemplates) return;
    setTemplateLoading(true);
    try {
      const template = await presentationLetterService.getTemplate(selectedType);
      setTemplateForm(toTemplateForm(template));
    } catch (error) {
      showToast({
        type: 'error',
        title: 'No se pudo cargar la plantilla',
        message: getErrorMessage(error),
      });
    } finally {
      setTemplateLoading(false);
    }
  }, [canReadTemplates, selectedType, showToast]);

  useEffect(() => {
    loadLetters();
  }, [loadLetters]);

  useEffect(() => {
    loadTemplate();
  }, [loadTemplate]);

  const handleGenerate = async (practiceType) => {
    setGenerating(true);
    try {
      const generated = await presentationLetterService.generateLetter(practiceType);
      showToast({
        type: 'success',
        title: 'Carta generada',
        message: generated.sent_at
          ? 'La carta fue registrada para envío y quedó disponible para descarga.'
          : 'La carta quedó disponible para descarga. Revisa el historial.',
      });
      await loadLetters();
    } catch (error) {
      showToast({
        type: 'error',
        title: 'No se pudo generar la carta',
        message: getErrorMessage(error),
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (letter) => {
    setDownloadingId(letter.id);
    try {
      const blob = await presentationLetterService.downloadLetter(letter.id);
      downloadPresentationLetterBlob(blob, letter.generated_file_name);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'No se pudo descargar la carta',
        message: getErrorMessage(error),
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleSaveTemplate = async () => {
    setSavingTemplate(true);
    try {
      const updated = await presentationLetterService.updateTemplate(
        selectedType,
        buildTemplatePayload(templateForm),
      );
      setTemplateForm(toTemplateForm(updated));
      showToast({
        type: 'success',
        title: 'Plantilla actualizada',
        message: 'Las nuevas cartas usarán este contenido.',
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'No se pudo guardar la plantilla',
        message: getErrorMessage(error),
      });
    } finally {
      setSavingTemplate(false);
    }
  };

  return (
    <>
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-widest text-[#d22864]">
            Carta de presentación
          </p>
          <h1 className="mt-2 text-3xl font-black text-gray-950">
            {isStudent ? 'Mis cartas de presentación' : 'Plantillas de carta de presentación'}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-500">
            El Director administra plantillas por tipo de práctica. El estudiante
            genera automáticamente su PDF con datos reales y puede descargarlo desde esta página.
          </p>
        </div>

        {isStudent ? (
          <StudentView
            letters={letters}
            loading={lettersLoading}
            onRefresh={loadLetters}
            onGenerate={handleGenerate}
            onDownload={handleDownload}
            generating={generating}
            downloadingId={downloadingId}
          />
        ) : (
          <TemplateEditor
            selectedType={selectedType}
            onSelectedTypeChange={setSelectedType}
            form={templateForm}
            onFormChange={setTemplateForm}
            onSave={handleSaveTemplate}
            loading={templateLoading}
            saving={savingTemplate}
            canEdit={canEditTemplates}
          />
        )}
    </>
  );
};

export const PresentationLettersPage = () => (
  <div className="flex min-h-screen flex-col bg-[#FAFAFA]">
    <UserHeader />
    <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 sm:px-8">
      <PresentationLettersPanel />
    </main>
    <Footer />
  </div>
);

export default PresentationLettersPage;

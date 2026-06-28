import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Braces,
  CalendarDays,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  FileText,
  Hash,
  ImagePlus,
  ListChecks,
  Loader2,
  Mail,
  RefreshCw,
  Save,
  Send,
  Trash2,
  UserRound,
  X,
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
  'Práctica Controlada',
];

const TEMPLATE_VARIABLES = [
  {
    token: '{{student_name}}',
    title: 'Nombre del estudiante',
    description: 'Nombres y apellidos registrados en la cuenta del estudiante.',
    example: 'Ej.: Camila Rojas',
    recommendedFields: 'Introducción o presentación del estudiante.',
    icon: UserRound,
  },
  {
    token: '{{student_identifier}}',
    title: 'Número de matrícula',
    description: 'Matrícula calculada con RUT sin formato y los dos últimos dígitos del año de ingreso.',
    example: 'Ej.: 12345678924',
    recommendedFields: 'Presentación del estudiante.',
    icon: Hash,
  },
  {
    token: '{{practice_type}}',
    title: 'Tipo de práctica',
    description: 'Tipo seleccionado para la plantilla activa.',
    example: 'Ej.: Práctica de Estudio I',
    recommendedFields: 'Título, subtítulo o descripción específica.',
    icon: FileText,
  },
  {
    token: '{{current_date}}',
    title: 'Fecha de emisión',
    description: 'Fecha exacta en que se genera la carta.',
    example: 'Ej.: 28 de junio del 2026',
    recommendedFields: 'Introducción, cierre o referencias formales.',
    icon: CalendarDays,
  },
  {
    token: '{{minimum_hours}}',
    title: 'Horas mínimas',
    description: 'Valor configurado en el campo “Horas mínimas” de esta plantilla.',
    example: 'Ej.: 168',
    recommendedFields: 'Descripción de práctica o cláusulas académicas.',
    icon: Hash,
  },
  {
    token: '{{learning_outcomes}}',
    title: 'Aprendizajes esperados',
    description: 'Lista generada desde el campo “Aprendizajes esperados”.',
    example: 'Ej.: listado con viñetas',
    recommendedFields: 'Descripción de práctica o cierre académico.',
    icon: ListChecks,
  },
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
  signature_image_uploaded: false,
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
  signature_image_uploaded: Boolean(template?.signature_image_uploaded),
  is_active: template?.is_active ?? true,
});

const buildTemplatePayload = (form) => {
  const { signature_image_uploaded: _signatureImageUploaded, ...editableFields } = form;

  return {
    ...editableFields,
    minimum_hours: Number(form.minimum_hours),
    learning_outcomes: form.learning_outcomes
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean),
  };
};

const MONTHS_ES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

const formatPreviewDate = (date) => (
  `${date.getDate()} de ${MONTHS_ES[date.getMonth()]} del ${date.getFullYear()}`
);

const renderTemplateText = (text, variables) => (
  Object.entries(variables).reduce(
    (rendered, [key, value]) => rendered.replaceAll(`{{${key}}}`, value),
    text || '',
  )
);

const VARIABLE_TOKEN_PATTERN = /({{[a-z_]+}})/g;
const KNOWN_VARIABLE_TOKENS = new Set(TEMPLATE_VARIABLES.map((variable) => variable.token));

const renderHighlightedTemplateText = (value, placeholder) => {
  const text = value || placeholder || ' ';
  const parts = text.split(VARIABLE_TOKEN_PATTERN);

  return parts.map((part, index) => {
    if (!part) return null;
    if (KNOWN_VARIABLE_TOKENS.has(part)) {
      return (
        <mark
          key={`${part}-${index}`}
          className="rounded-md bg-[#fff0f6] px-1 font-black text-[#b01e52]"
        >
          {part}
        </mark>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
};

const getPreviewLearningOutcomes = (form) => {
  const outcomes = form.learning_outcomes
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

  if (outcomes.length > 0) {
    return outcomes;
  }

  return [
    'Aplicar conocimientos disciplinares en un contexto profesional.',
    'Comunicar avances y resultados de manera clara y responsable.',
  ];
};

const buildLetterPreview = (form, selectedType) => {
  const generatedAt = new Date();
  const learningOutcomes = getPreviewLearningOutcomes(form);
  const learningOutcomesText = learningOutcomes
    .map((outcome) => `• ${outcome}`)
    .join('\n');
  const variables = {
    student_name: 'Camila Rojas Soto',
    student_identifier: '12345678924',
    practice_type: selectedType,
    current_date: formatPreviewDate(generatedAt),
    minimum_hours: String(form.minimum_hours || 168),
    learning_outcomes: learningOutcomesText,
  };
  const practiceLabel = renderTemplateText(
    form.subtitle || `Estudiante en ${selectedType}`,
    variables,
  ).replace('Estudiante en ', '');
  const minimumHoursClause = (
    'Es importante destacar que la duración mínima de la '
    + `${practiceLabel} es de ${variables.minimum_hours} horas cronológicas, `
    + 'y que una vez completada con éxito el/la estudiante debe ser '
    + 'capaz de evidenciar los siguientes aprendizajes:'
  );

  return {
    date: `Temuco, ${variables.current_date}`,
    title: renderTemplateText(form.title || 'Carta de presentación', variables).toUpperCase(),
    subtitle: renderTemplateText(form.subtitle || `Estudiante en ${selectedType}`, variables),
    paragraphs: [
      renderTemplateText(form.base_intro, variables),
      renderTemplateText(form.student_presentation_template, variables),
      renderTemplateText(form.practice_description, variables),
      minimumHoursClause,
    ].filter(Boolean),
    learningOutcomes,
    insuranceClause: renderTemplateText(form.insurance_clause, variables),
    closingText: renderTemplateText(form.closing_text, variables),
    signatureName: renderTemplateText(form.signature_name, variables),
    signatureRole: renderTemplateText(form.signature_role, variables),
    signatureInstitution: renderTemplateText(form.signature_institution, variables),
  };
};

const TemplateTextarea = ({
  label,
  value,
  onValueChange,
  disabled,
  required,
  rows = 3,
  placeholder = '',
}) => {
  const textareaRef = useRef(null);
  const minHeight = rows * 24 + 28;

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.max(textarea.scrollHeight, minHeight)}px`;
  }, [value, minHeight]);

  return (
    <label className="block text-sm font-bold text-gray-700">
      {label}
      <div
        className={`relative mt-1 rounded-xl border transition focus-within:border-[#d22864] ${
          disabled ? 'border-gray-200 bg-gray-50' : 'border-gray-200 bg-white'
        }`}
      >
        <div
          aria-hidden="true"
          className={`pointer-events-none min-h-full whitespace-pre-wrap break-words px-3 py-3 text-sm leading-6 ${
            value ? 'text-gray-700' : 'text-gray-400'
          }`}
          style={{ minHeight }}
        >
          {renderHighlightedTemplateText(value, placeholder)}
          {'\n'}
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          disabled={disabled}
          required={required}
          rows={rows}
          spellCheck="true"
          className="absolute inset-0 h-full w-full resize-none overflow-hidden rounded-xl bg-transparent px-3 py-3 text-sm leading-6 text-transparent caret-gray-900 outline-none selection:bg-[#d22864]/20 disabled:cursor-not-allowed"
          style={{ minHeight }}
        />
      </div>
    </label>
  );
};

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
  onSignatureImageDelete,
  onSignatureImageUpload,
  signatureImageUrl,
  loading,
  saving,
  canEdit,
}) => {
  const updateField = (field, value) => onFormChange({ ...form, [field]: value });
  const [copiedVariable, setCopiedVariable] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const letterPreview = useMemo(
    () => buildLetterPreview(form, selectedType),
    [form, selectedType],
  );

  const handleCopyVariable = async (token) => {
    try {
      await navigator.clipboard.writeText(token);
      setCopiedVariable(token);
      window.setTimeout(() => {
        setCopiedVariable((current) => (current === token ? '' : current));
      }, 1600);
    } catch {
      setCopiedVariable('');
    }
  };

  const handleSignatureFileChange = (event) => {
    const [file] = event.target.files || [];
    event.target.value = '';
    if (file) {
      onSignatureImageUpload(file);
    }
  };

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
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff0f6] text-[#d22864]">
              <Braces size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wide text-gray-500">
                Variables disponibles
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">
                Se reemplazan automáticamente al generar el PDF. Mantén las llaves dobles.
              </p>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-gray-100">
            {TEMPLATE_VARIABLES.map((variable) => {
              const Icon = variable.icon;
              const isCopied = copiedVariable === variable.token;

              return (
                <div key={variable.token} className="border-b border-gray-100 bg-gray-50/70 p-3 last:border-b-0">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#d22864] ring-1 ring-gray-100">
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-black text-gray-900">{variable.title}</p>
                          <code className="mt-1 inline-block max-w-full rounded-lg bg-white px-2 py-1 text-xs font-black text-gray-700 ring-1 ring-gray-100">
                            {variable.token}
                          </code>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyVariable(variable.token)}
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs transition ${
                            isCopied
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border-gray-200 bg-white text-gray-500 hover:border-[#d22864] hover:text-[#d22864]'
                          }`}
                          aria-label={`Copiar ${variable.token}`}
                          title={`Copiar ${variable.token}`}
                        >
                          {isCopied ? <Check size={15} /> : <Copy size={15} />}
                        </button>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-gray-600">
                        {variable.description}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-gray-400">
                        {variable.example}
                      </p>
                      <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                        Útil en: {variable.recommendedFields}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
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
            <div className="flex flex-col gap-3 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-black text-gray-950">Edición de plantilla</h3>
                <p className="mt-1 text-sm font-semibold text-gray-500">{selectedType}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-black text-white transition hover:bg-gray-800"
              >
                <Eye size={17} />
                Previsualizar carta
              </button>
            </div>

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

            <TemplateTextarea
              label="Introducción/base"
              rows={3}
              value={form.base_intro}
              onValueChange={(value) => updateField('base_intro', value)}
              disabled={!canEdit}
              required
            />

            <TemplateTextarea
              label="Presentación del estudiante"
              rows={3}
              value={form.student_presentation_template}
              onValueChange={(value) => updateField('student_presentation_template', value)}
              disabled={!canEdit}
              required
            />

            <TemplateTextarea
              label="Descripción específica de práctica"
              rows={4}
              value={form.practice_description}
              onValueChange={(value) => updateField('practice_description', value)}
              disabled={!canEdit}
              required
            />

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
              <TemplateTextarea
                label="Aprendizajes esperados"
                rows={5}
                value={form.learning_outcomes}
                onValueChange={(value) => updateField('learning_outcomes', value)}
                disabled={!canEdit}
                placeholder="Un aprendizaje por línea"
                required
              />
            </div>

            <TemplateTextarea
              label="Cláusula de seguro"
              rows={3}
              value={form.insurance_clause}
              onValueChange={(value) => updateField('insurance_clause', value)}
              disabled={!canEdit}
              required
            />

            <TemplateTextarea
              label="Cierre"
              rows={3}
              value={form.closing_text}
              onValueChange={(value) => updateField('closing_text', value)}
              disabled={!canEdit}
              required
            />

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

            <section className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-sm font-black uppercase tracking-wide text-gray-500">
                    Imagen de firma
                  </h4>
                  <p className="mt-1 text-sm font-semibold text-gray-500">
                    PNG o JPG, máximo 2 MB.
                  </p>
                </div>
                {canEdit && (
                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-gray-700 ring-1 ring-gray-200 transition hover:text-[#d22864] hover:ring-[#d22864]">
                      <ImagePlus size={16} />
                      {signatureImageUrl ? 'Reemplazar firma' : 'Subir firma'}
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={handleSignatureFileChange}
                        className="sr-only"
                      />
                    </label>
                    {signatureImageUrl && (
                      <button
                        type="button"
                        onClick={onSignatureImageDelete}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-white px-4 py-3 text-sm font-black text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                        Quitar firma
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 flex min-h-28 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white p-4">
                {signatureImageUrl ? (
                  <img
                    src={signatureImageUrl}
                    alt="Firma configurada"
                    className="max-h-24 max-w-full object-contain"
                  />
                ) : (
                  <p className="text-sm font-bold text-gray-400">Sin imagen de firma configurada</p>
                )}
              </div>
            </section>

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

      {isPreviewOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#d22864]">
                  Previsualización
                </p>
                <h2 className="mt-1 text-2xl font-black text-gray-950">
                  Carta de presentación
                </h2>
                <p className="mt-1 text-sm font-semibold text-gray-500">
                  Vista referencial con datos de ejemplo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:border-[#d22864] hover:text-[#d22864]"
                aria-label="Cerrar previsualización"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto bg-gray-100 px-4 py-6 sm:px-8">
              <article className="mx-auto min-h-[760px] max-w-3xl bg-white px-8 py-10 text-gray-900 shadow-sm ring-1 ring-gray-200 sm:px-12">
                <p className="text-right text-sm font-semibold text-gray-600">
                  {letterPreview.date}
                </p>
                <header className="mt-8 text-center">
                  <h3 className="text-xl font-black uppercase tracking-wide text-gray-950">
                    {letterPreview.title}
                  </h3>
                  <p className="mt-2 text-sm font-bold text-gray-600">
                    {letterPreview.subtitle}
                  </p>
                </header>

                <p className="mt-10 text-sm font-bold text-gray-800">
                  A quien corresponda:
                </p>

                <div className="mt-5 space-y-4 text-sm leading-7 text-gray-700">
                  {letterPreview.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>

                {letterPreview.learningOutcomes.length > 0 && (
                  <div className="mt-5">
                    <p className="text-sm font-black text-gray-800">Aprendizajes esperados</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-7 text-gray-700">
                      {letterPreview.learningOutcomes.map((outcome) => (
                        <li key={outcome}>{outcome}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-5 space-y-4 text-sm leading-7 text-gray-700">
                  {letterPreview.insuranceClause && (
                    <p>{letterPreview.insuranceClause}</p>
                  )}
                  {letterPreview.closingText && (
                    <p>{letterPreview.closingText}</p>
                  )}
                </div>

                <footer className="mt-14 text-center text-sm text-gray-700">
                  {signatureImageUrl ? (
                    <img
                      src={signatureImageUrl}
                      alt="Firma configurada"
                      className="mx-auto mb-3 max-h-20 max-w-56 object-contain"
                    />
                  ) : (
                    <div className="mx-auto mb-3 h-px w-56 bg-gray-300" />
                  )}
                  <p className="font-black text-gray-950">
                    {letterPreview.signatureName || 'Nombre de firma'}
                  </p>
                  <p className="font-semibold">
                    {letterPreview.signatureRole || 'Cargo'}
                  </p>
                  <p className="font-semibold">
                    {letterPreview.signatureInstitution || 'Institución'}
                  </p>
                </footer>
              </article>
            </div>

            <div className="flex justify-end border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="rounded-xl bg-[#d22864] px-5 py-3 text-sm font-black text-white transition hover:bg-[#b01e52]"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
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
  const [signatureImageUrl, setSignatureImageUrl] = useState('');
  const signatureImageUrlRef = useRef('');

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

  const revokeSignatureImageUrl = useCallback(() => {
    if (signatureImageUrlRef.current) {
      window.URL.revokeObjectURL(signatureImageUrlRef.current);
      signatureImageUrlRef.current = '';
    }
    setSignatureImageUrl('');
  }, []);

  const loadSignatureImagePreview = useCallback(async (template) => {
    revokeSignatureImageUrl();
    if (!template?.signature_image_uploaded) return;

    try {
      const blob = await presentationLetterService.getSignatureImage(selectedType);
      const objectUrl = window.URL.createObjectURL(blob);
      signatureImageUrlRef.current = objectUrl;
      setSignatureImageUrl(objectUrl);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'No se pudo cargar la firma',
        message: getErrorMessage(error),
      });
    }
  }, [revokeSignatureImageUrl, selectedType, showToast]);

  const loadTemplate = useCallback(async () => {
    if (!canReadTemplates) return;
    setTemplateLoading(true);
    try {
      const template = await presentationLetterService.getTemplate(selectedType);
      setTemplateForm(toTemplateForm(template));
      await loadSignatureImagePreview(template);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'No se pudo cargar la plantilla',
        message: getErrorMessage(error),
      });
    } finally {
      setTemplateLoading(false);
    }
  }, [canReadTemplates, loadSignatureImagePreview, selectedType, showToast]);

  useEffect(() => {
    loadLetters();
  }, [loadLetters]);

  useEffect(() => {
    loadTemplate();
  }, [loadTemplate]);

  useEffect(() => () => revokeSignatureImageUrl(), [revokeSignatureImageUrl]);

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

  const handleSignatureImageUpload = async (file) => {
    setSavingTemplate(true);
    try {
      const updated = await presentationLetterService.uploadSignatureImage(
        selectedType,
        file,
      );
      setTemplateForm(toTemplateForm(updated));
      await loadSignatureImagePreview(updated);
      showToast({
        type: 'success',
        title: 'Firma actualizada',
        message: 'La imagen se usará en las próximas cartas generadas.',
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'No se pudo subir la firma',
        message: getErrorMessage(error),
      });
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleSignatureImageDelete = async () => {
    setSavingTemplate(true);
    try {
      const updated = await presentationLetterService.deleteSignatureImage(selectedType);
      setTemplateForm(toTemplateForm(updated));
      revokeSignatureImageUrl();
      showToast({
        type: 'success',
        title: 'Firma eliminada',
        message: 'La plantilla volverá a usar solo los datos escritos de firma.',
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'No se pudo eliminar la firma',
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
            onSignatureImageDelete={handleSignatureImageDelete}
            onSignatureImageUpload={handleSignatureImageUpload}
            signatureImageUrl={signatureImageUrl}
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

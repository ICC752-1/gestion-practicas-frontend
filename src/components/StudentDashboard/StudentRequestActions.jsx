import { useMemo, useState } from 'react';
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  Loader2,
  Pencil,
  Save,
  X,
} from 'lucide-react';
import { internshipService } from '../../services/internshipService';

const EDITABLE_FIELDS = [
  { name: 'org_name', label: 'Organización', type: 'text' },
  { name: 'sector', label: 'Rubro', type: 'text' },
  { name: 'address', label: 'Dirección organización', type: 'text' },
  { name: 'city', label: 'Ciudad', type: 'text' },
  { name: 'org_phone', label: 'Teléfono organización', type: 'text' },
  { name: 'web', label: 'Sitio web', type: 'text' },
  { name: 'supervisor_name', label: 'Supervisor/a', type: 'text' },
  { name: 'supervisor_profession', label: 'Profesión supervisor/a', type: 'text' },
  { name: 'supervisor_position', label: 'Cargo supervisor/a', type: 'text' },
  { name: 'supervisor_department', label: 'Departamento supervisor/a', type: 'text' },
  { name: 'supervisor_email', label: 'Email supervisor/a', type: 'email' },
  { name: 'supervisor_phone', label: 'Teléfono supervisor/a', type: 'text' },
  { name: 'start_date', label: 'Inicio', type: 'date' },
  { name: 'end_date', label: 'Término', type: 'date' },
  { name: 'schedule', label: 'Horario', type: 'text' },
  { name: 'days', label: 'Días', type: 'text' },
  { name: 'internship_address', label: 'Dirección práctica', type: 'text' },
  { name: 'act_description', label: 'Actividades', type: 'textarea' },
  { name: 'ben_description', label: 'Beneficios', type: 'textarea' },
  { name: 'amount', label: 'Apoyo económico', type: 'number' },
];

const SELECT_FIELDS = {
  modality: {
    label: 'Modalidad',
    options: ['Presencial', 'Remoto', 'Híbrido'],
  },
  internship_period: {
    label: 'Período',
    options: ['Semestre', 'Verano', 'Invierno'],
  },
  internship_type: {
    label: 'Tipo de práctica',
    options: [
      'Práctica de Estudio I',
      'Práctica de Estudio II',
      'Práctica Controlada',
      'Tesis',
    ],
  },
};

const getApiErrorMessage = (error) => {
  const detail = error.response?.data?.detail;

  if (typeof detail === 'string') return detail;
  if (detail?.message) return detail.message;
  if (Array.isArray(detail?.reasons) && detail.reasons.length > 0) {
    return 'La solicitud ya no permite esta acción.';
  }
  if (Array.isArray(detail)) return detail.map((item) => item.msg).join(', ');
  if (!error.response) return 'No se pudo conectar con el servidor.';

  return 'No se pudo completar la acción.';
};

const normalizeValue = (value) => {
  if (value === null || value === undefined) return '';
  return String(value);
};

const buildInitialForm = (internship) => {
  const base = {};

  EDITABLE_FIELDS.forEach((field) => {
    base[field.name] = normalizeValue(internship?.[field.name]);
  });

  Object.keys(SELECT_FIELDS).forEach((fieldName) => {
    base[fieldName] = normalizeValue(internship?.[fieldName]);
  });

  return base;
};

const formatDeadline = (value) => {
  if (!value) return '';

  return new Date(value).toLocaleString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const REQUIRED_UPDATE_REASON_MESSAGE = 'El motivo de corrección es obligatorio.';

export const StudentRequestActions = ({
  internship,
  actions,
  onUpdated,
}) => {
  const initialForm = useMemo(() => buildInitialForm(internship), [internship]);
  const [mode, setMode] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [updateReason, setUpdateReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [updateReasonError, setUpdateReasonError] = useState(null);

  const resetForm = () => {
    setFormData(initialForm);
    setUpdateReason('');
    setCancelReason('');
    setMessage(null);
    setError(null);
    setUpdateReasonError(null);
  };

  const toggleMode = (nextMode) => {
    if (mode === nextMode) {
      setMode(null);
      return;
    }

    resetForm();
    setMode(nextMode);
  };

  const canUpdate = actions?.can_update;
  const canCancel = actions?.can_cancel;

  if (!canUpdate && !canCancel) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setMessage(null);
  };

  const handleUpdateReasonChange = (event) => {
    setUpdateReason(event.target.value);
    setUpdateReasonError(null);
    setError(null);
    setMessage(null);
  };

  const buildUpdatePayload = () => {
    const payload = { reason: updateReason.trim() };

    Object.entries(formData).forEach(([key, value]) => {
      const originalValue = normalizeValue(initialForm[key]);
      const currentValue = normalizeValue(value);

      if (currentValue !== originalValue) {
        payload[key] = key === 'amount' ? Number(currentValue || 0) : currentValue;
      }
    });

    return payload;
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!updateReason.trim()) {
      setUpdateReasonError(REQUIRED_UPDATE_REASON_MESSAGE);
      return;
    }

    const payload = buildUpdatePayload();
    if (Object.keys(payload).length === 1) {
      setError('Debes modificar al menos un campo.');
      return;
    }

    try {
      setSubmitting(true);
      await internshipService.updateStudentInternship(internship.id, payload);
      setMessage('Solicitud corregida correctamente.');
      setMode(null);
      await onUpdated?.();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (event) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!cancelReason.trim()) {
      setError('El motivo de anulación es obligatorio.');
      return;
    }

    try {
      setSubmitting(true);
      await internshipService.cancelStudentInternship(internship.id, cancelReason);
      setMessage('Solicitud anulada correctamente.');
      setMode(null);
      await onUpdated?.();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 mb-8 border border-gray-100">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Pencil size={20} className="text-[#d22864]" />
            Corrección de solicitud
          </h3>
          {actions?.editable_until && (
            <p className="mt-1 text-xs font-semibold text-gray-400">
              Disponible hasta {formatDeadline(actions.editable_until)}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {canUpdate && (
            <button
              type="button"
              onClick={() => toggleMode('update')}
              className="inline-flex items-center gap-2 rounded-xl bg-[#d22864] px-4 py-2 text-sm font-bold text-white hover:bg-[#b01e52]"
            >
              <Pencil size={16} />
              Corregir
            </button>
          )}
          {canCancel && (
            <button
              type="button"
              onClick={() => toggleMode('cancel')}
              className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-100"
            >
              <Ban size={16} />
              Anular
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="mt-5 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}

      {error && (
        <div className="mt-5 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {mode === 'update' && (
        <form onSubmit={handleUpdate} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {EDITABLE_FIELDS.map((field) => (
              <label key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                <span className="mb-1 block text-xs font-black uppercase tracking-wider text-gray-400">
                  {field.label}
                </span>
                {field.type === 'textarea' ? (
                  <textarea
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:border-[#d22864]"
                  />
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    min={field.type === 'number' ? '0' : undefined}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:border-[#d22864]"
                  />
                )}
              </label>
            ))}

            {Object.entries(SELECT_FIELDS).map(([fieldName, field]) => (
              <label key={fieldName}>
                <span className="mb-1 block text-xs font-black uppercase tracking-wider text-gray-400">
                  {field.label}
                </span>
                <select
                  name={fieldName}
                  value={formData[fieldName]}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:border-[#d22864]"
                >
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <label>
            <span className="mb-1 block text-xs font-black uppercase tracking-wider text-gray-400">
              Motivo
            </span>
            <textarea
              value={updateReason}
              onChange={handleUpdateReasonChange}
              rows={3}
              className={`w-full rounded-xl border bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:border-[#d22864] ${
                updateReasonError ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {updateReasonError && (
              <p className="mt-2 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                <AlertCircle size={14} />
                {updateReasonError}
              </p>
            )}
          </label>

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => setMode(null)}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 disabled:opacity-60"
            >
              <X size={16} />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#d22864] px-5 py-2 text-sm font-bold text-white hover:bg-[#b01e52] disabled:opacity-60"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Guardar
            </button>
          </div>
        </form>
      )}

      {mode === 'cancel' && (
        <form onSubmit={handleCancel} className="mt-6 space-y-5">
          <label>
            <span className="mb-1 block text-xs font-black uppercase tracking-wider text-gray-400">
              Motivo
            </span>
            <textarea
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
              rows={3}
              className="w-full rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:border-red-300"
            />
          </label>

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => setMode(null)}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 disabled:opacity-60"
            >
              <X size={16} />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Ban size={16} />}
              Anular solicitud
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

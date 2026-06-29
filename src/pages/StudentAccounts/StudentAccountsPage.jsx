import { useCallback, useEffect, useState } from 'react';
import { ArrowDown, ArrowDownUp, ArrowUp, BarChart3, Search, UserPlus, Users } from 'lucide-react';

import { Footer } from '../../components/Footer/Footer';
import { UserHeader } from '../../components/Header/UserHeader';
import { FormModal } from '../../components/common/FormModal';
import { studentAccountService } from '../../services/studentAccountService';
import {
  analyzeEnrollment,
  cleanEnrollment,
  getEnrollmentError,
} from '../../utils/enrollment';

const PAGE_SIZE = 10;

const initialFilters = {
  search: '',
  is_active: '',
};

const initialSort = {
  sort_by: 'created_at',
  sort_dir: 'desc',
};

const initialForm = {
  email: '',
  first_name: '',
  last_name: '',
  enrollment: '',
  degree: 'Ingenieria Civil Informatica',
  cod_degree: 'ICI',
};

const ERROR_TRANSLATIONS = {
  'Email already exists': 'El correo ya existe.',
  'RUT already exists': 'El RUT ya existe.',
  'Enrollment already exists': 'La matrícula ya está registrada.',
  'Enrollment is required for student accounts': 'La matrícula es obligatoria para estudiantes.',
  'User not found': 'No se encontró el usuario.',
};

const getErrorMessage = (error) => {
  const detail = error?.response?.data?.detail;
  if (typeof detail === 'string') {
    return ERROR_TRANSLATIONS[detail] || detail;
  }
  return detail?.message || 'No se pudo completar la acción.';
};

const formatDateTime = (value) => {
  if (!value) return '-';

  const rawValue = String(value);
  const normalizedValue = /([zZ]|[+-]\d{2}:\d{2})$/.test(rawValue)
    ? rawValue
    : `${rawValue}Z`;
  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const PRACTICE_PROGRESS_TEMPLATE = [
  'Práctica de Estudio I',
  'Práctica de Estudio II',
  'Práctica Controlada',
  'Tesis',
].map((type) => ({
  type,
  requirement_status: 'Pendiente',
  display_status: 'Pendiente',
  internship_id: null,
  request_status: null,
  completion_status: null,
  final_result: null,
  is_current: false,
  is_completed: false,
}));

const PRACTICE_TYPE_SHORT_LABELS = {
  'Práctica de Estudio I': 'Práctica I',
  'Práctica de Estudio II': 'Práctica II',
  'Práctica Controlada': 'Controlada',
  Tesis: 'Tesis',
};

const STATUS_PILL_STYLES = {
  Aprobada: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  Finalizada: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  'En curso': 'border-blue-100 bg-blue-50 text-blue-700',
  'Pendiente de evaluaciones': 'border-sky-100 bg-sky-50 text-sky-700',
  'Pendiente de presentación': 'border-sky-100 bg-sky-50 text-sky-700',
  'En revisión': 'border-amber-100 bg-amber-50 text-amber-700',
  Habilitada: 'border-[#d22864]/15 bg-[#fff0f6] text-[#d22864]',
  Pendiente: 'border-gray-200 bg-gray-50 text-gray-600',
  Rechazada: 'border-red-100 bg-red-50 text-red-700',
  Reprobada: 'border-red-100 bg-red-50 text-red-700',
  Anulada: 'border-gray-200 bg-gray-100 text-gray-500',
};

const DEFAULT_STATUS_PILL_STYLE = 'border-gray-200 bg-gray-50 text-gray-600';

const normalizeCount = (value, fallback) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const getShortPracticeType = (type) => PRACTICE_TYPE_SHORT_LABELS[type] || type;

const getStatusPillClass = (status) => (
  STATUS_PILL_STYLES[status] || DEFAULT_STATUS_PILL_STYLE
);

const getAcademicProgress = (student) => {
  const progress = student?.academic_progress;
  const items = Array.isArray(progress?.items) && progress.items.length > 0
    ? progress.items
    : PRACTICE_PROGRESS_TEMPLATE;
  const completedCount = normalizeCount(
    progress?.completed_count,
    items.filter((item) => item.is_completed).length,
  );
  const totalCount = normalizeCount(progress?.total_count, items.length || 4);

  return {
    completed_count: completedCount,
    total_count: totalCount,
    current_type: progress?.current_type || null,
    current_status: progress?.current_status || null,
    items,
  };
};

const getProgressPercent = (progress) => {
  if (!progress.total_count) return 0;
  return Math.min(
    100,
    Math.max(0, Math.round((progress.completed_count / progress.total_count) * 100)),
  );
};

const SortHeader = ({ label, field, sort, onSort, align = 'left' }) => {
  const isActive = sort.sort_by === field;
  const Icon = isActive
    ? (sort.sort_dir === 'asc' ? ArrowUp : ArrowDown)
    : ArrowDownUp;

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={[
        'inline-flex w-full items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-black uppercase tracking-wide transition-colors',
        align === 'center' ? 'justify-center text-center' : 'justify-start text-left',
        isActive ? 'text-[#d22864]' : 'text-gray-500 hover:bg-gray-50 hover:text-[#d22864]',
      ].join(' ')}
      aria-sort={isActive ? (sort.sort_dir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <span>{label}</span>
      <Icon size={14} strokeWidth={2.6} />
    </button>
  );
};

export const StudentAccountsPanel = () => {
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [sort, setSort] = useState(initialSort);
  const [form, setForm] = useState(initialForm);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [progressStudent, setProgressStudent] = useState(null);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        limit: PAGE_SIZE,
        offset,
        sort_by: sort.sort_by,
        sort_dir: sort.sort_dir,
      };
      if (appliedFilters.search) params.search = appliedFilters.search;
      if (appliedFilters.is_active !== '') {
        params.is_active = appliedFilters.is_active === 'true';
      }

      const data = await studentAccountService.listStudents(params);
      setStudents(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, offset, sort]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleApplyFilters = (event) => {
    event.preventDefault();
    setOffset(0);
    setAppliedFilters(filters);
  };

  const handleSort = (field) => {
    setOffset(0);
    setSort((current) => ({
      sort_by: field,
      sort_dir: current.sort_by === field && current.sort_dir === 'asc' ? 'desc' : 'asc',
    }));
  };

  const applyRecentSort = (direction) => {
    setOffset(0);
    setSort({ sort_by: 'created_at', sort_dir: direction });
  };

  const openCreateModal = () => {
    setError('');
    setMessage('');
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    if (saving) return;
    setIsCreateModalOpen(false);
    setForm(initialForm);
    setError('');
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleEnrollmentChange = (event) => {
    setForm((current) => ({
      ...current,
      enrollment: cleanEnrollment(event.target.value),
    }));
  };

  const handleCreateStudent = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const enrollmentError = getEnrollmentError(form.enrollment);
      if (enrollmentError) {
        setError(enrollmentError);
        return;
      }

      const payload = {
        ...form,
        sexo: 'No definido',
      };

      await studentAccountService.createStudent(payload);
      setForm(initialForm);
      setIsCreateModalOpen(false);
      setOffset(0);
      setMessage('Estudiante creado. Se envio un enlace de activacion al correo registrado.');
      await loadStudents();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (student) => {
    const nextStatus = !student.is_active;
    const action = nextStatus ? 'reactivar' : 'desactivar';

    if (!window.confirm(`Confirmas ${action} a ${student.email}?`)) {
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      await studentAccountService.updateStudent(student.id, { is_active: nextStatus });
      setMessage(`Estudiante ${nextStatus ? 'reactivado' : 'desactivado'}.`);
      await loadStudents();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const start = total === 0 ? 0 : offset + 1;
  const end = Math.min(offset + PAGE_SIZE, total);
  const currentPage = total === 0 ? 0 : Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const enrollmentDetails = analyzeEnrollment(form.enrollment);

  return (
    <>
        <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#fff0f6] text-[#d22864]">
                <Users size={28} />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-[#d22864]">Cuentas estudiante</p>
                <h1 className="mt-2 text-3xl font-black text-gray-900">Vinculacion de estudiantes</h1>
                <p className="mt-3 max-w-3xl text-gray-600">
                  Crea cuentas de rol estudiante y envia enlaces de activacion. La administracion global de roles queda reservada para superadmin.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#d22864] px-5 py-3 text-sm font-black text-white transition hover:bg-[#b01e52]"
            >
              <UserPlus size={18} />
              Nuevo estudiante
            </button>
          </div>
        </section>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}
        {message && (
          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">
            {message}
          </div>
        )}

        <section className="mt-6">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <form onSubmit={handleApplyFilters} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_140px]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Nombre, correo o matrícula"
                  className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-[#d22864]"
                />
              </label>
              <select
                name="is_active"
                value={filters.is_active}
                onChange={handleFilterChange}
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864]"
              >
                <option value="">Todos</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
              <button type="submit" className="rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white hover:bg-gray-800">
                Filtrar
              </button>
            </form>

            <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 px-4 py-3 text-sm font-semibold text-gray-600 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-black text-gray-900">
                  {total} {total === 1 ? 'resultado' : 'resultados'}
                </p>
                <p className="text-xs text-gray-500">
                  Mostrando {start}-{end} · Página {currentPage} de {totalPages}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyRecentSort('desc')}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black transition ${
                    sort.sort_by === 'created_at' && sort.sort_dir === 'desc'
                      ? 'border-[#d22864] bg-[#fff0f6] text-[#d22864]'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-[#d22864] hover:text-[#d22864]'
                  }`}
                >
                  <ArrowDown size={14} />
                  Más recientes
                </button>
                <button
                  type="button"
                  onClick={() => applyRecentSort('asc')}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black transition ${
                    sort.sort_by === 'created_at' && sort.sort_dir === 'asc'
                      ? 'border-[#d22864] bg-[#fff0f6] text-[#d22864]'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-[#d22864] hover:text-[#d22864]'
                  }`}
                >
                  <ArrowUp size={14} />
                  Más antiguos
                </button>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full table-fixed divide-y divide-gray-100 text-sm">
                <colgroup>
                  <col className="w-[32%] md:w-[27%] lg:w-[24%]" />
                  <col className="hidden lg:table-column lg:w-[13%]" />
                  <col className="w-[22%] md:w-[16%] lg:w-[14%]" />
                  <col className="hidden md:table-column md:w-[9%] lg:w-[8%]" />
                  <col className="w-[26%] md:w-[25%] lg:w-[20%]" />
                  <col className="w-[10%] md:w-[12%] lg:w-[10%]" />
                  <col className="w-[10%] md:w-[11%] lg:w-[11%]" />
                </colgroup>
                <thead>
                  <tr className="text-left text-xs font-black uppercase tracking-wide text-gray-500">
                    <th className="px-3 py-3">
                      <SortHeader label="Estudiante" field="last_name" sort={sort} onSort={handleSort} />
                    </th>
                    <th className="hidden px-3 py-3 lg:table-cell">
                      <SortHeader label="Registro" field="created_at" sort={sort} onSort={handleSort} align="center" />
                    </th>
                    <th className="px-3 py-3">
                      <SortHeader label="Matrícula" field="enrollment" sort={sort} onSort={handleSort} align="center" />
                    </th>
                    <th className="hidden px-3 py-3 md:table-cell">
                      <SortHeader label="Ingreso" field="admission_year" sort={sort} onSort={handleSort} align="center" />
                    </th>
                    <th className="px-3 py-3 text-center">Avance</th>
                    <th className="px-3 py-3">
                      <SortHeader label="Estado" field="is_active" sort={sort} onSort={handleSort} align="center" />
                    </th>
                    <th className="px-3 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading && (
                    <tr>
                      <td colSpan="7" className="px-3 py-8 text-center font-semibold text-gray-500">
                        Cargando estudiantes...
                      </td>
                    </tr>
                  )}
                  {!loading && students.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-3 py-8 text-center font-semibold text-gray-500">
                        No hay estudiantes para los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                  {!loading && students.map((student) => {
                    const progress = getAcademicProgress(student);
                    const progressPercent = getProgressPercent(progress);

                    return (
                      <tr key={student.id} className="align-top">
                        <td className="min-w-0 px-3 py-4">
                          <p className="truncate font-black text-gray-900">{student.first_name} {student.last_name}</p>
                          <p className="truncate text-gray-500">{student.email}</p>
                        </td>
                        <td className="hidden px-3 py-4 text-center text-xs font-semibold text-gray-500 lg:table-cell">{formatDateTime(student.created_at)}</td>
                        <td className="break-all px-3 py-4 text-gray-600">{student.enrollment || '-'}</td>
                        <td className="hidden px-3 py-4 text-center text-gray-600 md:table-cell">{student.admission_year || '-'}</td>
                        <td className="px-2 py-4">
                          <button
                            type="button"
                            onClick={() => setProgressStudent(student)}
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-left transition hover:border-[#d22864] hover:bg-[#fff0f6]"
                            aria-label={`Ver avance académico de ${student.first_name} ${student.last_name}`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-black text-gray-900">
                                {progress.completed_count}/{progress.total_count}
                              </span>
                              <span className="truncate text-[11px] font-black text-[#d22864]">
                                Ver avance
                              </span>
                            </div>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className="h-full rounded-full bg-[#d22864]"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                            <p className="mt-1 truncate text-[11px] font-semibold text-gray-500">
                              {progress.current_type
                                ? `Actual: ${getShortPracticeType(progress.current_type)}`
                                : 'Sin práctica activa'}
                            </p>
                          </button>
                        </td>
                        <td className="px-2 py-4 text-center">
                          <span className={`inline-flex max-w-full justify-center rounded-full px-2 py-1 text-xs font-black ${student.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                            {student.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                          {student.must_change_password && (
                            <span className="mt-2 block truncate rounded-full bg-amber-50 px-2 py-1 text-xs font-black text-amber-700">
                              Activacion pendiente
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-4 text-center">
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => handleToggleStatus(student)}
                            className="max-w-full rounded-xl border border-gray-200 px-2 py-2 text-xs font-black text-gray-700 hover:border-[#d22864] hover:text-[#d22864] disabled:opacity-50"
                          >
                            {student.is_active ? 'Desactivar' : 'Reactivar'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-4 text-sm font-semibold text-gray-500 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Mostrando {start}-{end} de {total} · Página {currentPage} de {totalPages}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={offset === 0 || loading}
                  onClick={() => setOffset(0)}
                  className="rounded-xl border border-gray-200 px-4 py-2 font-bold text-gray-700 disabled:opacity-40"
                >
                  Inicio
                </button>
                <button
                  type="button"
                  disabled={offset === 0 || loading}
                  onClick={() => setOffset((current) => Math.max(0, current - PAGE_SIZE))}
                  className="rounded-xl border border-gray-200 px-4 py-2 font-bold text-gray-700 disabled:opacity-40"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={offset + PAGE_SIZE >= total || loading}
                  onClick={() => setOffset((current) => current + PAGE_SIZE)}
                  className="rounded-xl border border-gray-200 px-4 py-2 font-bold text-gray-700 disabled:opacity-40"
                >
                  Siguiente
                </button>
                <button
                  type="button"
                  disabled={offset + PAGE_SIZE >= total || loading}
                  onClick={() => setOffset((totalPages - 1) * PAGE_SIZE)}
                  className="rounded-xl border border-gray-200 px-4 py-2 font-bold text-gray-700 disabled:opacity-40"
                >
                  Última
                </button>
              </div>
            </div>
          </div>
        </section>

        <FormModal
          isOpen={isCreateModalOpen}
          title="Nuevo estudiante"
          description="La cuenta recibirá un enlace de activación en el correo registrado."
          icon={UserPlus}
          isBusy={saving}
          onClose={closeCreateModal}
        >
          <form onSubmit={handleCreateStudent}>
            {error && (
              <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <div className="grid gap-3">
              <input name="email" type="email" required value={form.email} onChange={handleFormChange} placeholder="Correo institucional o personal" className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864]" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input name="first_name" required value={form.first_name} onChange={handleFormChange} placeholder="Nombres" className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864]" />
                <input name="last_name" required value={form.last_name} onChange={handleFormChange} placeholder="Apellidos" className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864]" />
              </div>
              <div>
                <input
                  name="enrollment"
                  required
                  inputMode="numeric"
                  value={form.enrollment}
                  onChange={handleEnrollmentChange}
                  placeholder="Matrícula, ej: 12345678523"
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-[#d22864] ${
                    form.enrollment && !enrollmentDetails.isValid
                      ? 'border-red-200 bg-red-50'
                      : 'border-gray-200'
                  }`}
                />
                <p className={`mt-1 text-xs font-semibold ${
                  form.enrollment && !enrollmentDetails.isRutValid
                    ? 'text-red-600'
                    : 'text-gray-500'
                }`}>
                  RUT asociado: {enrollmentDetails.rut || 'se calculará automáticamente'}
                </p>
                <p className={`mt-1 text-xs font-semibold ${
                  form.enrollment && !enrollmentDetails.isAdmissionYearValid
                    ? 'text-red-600'
                    : 'text-gray-500'
                }`}>
                  Año de ingreso: {enrollmentDetails.admissionYear || 'se calculará automáticamente'}
                </p>
              </div>
              <input
                value={enrollmentDetails.admissionYear || ''}
                readOnly
                aria-label="Año de ingreso calculado"
                placeholder="Año de ingreso"
                className="cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 outline-none"
              />
              <input name="degree" value={form.degree} onChange={handleFormChange} placeholder="Carrera" className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864]" />
              <input name="cod_degree" value={form.cod_degree} onChange={handleFormChange} placeholder="Codigo de carrera" className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864]" />
              <button type="submit" disabled={saving} className="rounded-xl bg-[#d22864] px-4 py-3 text-sm font-black text-white hover:bg-[#b01e52] disabled:opacity-60">
                {saving ? 'Guardando...' : 'Crear estudiante'}
              </button>
            </div>
          </form>
        </FormModal>

        <FormModal
          isOpen={Boolean(progressStudent)}
          title="Avance académico"
          description={progressStudent ? `${progressStudent.first_name} ${progressStudent.last_name}` : ''}
          icon={BarChart3}
          onClose={() => setProgressStudent(null)}
        >
          {progressStudent && (() => {
            const progress = getAcademicProgress(progressStudent);
            const progressPercent = getProgressPercent(progress);

            return (
              <div className="space-y-5">
                <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-black text-gray-900">
                        {progress.completed_count} de {progress.total_count} prácticas completadas
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-500">
                        {progress.current_type
                          ? `${getShortPracticeType(progress.current_type)} · ${progress.current_status}`
                          : 'Sin práctica activa registrada'}
                      </p>
                    </div>
                    <span className="text-2xl font-black text-[#d22864]">{progressPercent}%</span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-[#d22864]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {progress.items.map((item) => (
                    <div
                      key={item.type}
                      className={`rounded-xl border px-4 py-4 ${
                        item.is_current
                          ? 'border-[#d22864]/40 bg-[#fff0f6]'
                          : 'border-gray-100 bg-white'
                      }`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="font-black text-gray-900">{item.type}</p>
                          <p className="mt-1 text-sm font-semibold text-gray-500">
                            Requisito académico: {item.requirement_status}
                          </p>
                          {item.internship_id && (
                            <p className="mt-1 text-sm font-semibold text-gray-500">
                              Solicitud #{item.internship_id}
                            </p>
                          )}
                        </div>
                        <span className={`inline-flex shrink-0 rounded-full border px-3 py-1 text-xs font-black ${getStatusPillClass(item.display_status)}`}>
                          {item.display_status}
                        </span>
                      </div>
                      {item.is_current && (
                        <p className="mt-3 text-xs font-black text-[#d22864]">
                          Práctica actual o siguiente paso sugerido.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </FormModal>
    </>
  );
};

export const StudentAccountsPage = () => (
  <div className="min-h-screen flex flex-col bg-gray-50">
    <UserHeader />
    <main className="flex-grow container mx-auto max-w-7xl px-4 py-8">
      <StudentAccountsPanel />
    </main>
    <Footer />
  </div>
);

export default StudentAccountsPage;

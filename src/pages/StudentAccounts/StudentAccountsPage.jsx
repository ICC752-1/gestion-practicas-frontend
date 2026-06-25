import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Search, UserPlus, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Footer } from '../../components/Footer/Footer';
import { UserHeader } from '../../components/Header/UserHeader';
import { useAuth } from '../../context/useAuth';
import { getAdminBasePathForRoles, getDisplayRoleForRoles } from '../../services/roleRouting';
import { studentAccountService } from '../../services/studentAccountService';

const PAGE_SIZE = 10;

const initialFilters = {
  search: '',
  is_active: '',
};

const initialForm = {
  email: '',
  first_name: '',
  last_name: '',
  rut: '',
  admission_year: '',
  degree: 'Ingenieria Civil Informatica',
  cod_degree: 'ICI',
};

const getErrorMessage = (error) => error?.response?.data?.detail || 'No se pudo completar la accion.';

const cleanRut = (value) => {
  const raw = value.replace(/[^0-9kK]/g, '').toUpperCase();
  if (!raw) return '';
  const verifier = raw.slice(-1);
  const number = (verifier === 'K' ? raw.slice(0, -1) : raw).replace(/\D/g, '');
  return `${number}${verifier === 'K' ? 'K' : ''}`;
};

const calculateRutVerifier = (number) => {
  let total = 0;
  let multiplier = 2;

  for (let index = number.length - 1; index >= 0; index -= 1) {
    total += Number(number[index]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (total % 11);
  if (remainder === 11) return '0';
  if (remainder === 10) return 'K';
  return String(remainder);
};

const formatRut = (value) => {
  const cleaned = cleanRut(value);
  if (cleaned.length <= 1) return cleaned;
  const number = cleaned.slice(0, -1);
  const verifier = cleaned.slice(-1);
  return `${Number(number).toLocaleString('es-CL')}-${verifier}`;
};

const isValidRut = (value) => {
  const cleaned = cleanRut(value);
  if (cleaned.length < 2) return false;
  const number = cleaned.slice(0, -1).replace(/^0+/, '');
  const verifier = cleaned.slice(-1);
  return Boolean(number) && /^\d+$/.test(number) && calculateRutVerifier(number) === verifier;
};

export const StudentAccountsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userName = user ? `${user.first_name} ${user.last_name}` : 'Administracion';
  const userRole = getDisplayRoleForRoles(user?.roles);
  const dashboardPath = getAdminBasePathForRoles(user?.roles);
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [form, setForm] = useState(initialForm);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = { limit: PAGE_SIZE, offset };
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
  }, [appliedFilters, offset]);

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

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleRutChange = (event) => {
    setForm((current) => ({ ...current, rut: formatRut(event.target.value) }));
  };

  const handleCreateStudent = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      if (!isValidRut(form.rut)) {
        setError('Ingresa un RUT valido con digito verificador correcto.');
        return;
      }

      const payload = {
        ...form,
        admission_year: form.admission_year ? Number(form.admission_year) : undefined,
        sexo: 'No definido',
      };

      await studentAccountService.createStudent(payload);
      setForm(initialForm);
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <UserHeader userName={userName} userRole={userRole} />

      <main className="flex-grow container mx-auto max-w-7xl px-4 py-8">
        <button
          type="button"
          onClick={() => navigate(dashboardPath)}
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-600 hover:border-[#d22864] hover:text-[#d22864]"
        >
          <ArrowLeft size={18} />
          Volver al dashboard
        </button>

        <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
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

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <form onSubmit={handleApplyFilters} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_140px]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Nombre, correo o RUT"
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

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead>
                  <tr className="text-left text-xs font-black uppercase tracking-wide text-gray-500">
                    <th className="px-3 py-3">Estudiante</th>
                    <th className="px-3 py-3">RUT</th>
                    <th className="px-3 py-3">Ingreso</th>
                    <th className="px-3 py-3">Estado</th>
                    <th className="px-3 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading && (
                    <tr>
                      <td colSpan="5" className="px-3 py-8 text-center font-semibold text-gray-500">
                        Cargando estudiantes...
                      </td>
                    </tr>
                  )}
                  {!loading && students.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-3 py-8 text-center font-semibold text-gray-500">
                        No hay estudiantes para los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                  {!loading && students.map((student) => (
                    <tr key={student.id} className="align-top">
                      <td className="px-3 py-4">
                        <p className="font-black text-gray-900">{student.first_name} {student.last_name}</p>
                        <p className="text-gray-500">{student.email}</p>
                      </td>
                      <td className="px-3 py-4 text-gray-600">{student.rut}</td>
                      <td className="px-3 py-4 text-gray-600">{student.admission_year || '-'}</td>
                      <td className="px-3 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-black ${student.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                          {student.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                        {student.must_change_password && (
                          <span className="mt-2 block rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                            Activacion pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-4">
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => handleToggleStatus(student)}
                          className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-black text-gray-700 hover:border-[#d22864] hover:text-[#d22864] disabled:opacity-50"
                        >
                          {student.is_active ? 'Desactivar' : 'Reactivar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-4 text-sm font-semibold text-gray-500 sm:flex-row sm:items-center sm:justify-between">
              <span>Mostrando {start}-{end} de {total}</span>
              <div className="flex gap-2">
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
              </div>
            </div>
          </div>

          <form onSubmit={handleCreateStudent} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff0f6] text-[#d22864]">
                <UserPlus size={22} />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">Nuevo estudiante</h2>
                <p className="text-sm text-gray-500">Recibira enlace de activacion por correo.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <input name="email" type="email" required value={form.email} onChange={handleFormChange} placeholder="Correo institucional o personal" className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864]" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input name="first_name" required value={form.first_name} onChange={handleFormChange} placeholder="Nombres" className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864]" />
                <input name="last_name" required value={form.last_name} onChange={handleFormChange} placeholder="Apellidos" className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864]" />
              </div>
              <div>
                <input
                  name="rut"
                  required
                  value={form.rut}
                  onChange={handleRutChange}
                  placeholder="RUT"
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-[#d22864] ${
                    form.rut && !isValidRut(form.rut) ? 'border-red-200 bg-red-50' : 'border-gray-200'
                  }`}
                />
                <p className={`mt-1 text-xs font-semibold ${form.rut && !isValidRut(form.rut) ? 'text-red-600' : 'text-gray-400'}`}>
                  {form.rut && !isValidRut(form.rut) ? 'RUT invalido o digito verificador incorrecto.' : 'Formato automatico: 12.345.678-5'}
                </p>
              </div>
              <input name="admission_year" type="number" min="1900" max="2100" value={form.admission_year} onChange={handleFormChange} placeholder="Ano de ingreso (opcional)" className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864]" />
              <input name="degree" value={form.degree} onChange={handleFormChange} placeholder="Carrera" className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864]" />
              <input name="cod_degree" value={form.cod_degree} onChange={handleFormChange} placeholder="Codigo de carrera" className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864]" />
              <button type="submit" disabled={saving} className="rounded-xl bg-[#d22864] px-4 py-3 text-sm font-black text-white hover:bg-[#b01e52] disabled:opacity-60">
                {saving ? 'Guardando...' : 'Crear estudiante'}
              </button>
            </div>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default StudentAccountsPage;

import { useCallback, useEffect, useState } from 'react';
import { UserHeader } from '../../components/Header/UserHeader';
import { Footer } from '../../components/Footer/Footer';
import { FormModal } from '../../components/common/FormModal';
import { useAuth } from '../../context/useAuth';
import { getDisplayRoleForRoles } from '../../services/roleRouting';
import { ArrowDown, ArrowDownUp, ArrowUp, Inbox, UserPlus } from 'lucide-react';
import {
  assignUserRole,
  createUser,
  listRoles,
  listUsers,
  removeUserRole,
  updateUser,
} from '../../services/superadminService';
import {
  analyzeEnrollment,
  cleanEnrollment,
  getEnrollmentError,
} from '../../utils/enrollment';

const PAGE_SIZE = 10;
const STUDENT_ROLE_NAME = 'Estudiante';

const initialFilters = {
  search: '',
  role: '',
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
  rut: '',
  enrollment: '',
  degree: 'Ingenieria Civil Informatica',
  cod_degree: 'ICI',
  role_ids: [],
};

const ERROR_TRANSLATIONS = {
  'Email already exists': 'El correo ya existe.',
  'RUT already exists': 'El RUT ya existe.',
  'Enrollment already exists': 'La matrícula ya está registrada.',
  'Enrollment is required for student accounts': 'La matrícula es obligatoria para estudiantes.',
  'User not found': 'No se encontró el usuario.',
  'Role not found': 'No se encontró el rol.',
};

const getErrorMessage = (error) => {
  const detail = error?.response?.data?.detail;
  if (typeof detail === 'string') {
    return ERROR_TRANSLATIONS[detail] || detail;
  }
  return detail?.message || 'No se pudo completar la acción.';
};

const cleanRut = (value) => {
  const raw = value.replace(/[^0-9kK]/g, '').toUpperCase();

  if (!raw) {
    return '';
  }

  const lastCharacter = raw.slice(-1);
  const number = (
    lastCharacter === 'K' ? raw.slice(0, -1) : raw
  ).replace(/\D/g, '');

  return `${number}${lastCharacter === 'K' ? 'K' : ''}`;
};

const calculateRutVerifier = (number) => {
  let total = 0;
  let multiplier = 2;

  for (let index = number.length - 1; index >= 0; index -= 1) {
    total += Number(number[index]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (total % 11);

  if (remainder === 11) {
    return '0';
  }
  if (remainder === 10) {
    return 'K';
  }
  return String(remainder);
};

const formatRut = (value) => {
  const cleaned = cleanRut(value);

  if (cleaned.length <= 1) {
    return cleaned;
  }

  const number = cleaned.slice(0, -1);
  const verifier = cleaned.slice(-1);
  const formattedNumber = Number(number).toLocaleString('es-CL');

  return `${formattedNumber}-${verifier}`;
};

const isValidRut = (value) => {
  const cleaned = cleanRut(value);

  if (cleaned.length < 2) {
    return false;
  }

  const number = cleaned.slice(0, -1).replace(/^0+/, '');
  const verifier = cleaned.slice(-1);

  if (!number || !/^\d+$/.test(number)) {
    return false;
  }

  return calculateRutVerifier(number) === verifier;
};

const formatDateTime = (value) => {
  if (!value) return '-';

  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value.endsWith?.('Z') ? value : `${value}Z`));
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
        'inline-flex w-full items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-black uppercase tracking-wider transition-colors',
        align === 'center' ? 'justify-center text-center' : 'justify-start text-left',
        isActive ? 'text-[#d22864]' : 'text-gray-500 hover:bg-white hover:text-[#d22864]',
      ].join(' ')}
      aria-sort={isActive ? (sort.sort_dir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <span>{label}</span>
      <Icon size={14} strokeWidth={2.6} />
    </button>
  );
};

export const SuperadminUsersPanel = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
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
  const [statusConfirmationUser, setStatusConfirmationUser] = useState(null);
  const [roleRemovalConfirmation, setRoleRemovalConfirmation] = useState(null);
  const selectedRoleNames = roles
    .filter((role) => form.role_ids.includes(role.id))
    .map((role) => role.name);
  const isStudentSelected = selectedRoleNames.includes(STUDENT_ROLE_NAME);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        limit: PAGE_SIZE,
        offset,
        sort_by: sort.sort_by,
        sort_dir: sort.sort_dir,
      };

      if (appliedFilters.search) {
        params.search = appliedFilters.search;
      }
      if (appliedFilters.role) {
        params.role = appliedFilters.role;
      }
      if (appliedFilters.is_active !== '') {
        params.is_active = appliedFilters.is_active === 'true';
      }

      const data = await listUsers(params);
      setUsers(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, offset, sort]);

  useEffect(() => {
    let ignore = false;

    const loadInitialData = async () => {
      try {
        const roleData = await listRoles();
        if (!ignore) {
          setRoles(roleData);
        }
      } catch (err) {
        if (!ignore) {
          setError(getErrorMessage(err));
        }
      }
    };

    loadInitialData();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadUsers();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadUsers]);

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

  const handleRutChange = (event) => {
    const formattedRut = formatRut(event.target.value);
    setForm((current) => ({ ...current, rut: formattedRut }));
  };

  const handleEnrollmentChange = (event) => {
    setForm((current) => ({
      ...current,
      enrollment: cleanEnrollment(event.target.value),
    }));
  };

  const handleRoleToggle = (roleId) => {
    setForm((current) => {
      const hasRole = current.role_ids.includes(roleId);
      return {
        ...current,
        role_ids: hasRole
          ? current.role_ids.filter((id) => id !== roleId)
          : [...current.role_ids, roleId],
      };
    });
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      let payload;

      if (isStudentSelected) {
        const enrollmentError = getEnrollmentError(form.enrollment);
        if (enrollmentError) {
          setError(enrollmentError);
          return;
        }

        payload = { ...form, rut: undefined };
      } else {
        if (!isValidRut(form.rut)) {
          setError('Ingresa un RUT válido con dígito verificador correcto.');
          return;
        }

        payload = {
          ...form,
          enrollment: undefined,
          degree: undefined,
          cod_degree: undefined,
        };
      }

      await createUser(payload);
      setForm(initialForm);
      setIsCreateModalOpen(false);
      setMessage('Usuario creado correctamente. Se envió el enlace de activación al correo registrado.');
      setOffset(0);
      await loadUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleRequestToggleUserStatus = (targetUser) => {
    setStatusConfirmationUser(targetUser);
    setError('');
    setMessage('');
  };

  const handleCancelToggleUserStatus = () => {
    if (!saving) {
      setStatusConfirmationUser(null);
    }
  };

  const handleConfirmToggleUserStatus = async () => {
    if (!statusConfirmationUser) {
      return;
    }

    const targetUser = statusConfirmationUser;
    const nextStatus = !targetUser.is_active;

    setSaving(true);
    setError('');
    setMessage('');

    try {
      await updateUser(targetUser.id, { is_active: nextStatus });
      setMessage(`Usuario ${nextStatus ? 'reactivado' : 'desactivado'}.`);
      setStatusConfirmationUser(null);
      await loadUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleAddRole = async (targetUser, roleId) => {
    if (!roleId) {
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      await assignUserRole(targetUser.id, Number(roleId));
      setMessage('Rol asignado correctamente.');
      await loadUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleRequestRemoveRole = (targetUser, role) => {
    const roleData = roles.find((item) => item.name === role);
    if (!roleData) {
      return;
    }

    setRoleRemovalConfirmation({ targetUser, role, roleId: roleData.id });
    setError('');
    setMessage('');
  };

  const handleCancelRemoveRole = () => {
    if (!saving) {
      setRoleRemovalConfirmation(null);
    }
  };

  const handleConfirmRemoveRole = async () => {
    if (!roleRemovalConfirmation) {
      return;
    }

    const { targetUser, roleId } = roleRemovalConfirmation;

    setSaving(true);
    setError('');
    setMessage('');

    try {
      await removeUserRole(targetUser.id, roleId);
      setMessage('Rol retirado correctamente.');
      setRoleRemovalConfirmation(null);
      await loadUsers();
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

  // CLASE DE REJILLA UNIFICADA: Controla anchos y espaciados de la tabla de forma fluida
  const gridLayoutClass = "grid grid-cols-[1.6fr_1fr_0.9fr_0.9fr_1.3fr_0.85fr] items-center gap-4 px-6 py-4 w-full";

  return (
    <>
        {/* Cabecera / Banner */}
        <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-[#d22864]">Superadmin</p>
              <h1 className="mt-2 text-3xl font-black text-gray-900">Administración de usuarios</h1>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Gestiona cuentas y roles técnicos sin conceder permisos académicos implícitos.
                Las cuentas nuevas reciben un enlace de activación de un solo uso para definir su contraseña.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#d22864] px-5 py-3 text-sm font-black text-white transition hover:bg-[#b01e52]"
            >
              <UserPlus size={18} />
              Crear usuario
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

        {/* Sección de tabla */}
        <section className="mt-6">
          <div className="flex flex-col justify-between rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            
            {/* Barra de Filtros */}
            <form onSubmit={handleApplyFilters} className="grid gap-3 md:grid-cols-4">
              <div className="relative flex items-center">
                <input
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Nombre, correo, RUT o matrícula"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864]"
                />
              </div>
              <select
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864] cursor-pointer bg-white"
              >
                <option value="">Todos los roles</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.name}>{role.name}</option>
                ))}
              </select>
              <select
                name="is_active"
                value={filters.is_active}
                onChange={handleFilterChange}
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864] cursor-pointer bg-white"
              >
                <option value="">Todos los estados</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
              <button
                type="submit"
                className="rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white hover:bg-gray-800 transition-colors cursor-pointer"
              >
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

            {/* Contenedor de Tabla Fluid / Responsive sin Scroll Horizontal */}
            <div className="w-full mt-6 rounded-xl border border-gray-100 overflow-hidden bg-white">
              <div className="w-full table-layout-fixed">
                
                {/* Cabecera Grid de la Tabla */}
                <div className={`${gridLayoutClass} bg-gray-50/70 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider`}>
                  <SortHeader label="Usuario" field="last_name" sort={sort} onSort={handleSort} />
                  <SortHeader label="Registro" field="created_at" sort={sort} onSort={handleSort} align="center" />
                  <SortHeader label="Identificación" field="rut" sort={sort} onSort={handleSort} align="center" />
                  <SortHeader label="Estado" field="is_active" sort={sort} onSort={handleSort} align="center" />
                  <div className="text-center">Roles</div>
                  <div className="text-center">Acciones</div>
                </div>

                {/* Cuerpo Grid de la Tabla */}
                <div className="divide-y divide-gray-100">
                  {loading && (
                    <div className="p-12 text-center font-semibold text-gray-500 text-sm">
                      Cargando usuarios...
                    </div>
                  )}
                  
                  {!loading && users.length === 0 && (
                    <div className="p-12 text-center font-semibold text-gray-500 text-sm flex flex-col items-center gap-2">
                      <Inbox className="text-gray-300 w-8 h-8" />
                      <span>No hay usuarios para los filtros seleccionados.</span>
                    </div>
                  )}

                  {!loading && users.map((item) => (
                    <div key={item.id} className={`${gridLayoutClass} hover:bg-gray-50/40 transition-colors min-w-0`}>
                      
                      {/* Celda: Usuario */}
                      <div className="min-w-0 flex flex-col">
                        <span className="font-bold text-gray-900 text-sm truncate">{item.first_name} {item.last_name}</span>
                        <span className="text-xs text-gray-400 font-medium truncate mt-0.5">{item.email}</span>
                      </div>

                      {/* Celda: Registro (Centrado) */}
                      <div className="text-center text-xs text-gray-500 font-semibold min-w-0">
                        {formatDateTime(item.created_at)}
                      </div>

                      {/* Celda: identificación (Centrado) */}
                      <div className="text-center text-sm text-gray-600 font-medium truncate min-w-0">
                        {item.roles?.includes(STUDENT_ROLE_NAME) && item.enrollment
                          ? item.enrollment
                          : (item.rut || 'N/A')}
                      </div>

                      {/* Celda: Estado (Centrado) */}
                      <div className="flex flex-col items-center justify-center min-w-0 w-full gap-1">
                        <span className={`rounded-full px-3 py-1 text-[10px] font-bold shadow-sm inline-block min-w-[75px] text-center ${item.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-gray-100 text-gray-500'}`}>
                          {item.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                        {item.must_change_password && (
                          <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-center max-w-full truncate border border-amber-100">
                            Contraseña temporal
                          </span>
                        )}
                      </div>

                      {/* Celda: Roles (Centrado) */}
                      <div className="flex flex-col items-center justify-center min-w-0 w-full">
                        <div className="flex flex-wrap gap-1 justify-center max-h-[55px] overflow-y-auto w-full px-1">
                          {(item.roles || []).map((role) => (
                            <button
                              key={role}
                              type="button"
                              disabled={saving}

                              onClick={() => handleRequestRemoveRole(item, role)}
                              className="rounded-full border border-gray-100 bg-gray-50/80 px-2 py-0.5 text-[10px] font-bold text-gray-600 hover:border-red-200 hover:text-red-600 transition-all cursor-pointer flex-shrink-0"

                              title="Retirar rol"
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                        
                        <select
                          defaultValue=""
                          disabled={saving}
                          onChange={(event) => {
                            handleAddRole(item, event.target.value);
                            event.target.value = '';
                          }}
                          className="mt-2 w-full max-w-[130px] rounded-lg border border-gray-200 px-2 py-1 text-[12px] font-semibold outline-none focus:border-[#d22864] bg-white cursor-pointer"
                        >
                          <option value="">Asignar rol</option>
                          {roles
                            .filter((role) => !(item.roles || []).includes(role.name))
                            .map((role) => (
                              <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                        </select>
                      </div>

                      {/* Celda: Acciones (Centrado) */}
                      <div className="text-center min-w-0">
                        <button
                          type="button"
                          disabled={saving}
                          
                          onClick={() => handleRequestToggleUserStatus(item)}
                          className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-700 hover:border-[#d22864] hover:text-[#d22864] disabled:opacity-50 transition-all cursor-pointer whitespace-nowrap"
                        >
                          {item.is_active ? 'Desactivar' : 'Reactivar'}
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* Paginación */}
            <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-4 text-sm font-semibold text-gray-500 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Mostrando {start}-{end} de {total} · Página {currentPage} de {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={offset === 0 || loading}
                  onClick={() => setOffset(0)}
                  className="rounded-xl border border-gray-200 px-4 py-2 font-bold text-gray-700 disabled:opacity-40 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  Inicio
                </button>
                <button
                  type="button"
                  disabled={offset === 0 || loading}
                  onClick={() => setOffset((current) => Math.max(0, current - PAGE_SIZE))}
                  className="rounded-xl border border-gray-200 px-4 py-2 font-bold text-gray-700 disabled:opacity-40 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={offset + PAGE_SIZE >= total || loading}
                  onClick={() => setOffset((current) => current + PAGE_SIZE)}
                  className="rounded-xl border border-gray-200 px-4 py-2 font-bold text-gray-700 disabled:opacity-40 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  Siguiente
                </button>
                <button
                  type="button"
                  disabled={offset + PAGE_SIZE >= total || loading}
                  onClick={() => setOffset((totalPages - 1) * PAGE_SIZE)}
                  className="rounded-xl border border-gray-200 px-4 py-2 font-bold text-gray-700 disabled:opacity-40 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  Última
                </button>
              </div>
            </div>
          </div>

        </section>

        <FormModal
          isOpen={isCreateModalOpen}
          title="Crear usuario"
          description="El sistema enviará un enlace de activación para que el usuario defina su contraseña."
          icon={UserPlus}
          isBusy={saving}
          onClose={closeCreateModal}
        >
          <form onSubmit={handleCreateUser}>
            {error && (
              <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}
            <div className="grid gap-3">
              <input 
                name="email" 
                type="email" 
                required 
                value={form.email} 
                onChange={handleFormChange} 
                placeholder="Correo electrónico" 
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864]" 
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input name="first_name" required value={form.first_name} onChange={handleFormChange} placeholder="Nombres" className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864]" />
                <input name="last_name" required value={form.last_name} onChange={handleFormChange} placeholder="Apellidos" className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864]" />
              </div>
              
              {isStudentSelected ? (
                <>
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
                  <input
                    name="degree"
                    value={form.degree}
                    onChange={handleFormChange}
                    placeholder="Carrera"
                    className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864]"
                  />
                  <input
                    name="cod_degree"
                    value={form.cod_degree}
                    onChange={handleFormChange}
                    placeholder="Código de carrera"
                    className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864]"
                  />
                </>
              ) : (
                <div>
                  <input
                    name="rut"
                    required
                    value={form.rut}
                    onChange={handleRutChange}
                    placeholder="RUT"
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-[#d22864] ${
                      form.rut && !isValidRut(form.rut)
                        ? 'border-red-200 bg-red-50'
                        : 'border-gray-200'
                    }`}
                  />
                  <p
                    className={`mt-1 text-xs font-semibold ${
                      form.rut && !isValidRut(form.rut)
                        ? 'text-red-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {form.rut && !isValidRut(form.rut)
                      ? 'RUT inválido o dígito verificador incorrecto.'
                      : 'Formato automático: 12.345.678-5'}
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-gray-100 p-4 bg-gray-50/50">
                <p className="text-xs font-black uppercase tracking-wide text-gray-500">Roles iniciales</p>
                <p className="mt-1 text-xs font-semibold text-gray-400">
                  {form.role_ids.length === 0
                    ? 'Sin roles seleccionados'
                    : `${form.role_ids.length} rol(es) seleccionado(s)`}
                </p>
                <div className="mt-3 grid gap-2 max-h-[200px] overflow-y-auto pr-1">
                  {roles.map((role) => {
                    const isSelected = form.role_ids.includes(role.id);

                    return (
                      <button
                        key={role.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => handleRoleToggle(role.id)}
                        className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-bold transition-all ${
                          isSelected
                            ? 'border-[#d22864] bg-[#fff0f6] text-[#8B1D46] shadow-sm ring-2 ring-[#d22864]/10'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-[#d22864]/50 hover:bg-gray-50'
                        }`}
                      >
                        <span>{role.name}</span>
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full border text-xs ${
                            isSelected
                              ? 'border-[#d22864] bg-[#d22864] text-white'
                              : 'border-gray-300 bg-white text-transparent'
                          }`}
                        >
                          ✓
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#d22864] px-4 py-3 text-sm font-black text-white hover:bg-[#b01e52] disabled:opacity-60 transition-colors cursor-pointer"
              >
                {saving ? 'Guardando...' : 'Crear usuario'}
              </button>
            </div>
          </form>
        </FormModal>

      {statusConfirmationUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <p className="text-sm font-black uppercase tracking-wider text-[#d22864]">
              Confirmar cambio de estado
            </p>
            <h2 className="mt-3 text-2xl font-black text-gray-900">
              {statusConfirmationUser.is_active ? 'Desactivar usuario' : 'Reactivar usuario'}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              {statusConfirmationUser.is_active
                ? 'El usuario no podrá acceder al sistema mientras su cuenta permanezca inactiva.'
                : 'El usuario recuperará el acceso al sistema si sus credenciales están vigentes.'}
            </p>
            <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="font-black text-gray-900">
                {statusConfirmationUser.first_name} {statusConfirmationUser.last_name}
              </p>
              <p className="text-sm font-semibold text-gray-500">{statusConfirmationUser.email}</p>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={handleCancelToggleUserStatus}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-black text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleConfirmToggleUserStatus}
                className={`rounded-xl px-5 py-3 text-sm font-black text-white disabled:opacity-60 ${
                  statusConfirmationUser.is_active
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-[#d22864] hover:bg-[#b01e52]'
                }`}
              >
                {saving
                  ? 'Guardando...'
                  : statusConfirmationUser.is_active
                    ? 'Desactivar usuario'
                    : 'Reactivar usuario'}
              </button>
            </div>
          </div>
        </div>
      )}

      {roleRemovalConfirmation && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <p className="text-sm font-black uppercase tracking-wider text-[#d22864]">
              Confirmar cambio de rol
            </p>
            <h2 className="mt-3 text-2xl font-black text-gray-900">
              Retirar rol
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              El usuario perderá los permisos asociados a este rol inmediatamente después de confirmar la acción.
            </p>
            <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="font-black text-gray-900">
                {roleRemovalConfirmation.targetUser.first_name} {roleRemovalConfirmation.targetUser.last_name}
              </p>
              <p className="text-sm font-semibold text-gray-500">{roleRemovalConfirmation.targetUser.email}</p>
              <span className="mt-3 inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-600">
                {roleRemovalConfirmation.role}
              </span>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={handleCancelRemoveRole}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-black text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleConfirmRemoveRole}
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white hover:bg-red-700 disabled:opacity-60"
              >
                {saving ? 'Guardando...' : 'Retirar rol'}
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export const SuperadminUsersPage = () => {
  const { user } = useAuth();
  const userName = user ? `${user.first_name} ${user.last_name}` : 'Superadmin';
  const userRole = getDisplayRoleForRoles(user?.roles);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <UserHeader userName={userName} userRole={userRole} />
      <main className="flex-grow container mx-auto max-w-7xl px-4 py-8">
        <SuperadminUsersPanel />
      </main>
      <Footer />
    </div>
  );
};

export default SuperadminUsersPage;

import { useCallback, useEffect, useState } from 'react';
import { UserHeader } from '../../components/Header/UserHeader';
import { Footer } from '../../components/Footer/Footer';
import { useAuth } from '../../context/useAuth';
import { getDisplayRoleForRoles } from '../../services/roleRouting';
import {
  assignUserRole,
  createUser,
  listRoles,
  listUsers,
  removeUserRole,
  updateUser,
} from '../../services/superadminService';

const PAGE_SIZE = 10;

const initialFilters = {
  search: '',
  role: '',
  is_active: '',
};

const initialForm = {
  email: '',
  password: '',
  first_name: '',
  last_name: '',
  rut: '',
  role_ids: [],
};

const getErrorMessage = (error) => {
  return error?.response?.data?.detail || 'No se pudo completar la acción.';
};

export const SuperadminUsersPage = () => {
  const { user } = useAuth();
  const userName = user ? `${user.first_name} ${user.last_name}` : 'Superadmin';
  const userRole = getDisplayRoleForRoles(user?.roles);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [form, setForm] = useState(initialForm);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        limit: PAGE_SIZE,
        offset,
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
  }, [appliedFilters, offset]);

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

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
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
      await createUser(form);
      setForm(initialForm);
      setMessage('Usuario creado correctamente.');
      setOffset(0);
      await loadUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleUserStatus = async (targetUser) => {
    const nextStatus = !targetUser.is_active;
    const action = nextStatus ? 'reactivar' : 'desactivar';

    if (!window.confirm(`¿Confirmas ${action} a ${targetUser.email}?`)) {
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      await updateUser(targetUser.id, { is_active: nextStatus });
      setMessage(`Usuario ${nextStatus ? 'reactivado' : 'desactivado'}.`);
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

  const handleRemoveRole = async (targetUser, role) => {
    const roleData = roles.find((item) => item.name === role);
    if (!roleData) {
      return;
    }

    if (!window.confirm(`¿Confirmas retirar el rol ${role} de ${targetUser.email}?`)) {
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      await removeUserRole(targetUser.id, roleData.id);
      setMessage('Rol retirado correctamente.');
      await loadUsers();
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
        <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wider text-[#d22864]">Superadmin</p>
          <h1 className="mt-3 text-3xl font-black text-gray-900">Administración de usuarios</h1>
          <p className="mt-4 text-gray-600">
            Gestiona cuentas y roles técnicos sin conceder permisos académicos implícitos.
            Al desactivar una cuenta se bloquean nuevas sesiones y refresh tokens.
          </p>
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
            <form onSubmit={handleApplyFilters} className="grid gap-3 md:grid-cols-4">
              <input
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Nombre, correo o RUT"
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864]"
              />
              <select
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864]"
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
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864]"
              >
                <option value="">Todos los estados</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
              <button
                type="submit"
                className="rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white hover:bg-gray-800"
              >
                Filtrar
              </button>
            </form>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead>
                  <tr className="text-left text-xs font-black uppercase tracking-wide text-gray-500">
                    <th className="px-3 py-3">Usuario</th>
                    <th className="px-3 py-3">RUT</th>
                    <th className="px-3 py-3">Estado</th>
                    <th className="px-3 py-3">Roles</th>
                    <th className="px-3 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading && (
                    <tr>
                      <td colSpan="5" className="px-3 py-8 text-center font-semibold text-gray-500">
                        Cargando usuarios...
                      </td>
                    </tr>
                  )}
                  {!loading && users.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-3 py-8 text-center font-semibold text-gray-500">
                        No hay usuarios para los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                  {!loading && users.map((item) => (
                    <tr key={item.id} className="align-top">
                      <td className="px-3 py-4">
                        <p className="font-black text-gray-900">{item.first_name} {item.last_name}</p>
                        <p className="text-gray-500">{item.email}</p>
                      </td>
                      <td className="px-3 py-4 text-gray-600">{item.rut}</td>
                      <td className="px-3 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-black ${item.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                          {item.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex max-w-xs flex-wrap gap-2">
                          {(item.roles || []).map((role) => (
                            <button
                              key={role}
                              type="button"
                              disabled={saving}
                              onClick={() => handleRemoveRole(item, role)}
                              className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-bold text-gray-700 hover:border-red-200 hover:text-red-600"
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
                          className="mt-3 w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold outline-none focus:border-[#d22864]"
                        >
                          <option value="">Asignar rol</option>
                          {roles
                            .filter((role) => !(item.roles || []).includes(role.name))
                            .map((role) => (
                              <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                        </select>
                      </td>
                      <td className="px-3 py-4">
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => handleToggleUserStatus(item)}
                          className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-black text-gray-700 hover:border-[#d22864] hover:text-[#d22864] disabled:opacity-50"
                        >
                          {item.is_active ? 'Desactivar' : 'Reactivar'}
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

          <form onSubmit={handleCreateUser} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-gray-900">Crear usuario</h2>
            <p className="mt-2 text-sm text-gray-500">
              Usa una credencial temporal y solicita cambio posterior fuera de este panel.
            </p>
            <div className="mt-5 grid gap-3">
              <input name="email" type="email" required value={form.email} onChange={handleFormChange} placeholder="Correo" className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864]" />
              <input name="password" type="password" required minLength="8" value={form.password} onChange={handleFormChange} placeholder="Credencial temporal" className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864]" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input name="first_name" required value={form.first_name} onChange={handleFormChange} placeholder="Nombres" className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864]" />
                <input name="last_name" required value={form.last_name} onChange={handleFormChange} placeholder="Apellidos" className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864]" />
              </div>
              <input name="rut" required value={form.rut} onChange={handleFormChange} placeholder="RUT" className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864]" />
              <div className="rounded-2xl border border-gray-100 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-gray-500">Roles iniciales</p>
                <div className="mt-3 grid gap-2">
                  {roles.map((role) => (
                    <label key={role.id} className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                      <input
                        type="checkbox"
                        checked={form.role_ids.includes(role.id)}
                        onChange={() => handleRoleToggle(role.id)}
                      />
                      {role.name}
                    </label>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#d22864] px-4 py-3 text-sm font-black text-white hover:bg-[#b01e52] disabled:opacity-60"
              >
                {saving ? 'Guardando...' : 'Crear usuario'}
              </button>
            </div>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SuperadminUsersPage;

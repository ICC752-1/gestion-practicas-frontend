import { useCallback, useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Inbox,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import { auditService } from '../../services/auditService';

const PAGE_SIZE = 15;

const initialFilters = {
  date_from: '',
  date_to: '',
  action: '',
  entity: '',
  actor_id: '',
  entity_id: '',
  search: '',
  without_actor: false,
};

const actionOptions = ['INSERT', 'UPDATE', 'DELETE'];

const entityOptions = [
  'Usuario',
  'Práctica',
  'Documento',
  'Presentación',
  'Estado',
  'Rol',
  'Configuración',
  'Autoevaluación',
  'Portabilidad',
];

const getErrorMessage = (error) => error?.response?.data?.detail || 'No se pudo cargar la auditoría.';

const formatDateTime = (value) => {
  if (!value) {
    return 'Sin fecha';
  }

  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
};

const getActorLabel = (actor) => {
  if (!actor) {
    return 'Sistema/no capturado';
  }

  return actor.name || actor.email || `Usuario #${actor.id}`;
};

const formatJson = (value) => {
  if (value === null || value === undefined) {
    return 'Sin datos';
  }

  return JSON.stringify(value, null, 2);
};

const StatCard = ({ title, value, helper }) => (
  <article className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
    <p className="text-xs font-black uppercase tracking-wide text-gray-500">{title}</p>
    <p className="mt-3 text-3xl font-black text-gray-900">{value}</p>
    <p className="mt-2 text-xs font-semibold text-gray-500">{helper}</p>
  </article>
);

export const SuperadminAuditPanel = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await auditService.listEvents({
        ...appliedFilters,
        limit: PAGE_SIZE,
        offset,
      });
      setEvents(data.items || []);
      setStats(data.stats || null);
      setTotal(data.total || 0);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, offset]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadEvents();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadEvents]);

  const handleFilterChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFilters((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleApplyFilters = (event) => {
    event.preventDefault();
    setOffset(0);
    setAppliedFilters(filters);
  };

  const handleReset = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setOffset(0);
  };

  const handleOpenDetail = async (eventId) => {
    setSelectedEvent(null);
    setDetailError('');
    setDetailLoading(true);

    try {
      const data = await auditService.getEvent(eventId);
      setSelectedEvent(data);
    } catch (err) {
      setDetailError(getErrorMessage(err));
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    if (!detailLoading) {
      setSelectedEvent(null);
      setDetailError('');
    }
  };

  const start = total === 0 ? 0 : offset + 1;
  const end = Math.min(offset + PAGE_SIZE, total);
  const byAction = stats?.by_action || {};

  return (
    <>
      <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wider text-[#d22864]">Superadmin</p>
        <h1 className="mt-2 text-3xl font-black text-gray-900">Auditoría del sistema</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          Consulta eventos técnicos y funcionales generados por acciones críticas del sistema.
          Los valores sensibles se muestran sanitizados desde el backend.
        </p>
      </section>

      <form onSubmit={handleApplyFilters} className="mt-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <input
            name="date_from"
            type="date"
            value={filters.date_from}
            onChange={handleFilterChange}
            className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864]"
            aria-label="Fecha desde"
          />
          <input
            name="date_to"
            type="date"
            value={filters.date_to}
            onChange={handleFilterChange}
            className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864]"
            aria-label="Fecha hasta"
          />
          <select
            name="action"
            value={filters.action}
            onChange={handleFilterChange}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#d22864]"
          >
            <option value="">Todas las acciones</option>
            {actionOptions.map((action) => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
          <select
            name="entity"
            value={filters.entity}
            onChange={handleFilterChange}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#d22864]"
          >
            <option value="">Todas las entidades</option>
            {entityOptions.map((entity) => (
              <option key={entity} value={entity}>{entity}</option>
            ))}
          </select>
          <input
            name="actor_id"
            type="number"
            min="1"
            value={filters.actor_id}
            onChange={handleFilterChange}
            placeholder="ID actor"
            className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864]"
          />
          <input
            name="entity_id"
            type="number"
            min="1"
            value={filters.entity_id}
            onChange={handleFilterChange}
            placeholder="ID recurso"
            className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864]"
          />
          <input
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Buscar en descripción"
            className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864] lg:col-span-2"
          />
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="inline-flex items-center gap-3 text-sm font-bold text-gray-600">
            <input
              name="without_actor"
              type="checkbox"
              checked={filters.without_actor}
              onChange={handleFilterChange}
              className="h-4 w-4 accent-[#d22864]"
            />
            Solo eventos sin actor capturado
          </label>

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-black text-gray-700 hover:bg-gray-50"
            >
              <RotateCcw size={16} strokeWidth={2.5} />
              Limpiar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-[#d22864] px-5 py-3 text-sm font-black text-white hover:bg-[#b01e52] disabled:opacity-50"
            >
              <Filter size={16} strokeWidth={2.5} />
              {loading ? 'Cargando...' : 'Aplicar filtros'}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Eventos filtrados" value={stats?.total ?? 0} helper="Total según filtros activos." />
        <StatCard title="Últimas 24 horas" value={stats?.last_24_hours ?? 0} helper="Actividad reciente dentro del alcance filtrado." />
        <StatCard
          title="Por acción"
          value={`${byAction.INSERT || 0}/${byAction.UPDATE || 0}/${byAction.DELETE || 0}`}
          helper="INSERT / UPDATE / DELETE."
        />
        <StatCard title="Sin actor" value={stats?.without_actor ?? 0} helper="Eventos generados sin user_id capturado." />
      </section>

      <section className="mt-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900">Eventos registrados</h2>
            <p className="text-sm font-semibold text-gray-500">Mostrando {start}-{end} de {total}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={offset === 0 || loading}
              onClick={() => setOffset((current) => Math.max(0, current - PAGE_SIZE))}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-black text-gray-700 disabled:opacity-40 hover:bg-gray-50"
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
              Anterior
            </button>
            <button
              type="button"
              disabled={offset + PAGE_SIZE >= total || loading}
              onClick={() => setOffset((current) => current + PAGE_SIZE)}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-black text-gray-700 disabled:opacity-40 hover:bg-gray-50"
            >
              Siguiente
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-gray-100">
          <div className="min-w-[1080px]">
            <div className="grid grid-cols-[1fr_0.7fr_0.9fr_0.7fr_1.25fr_1.4fr_1.3fr_0.6fr] gap-4 bg-gray-50 px-5 py-3 text-xs font-black uppercase tracking-wide text-gray-500">
              <div>Fecha</div>
              <div>Acción</div>
              <div>Entidad</div>
              <div>Recurso</div>
              <div>Actor</div>
              <div>Descripción</div>
              <div>Campos</div>
              <div className="text-right">Detalle</div>
            </div>

            <div className="divide-y divide-gray-100">
              {loading && (
                <div className="p-10 text-center text-sm font-bold text-gray-500">
                  Cargando eventos...
                </div>
              )}

              {!loading && events.length === 0 && (
                <div className="flex flex-col items-center gap-2 p-10 text-center text-sm font-bold text-gray-500">
                  <Inbox className="h-8 w-8 text-gray-300" />
                  <span>No hay eventos para los filtros seleccionados.</span>
                </div>
              )}

              {!loading && events.map((event) => (
                <div
                  key={event.id}
                  className="grid grid-cols-[1fr_0.7fr_0.9fr_0.7fr_1.25fr_1.4fr_1.3fr_0.6fr] items-center gap-4 px-5 py-4 text-sm"
                >
                  <div className="font-bold text-gray-700">{formatDateTime(event.timestamp)}</div>
                  <div>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-black text-gray-700">{event.action}</span>
                  </div>
                  <div className="font-bold text-gray-700">{event.entity}</div>
                  <div className="font-semibold text-gray-500">#{event.entity_id}</div>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-gray-800">{getActorLabel(event.actor)}</p>
                    {event.actor?.email && <p className="truncate text-xs font-semibold text-gray-400">{event.actor.email}</p>}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-600">{event.description}</p>
                  </div>
                  <div className="flex max-h-16 flex-wrap gap-1 overflow-hidden">
                    {(event.changed_fields || []).slice(0, 5).map((field) => (
                      <span key={field} className="rounded-full bg-[#fff0f6] px-2 py-1 text-[10px] font-black text-[#8B1D46]">
                        {field}
                      </span>
                    ))}
                    {(event.changed_fields || []).length === 0 && (
                      <span className="text-xs font-semibold text-gray-400">Sin campos visibles</span>
                    )}
                  </div>
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(event.id)}
                      className="inline-flex items-center justify-end gap-1 rounded-xl border border-gray-200 px-3 py-2 text-xs font-black text-gray-700 hover:border-[#d22864] hover:text-[#d22864]"
                    >
                      <Eye size={14} strokeWidth={2.5} />
                      Ver
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {(detailLoading || detailError || selectedEvent) && (
        <div className="fixed inset-0 z-[60] flex justify-end bg-black/40">
          <aside className="h-full w-full max-w-3xl overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-wider text-[#d22864]">Detalle de auditoría</p>
                <h2 className="mt-2 text-2xl font-black text-gray-900">
                  {selectedEvent ? `${selectedEvent.entity} #${selectedEvent.entity_id}` : 'Cargando evento'}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCloseDetail}
                className="rounded-xl p-2 text-gray-500 hover:bg-gray-50 hover:text-[#d22864]"
                aria-label="Cerrar detalle"
              >
                <X size={22} strokeWidth={2.5} />
              </button>
            </div>

            {detailLoading && (
              <div className="mt-8 rounded-2xl border border-gray-100 bg-gray-50 p-5 text-sm font-bold text-gray-500">
                Cargando detalle...
              </div>
            )}

            {detailError && (
              <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-bold text-red-700">
                {detailError}
              </div>
            )}

            {selectedEvent && (
              <>
                <section className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-gray-500">Fecha exacta</p>
                    <p className="mt-2 text-sm font-bold text-gray-800">{formatDateTime(selectedEvent.timestamp)}</p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-gray-500">Actor</p>
                    <p className="mt-2 text-sm font-bold text-gray-800">{getActorLabel(selectedEvent.actor)}</p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-gray-500">Acción</p>
                    <p className="mt-2 text-sm font-bold text-gray-800">{selectedEvent.action}</p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-gray-500">ID evento</p>
                    <p className="mt-2 text-sm font-bold text-gray-800">#{selectedEvent.id}</p>
                  </div>
                </section>

                <section className="mt-6 rounded-2xl border border-gray-100 p-5">
                  <p className="text-xs font-black uppercase tracking-wide text-gray-500">Resumen</p>
                  <p className="mt-2 text-sm font-semibold text-gray-700">{selectedEvent.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(selectedEvent.change_preview || []).map((item) => (
                      <span key={item} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                        {item}
                      </span>
                    ))}
                  </div>
                </section>

                <section className="mt-6 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-gray-100">
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="text-sm font-black text-gray-800">Valor anterior</p>
                    </div>
                    <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap p-4 text-xs font-semibold text-gray-700">
                      {formatJson(selectedEvent.old_value)}
                    </pre>
                  </div>
                  <div className="rounded-2xl border border-gray-100">
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="text-sm font-black text-gray-800">Valor nuevo</p>
                    </div>
                    <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap p-4 text-xs font-semibold text-gray-700">
                      {formatJson(selectedEvent.new_value)}
                    </pre>
                  </div>
                </section>
              </>
            )}
          </aside>
        </div>
      )}
    </>
  );
};

export default SuperadminAuditPanel;

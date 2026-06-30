import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  PieChart,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { UserHeader } from '../../components/Header/UserHeader';
import { Footer } from '../../components/Footer/Footer';
import { useAuth } from '../../context/useAuth';
import { getDisplayRoleForRoles } from '../../services/roleRouting';
import { adminReportService } from '../../services/adminReportService';

const initialFilters = {
  date_from: '',
  date_to: '',
  career: '',
  career_code: '',
  practice_type: '',
  period: '',
  status: '',
  organization: '',
  city: '',
};

const getFiltersFromSearch = (search) => {
  const params = new URLSearchParams(search);
  return Object.fromEntries(
    Object.keys(initialFilters).map((key) => [key, params.get(key) || '']),
  );
};

const getSearchFromFilters = (filters) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return params;
};

const inputClassName = 'w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#d22864] focus:ring-2 focus:ring-pink-100';

const metricTones = {
  pink: {
    icon: 'bg-pink-50 text-[#b01e52]',
    accent: 'border-l-[#d22864]',
  },
  blue: {
    icon: 'bg-blue-50 text-blue-700',
    accent: 'border-l-blue-600',
  },
  green: {
    icon: 'bg-emerald-50 text-emerald-700',
    accent: 'border-l-emerald-600',
  },
  amber: {
    icon: 'bg-amber-50 text-amber-700',
    accent: 'border-l-amber-500',
  },
};

const tabs = [
  {
    id: 'resumen',
    label: 'Resumen',
    to: '/fica/resumen',
    icon: LayoutDashboard,
  },
  {
    id: 'cumplimiento',
    label: 'Cumplimiento',
    to: '/fica/cumplimiento',
    icon: ShieldCheck,
  },
  {
    id: 'distribuciones',
    label: 'Distribuciones',
    to: '/fica/distribuciones',
    icon: PieChart,
  },
  {
    id: 'indicadores',
    label: 'Indicadores',
    to: '/fica/indicadores',
    icon: Gauge,
  },
  {
    id: 'organizaciones',
    label: 'Organizaciones',
    to: '/fica/organizaciones',
    icon: Building2,
  },
];

const tabMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.18, ease: 'easeOut' },
};

const getErrorMessage = (error) => {
  const detail = error?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  return 'No se pudieron cargar los reportes institucionales. Intenta nuevamente.';
};

const formatPercent = (value) => (
  value === null || value === undefined ? 'Sin dato' : `${value}%`
);

const formatGeneratedAt = (value) => {
  if (!value) return 'Fecha no disponible';
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Santiago',
  }).format(new Date(value));
};

const findRate = (rates = [], name) => rates.find((rate) => rate.name === name);

const downloadBlob = ({ blob, filename }) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const FilterField = ({ label, children }) => (
  <label className="block min-w-0">
    <span className="mb-1.5 block text-xs font-bold text-gray-700">{label}</span>
    {children}
  </label>
);

const MetricCard = ({ title, value, helper, icon: Icon, tone = 'pink' }) => {
  const colors = metricTones[tone];
  return (
    <article className={`min-w-0 rounded-2xl border border-gray-200 border-l-4 bg-white p-4 shadow-sm sm:p-5 ${colors.accent}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-600">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-950 sm:text-3xl">{value}</p>
        </div>
        <span className={`flex h-10 w-10 flex-none items-center justify-center rounded-xl ${colors.icon}`}>
          <Icon aria-hidden="true" size={20} />
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-gray-500">{helper}</p>
    </article>
  );
};

const DistributionSection = ({ title, rows, emptyText }) => (
  <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <h3 className="text-base font-bold text-gray-950">{title}</h3>
    {rows.length === 0 ? (
      <p className="mt-4 text-sm text-gray-500">{emptyText}</p>
    ) : (
      <div className="mt-4 space-y-4">
        {rows.map((row) => (
          <div key={row.name}>
            <div className="flex items-start justify-between gap-3 text-sm">
              <span className="min-w-0 font-semibold text-gray-700">{row.name}</span>
              <span className="flex-none font-bold text-gray-950">
                {row.total} <span className="font-medium text-gray-500">({formatPercent(row.percentage)})</span>
              </span>
            </div>
            <div
              className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100"
              role="progressbar"
              aria-label={`${row.name}: ${formatPercent(row.percentage)}`}
              aria-valuenow={row.percentage}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div
                className="h-full rounded-full bg-[#d22864]"
                style={{ width: `${Math.min(row.percentage, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
);

const AlertItem = ({ title, count, guidance, tone, icon: Icon }) => {
  const styles = {
    critical: 'border-red-200 bg-red-50 text-red-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    info: 'border-blue-200 bg-blue-50 text-blue-900',
  };
  return (
    <article className={`rounded-2xl border p-4 ${styles[tone]}`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 flex-none" aria-hidden="true" size={20} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-bold">{title}</h3>
            <span className="text-xl font-bold">{count}</span>
          </div>
          <p className="mt-1 text-xs leading-relaxed opacity-80">{guidance}</p>
        </div>
      </div>
    </article>
  );
};

const LoadingSkeleton = () => (
  <div className="mt-6 animate-pulse" aria-label="Cargando reporte">
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="h-32 rounded-2xl bg-gray-200" />
      ))}
    </div>
    <div className="mt-6 grid gap-4 lg:grid-cols-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-36 rounded-2xl bg-gray-200" />
      ))}
    </div>
    <div className="mt-6 h-72 rounded-2xl bg-gray-200" />
  </div>
);

export const FicaDashboardPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [, setSearchParams] = useSearchParams();
  const userName = user ? `${user.first_name} ${user.last_name}` : 'FICA';
  const userRole = getDisplayRoleForRoles(user?.roles);
  const [filters, setFilters] = useState(() => getFiltersFromSearch(window.location.search));
  const [appliedFilters, setAppliedFilters] = useState(() => getFiltersFromSearch(window.location.search));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState('');
  const [error, setError] = useState('');

  const loadReport = async (activeFilters) => {
    setLoading(true);
    setError('');
    try {
      const data = await adminReportService.getDashboard(activeFilters);
      setReport(data);
      setAppliedFilters(activeFilters);
      setSearchParams(getSearchFromFilters(activeFilters), { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    adminReportService.getDashboard(getFiltersFromSearch(window.location.search))
      .then((data) => {
        if (active) setReport(data);
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    loadReport(filters);
    setFiltersOpen(false);
  };

  const handleReset = () => {
    setFilters(initialFilters);
    loadReport(initialFilters);
    setFiltersOpen(false);
  };

  const handleExport = async (format) => {
    setExporting(format);
    setError('');
    try {
      const result = format === 'pdf'
        ? await adminReportService.exportPdf(appliedFilters)
        : await adminReportService.exportCsv(appliedFilters);
      downloadBlob(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setExporting('');
    }
  };

  const activeFilterCount = useMemo(
    () => Object.values(appliedFilters).filter(Boolean).length,
    [appliedFilters],
  );

  const totalInternships = report?.totals?.find((item) => item.label === 'Prácticas filtradas');
  const totalStudents = report?.totals?.find((item) => item.label === 'Estudiantes con práctica');
  const requiredDocuments = report?.totals?.find((item) => item.label === 'Tipos documentales requeridos');
  const approvalRate = findRate(report?.rates, 'Tasa de aprobación administrativa');
  const completionRate = findRate(report?.rates, 'Tasa de finalización');
  const unavailableNotes = [report?.evaluations, report?.compliance]
    .filter((section) => section && section.data_available === false)
    .map((section) => section.notes);
  const scopeText = report?.scope?.is_cross_career
    ? 'Todas las carreras'
    : `Carrera ${report?.scope?.career_code || 'no informada'}`;
  const activeTab = tabs.find((tab) => location.pathname === tab.to)?.id || 'resumen';
  const alertTotal = report
    ? report.compliance.summer_without_school_insurance
      + report.compliance.overdue_active_internships
      + report.evaluations.supervisor_pending
    : 0;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <UserHeader userName={userName} userRole={userRole} />

      <main className="mx-auto w-full max-w-7xl flex-grow px-4 pb-12 pt-4">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase text-[#b01e52]">Panel ejecutivo FICA</p>
              <h1 className="mt-2 text-2xl font-bold text-gray-950 sm:text-3xl">
                Reportes institucionales de prácticas FICA
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600">
                Consulta el avance por carrera, el estado documental, los tiempos de tramitación y los casos que requieren atención.
              </p>
              {report && (
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-gray-500">
                  <span>Actualizado: {formatGeneratedAt(report.generated_at)}</span>
                  <span>Alcance: {scopeText}</span>
                  <span>{activeFilterCount === 0 ? 'Sin filtros aplicados' : `${activeFilterCount} filtros aplicados`}</span>
                </div>
              )}
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <button
                type="button"
                onClick={() => handleExport('csv')}
                disabled={Boolean(exporting) || loading || !report}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {exporting === 'csv' ? <Loader2 className="animate-spin" size={18} /> : <FileSpreadsheet size={18} />}
                Descargar CSV
              </button>
              <button
                type="button"
                onClick={() => handleExport('pdf')}
                disabled={Boolean(exporting) || loading || !report}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {exporting === 'pdf' ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                Descargar reporte completo PDF
              </button>
            </div>
          </div>
        </section>

        <nav
          aria-label="Secciones del reporte FICA"
          className="mt-5 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-2 shadow-sm"
        >
          <div className="flex min-w-max justify-start gap-1 md:mx-auto md:w-fit">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  to={{ pathname: tab.to, search: location.search }}
                  aria-current={isActive ? 'page' : undefined}
                  className={[
                    'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors',
                    isActive
                      ? 'bg-[#d22864] text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-[#b01e52]',
                  ].join(' ')}
                >
                  <Icon aria-hidden="true" size={18} />
                  {tab.label}
                  {tab.id === 'cumplimiento' && alertTotal > 0 && (
                    <span className={`rounded-full px-2 py-0.5 text-xs ${isActive ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700'}`}>
                      {alertTotal}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        <form onSubmit={handleSubmit} className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-base font-bold text-gray-950">
                <Filter aria-hidden="true" size={18} />
                Filtros del reporte
              </h2>
              <p className="mt-1 text-xs text-gray-500">Los archivos descargados respetan los filtros aplicados.</p>
            </div>
            <button
              type="button"
              onClick={() => setFiltersOpen((current) => !current)}
              aria-expanded={filtersOpen}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm font-bold text-gray-700 lg:hidden"
            >
              {filtersOpen ? 'Ocultar' : 'Mostrar'}
              <ChevronDown className={`transition-transform ${filtersOpen ? 'rotate-180' : ''}`} size={17} />
            </button>
          </div>

          <div className={`${filtersOpen ? 'grid' : 'hidden'} mt-5 gap-4 sm:grid-cols-2 lg:grid lg:grid-cols-4`}>
            <FilterField label="Desde">
              <input name="date_from" type="date" value={filters.date_from} onChange={handleFilterChange} className={inputClassName} />
            </FilterField>
            <FilterField label="Hasta">
              <input name="date_to" type="date" value={filters.date_to} onChange={handleFilterChange} className={inputClassName} />
            </FilterField>
            <FilterField label="Carrera">
              <input name="career" value={filters.career} onChange={handleFilterChange} placeholder="Ej.: Ing. Civil Informática" className={inputClassName} />
            </FilterField>
            <FilterField label="Código de carrera">
              <input name="career_code" value={filters.career_code} onChange={handleFilterChange} placeholder="Ej.: ICI" className={inputClassName} />
            </FilterField>
            <FilterField label="Tipo de práctica">
              <select name="practice_type" value={filters.practice_type} onChange={handleFilterChange} className={inputClassName}>
                <option value="">Todos los tipos</option>
                <option value="Práctica de Estudio I">Práctica de Estudio I</option>
                <option value="Práctica de Estudio II">Práctica de Estudio II</option>
                <option value="Práctica Controlada">Práctica Controlada</option>
                <option value="Tesis">Tesis</option>
              </select>
            </FilterField>
            <FilterField label="Periodo académico">
              <select name="period" value={filters.period} onChange={handleFilterChange} className={inputClassName}>
                <option value="">Todos los periodos</option>
                <option value="Semestre">Semestre</option>
                <option value="Verano">Verano</option>
                <option value="Invierno">Invierno</option>
              </select>
            </FilterField>
            <FilterField label="Estado de solicitud">
              <select name="status" value={filters.status} onChange={handleFilterChange} className={inputClassName}>
                <option value="">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="En revisión">En revisión</option>
                <option value="En revisión DIRAE">En revisión DIRAE</option>
                <option value="Aprobada">Aprobada</option>
                <option value="Rechazada">Rechazada</option>
              </select>
            </FilterField>
            <FilterField label="Ciudad">
              <input name="city" value={filters.city} onChange={handleFilterChange} placeholder="Ej.: Temuco" className={inputClassName} />
            </FilterField>
            <div className="sm:col-span-2 lg:col-span-2">
              <FilterField label="Organización">
                <input name="organization" value={filters.organization} onChange={handleFilterChange} placeholder="Nombre de la organización" className={inputClassName} />
              </FilterField>
            </div>
          </div>

          <div className={`${filtersOpen ? 'flex' : 'hidden'} mt-5 flex-col-reverse gap-2 sm:flex-row sm:justify-end lg:flex`}>
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCcw size={17} />
              Limpiar filtros
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#d22864] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#b01e52] disabled:opacity-50"
            >
              {loading && <Loader2 className="animate-spin" size={17} />}
              Aplicar filtros
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
            <ShieldAlert className="mt-0.5 flex-none" size={20} />
            <div className="flex-1">
              <p className="font-bold">No fue posible actualizar el reporte</p>
              <p className="mt-1">{error}</p>
            </div>
            <button type="button" onClick={() => loadReport(appliedFilters)} className="font-bold underline underline-offset-2">
              Reintentar
            </button>
          </div>
        )}

        {loading && !report && <LoadingSkeleton />}

        {report && (
          <div className={loading ? 'pointer-events-none opacity-60' : ''} aria-busy={loading}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={activeTab} {...tabMotion}>
                {activeTab === 'resumen' && (
                  <>
                    <section className="mt-6">
                      <div className="mb-3 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase text-[#b01e52]">Resumen ejecutivo</p>
                          <h2 className="mt-1 text-xl font-bold text-gray-950">Estado general de las prácticas</h2>
                        </div>
                        {loading && <Loader2 className="animate-spin text-[#d22864]" aria-label="Actualizando" size={22} />}
                      </div>
                      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                        <MetricCard
                          title="Prácticas"
                          value={totalInternships?.value ?? 0}
                          helper="Prácticas incluidas en el reporte actual."
                          icon={BarChart3}
                          tone="pink"
                        />
                        <MetricCard
                          title="Estudiantes"
                          value={totalStudents?.value ?? 0}
                          helper="Estudiantes únicos con prácticas registradas."
                          icon={Users}
                          tone="blue"
                        />
                        <MetricCard
                          title="Aprobación"
                          value={formatPercent(approvalRate?.percentage)}
                          helper="Solicitudes administrativamente aprobadas."
                          icon={CheckCircle2}
                          tone="green"
                        />
                        <MetricCard
                          title="Finalización"
                          value={formatPercent(completionRate?.percentage)}
                          helper="Prácticas marcadas como finalizadas."
                          icon={GraduationCap}
                          tone="amber"
                        />
                      </div>
                    </section>

                    <section className="mt-6 rounded-2xl border border-red-200 bg-white p-5 shadow-sm sm:p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-red-50 text-red-700">
                            <ShieldAlert aria-hidden="true" size={21} />
                          </span>
                          <div>
                            <p className="text-xs font-bold uppercase text-red-700">Atención requerida</p>
                            <h2 className="mt-1 text-lg font-bold text-gray-950">
                              {alertTotal} incidencias requieren revisión
                            </h2>
                            <p className="mt-1 text-sm text-gray-600">
                              Incluye cobertura, etapas vencidas y evaluaciones pendientes.
                            </p>
                          </div>
                        </div>
                        <Link
                          to={{ pathname: '/fica/cumplimiento', search: location.search }}
                          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-red-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-800"
                        >
                          Revisar cumplimiento
                        </Link>
                      </div>
                    </section>
                  </>
                )}

                {activeTab === 'cumplimiento' && (
                  <>
                    <section className="mt-6">
                      <p className="text-xs font-bold uppercase text-red-700">Atención requerida</p>
                      <h2 className="mt-1 text-xl font-bold text-gray-950">Alertas prioritarias</h2>
                      <p className="mt-1 text-sm text-gray-600">Casos que requieren coordinación con Secretaría, Dirección o supervisores.</p>
                      <div className="mt-3 grid gap-3 lg:grid-cols-3">
                        <AlertItem
                          title="Verano sin seguro o excepción"
                          count={report.compliance.summer_without_school_insurance}
                          guidance="Revisar cobertura o excepción con Secretaría y Dirección."
                          tone="critical"
                          icon={ShieldAlert}
                        />
                        <AlertItem
                          title="Etapas vencidas en prácticas activas"
                          count={report.compliance.overdue_active_internships}
                          guidance="Solicitar actualización del seguimiento de estas prácticas."
                          tone="warning"
                          icon={Clock3}
                        />
                        <AlertItem
                          title="Evaluaciones de supervisor pendientes"
                          count={report.evaluations.supervisor_pending}
                          guidance="Gestionar el envío o recordatorio con los supervisores."
                          tone="info"
                          icon={AlertTriangle}
                        />
                      </div>
                    </section>

                    <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase text-emerald-700">Cumplimiento documental</p>
                          <h2 className="mt-1 text-xl font-bold text-gray-950">Documentación y preparación para DIRAE</h2>
                          <p className="mt-1 text-sm text-gray-600">Estado agregado de los expedientes asociados a las prácticas filtradas.</p>
                        </div>
                        <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                          {requiredDocuments?.value ?? 0} tipos requeridos
                        </span>
                      </div>
                      {(requiredDocuments?.value ?? 0) === 0 ? (
                        <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                          <FileText className="mt-0.5 flex-none" aria-hidden="true" size={20} />
                          <div>
                            <h3 className="text-sm font-bold">No hay requisitos documentales configurados</h3>
                            <p className="mt-1 text-xs leading-relaxed">
                              Los tipos documentales activos están definidos como opcionales, por lo que todavía no es posible calcular expedientes completos, incompletos o listos para DIRAE.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 lg:grid-cols-4">
                            {[
                              ['Paquetes completos', report.documents.complete_packages, 'text-emerald-700'],
                              ['Paquetes observados', report.documents.observed_packages, 'text-amber-700'],
                              ['Con documentos faltantes', report.documents.missing_required_packages, 'text-red-700'],
                              ['Listos para DIRAE', report.documents.exportable_to_dirae, 'text-blue-700'],
                            ].map(([label, value, tone]) => (
                              <div key={label} className="border-l-2 border-gray-200 pl-3">
                                <p className={`text-2xl font-bold ${tone}`}>{value}</p>
                                <p className="mt-1 text-xs font-semibold leading-relaxed text-gray-600">{label}</p>
                              </div>
                            ))}
                          </div>
                          <p className="mt-5 border-t border-gray-100 pt-4 text-xs leading-relaxed text-gray-500">{report.documents.notes}</p>
                        </>
                      )}
                    </section>

                    <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="text-[#b01e52]" aria-hidden="true" size={20} />
                        <h2 className="text-lg font-bold text-gray-950">Estado de evaluaciones</h2>
                      </div>
                      <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3">
                        {[
                          ['Enviadas por supervisores', report.evaluations.supervisor_submitted],
                          ['Pendientes de supervisores', report.evaluations.supervisor_pending],
                          ['Autoevaluaciones pendientes', report.evaluations.self_evaluation_pending ?? 'Sin dato'],
                        ].map(([label, value]) => (
                          <div key={label} className="border-l-2 border-gray-200 pl-3">
                            <p className="text-2xl font-bold text-gray-950">{value}</p>
                            <p className="mt-1 text-xs font-semibold leading-relaxed text-gray-600">{label}</p>
                          </div>
                        ))}
                      </div>
                      <p className="mt-5 border-t border-gray-100 pt-4 text-xs leading-relaxed text-gray-500">{report.evaluations.notes}</p>
                    </section>

                    {unavailableNotes.length > 0 && (
                      <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
                        <div className="flex items-center gap-2">
                          <CalendarDays aria-hidden="true" size={19} />
                          <h2 className="font-bold">Datos todavía no disponibles</h2>
                        </div>
                        {unavailableNotes.map((note) => <p key={note} className="mt-2 leading-relaxed">{note}</p>)}
                      </section>
                    )}
                  </>
                )}

                {activeTab === 'distribuciones' && (
                  <section className="mt-6">
                    <p className="text-xs font-bold uppercase text-[#b01e52]">Composición del reporte</p>
                    <h2 className="mt-1 text-xl font-bold text-gray-950">Distribuciones institucionales</h2>
                    <p className="mt-1 text-sm text-gray-600">Compara la concentración de prácticas según los filtros aplicados.</p>
                    <div className="mt-3 grid gap-4 lg:grid-cols-2">
                      <DistributionSection title="Por estado" rows={report.by_status} emptyText="No hay estados para los filtros seleccionados." />
                      <DistributionSection title="Por carrera" rows={report.by_career} emptyText="No hay carreras para los filtros seleccionados." />
                      <DistributionSection title="Por tipo de práctica" rows={report.by_practice_type} emptyText="No hay tipos de práctica para los filtros seleccionados." />
                      <DistributionSection title="Por periodo académico" rows={report.by_period} emptyText="No hay periodos para los filtros seleccionados." />
                      <DistributionSection title="Por ciudad" rows={report.by_city} emptyText="No hay ciudades para los filtros seleccionados." />
                    </div>
                  </section>
                )}

                {activeTab === 'indicadores' && (
                  <section className="mt-6">
                    <p className="text-xs font-bold uppercase text-[#b01e52]">Desempeño institucional</p>
                    <h2 className="mt-1 text-xl font-bold text-gray-950">Indicadores y tiempos de tramitación</h2>
                    <p className="mt-1 text-sm text-gray-600">Revisa tasas administrativas y duración de los principales hitos.</p>
                    <div className="mt-3 grid gap-5 lg:grid-cols-2">
                      <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-2">
                          <Clock3 className="text-[#b01e52]" aria-hidden="true" size={20} />
                          <h3 className="text-lg font-bold text-gray-950">Tiempos de tramitación</h3>
                        </div>
                        <div className="mt-4 divide-y divide-gray-100">
                          {report.time_metrics.map((metric) => (
                            <div key={metric.name} className="py-4 first:pt-0 last:pb-0">
                              <p className="text-sm font-bold text-gray-900">{metric.name}</p>
                              <p className="mt-1 text-sm text-gray-600">
                                Promedio: <strong>{metric.average_days ?? 'Sin dato'} días</strong>
                                {' · '}
                                Mediana: <strong>{metric.median_days ?? 'Sin dato'} días</strong>
                              </p>
                              <p className="mt-1 text-xs leading-relaxed text-gray-500">
                                {metric.samples} muestras. {metric.definition}
                              </p>
                            </div>
                          ))}
                        </div>
                      </article>

                      <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="text-[#b01e52]" aria-hidden="true" size={20} />
                          <h3 className="text-lg font-bold text-gray-950">Indicadores administrativos</h3>
                        </div>
                        <div className="mt-4 divide-y divide-gray-100">
                          {report.rates.map((rate) => (
                            <div key={rate.name} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-900">{rate.name}</p>
                                <p className="mt-1 text-xs leading-relaxed text-gray-500">{rate.definition}</p>
                              </div>
                              <span className="flex-none text-lg font-bold text-gray-950">{formatPercent(rate.percentage)}</span>
                            </div>
                          ))}
                        </div>
                      </article>
                    </div>
                  </section>
                )}

                {activeTab === 'organizaciones' && (
                  <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-center gap-2">
                      <Building2 className="text-[#b01e52]" aria-hidden="true" size={20} />
                      <h2 className="text-lg font-bold text-gray-950">Organizaciones recurrentes</h2>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">Organizaciones con más de una práctica dentro del alcance seleccionado.</p>

                    {report.recurrent_organizations.length === 0 ? (
                      <p className="mt-5 rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                        No hay organizaciones recurrentes para los filtros aplicados.
                      </p>
                    ) : (
                      <>
                        <div className="mt-5 space-y-3 md:hidden">
                          {report.recurrent_organizations.map((org) => (
                            <article key={org.normalized_name} className="rounded-xl border border-gray-200 p-4">
                              <h3 className="font-bold text-gray-950">{org.display_name}</h3>
                              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                                <div><p className="text-xs text-gray-500">Prácticas</p><p className="font-bold text-gray-900">{org.total}</p></div>
                                <div><p className="text-xs text-gray-500">Aprobadas</p><p className="font-bold text-emerald-700">{org.approved}</p></div>
                                <div><p className="text-xs text-gray-500">Rechazadas</p><p className="font-bold text-red-700">{org.rejected}</p></div>
                                <div><p className="text-xs text-gray-500">Canceladas</p><p className="font-bold text-gray-700">{org.cancelled}</p></div>
                              </div>
                            </article>
                          ))}
                        </div>
                        <div className="mt-5 hidden overflow-hidden rounded-xl border border-gray-200 md:block">
                          <table className="w-full table-fixed text-left text-sm">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                              <tr>
                                <th className="w-2/5 px-4 py-3">Organización</th>
                                <th className="px-4 py-3">Prácticas</th>
                                <th className="px-4 py-3">Aprobadas</th>
                                <th className="px-4 py-3">Rechazadas</th>
                                <th className="px-4 py-3">Canceladas</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {report.recurrent_organizations.map((org) => (
                                <tr key={org.normalized_name} className="transition hover:bg-gray-50">
                                  <td className="break-words px-4 py-3.5 font-bold text-gray-950">{org.display_name}</td>
                                  <td className="px-4 py-3.5 text-gray-700">{org.total}</td>
                                  <td className="px-4 py-3.5 text-emerald-700">{org.approved}</td>
                                  <td className="px-4 py-3.5 text-red-700">{org.rejected}</td>
                                  <td className="px-4 py-3.5 text-gray-700">{org.cancelled}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </section>
                )}
              </motion.div>
            </AnimatePresence>

            <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-gray-500">
              <FileText aria-hidden="true" size={15} />
              Este panel presenta datos agregados y no expone información personal de estudiantes.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default FicaDashboardPage;

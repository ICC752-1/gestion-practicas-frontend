import { useEffect, useState } from 'react';
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

const getErrorMessage = (error) => error?.response?.data?.detail || 'No se pudieron cargar los reportes.';

const formatPercent = (value) => (value === null || value === undefined ? 'Sin dato' : `${value}%`);

const MetricCard = ({ title, value, helper }) => (
  <article className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
    <p className="text-sm font-bold text-gray-500">{title}</p>
    <p className="mt-3 text-3xl font-bold text-gray-900">{value}</p>
    <p className="mt-2 text-xs text-gray-500">{helper}</p>
  </article>
);

const DistributionTable = ({ title, rows }) => (
  <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
    <div className="mt-4 space-y-3">
      {rows.length === 0 && <p className="text-sm font-semibold text-gray-500">Sin datos para los filtros activos.</p>}
      {rows.map((row) => (
        <div key={row.name}>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-bold text-gray-700">{row.name}</span>
            <span className="font-bold text-gray-900">{row.total} · {formatPercent(row.percentage)}</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-gray-100">
            <div className="h-2 rounded-full bg-[#d22864]" style={{ width: `${Math.min(row.percentage, 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  </section>
);

export const FicaDashboardPage = () => {
  const { user } = useAuth();
  const userName = user ? `${user.first_name} ${user.last_name}` : 'FICA';
  const userRole = getDisplayRoleForRoles(user?.roles);
  const [filters, setFilters] = useState(initialFilters);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  const loadReport = async (activeFilters = filters) => {
    setLoading(true);
    setError('');
    try {
      const data = await adminReportService.getDashboard(activeFilters);
      setReport(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setLoading(true);
      setError('');
      adminReportService.getDashboard(initialFilters)
        .then((data) => setReport(data))
        .catch((err) => setError(getErrorMessage(err)))
        .finally(() => setLoading(false));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    loadReport(filters);
  };

  const handleReset = () => {
    setFilters(initialFilters);
    loadReport(initialFilters);
  };

  const handleExport = async () => {
    setExporting(true);
    setError('');
    try {
      const { blob, filename } = await adminReportService.exportCsv(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  const totalInternships = report?.totals?.find((item) => item.label === 'Prácticas filtradas');
  const totalStudents = report?.totals?.find((item) => item.label === 'Estudiantes con práctica');
  const requiredDocuments = report?.totals?.find((item) => item.label === 'Tipos documentales requeridos');
  const unavailableNotes = [report?.evaluations, report?.compliance]
    .filter((section) => section && section.data_available === false)
    .map((section) => section.notes);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <UserHeader userName={userName} userRole={userRole} />
      
      <main className="flex-grow mx-auto w-full max-w-7xl px-4 pt-4 pb-12">
        <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wide text-[#d22864]">Reportes institucionales</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard FICA y administrativo</h1>
              <p className="mt-2 max-w-3xl text-sm text-gray-600 leading-relaxed">
                Métricas agregadas de prácticas, documentación, organizaciones y alertas sin RUT, correos ni documentos individuales.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting || loading || !report}
              className="rounded-2xl bg-gray-900 px-5 py-3 text-sm font-bold text-white disabled:opacity-50 hover:bg-gray-800 transition-colors cursor-pointer flex-shrink-0"
            >
              {exporting ? 'Exportando...' : 'Exportar CSV'}
            </button>
          </div>
        </section>

        {/* Formulario de Filtros con Padding e inputs alineados */}
        <form onSubmit={handleSubmit} className="mt-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-4">
            <input name="date_from" type="date" value={filters.date_from} onChange={handleFilterChange} className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864]" />
            <input name="date_to" type="date" value={filters.date_to} onChange={handleFilterChange} className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864]" />
            <input name="career" value={filters.career} onChange={handleFilterChange} placeholder="Carrera" className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864]" />
            <input name="career_code" value={filters.career_code} onChange={handleFilterChange} placeholder="Código carrera" className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864]" />
            <select name="practice_type" value={filters.practice_type} onChange={handleFilterChange} className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864] bg-white cursor-pointer">
              <option value="">Tipo de práctica</option>
              <option value="Práctica de Estudio I">Práctica de Estudio I</option>
              <option value="Práctica de Estudio II">Práctica de Estudio II</option>
              <option value="Práctica Controlada">Práctica Controlada</option>
              <option value="Tesis">Tesis</option>
            </select>
            <select name="period" value={filters.period} onChange={handleFilterChange} className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864] bg-white cursor-pointer">
              <option value="">Periodo</option>
              <option value="Semestre">Semestre</option>
              <option value="Verano">Verano</option>
              <option value="Invierno">Invierno</option>
            </select>
            <select name="status" value={filters.status} onChange={handleFilterChange} className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864] bg-white cursor-pointer">
              <option value="">Estado</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En revisión">En revisión</option>
              <option value="En revisión DIRAE">En revisión DIRAE</option>
              <option value="Aprobada">Aprobada</option>
              <option value="Rechazada">Rechazada</option>
            </select>
            <input name="city" value={filters.city} onChange={handleFilterChange} placeholder="Ciudad" className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864]" />
            <input name="organization" value={filters.organization} onChange={handleFilterChange} placeholder="Organización" className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d22864] lg:col-span-2" />
          </div>
          
          <div className="mt-5 flex justify-end gap-3 px-4">
            <button type="button" onClick={handleReset} className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
              Limpiar
            </button>
            <button type="submit" disabled={loading} className="rounded-xl bg-[#d22864] px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50 hover:bg-[#b01e52] transition-colors cursor-pointer">
              {loading ? 'Cargando...' : 'Aplicar filtros'}
            </button>
          </div>
        </form>

        {error && <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

        {report && (
          <>
            <section className="mt-6 grid gap-4 md:grid-cols-3">
              <MetricCard title="Prácticas" value={totalInternships?.value ?? 0} helper={totalInternships?.description} />
              <MetricCard title="Estudiantes" value={totalStudents?.value ?? 0} helper={totalStudents?.description} />
              <MetricCard title="Documentos requeridos" value={requiredDocuments?.value ?? 0} helper={requiredDocuments?.description} />
            </section>

            <section className="mt-6 grid gap-4 lg:grid-cols-4">
              {report.rates.map((rate) => (
                <MetricCard key={rate.name} title={rate.name} value={formatPercent(rate.percentage)} helper={rate.definition} />
              ))}
            </section>

            <section className="mt-6 grid gap-6 lg:grid-cols-2">
              <DistributionTable title="Distribución por estado" rows={report.by_status} />
              <DistributionTable title="Distribución por carrera" rows={report.by_career} />
              <DistributionTable title="Tipos de práctica" rows={report.by_practice_type} />
              <DistributionTable title="Ciudades" rows={report.by_city} />
            </section>

            <section className="mt-6 grid gap-6 lg:grid-cols-3">

              <article className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900">Tiempos</h2>
                <div className="mt-4 space-y-4">
                  {report.time_metrics.map((metric) => (
                    <div key={metric.name} className="rounded-2xl bg-gray-50 p-4 pt-2.5">
                      <p className="font-bold text-gray-900 text-[15px]">{metric.name}</p>
                      <p className="mt-1 text-sm text-gray-600">Promedio: {metric.average_days ?? 'Sin dato'} días · Mediana: {metric.median_days ?? 'Sin dato'} días</p>
                      <p className="mt-1 text-xs text-gray-500">Muestras: {metric.samples}. {metric.definition}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900">Documentación y DIRAE</h2>
                <div className="mt-4 grid gap-3 text-sm font-semibold text-gray-700">
                  <p>Completos: {report.documents.complete_packages}</p>
                  <p>Observados: {report.documents.observed_packages}</p>
                  <p>Faltantes: {report.documents.missing_required_packages}</p>
                  <p>Exportables a DIRAE: {report.documents.exportable_to_dirae}</p>
                </div>
                <p className="mt-4 text-xs text-gray-500">{report.documents.notes}</p>
              </article>

              <article className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900">Alertas</h2>
                <div className="mt-4 grid gap-3 text-sm font-semibold text-gray-700">
                  <p>Verano sin seguro/excepción: {report.compliance.summer_without_school_insurance}</p>
                  <p>Etapas vencidas activas: {report.compliance.overdue_active_internships}</p>
                  <p>Evaluaciones supervisor pendientes: {report.evaluations.supervisor_pending}</p>
                </div>
                <p className="mt-4 text-xs text-gray-500">{report.compliance.notes}</p>
              </article>
            </section>

            <section className="mt-6 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 px-4">Organizaciones recurrentes</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="text-xs uppercase text-gray-400">
                    <tr className="border-b border-gray-100/60">
                      <th className="py-3 px-4">Organización</th>
                      <th className="py-3 px-4">Prácticas</th>
                      <th className="py-3 px-4">Solicitudes aprobadas</th>
                      <th className="py-3 px-4">Rechazadas</th>
                      <th className="py-3 px-4">Canceladas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.recurrent_organizations.map((org) => (
                      <tr key={org.normalized_name} className="border-t border-gray-100 hover:bg-gray-50/30 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-gray-900">{org.display_name}</td>
                        <td className="py-3.5 px-4 text-gray-600">{org.total}</td>
                        <td className="py-3.5 px-4 text-gray-600">{org.approved}</td>
                        <td className="py-3.5 px-4 text-gray-600">{org.rejected}</td>
                        <td className="py-3.5 px-4 text-gray-600">{org.cancelled}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {report.recurrent_organizations.length === 0 && <p className="py-6 px-4 text-sm font-semibold text-gray-500">No hay organizaciones repetidas para los filtros activos.</p>}
              </div>
            </section>

            {unavailableNotes.length > 0 && (
              <section className="mt-6 rounded-3xl border border-amber-100 bg-amber-50 p-5 text-sm text-amber-800">
                <h2 className="font-bold">Datos no disponibles en este corte</h2>
                {unavailableNotes.map((note) => <p key={note} className="mt-2">{note}</p>)}
              </section>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default FicaDashboardPage;
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowDownUp, ArrowUp, Inbox, Filter, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { getAdminBasePathForRoles } from '../../services/roleRouting';
import { internshipService } from '../../services/internshipService';

const PAGE_SIZE = 10;

const initialSort = {
  sort_by: 'upload_date',
  sort_dir: 'desc',
};

const normalizeText = (value) => String(value || '').toLowerCase();

const getEntryMotion = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  ...(delay > 0 ? { transition: { delay } } : {}),
});

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

const getStudentName = (internship) => (
  internship.student
    ? `${internship.student.first_name} ${internship.student.last_name}`
    : 'Estudiante no registrado'
);

const getStudentDegree = (internship) => (
  internship.student?.degree || internship.student?.cod_degree || ''
);

const getPracticeType = (internship) => (
  internship.internship_type || internship.practice_type || ''
);

const getRequestDate = (internship) => (
  internship.upload_date || internship.created_at || ''
);

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
        'inline-flex w-full items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold uppercase tracking-wider transition-colors',
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

const PracticeRequestMobileCard = ({
  student,
  index,
  normalizedStatus,
  openingId,
  onOpenDetails,
}) => {
  const requestDate = formatDateTime(getRequestDate(student));
  const degree = getStudentDegree(student) || 'N/A';
  const practiceType = getPracticeType(student) || 'N/A';
  const company = student.org_name || 'N/A';

  return (
    <motion.article
      className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
      {...getEntryMotion(0.32 + index * 0.025)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-black text-gray-900">
            {getStudentName(student)}
          </h3>
          <p className="mt-1 break-words text-xs font-semibold text-gray-500">
            {student.student?.email || 'Correo no registrado'}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold text-white shadow-sm ${normalizedStatus.color}`}>
          {normalizedStatus.label}
        </span>
      </div>

      <div className="mt-4 grid gap-3 rounded-2xl bg-gray-50 p-3 text-sm sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wide text-gray-400">Solicitud</p>
          <p className="mt-1 font-bold text-gray-700">{requestDate}</p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-wide text-gray-400">Tipo</p>
          <p className="mt-1 font-bold text-gray-700">{practiceType}</p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-wide text-gray-400">Carrera</p>
          <p className="mt-1 break-words font-bold text-gray-700">{degree}</p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-wide text-gray-400">Empresa</p>
          <p className="mt-1 break-words font-bold text-gray-700">{company}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onOpenDetails(student)}
        disabled={openingId === student.id}
        className="mt-4 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-black text-[#d22864] transition-all hover:border-[#d22864] hover:bg-[#fff0f6] disabled:opacity-50"
      >
        {openingId === student.id ? 'Abriendo...' : 'Ver detalles'}
      </button>
    </motion.article>
  );
};

export const StudentTable = ({ students = [] }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const adminBasePath = getAdminBasePathForRoles(user?.roles);
  const [searchTerm, setSearchTerm] = useState('');
  const [degreeFilter, setDegreeFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [practiceTypeFilter, setPracticeTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('Práctica Pendiente');
  const [sort, setSort] = useState(initialSort);
  const [offset, setOffset] = useState(0);
  const [openingId, setOpeningId] = useState(null);

  // FE4: Normalizar estado
  const getNormalizedStatus = (internship) => {
    if (internship?.is_cancelled) {
      return { label: 'Anulada', color: 'bg-gray-500', value: 'Anulada' };
    }

    const status = internship?.status;
    const statusLabel = status?.title || status || '';
    const statusStr = String(statusLabel).toLowerCase();
    if (statusStr.includes('revisi') || status === 'in_review') return { label: 'En Revisión', color: 'bg-blue-500', value: 'En Revisión' };
    if (statusStr.includes('aprob') || status === 'approved') return { label: 'Solicitud Aprobada', color: 'bg-emerald-500', value: 'Aprobada' };
    if (statusStr.includes('rechaz') || status === 'rejected') return { label: 'Rechazada', color: 'bg-red-500', value: 'Rechazada' };
    if (!status || statusStr === 'pendiente' || status === 'submitted' || status === 'submited') return { label: 'Pendiente', color: 'bg-amber-500', value: 'Práctica Pendiente' };
    return { label: statusLabel || 'Pendiente', color: 'bg-gray-500', value: statusLabel || 'Pendiente' };
  };

  const uniqueDegrees = useMemo(() => {
    return [...new Set(students.map(s => s.student?.degree || s.student?.cod_degree).filter(Boolean))];
  }, [students]);

  const uniqueCompanies = useMemo(() => {
    return [...new Set(students.map(s => s.org_name).filter(Boolean))];
  }, [students]);

  const uniquePracticeTypes = useMemo(() => {
    return [...new Set(students.map(getPracticeType).filter(Boolean))];
  }, [students]);

  const uniqueStatuses = useMemo(() => {
    return [...new Set(students.map(s => getNormalizedStatus(s).value).filter(Boolean))];
  }, [students]);

  const filteredStudents = useMemo(() => students.filter(s => {
    const name = normalizeText(getStudentName(s));
    const email = normalizeText(s.student?.email);
    const degree = normalizeText(getStudentDegree(s));
    const org = normalizeText(s.org_name);
    const status = normalizeText(getNormalizedStatus(s).label);
    const city = normalizeText(s.city);
    const region = normalizeText(s.region);
    const practiceType = normalizeText(getPracticeType(s));
    const modality = normalizeText(s.modality);
    const startDate = normalizeText(s.start_date);
    const endDate = normalizeText(s.end_date);
    const uploadDate = normalizeText(s.upload_date);
    const term = normalizeText(searchTerm);

    const matchesSearch = (
      name.includes(term) ||
      email.includes(term) ||
      degree.includes(term) ||
      org.includes(term) ||
      status.includes(term) ||
      city.includes(term) ||
      region.includes(term) ||
      practiceType.includes(term) ||
      modality.includes(term) ||
      startDate.includes(term) ||
      endDate.includes(term) ||
      uploadDate.includes(term)
    );

    const matchesDegree = degreeFilter === '' || getStudentDegree(s) === degreeFilter;
    const matchesCompany = companyFilter === '' || s.org_name === companyFilter;
    const matchesPracticeType = practiceTypeFilter === '' || getPracticeType(s) === practiceTypeFilter;
    const matchesStatus = statusFilter === '' || getNormalizedStatus(s).value === statusFilter;

    return matchesSearch && matchesDegree && matchesCompany && matchesPracticeType && matchesStatus;
  }), [students, searchTerm, degreeFilter, companyFilter, practiceTypeFilter, statusFilter]);

  const sortedStudents = useMemo(() => {
    const getSortValue = (student) => {
      if (sort.sort_by === 'student') return normalizeText(getStudentName(student));
      if (sort.sort_by === 'degree') return normalizeText(getStudentDegree(student));
      if (sort.sort_by === 'internship_type') return normalizeText(getPracticeType(student));
      if (sort.sort_by === 'company') return normalizeText(student.org_name);
      if (sort.sort_by === 'status') return normalizeText(getNormalizedStatus(student).label);
      if (sort.sort_by === 'upload_date') {
        const timestamp = Date.parse(getRequestDate(student));
        return Number.isNaN(timestamp) ? 0 : timestamp;
      }
      return normalizeText(student[sort.sort_by]);
    };

    return [...filteredStudents].sort((left, right) => {
      const leftValue = getSortValue(left);
      const rightValue = getSortValue(right);

      if (leftValue < rightValue) return sort.sort_dir === 'asc' ? -1 : 1;
      if (leftValue > rightValue) return sort.sort_dir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredStudents, sort]);

  const total = sortedStudents.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageOffset = total === 0 ? 0 : Math.min(offset, (totalPages - 1) * PAGE_SIZE);
  const start = total === 0 ? 0 : pageOffset + 1;
  const end = Math.min(pageOffset + PAGE_SIZE, total);
  const currentPage = total === 0 ? 0 : Math.floor(pageOffset / PAGE_SIZE) + 1;
  const paginatedStudents = sortedStudents.slice(pageOffset, pageOffset + PAGE_SIZE);

  const resetPagination = () => {
    setOffset(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    resetPagination();
  };

  const handleDegreeFilterChange = (event) => {
    setDegreeFilter(event.target.value);
    resetPagination();
  };

  const handleCompanyFilterChange = (event) => {
    setCompanyFilter(event.target.value);
    resetPagination();
  };

  const handlePracticeTypeFilterChange = (nextPracticeType) => {
    setPracticeTypeFilter(nextPracticeType);
    resetPagination();
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    resetPagination();
  };

  const clearFilters = () => {
    setDegreeFilter('');
    setCompanyFilter('');
    setPracticeTypeFilter('');
    setStatusFilter('');
    resetPagination();
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
    setSort({ sort_by: 'upload_date', sort_dir: direction });
  };

  const gridLayoutClass = "grid grid-cols-[1.25fr_0.85fr_0.95fr_1fr_1.05fr_0.85fr_0.75fr] items-center gap-3 px-4 py-4 w-full";

  const handleOpenDetails = async (internship) => {
    setOpeningId(internship.id);
    try {
      await internshipService.startReview(internship.id);
    } catch (error) {
      console.error('No se pudo iniciar revisión automáticamente:', error);
    } finally {
      setOpeningId(null);
      navigate(`${adminBasePath}/practica/${internship.id}`, {
        state: { student: internship.student },
      });
    }
  };

  if (students.length === 0) {
    return (
      <motion.div
        className="bg-white rounded-3xl p-12 shadow-xl border border-gray-100 flex flex-col items-center justify-center text-center space-y-4"
        {...getEntryMotion()}
      >
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
          <Inbox className="w-10 h-10 text-gray-300" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">No hay solicitudes registradas aún</h3>
          <p className="text-gray-500 max-w-xs mx-auto">Cuando los estudiantes envíen sus solicitudes de práctica, aparecerán en esta lista.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Sección Filtros Internos y Buscador Secundario */}
      <motion.div
        className="flex flex-col gap-4 w-full"
        {...getEntryMotion()}
      >
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full"
          {...getEntryMotion(0.04)}
        >
          <h3 className="text-xl font-bold text-gray-800 flex-shrink-0"> Gestión de solicitudes de práctica</h3>
        </motion.div>

        <motion.div
          className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm text-gray-600"
          {...getEntryMotion(0.1)}
        >
          {/* Buscador */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar estudiante, empresa, tipo o estado..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full h-10 pl-9 pr-4 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] transition-all"
            />
          </div>

          {/* Selectores */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 font-bold text-gray-500 flex-shrink-0">
              <Filter size={16} />
              <span>Filtros:</span>
            </div>

            <select
              value={degreeFilter}
              onChange={handleDegreeFilterChange}
              className="h-9 flex-1 min-w-[130px] rounded-lg border border-gray-200 bg-white px-2 text-xs font-medium outline-none focus:border-[#d22864] sm:max-w-[160px]"
            >
              <option value="">Todas las Carreras</option>
              {uniqueDegrees.map(degree => (
                <option key={degree} value={degree}>{degree}</option>
              ))}
            </select>

            <select
              value={companyFilter}
              onChange={handleCompanyFilterChange}
              className="h-9 flex-1 min-w-[130px] rounded-lg border border-gray-200 bg-white px-2 text-xs font-medium outline-none focus:border-[#d22864] sm:max-w-[160px]"
            >
              <option value="">Todas las Empresas</option>
              {uniqueCompanies.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>

            <select
              value={practiceTypeFilter}
              onChange={(e) => handlePracticeTypeFilterChange(e.target.value)}
              className="h-9 flex-1 min-w-[130px] rounded-lg border border-gray-200 bg-white px-2 text-xs font-medium outline-none focus:border-[#d22864] sm:max-w-[160px]"
            >
              <option value="">Todos los tipos</option>
              {uniquePracticeTypes.map((practiceType) => (
                <option key={practiceType} value={practiceType}>{practiceType}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="h-9 flex-1 min-w-[130px] rounded-lg border border-gray-200 bg-white px-2 text-xs font-medium outline-none focus:border-[#d22864] sm:max-w-[160px]"
            >
              <option value="">Todos los estados</option>
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            {(degreeFilter || companyFilter || practiceTypeFilter || statusFilter) && (
              <button
                onClick={clearFilters}
                className="text-xs font-bold text-[#d22864] hover:underline flex-shrink-0"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 px-4 py-3 text-sm font-semibold text-gray-600 sm:flex-row sm:items-center sm:justify-between"
        {...getEntryMotion(0.22)}
      >
        <div>
          <p className="font-black text-gray-900">
            {total} {total === 1 ? 'resultado' : 'resultados'}
          </p>
          <p className="text-xs text-gray-500">
            Mostrando {start}-{end} · Página {currentPage} de {totalPages}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => applyRecentSort('desc')}
            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition ${
              sort.sort_by === 'upload_date' && sort.sort_dir === 'desc'
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
            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition ${
              sort.sort_by === 'upload_date' && sort.sort_dir === 'asc'
                ? 'border-[#d22864] bg-[#fff0f6] text-[#d22864]'
                : 'border-gray-200 bg-white text-gray-700 hover:border-[#d22864] hover:text-[#d22864]'
            }`}
          >
            <ArrowUp size={14} />
            Más antiguos
          </button>
        </div>
      </motion.div>

      {/* Contenedor de la Tabla Estructurada - SIN OVERFLOW NI MIN-W */}
      <motion.div
        className="hidden w-full rounded-xl border border-gray-100 bg-white shadow-sm lg:block"
        {...getEntryMotion(0.28)}
      >
        <div className="w-full table-layout-fixed">
          
          {/* Cabecera de la Tabla */}
          <div className={`${gridLayoutClass} bg-gray-50/70 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider`}>
            <SortHeader label="Estudiante" field="student" sort={sort} onSort={handleSort} align="left" />
            <SortHeader label="Solicitud" field="upload_date" sort={sort} onSort={handleSort} align="left" />
            <SortHeader label="Carrera" field="degree" sort={sort} onSort={handleSort} align="left" />
            <SortHeader label="Tipo" field="internship_type" sort={sort} onSort={handleSort} align="left" />
            <SortHeader label="Empresa" field="company" sort={sort} onSort={handleSort} align="left"/>
            <SortHeader label="Estado" field="status" sort={sort} onSort={handleSort} align="center" />
            <div className="text-center">Acciones</div>
          </div>

          {/* Cuerpo de la Tabla */}
          <div className="divide-y divide-gray-100 bg-white">
            {paginatedStudents.length > 0 ? (
              paginatedStudents.map((student, index) => {
                const normalizedStatus = getNormalizedStatus(student);

                return (
                  <motion.div
                    key={student.id}
                    className={`${gridLayoutClass} hover:bg-gray-50/40 transition-colors`}
                    {...getEntryMotion(0.32 + index * 0.035)}
                  >
                    
                    {/* Estudiante (Con min-w-0 para activar el truncado fluido) */}
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-gray-800 leading-tight text-sm ">
                        {student.student ? `${student.student.first_name} ${student.student.last_name}` : 'Estudiante no registrado'}
                      </span>
                      <span className="text-xs text-gray-400 font-medium truncate mt-0.5">{student.student?.email}</span>
                    </div>

                    {/* Fecha de solicitud */}
                    <div className="text-center text-xs font-semibold text-gray-500 min-w-0">
                      {formatDateTime(getRequestDate(student))}
                    </div>

                    {/* Carrera (Se corrigió la etiqueta td invasiva de develop para mantener la rejilla CSS Grid limpia) */}
                    <div className="min-w-0">
                      <p className="text-[12px] text-gray-600 font-medium">
                        {student.student?.degree || student.student?.cod_degree || 'N/A'}
                      </p>
                    </div>

                    {/* Tipo de práctica */}
                    <div className="min-w-0">
                      <p className="text-[12px] text-gray-600 font-medium " 
                        title={getPracticeType(student)}>
                        {getPracticeType(student) || 'N/A'}
                      </p>
                    </div>

                    {/* Empresa */}
                    <div className="min-w-0">
                      <p className="text-[12px] text-gray-600 font-medium ">{student.org_name || 'N/A'}</p>
                    </div>

                    {/* Estado */}
                    <div className="flex justify-center min-w-0 w-full">
                      <span className={`
                        px-2 sm:px-4 py-1.5 rounded-full text-white text-[11px] font-bold text-center w-full max-w-[90px] block shadow-sm truncate
                        ${normalizedStatus.color}
                      `}>
                        {normalizedStatus.label}
                      </span>
                    </div>

                    {/* Acciones */}
                    <div className="text-center whitespace-nowrap min-w-0">
                      <button
                        onClick={() => handleOpenDetails(student)}
                        disabled={openingId === student.id}
                        className="text-[#d22864] font-bold hover:underline text-sm transition-all disabled:opacity-50"
                      >
                        {openingId === student.id ? 'Abriendo...' : 'Ver detalles'}
                      </button>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="py-12 text-center text-gray-500 text-sm bg-white">
                No se encontraron solicitudes que coincidan con los filtros.
              </div>
            )}
          </div>

        </div>
      </motion.div>

      <div className="min-h-[560px] lg:hidden">
        {paginatedStudents.length > 0 ? (
          <div className="grid gap-3">
            {paginatedStudents.map((student, index) => (
              <PracticeRequestMobileCard
                key={student.id}
                student={student}
                index={index}
                normalizedStatus={getNormalizedStatus(student)}
                openingId={openingId}
                onOpenDetails={handleOpenDetails}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-[480px] items-center justify-center rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm font-semibold text-gray-500">
            No se encontraron solicitudes que coincidan con los filtros.
          </div>
        )}
      </div>

      <motion.div
        className="flex flex-col gap-3 border-t border-gray-100 pt-4 text-sm font-semibold text-gray-500 sm:flex-row sm:items-center sm:justify-between"
        {...getEntryMotion(0.36)}
      >
        <span>
          Mostrando {start}-{end} de {total} · Página {currentPage} de {totalPages}
        </span>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button
            type="button"
            disabled={offset === 0}
            onClick={() => setOffset(0)}
            className="rounded-xl border border-gray-200 px-4 py-2 font-bold text-gray-700 disabled:opacity-40"
          >
            Inicio
          </button>
          <button
            type="button"
            disabled={offset === 0}
            onClick={() => setOffset((current) => Math.max(0, current - PAGE_SIZE))}
            className="rounded-xl border border-gray-200 px-4 py-2 font-bold text-gray-700 disabled:opacity-40"
          >
            Anterior
          </button>
          <button
            type="button"
            disabled={pageOffset + PAGE_SIZE >= total}
            onClick={() => setOffset((current) => current + PAGE_SIZE)}
            className="rounded-xl border border-gray-200 px-4 py-2 font-bold text-gray-700 disabled:opacity-40"
          >
            Siguiente
          </button>
          <button
            type="button"
            disabled={pageOffset + PAGE_SIZE >= total}
            onClick={() => setOffset((totalPages - 1) * PAGE_SIZE)}
            className="rounded-xl border border-gray-200 px-4 py-2 font-bold text-gray-700 disabled:opacity-40"
          >
            Última
          </button>
        </div>
      </motion.div>
    </div>
  );
};

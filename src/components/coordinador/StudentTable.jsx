import React, { useState, useMemo } from 'react';
import { Inbox, Filter, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { getAdminBasePathForRoles } from '../../services/roleRouting';

export const StudentTable = ({ students = [] }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const adminBasePath = getAdminBasePathForRoles(user?.roles);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [degreeFilter, setDegreeFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');

  // FE4: Normalizar estado
  const getNormalizedStatus = (internship) => {
    if (internship?.is_cancelled) {
      return { label: 'Anulada', color: 'bg-gray-500', value: 'Anulada' };
    }

    const status = internship?.status;
    const statusLabel = status?.title || status || '';
    const statusStr = String(statusLabel).toLowerCase();
    if (statusStr.includes('revisi') || status === 'in_review') return { label: 'En Revisión', color: 'bg-blue-500', value: 'En Revisión' };
    if (statusStr.includes('aprob') || status === 'approved') return { label: 'Aprobada', color: 'bg-emerald-500', value: 'Aprobada' };
    if (statusStr.includes('rechaz') || status === 'rejected') return { label: 'Rechazada', color: 'bg-red-500', value: 'Rechazada' };
    if (!status || statusStr === 'pendiente' || status === 'submitted' || status === 'submited') return { label: 'Pendiente', color: 'bg-amber-500', value: 'Práctica Pendiente' };
    return { label: statusLabel || 'Pendiente', color: 'bg-gray-500', value: statusLabel || 'Pendiente' };
  };

  const uniqueDegrees = useMemo(() => {
    return [...new Set(students.map(s => s.student?.degree).filter(Boolean))];
  }, [students]);

  const uniqueCompanies = useMemo(() => {
    return [...new Set(students.map(s => s.org_name).filter(Boolean))];
  }, [students]);

  const uniqueStatuses = useMemo(() => {
    return [...new Set(students.map(s => getNormalizedStatus(s).value).filter(Boolean))];
  }, [students]);

  const filteredStudents = students.filter(s => {
    const name = s.student ? `${s.student.first_name} ${s.student.last_name}`.toLowerCase() : '';
    const email = s.student?.email?.toLowerCase() || '';
    const degree = s.student?.degree?.toLowerCase() || '';
    const org = s.org_name?.toLowerCase() || '';
    
    const city = s.city?.toLowerCase() || '';
    const region = s.region?.toLowerCase() || '';
    const practiceType = (s.modality || s.practice_type || '').toLowerCase();
    const startDate = s.start_date?.toString().toLowerCase() || '';
    const endDate = s.end_date?.toString().toLowerCase() || '';
    
    const term = searchTerm.toLowerCase();

    const matchesSearch = (
      name.includes(term) ||
      email.includes(term) ||
      degree.includes(term) ||
      org.includes(term) ||
      city.includes(term) ||
      region.includes(term) ||
      practiceType.includes(term) ||
      startDate.includes(term) ||
      endDate.includes(term)
    );

    const normalizedStatus = getNormalizedStatus(s).value;

    const matchesStatus = statusFilter === '' || normalizedStatus === statusFilter;
    const matchesDegree = degreeFilter === '' || s.student?.degree === degreeFilter;
    const matchesCompany = companyFilter === '' || s.org_name === companyFilter;

    return matchesSearch && matchesStatus && matchesDegree && matchesCompany;
  });

  const gridLayoutClass = "grid grid-cols-[1.4fr_1fr_1.3fr_1.1fr_0.9fr] items-center gap-3 px-4 py-4 w-full";

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 shadow-xl border border-gray-100 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
          <Inbox className="w-10 h-10 text-gray-300" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">No hay solicitudes registradas aún</h3>
          <p className="text-gray-500 max-w-xs mx-auto">Cuando los estudiantes envíen sus solicitudes de práctica, aparecerán en esta lista.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Sección Filtros Internos y Buscador Secundario */}
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <h3 className="text-lg font-bold text-gray-800 flex-shrink-0">Solicitudes de práctica</h3>
          
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar estudiante o empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-4 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] transition-all"
            />
          </div>
        </div>

        {/* Fila de Selectores */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 w-full">
          <div className="flex items-center gap-1.5 font-bold text-gray-500 mr-1 flex-shrink-0">
            <Filter size={16} />
            <span>Filtros:</span>
          </div>
          
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-2 bg-white border border-gray-200 rounded-lg outline-none text-xs font-medium focus:border-[#d22864] max-w-[180px] truncate cursor-pointer"
          >
            <option value="">Todos los estados</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select 
            value={degreeFilter}
            onChange={(e) => setDegreeFilter(e.target.value)}
            className="h-9 px-2 bg-white border border-gray-200 rounded-lg outline-none text-xs font-medium focus:border-[#d22864] max-w-[160px] truncate cursor-pointer"
          >
            <option value="">Todas las Carreras</option>
            {uniqueDegrees.map(degree => (
              <option key={degree} value={degree}>{degree}</option>
            ))}
          </select>

          <select 
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="h-9 px-2 bg-white border border-gray-200 rounded-lg outline-none text-xs font-medium focus:border-[#d22864] max-w-[160px] truncate cursor-pointer"
          >
            <option value="">Todas las Empresas</option>
            {uniqueCompanies.map(company => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>
          
          {(statusFilter || degreeFilter || companyFilter) && (
            <button 
              onClick={() => { setStatusFilter(''); setDegreeFilter(''); setCompanyFilter(''); }}
              className="text-xs text-[#d22864] font-bold hover:underline sm:ml-auto flex-shrink-0"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Contenedor de la Tabla Estructurada - SIN OVERFLOW NI MIN-W */}
      <div className="w-full rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="w-full table-layout-fixed">
          
          {/* Cabecera de la Tabla */}
          <div className={`${gridLayoutClass} bg-gray-50/70 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider`}>
            <div>Estudiante</div>
            <div>Carrera</div>
            <div>Empresa</div>
            <div className="text-center">Estado</div>
            <div className="text-center">Acciones</div>
          </div>

          {/* Cuerpo de la Tabla */}
          <div className="divide-y divide-gray-100 bg-white">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => {
                const normalizedStatus = getNormalizedStatus(student);

                return (
                  <div key={student.id} className={`${gridLayoutClass} hover:bg-gray-50/40 transition-colors`}>
                    
                    {/* Estudiante (Con min-w-0 para activar el truncado fluido) */}
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-gray-800 leading-tight text-sm truncate">
                        {student.student ? `${student.student.first_name} ${student.student.last_name}` : 'Estudiante no registrado'}
                      </span>
                      <span className="text-xs text-gray-400 font-medium truncate mt-0.5">{student.student?.email}</span>
                    </div>

                    {/* Carrera */}
                    <div className="min-w-0">
                      <p className="text-sm text-gray-600 font-medium truncate">{student.student?.degree || 'N/A'}</p>
                    </div>

                    {/* Empresa */}
                    <div className="min-w-0">
                      <p className="text-sm text-gray-600 font-medium truncate">{student.org_name || 'N/A'}</p>
                    </div>

                    {/* Estado */}
                    <div className="flex justify-center min-w-0 w-full">
                      <span className={`
                        px-2 sm:px-4 py-1.5 rounded-full text-white text-[11px] font-bold text-center w-full max-w-[100px] block shadow-sm truncate
                        ${normalizedStatus.color}
                      `}>
                        {normalizedStatus.label}
                      </span>
                    </div>

                    {/* Acciones */}
                    <div className="text-center whitespace-nowrap min-w-0">
                      <button
                        onClick={() => navigate(`${adminBasePath}/practica/${student.id}`, { state: { student: student.student } })}
                        className="text-[#d22864] font-bold hover:underline text-sm transition-all"
                      >
                        Ver detalles
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-gray-500 text-sm bg-white">
                No se encontraron solicitudes que coincidan con los filtros.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
import React, { useState, useMemo } from 'react';
import { Search, Inbox, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StudentTable = ({ students = [] }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [degreeFilter, setDegreeFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');

  // FE4: Normalizar estado
  const getNormalizedStatus = (status) => {
    const statusStr = String(status?.title || status || '').toLowerCase();
    if (statusStr.includes('revisi') || status === 'in_review') return { label: 'En Revisión', color: 'bg-blue-500', value: 'En Revisión' };
    if (statusStr.includes('aprob') || status === 'approved') return { label: 'Aprobado', color: 'bg-emerald-500', value: 'Aprobado' };
    if (statusStr.includes('rechaz') || status === 'rejected') return { label: 'Rechazado', color: 'bg-red-500', value: 'Rechazado' };
    if (!status || statusStr === 'pendiente' || status === 'submitted' || status === 'submited') return { label: 'Pendiente', color: 'bg-amber-500', value: 'Pendiente' };
    return { label: status || 'Pendiente', color: 'bg-gray-500', value: status || 'Pendiente' };
  };

  const uniqueDegrees = useMemo(() => {
    return [...new Set(students.map(s => s.student?.degree).filter(Boolean))];
  }, [students]);

  const uniqueCompanies = useMemo(() => {
    return [...new Set(students.map(s => s.org_name).filter(Boolean))];
  }, [students]);

  const uniqueStatuses = useMemo(() => {
    return [...new Set(students.map(s => getNormalizedStatus(s.status).value).filter(Boolean))];
  }, [students]);

  const filteredStudents = students.filter(s => {
    // FE4: Mapear datos reales (estudiante, organización, ciudad, región, fechas, tipo de práctica)
    const name = s.student ? `${s.student.first_name} ${s.student.last_name}`.toLowerCase() : '';
    const email = s.student?.email?.toLowerCase() || '';
    const degree = s.student?.degree?.toLowerCase() || '';
    const org = s.org_name?.toLowerCase() || '';
    
    // Datos FE4 mapeados para búsqueda (sin mostrar columnas en tabla)
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

    const normalizedStatus = getNormalizedStatus(s.status).value;

    const matchesStatus = statusFilter === '' || normalizedStatus === statusFilter;
    const matchesDegree = degreeFilter === '' || s.student?.degree === degreeFilter;
    const matchesCompany = companyFilter === '' || s.org_name === companyFilter;

    return matchesSearch && matchesStatus && matchesDegree && matchesCompany;
  });

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 shadow-xl border border-gray-100 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
          <Inbox className="w-10 h-10 text-gray-300" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">No hay prácticas registradas aún</h3>
          <p className="text-gray-500 max-w-xs mx-auto">Cuando los estudiantes envíen sus solicitudes de práctica, aparecerán en esta lista.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
      <div className="flex flex-col space-y-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <h2 className="text-2xl font-bold text-gray-800">Lista de Estudiantes</h2>
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Buscar por estudiante, carrera o empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-ufro-primary/20 focus:border-ufro-primary transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center text-gray-500 mr-2">
            <Filter size={18} className="mr-2" />
            <span className="text-sm font-medium">Filtros:</span>
          </div>
          
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-ufro-primary focus:border-ufro-primary block p-2.5"
          >
            <option value="">Todos los Estados</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select 
            value={degreeFilter}
            onChange={(e) => setDegreeFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-ufro-primary focus:border-ufro-primary block p-2.5"
          >
            <option value="">Todas las Carreras</option>
            {uniqueDegrees.map(degree => (
              <option key={degree} value={degree}>{degree}</option>
            ))}
          </select>

          <select 
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-ufro-primary focus:border-ufro-primary block p-2.5 max-w-xs truncate"
          >
            <option value="">Todas las Empresas</option>
            {uniqueCompanies.map(company => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>
          
          {(statusFilter || degreeFilter || companyFilter) && (
            <button 
              onClick={() => { setStatusFilter(''); setDegreeFilter(''); setCompanyFilter(''); }}
              className="text-sm text-ufro-primary font-medium hover:underline ml-auto"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-100">
              <th className="pb-4 text-left font-bold text-gray-800">Estudiante</th>
              <th className="pb-4 text-left font-bold text-gray-800">Carrera</th>
              <th className="pb-4 text-left font-bold text-gray-800">Empresa</th>
              <th className="pb-4 text-center font-bold text-gray-800">Estado</th>
              <th className="pb-4 text-right font-bold text-gray-800">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => {
                const normalizedStatus = getNormalizedStatus(student.status);

                return (
                  <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 leading-tight text-sm">
                          {student.student ? `${student.student.first_name} ${student.student.last_name}` : 'Estudiante no registrado'}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">{student.student?.email}</span>
                      </div>
                    </td>

                    <td className="py-5 px-4">
                      <p className="text-sm text-gray-700 font-medium">{student.student?.degree || 'N/A'}</p>
                    </td>

                    <td className="py-5 px-4">
                      <p className="text-sm text-gray-700 font-medium">{student.org_name || 'N/A'}</p>
                    </td>

                    <td className="py-5 px-4 text-center">
                      <span className={`
                        px-6 py-1.5 rounded-full text-white text-xs font-bold inline-block min-w-32
                        ${normalizedStatus.color}
                      `}>
                        {normalizedStatus.label}
                      </span>
                    </td>

                    <td className="py-5 px-4 text-right">
                      <button
                        onClick={() => navigate(`/coordinador/practica/${student.id}`, { state: { student: student.student } })}
                        className="text-ufro-primary font-bold hover:underline text-sm transition-all"
                      >
                        Ver detalles
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500">
                  No se encontraron estudiantes que coincidan con los filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

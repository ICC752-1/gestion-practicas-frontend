import React, { useState } from 'react';
import { Search, Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StudentTable = ({ students = [] }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(s => {
    const name = s.student ? `${s.student.first_name} ${s.student.last_name}`.toLowerCase() : '';
    const email = s.student?.email?.toLowerCase() || '';
    const org = s.org_name?.toLowerCase() || '';
    const term = searchTerm.toLowerCase();
    
    return name.includes(term) || email.includes(term) || org.includes(term);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
        <h2 className="text-2xl font-bold text-gray-800">Lista de Estudiantes</h2>
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Buscar estudiante o empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-ufro-primary/20 focus:border-ufro-primary transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
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
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                {/* Columna Estudiante */}
                <td className="py-5">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-800 leading-tight">
                      {student.student ? `${student.student.first_name} ${student.student.last_name}` : "Estudiante no registrado"}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">{student.student?.email}</span>
                  </div>
                </td>

                {/* Columna Carrera */}
                <td className="py-5">
                  <p className="text-sm text-gray-700 font-medium">{student.student?.degree || 'N/A'}</p>
                </td>

                {/* Columna Empresa */}
                <td className="py-5">
                  <p className="text-sm text-gray-700 font-medium">{student.org_name}</p>
                </td>

                {/* Columna Estado */}
                <td className="py-5 text-center">
                  <span className={`
                    px-6 py-1.5 rounded-full text-white text-xs font-bold inline-block min-w-32
                    ${(String(student.status?.title || student.status).toLowerCase().includes('revisi') || student.status === "in_review") ? "bg-blue-500" : ""}
                    ${(!student.status || String(student.status?.title || student.status).toLowerCase() === "pendiente" || student.status === "submitted" || student.status === "submited") ? "bg-amber-500" : ""}
                    ${(String(student.status?.title || student.status).toLowerCase().includes('aprob') || student.status === "approved") ? "bg-emerald-500" : ""}
                    ${(String(student.status?.title || student.status).toLowerCase().includes('rechaz') || student.status === "rejected") ? "bg-red-500" : ""}
                  `}>
                    {typeof student.status === 'object' ? student.status?.title : ( (student.status === "submitted" || student.status === "submited") ? "Pendiente" : (student.status || "Pendiente"))}
                  </span>
                </td>
                <td className="py-5 text-right">
                  <button 
                    onClick={() => navigate(`/coordinador/practica/${student.id}`)}
                    className="text-ufro-primary font-bold hover:underline text-sm transition-all"
                  >
                    Ver detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

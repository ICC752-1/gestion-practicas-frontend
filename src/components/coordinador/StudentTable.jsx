import React from 'react';
import { Search } from 'lucide-react';

const mockStudents = [
  { id: '1', name: 'Nombre estudiante', email: 'Correo electrónico', career: 'Ingeniería civil informática', company: 'Nombre empresa', status: 'En proceso' },
  { id: '2', name: 'Nombre estudiante', email: 'Correo electrónico', career: 'Ingeniería civil informática', company: 'Nombre empresa', status: 'Pendiente' },
  { id: '3', name: 'Nombre estudiante', email: 'Correo electrónico', career: 'Ingeniería civil informática', company: 'Nombre empresa', status: 'Completada' },
  { id: '4', name: 'Nombre estudiante', email: 'Correo electrónico', career: 'Ingeniería civil informática', company: 'Nombre empresa', status: 'En proceso' },
  { id: '5', name: 'Nombre estudiante', email: 'Correo electrónico', career: 'Ingeniería civil informática', company: 'Nombre empresa', status: 'En proceso' },
];

export const StudentTable = () => {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
        <h2 className="text-2xl font-bold text-gray-800">Lista de Estudiantes</h2>
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Buscar estudiante..."
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
            {mockStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-5">
                  <p className="font-bold text-gray-800">{student.name}</p>
                  <p className="text-xs text-gray-400 font-medium">{student.email}</p>
                </td>
                <td className="py-5">
                  <p className="text-sm text-gray-700 font-medium">{student.career}</p>
                </td>
                <td className="py-5">
                  <p className="text-sm text-gray-700 font-medium">{student.company}</p>
                </td>
                <td className="py-5 text-center">
                  <span className={`
                    px-6 py-1.5 rounded-full text-white text-xs font-bold inline-block min-w-32
                    ${student.status === 'En proceso' ? 'bg-ufro-primary' : ''}
                    ${student.status === 'Pendiente' ? 'bg-ufro-footer' : ''}
                    ${student.status === 'Completada' ? 'bg-ufro-secondary' : ''}
                  `}>
                    {student.status}
                  </span>
                </td>
                <td className="py-5 text-right">
                  <button className="text-ufro-primary font-bold hover:underline text-sm transition-all">
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

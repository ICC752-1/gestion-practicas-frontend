import { StudentTable } from '../coordinador/StudentTable';

const STATUS_FILTERS = [
  { value: '', label: 'Todas' },
  { value: 'submitted', label: 'Pendientes' },
  { value: 'in_review', label: 'En revisión' },
  { value: 'approved', label: 'Solicitudes aprobadas' },
  { value: 'rejected', label: 'Solicitudes rechazadas' },
];

const Management = ({ students, statusFilter, onStatusFilterChange }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0px_4px_12px_rgba(0,0,0,0.08)] border border-gray-100/50">
      <div className="flex flex-col gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800">Gestión de solicitudes de práctica</h2>
        <div className="flex flex-wrap gap-2" aria-label="Filtrar solicitudes por estado administrativo">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value || 'all'}
              type="button"
              onClick={() => onStatusFilterChange(filter.value)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                statusFilter === filter.value
                  ? 'bg-ufro-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
      <StudentTable students={students} />
    </div>
  );
};

export default Management;

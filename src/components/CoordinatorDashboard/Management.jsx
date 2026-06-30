import { motion } from 'framer-motion';
import { StudentTable } from '../coordinador/StudentTable';

const STATUS_FILTERS = [
  { value: '', label: 'Todas' },
  { value: 'submitted', label: 'Pendientes' },
  { value: 'in_review', label: 'En revisión' },
  { value: 'approved', label: 'Solicitudes aprobadas' },
  { value: 'rejected', label: 'Solicitudes rechazadas' },
];

const getEntryMotion = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  ...(delay > 0 ? { transition: { delay } } : {}),
});

const Management = ({ students, statusFilter, onStatusFilterChange }) => {
  return (
    <div className="rounded-2xl border border-gray-100/50 bg-white p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.08)] sm:p-6">
      <div className="flex flex-col gap-4 mb-6">
        <motion.h2
          className="text-xl font-bold text-gray-800"
          {...getEntryMotion()}
        >
          Gestión de solicitudes de práctica
        </motion.h2>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap" aria-label="Filtrar solicitudes por estado administrativo">
          {STATUS_FILTERS.map((filter, index) => (
            <motion.button
              key={filter.value || 'all'}
              type="button"
              onClick={() => onStatusFilterChange(filter.value)}
              {...getEntryMotion(0.06 + index * 0.04)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                statusFilter === filter.value
                  ? 'bg-ufro-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </motion.button>
          ))}
        </div>
      </div>
      <StudentTable students={students} />
    </div>
  );
};

export default Management;

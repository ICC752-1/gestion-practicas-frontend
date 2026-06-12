const DEFAULT_STATUS = {
  label: 'Desconocido',
  color: 'bg-gray-500',
  text: 'text-gray-500',
  border: 'border-gray-200',
  bg: 'bg-gray-50',
  icon: 'clock',
};

export const INTERNSHIP_STATUSES = {
  1: {
    label: 'Pendiente',
    color: 'bg-amber-500',
    text: 'text-amber-600',
    border: 'border-amber-200',
    bg: 'bg-amber-50',
    icon: 'clock',
  },
  2: {
    label: 'En revisión DIRAE',
    color: 'bg-purple-500',
    text: 'text-purple-600',
    border: 'border-purple-200',
    bg: 'bg-purple-50',
    icon: 'clock',
  },
  3: {
    label: 'En revisión',
    color: 'bg-blue-500',
    text: 'text-blue-600',
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    icon: 'clock',
  },
  4: {
    label: 'Aprobada',
    color: 'bg-green-500',
    text: 'text-green-600',
    border: 'border-green-200',
    bg: 'bg-green-50',
    icon: 'approved',
  },
  5: {
    label: 'Rechazada',
    color: 'bg-red-500',
    text: 'text-red-600',
    border: 'border-red-200',
    bg: 'bg-red-50',
    icon: 'rejected',
  },
};

export const getInternshipStatus = (statusId) =>
  INTERNSHIP_STATUSES[statusId] || DEFAULT_STATUS;

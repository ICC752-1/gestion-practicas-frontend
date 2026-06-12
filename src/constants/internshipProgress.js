export const REQUIRED_APPROVED_INTERNSHIPS = 4;

const STATUS_PROGRESS = {
  1: { percentage: 25, label: 'Registro pendiente de revisión', color: 'bg-amber-500' },
  2: { percentage: 50, label: 'En revisión DIRAE', color: 'bg-purple-500' },
  3: { percentage: 75, label: 'En revisión administrativa', color: 'bg-blue-500' },
  4: { percentage: 100, label: 'Práctica aprobada', color: 'bg-emerald-500' },
  5: { percentage: 0, label: 'Práctica rechazada', color: 'bg-red-500' },
};

const DEFAULT_PROGRESS = {
  percentage: 0,
  label: 'Estado sin progreso disponible',
  color: 'bg-gray-400',
};

export const getInternshipAdministrativeProgress = (statusId) =>
  STATUS_PROGRESS[statusId] || DEFAULT_PROGRESS;

export const getOverallInternshipProgress = (internships = []) => {
  const approvedCount = internships.filter((internship) => internship.status_id === 4).length;
  const completedCount = Math.min(approvedCount, REQUIRED_APPROVED_INTERNSHIPS);

  return {
    approvedCount,
    completedCount,
    requiredCount: REQUIRED_APPROVED_INTERNSHIPS,
    percentage: Math.round((completedCount / REQUIRED_APPROVED_INTERNSHIPS) * 100),
  };
};

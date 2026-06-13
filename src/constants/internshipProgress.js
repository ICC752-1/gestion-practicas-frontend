const PROGRESS_BY_STATUS = {
  Pendiente: {
    percentage: 25,
    label: 'Solicitud registrada',
    color: 'bg-amber-500',
  },
  'En revisión': {
    percentage: 60,
    label: 'Evaluación administrativa en curso',
    color: 'bg-blue-500',
  },
  'En revisión DIRAE': {
    percentage: 60,
    label: 'Revisión documental DIRAE en curso',
    color: 'bg-purple-500',
  },
  Aprobada: {
    percentage: 100,
    label: 'Proceso finalizado con aprobación',
    color: 'bg-green-500',
  },
  Rechazada: {
    percentage: 100,
    label: 'Proceso finalizado sin aprobación',
    color: 'bg-red-500',
  },
  Reprobada: {
    percentage: 100,
    label: 'Proceso finalizado sin aprobación',
    color: 'bg-red-500',
  },
};

const STATUS_TITLE_BY_ID = {
  1: 'Pendiente',
  2: 'En revisión DIRAE',
  3: 'En revisión',
  4: 'Aprobada',
  5: 'Rechazada',
};

export const getInternshipAdministrativeProgress = (internship) => {
  const statusTitle = internship?.status?.title
    || internship?.status
    || STATUS_TITLE_BY_ID[internship?.status_id]
    || 'Pendiente';

  return PROGRESS_BY_STATUS[statusTitle] || PROGRESS_BY_STATUS.Pendiente;
};

export const REQUIRED_PRACTICE_STAGES = 3;

const PRACTICE_STAGE_BY_TYPE = {
  'Práctica de Estudio I': 'practice_1',
  'Práctica de Estudio II': 'practice_2',
  'Práctica Controlada': 'final_option',
  Tesis: 'final_option',
};

const PROGRESS_BY_STATUS = {
  Anulada: {
    percentage: 100,
    label: 'Solicitud anulada',
    color: 'bg-gray-500',
  },
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
    label: 'Solicitud de práctica aprobada',
    color: 'bg-green-500',
  },
  Rechazada: {
    percentage: 100,
    label: 'Solicitud de práctica rechazada',
    color: 'bg-red-500',
  },
  Reprobada: {
    percentage: 100,
    label: 'Solicitud de práctica rechazada',
    color: 'bg-red-500',
  },
};

const PROGRESS_BY_COMPLETION = {
  in_progress: {
    percentage: 75,
    label: 'Práctica en ejecución',
    color: 'bg-blue-500',
  },
  pending_evaluations: {
    percentage: 85,
    label: 'Práctica pendiente de evaluaciones',
    color: 'bg-purple-500',
  },
  pending_presentation: {
    percentage: 90,
    label: 'Práctica pendiente de presentación',
    color: 'bg-purple-500',
  },
  finalized_passed: {
    percentage: 100,
    label: 'Práctica finalizada con resultado aprobado',
    color: 'bg-green-500',
  },
  finalized_failed: {
    percentage: 100,
    label: 'Práctica finalizada con resultado reprobado',
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

const resolveStatusProgress = (statusId) => {
  const statusTitle = STATUS_TITLE_BY_ID[statusId] || 'Pendiente';
  return PROGRESS_BY_STATUS[statusTitle] || PROGRESS_BY_STATUS.Pendiente;
};

export const getInternshipAdministrativeProgress = (internship) => {
  if (typeof internship === 'number' || typeof internship === 'string') {
    return resolveStatusProgress(Number(internship));
  }

  if (internship?.is_cancelled) {
    return PROGRESS_BY_STATUS.Anulada;
  }

  if (internship?.completion_status === 'finalized') {
    if (internship?.final_result === 'failed') {
      return PROGRESS_BY_COMPLETION.finalized_failed;
    }

    if (internship?.final_result === 'passed') {
      return PROGRESS_BY_COMPLETION.finalized_passed;
    }
  }

  if (
    internship?.completion_status
    && internship.completion_status !== 'not_started'
    && PROGRESS_BY_COMPLETION[internship.completion_status]
  ) {
    return PROGRESS_BY_COMPLETION[internship.completion_status];
  }

  const statusTitle = internship?.status?.title
    || internship?.status
    || STATUS_TITLE_BY_ID[internship?.status_id]
    || 'Pendiente';

  return PROGRESS_BY_STATUS[statusTitle] || PROGRESS_BY_STATUS.Pendiente;
};

export const getOverallInternshipProgress = (internships = []) => {
  const completedStages = new Set();

  internships.forEach((internship) => {
    if (
      internship?.is_cancelled
      || internship?.completion_status !== 'finalized'
      || internship?.final_result !== 'passed'
    ) {
      return;
    }

    const practiceType = internship?.internship_type?.value
      || internship?.internship_type;
    const stage = PRACTICE_STAGE_BY_TYPE[practiceType];
    if (stage) completedStages.add(stage);
  });

  const completedCount = Math.min(
    completedStages.size,
    REQUIRED_PRACTICE_STAGES,
  );

  return {
    completedCount,
    requiredCount: REQUIRED_PRACTICE_STAGES,
    percentage: Math.round((completedCount / REQUIRED_PRACTICE_STAGES) * 100),
  };
};

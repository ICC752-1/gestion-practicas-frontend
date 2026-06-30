import api from './api';

const MESSAGE_TRANSLATIONS = [
  {
    matches: [
      'video_url must be an absolute HTTP(S) URL',
      'La URL del video debe ser completa',
    ],
    message: 'Ingresa una URL completa del video que comience con http:// o https://.',
  },
  {
    matches: [
      'Each question must have at least two options',
      'Cada pregunta debe tener al menos dos opciones',
    ],
    message: 'Cada pregunta debe tener al menos dos opciones de respuesta.',
  },
  {
    matches: [
      'Question options cannot be blank',
      'Las opciones de respuesta no pueden estar vacias',
    ],
    message: 'Completa todas las opciones de respuesta o elimina las que no usarás.',
  },
  {
    matches: [
      'correct_answer must match one option key',
      'La respuesta correcta debe coincidir',
    ],
    message: 'Selecciona una respuesta correcta válida para cada pregunta.',
  },
  {
    matches: [
      'min_score cannot exceed',
      'El puntaje minimo no puede superar',
    ],
    message: 'El puntaje mínimo no puede superar el total de preguntas.',
  },
  {
    matches: [
      'Video order values must be unique',
      'El orden de los videos no puede repetirse',
    ],
    message: 'El orden de los videos no puede repetirse.',
  },
  {
    matches: [
      'Question order values must be unique',
      'El orden de las preguntas no puede repetirse',
    ],
    message: 'El orden de las preguntas no puede repetirse.',
  },

  {
    matches: ['Induction version not found'],
    message: 'No se encontró la versión de inducción solicitada.',
  },
  {
    matches: ['Field required', 'String should have at least 1 character'],
    message: 'Completa todos los campos obligatorios antes de guardar.',
  },
];

const cleanBackendMessage = (message = '') => (
  String(message)
    .replace(/^Value error,\s*/i, '')
    .replace(/^Assertion failed,\s*/i, '')
    .trim()
);

const translateBackendMessage = (message) => {
  const cleaned = cleanBackendMessage(message);
  const translation = MESSAGE_TRANSLATIONS.find(({ matches }) => (
    matches.some((match) => cleaned.includes(match) || String(message).includes(match))
  ));

  return translation?.message || cleaned;
};

export const getInductionAdminErrorMessage = (error) => {
  const detail = error?.response?.data?.detail || error?.message;

  if (typeof detail === 'string') {
    return translateBackendMessage(detail) || 'No se pudo completar la acción.';
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => translateBackendMessage(item?.msg || item?.message || ''))
      .filter(Boolean);

    return [...new Set(messages)].join(' ') || 'No se pudo completar la acción.';
  }

  if (detail?.message) {
    return translateBackendMessage(detail.message);
  }

  return 'No se pudo completar la acción.';
};

export const inductionAdminService = {
  async listVersions() {
    const response = await api.get('/induction/admin/versions');
    return response.data;
  },

  async getVersion(versionId) {
    const response = await api.get(`/induction/admin/versions/${versionId}`);
    return response.data;
  },

  async createDraft(payload) {
    const response = await api.post('/induction/admin/versions', payload);
    return response.data;
  },

  async updateVersion(versionId, payload) {
    const response = await api.patch(`/induction/admin/versions/${versionId}`, payload);
    return response.data;
  },

  async deleteVersion(versionId) {
    await api.delete(`/induction/admin/versions/${versionId}`);
  },

  async publish(versionId) {
    const response = await api.post(`/induction/admin/versions/${versionId}/publish`);
    return response.data;
  },

  async activate(versionId) {
    const response = await api.post(`/induction/admin/versions/${versionId}/publish`);
    return response.data;
  },
};

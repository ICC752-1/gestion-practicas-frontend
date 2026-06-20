import api from './api';

export const dataPortabilityService = {
  async downloadMyData({ format = 'zip', includeDocuments = true } = {}) {
    const response = await api.get('/data-portability/me/export', {
      params: {
        format,
        include_documents: includeDocuments,
      },
      responseType: 'blob',
    });

    const disposition = response.headers['content-disposition'];
    const filenameMatch = disposition?.match(/filename="(.+)"/);
    const filename = filenameMatch?.[1] || `portabilidad-estudiante.${format}`;

    return {
      blob: response.data,
      filename,
    };
  },
};

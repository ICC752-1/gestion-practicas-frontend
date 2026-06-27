import api from './api';

export const dataPortabilityService = {
  async downloadMyData({ format = 'zip', includeDocuments = true } = {}) {
    let response;

    try {
      response = await api.get('/data-portability/me/export', {
        params: {
          format,
          include_documents: includeDocuments,
        },
        responseType: 'blob',
      });
    } catch (error) {
      if (error.response?.data instanceof Blob) {
        const text = await error.response.data.text();
        try {
          error.response.data = JSON.parse(text);
        } catch {
          error.response.data = { detail: text };
        }
      }
      throw error;
    }

    const disposition = response.headers['content-disposition'];
    const filenameMatch = disposition?.match(/filename="(.+)"/);
    const filename = filenameMatch?.[1] || `portabilidad-estudiante.${format}`;

    return {
      blob: response.data,
      filename,
    };
  },
};

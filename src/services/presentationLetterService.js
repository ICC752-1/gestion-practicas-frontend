import api from './api';

export const presentationLetterService = {
  async generateLetter(practiceType) {
    const response = await api.post('/presentation-letters/generate', {
      practice_type: practiceType,
    });
    return response.data;
  },

  async getMyLetters() {
    const response = await api.get('/presentation-letters/me');
    return response.data;
  },

  async downloadLetter(letterId) {
    const response = await api.get(`/presentation-letters/${letterId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async getTemplates() {
    const response = await api.get('/presentation-letters/templates');
    return response.data;
  },

  async getTemplate(practiceType) {
    const response = await api.get(`/presentation-letters/templates/${encodeURIComponent(practiceType)}`);
    return response.data;
  },

  async updateTemplate(practiceType, payload) {
    const response = await api.put(
      `/presentation-letters/templates/${encodeURIComponent(practiceType)}`,
      payload,
    );
    return response.data;
  },
};

export const downloadPresentationLetterBlob = (blob, filename = 'carta-presentacion.pdf') => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

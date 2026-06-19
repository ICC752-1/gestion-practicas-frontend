import api from './api';

export const selfEvaluationService = {
  async getForm(internshipId) {
    const response = await api.get(`/self-evaluations/internships/${internshipId}/form`);
    return response.data;
  },

  async saveDraft(internshipId, data) {
    const response = await api.put(`/self-evaluations/internships/${internshipId}/draft`, data);
    return response.data;
  },

  async submit(internshipId, data) {
    const response = await api.post(`/self-evaluations/internships/${internshipId}/submit`, data);
    return response.data;
  },

  async listMine() {
    const response = await api.get('/self-evaluations/me');
    return response.data;
  },
};

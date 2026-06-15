import api from './api';

export const supervisorEvaluationService = {
  async generateInvitation(internshipId) {
    const response = await api.post(`/supervisor/evaluations/internships/${internshipId}/invitations`);
    return response.data;
  },

  async getPublicEvaluationForm(token) {
    const response = await api.get(`/supervisor/evaluations/invitations/${token}`);
    return response.data;
  },

  async submitPublicEvaluation(token, payload) {
    const response = await api.post(
      `/supervisor/evaluations/invitations/${token}/submit`,
      payload
    );
    return response.data;
  },

  async getMyAssignments() {
    const response = await api.get('/supervisor/evaluations/me');
    return response.data;
  },
};

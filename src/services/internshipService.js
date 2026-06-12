import api from './api';

export const internshipService = {
  async createInternship(data) {
    const response = await api.post('/internships', data);
    return response.data;
  },

  async getRegistrationEligibility() {
    const response = await api.get('/internships/registration-eligibility');
    return response.data;
  },

  async getInductionContent() {
    const response = await api.get('/internships/induction');
    return response.data;
  },

  async submitInductionAttempt(answers) {
    const response = await api.post('/internships/induction/attempts', { answers });
    return response.data;
  },

  async getInternships() {
    const response = await api.get('/internships');
    return response.data;
  },

  async getIntershipById(id) {
    const response = await api.get(`/internships/${id}`);
    return response.data;
  },

  async getMyInternships() {
    const response = await api.get('/internships/me');
    return response.data;
  },

  async getInternshipTracking(internshipId) {
    const response = await api.get(`/internships/${internshipId}/tracking`);
    return response.data;
  },
}

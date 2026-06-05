import api from './api';

export const internshipService = {
  async createInternship(data) {
    const response = await api.post('/internships', data);
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

  async approveInternship(internshipId, comment) {
    const response = await api.post(`/internships/${internshipId}/approve`, { comment });
    return response.data;
  },

  async rejectInternship(internshipId, comment) {
    const response = await api.post(`/internships/${internshipId}/reject`, { comment });
    return response.data;
  },

  async deriveInternship(internshipId, comment) {
    const response = await api.post(`/internships/${internshipId}/derive`, { comment });
    return response.data;
  },
}
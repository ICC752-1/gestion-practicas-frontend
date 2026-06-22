import api from './api';

export const internshipService = {
  async createInternship(data) {
    const response = await api.post('/internships', data);
    return response.data;
  },

  async getRegistrationEligibility(params = {}) {
    const response = await api.get('/internships/registration-eligibility', { params });
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

  async getInternshipById(id) {
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

  async getDiraeTracking(internshipId) {
    const response = await api.get(`/internships/${internshipId}/dirae-tracking`);
    return response.data;
  },

  async getStudentActions(internshipId) {
    const response = await api.get(`/internships/${internshipId}/student-actions`);
    return response.data;
  },

  async updateStudentInternship(internshipId, data) {
    const response = await api.patch(`/internships/${internshipId}/student`, data);
    return response.data;
  },

  async cancelStudentInternship(internshipId, reason) {
    const response = await api.post(`/internships/${internshipId}/student/cancel`, { reason });
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

  async reopenDiraeRectification(internshipId, comment) {
    const response = await api.post(`/internships/${internshipId}/dirae-reopen`, { comment });
    return response.data;
  },
}

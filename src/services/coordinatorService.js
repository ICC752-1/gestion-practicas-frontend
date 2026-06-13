import api from './api';

export const coordinatorService = {
  async getDashboardStats() {
    const response = await api.get('/admin/summary');
    return response.data;
  },

  async getPractices(status) {
    const params = status ? { status } : {};
    const response = await api.get('/admin/internships', { params });
    return response.data;
  },

  async getPracticeById(id) {
    const response = await api.get(`/admin/internships/${id}`);
    return response.data;
  },

  async updatePracticeStatus(studentId, requirementId, status) {
    const response = await api.patch(
      `/admin/students/${studentId}/internship-requirements/${requirementId}/status`,
      { status }
    );
    return response.data;
  },
};

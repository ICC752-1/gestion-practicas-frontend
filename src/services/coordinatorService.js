import api from './api';

export const coordinatorService = {
  async getDashboardStats() {
    const response = await api.get('/admin/summary');
    return response.data;
  },

  async getPractices() {
    const response = await api.get('/admin/internships');
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


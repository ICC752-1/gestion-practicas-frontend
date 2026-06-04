import api from './api';

export const coordinatorService = {
  async getDashboardStats() {
    try {
      const response = await api.get('/admin/summary');
      return response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        // Fallback silencioso si no hay acceso a admin
        return {
          total_internships: 0,
          internships_by_status: []
        };
      }
      throw error;
    }
  },

  async getPractices(status) {
    const params = status ? { status } : {};
    try {
      const response = await api.get('/admin/internships', { params });
      return response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        // Fallback a ruta estándar
        const response = await api.get('/internships', { params });
        return response.data;
      }
      throw error;
    }
  },

  async getPracticeById(id) {
    try {
      const response = await api.get(`/admin/internships/${id}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        // Fallback a ruta estándar
        const response = await api.get(`/internships/${id}`);
        return response.data;
      }
      throw error;
    }
  },

  async updatePracticeStatus(studentId, requirementId, status) {
    const response = await api.patch(
      `/admin/students/${studentId}/internship-requirements/${requirementId}/status`,
      { status }
    );
    return response.data;
  },
};

import api from './api';

export const studentAccountService = {
  async listStudents(params = {}) {
    const response = await api.get('/users/students', { params });
    return response.data;
  },

  async createStudent(payload) {
    const response = await api.post('/users/students', payload);
    return response.data;
  },

  async updateStudent(userId, payload) {
    const response = await api.patch(`/users/students/${userId}`, payload);
    return response.data;
  },
};

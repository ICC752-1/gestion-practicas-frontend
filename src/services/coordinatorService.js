import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const coordinatorService = {
  async getDashboardStats() {
    const response = await axios.get(`${API_BASE_URL}/coordinator/stats`);
    return response.data;
  },

  async getPractices() {
    const response = await axios.get(`${API_BASE_URL}/coordinator/practices`);
    return response.data;
  },

  async updatePracticeStatus(practiceId, status) {
    const response = await axios.patch(`${API_BASE_URL}/coordinator/practices/${practiceId}`, { status });
    return response.data;
  },
};

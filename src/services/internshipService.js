import api from './api';

export const internshipService = {
    async createIntership(data) {
        const response = await api.post('/internships', data);
        return response.data;
    },

    async getInterships() {
        const response = await api.get('/internships');
        return response.data;
    },

    async getIntershipById(id) {
        const response = await api.get(`/internships/${id}`);
        return response.data;
    },

    async getInternships(status) {
        const params = status ? { status } : {};
        const response = await api.get('/internships', { params });
        return response.data;
    },

    async getInternshipStats() {
        const response = await api.get('/internships/stats');
        return response.data;
    },
}
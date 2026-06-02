import api from './api';

export const internshipService = {
    async createInternship(payload) {
        const response = await api.post('/internships', payload);
        return response.data;
    },

    async getInternships() {
        const response = await api.get('/internships');
        return response.data;
    },
    async getMyInternship() {
        const response = await api.get('/internships/me');
        return response.data;
    },
    async getInternshipStats() {
        const response = await api.get('/internships/stats');
        return response.data;
    },

    async getInternshipById(id) {
        const response = await api.get(`/internships/${id}`);
        return response.data;
    },

}
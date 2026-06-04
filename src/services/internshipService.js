import api from './api';

export const internshipService = {
    async createIntership(data) {
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
}
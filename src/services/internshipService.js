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
        try {
            // Intentamos primero la ruta de administración si el rol lo permite
            const response = await api.get('/admin/internships', { params });
            return response.data;
        } catch (error) {
            if (error.response?.status === 403) {
                // Fallback silencioso para no ensuciar la consola si ya sabemos que puede fallar
                const response = await api.get('/internships', { params });
                return response.data;
            }
            throw error;
        }
    },

    async getInternshipStats() {
        try {
            const response = await api.get('/admin/summary');
            return response.data;
        } catch (error) {
            if (error.response?.status === 403) {
                // Fallback silencioso devolviendo datos vacíos para que el dashboard calcule localmente
                return {
                    total_internships: 0,
                    internships_by_status: []
                };
            }
            throw error;
        }
    },
}
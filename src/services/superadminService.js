import api from './api';

export const listUsers = async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
};

export const createUser = async (payload) => {
    const response = await api.post('/users', payload);
    return response.data;
};

export const updateUser = async (userId, payload) => {
    const response = await api.patch(`/users/${userId}`, payload);
    return response.data;
};

export const listRoles = async () => {
    const response = await api.get('/roles');
    return response.data;
};

export const assignUserRole = async (userId, roleId) => {
    const response = await api.post(`/users/${userId}/roles`, { role_id: roleId });
    return response.data;
};

export const removeUserRole = async (userId, roleId) => {
    await api.delete(`/users/${userId}/roles/${roleId}`);
};

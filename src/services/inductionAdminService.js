import api from './api';

export const inductionAdminService = {
  async listVersions() {
    const response = await api.get('/induction/admin/versions');
    return response.data;
  },

  async getVersion(versionId) {
    const response = await api.get(`/induction/admin/versions/${versionId}`);
    return response.data;
  },

  async createDraft(payload) {
    const response = await api.post('/induction/admin/versions', payload);
    return response.data;
  },

  async updateDraft(versionId, payload) {
    const response = await api.patch(`/induction/admin/versions/${versionId}`, payload);
    return response.data;
  },

  async discardDraft(versionId) {
    await api.delete(`/induction/admin/versions/${versionId}`);
  },

  async publish(versionId) {
    const response = await api.post(`/induction/admin/versions/${versionId}/publish`);
    return response.data;
  },
};

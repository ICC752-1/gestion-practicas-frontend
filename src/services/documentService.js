import api from './api';

export const documentService = {
  /**
   * Obtiene la lista de tipos de documentos disponibles.
   * GET /documents/types
   */
  async getDocumentTypes() {
    const response = await api.get('/documents/types');
    return response.data;
  },

  /**
   * Sube un documento asociado a una práctica específica.
   * POST /internships/{internship_id}/documents
   */
  async uploadDocument(internshipId, documentTypeId, file) {
    const formData = new FormData();
    formData.append('document_type_id', documentTypeId);
    formData.append('file', file);

    const response = await api.post(`/internships/${internshipId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Obtiene la lista de documentos de una práctica.
   * GET /internships/{internship_id}/documents
   */
  async getInternshipDocuments(internshipId) {
    const response = await api.get(`/internships/${internshipId}/documents`);
    return response.data;
  },

  /**
   * Descarga un documento específico.
   * GET /documents/{document_id}/download
   */
  async downloadDocument(documentId) {
    const response = await api.get(`/documents/${documentId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Actualiza el estado de un documento (Rol documental).
   * PATCH /documents/{document_id}/status
   */
  async updateDocumentStatus(documentId, statusData) {
    const response = await api.patch(`/documents/${documentId}/status`, statusData);
    return response.data;
  },

  /**
   * Elimina un documento.
   * DELETE /documents/{document_id}
   */
  async deleteDocument(documentId) {
    const response = await api.delete(`/documents/${documentId}`);
    return response.data;
  },
};

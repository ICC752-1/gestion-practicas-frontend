import api from './api';

const APPROVED_INTERNSHIP_STATE = 'Aprobada';
const PRESENTATION_SLIDES_TYPE_NAME = 'Diapositivas de Presentación';
const TERMINAL_INTERNSHIP_STATES = new Set([
  APPROVED_INTERNSHIP_STATE,
  'Rechazada',
  'Reprobada',
]);

const getStatusTitle = (internship) => internship?.status?.title || internship?.status;

const isApprovedInternship = (internship) => (
  getStatusTitle(internship) === APPROVED_INTERNSHIP_STATE
  || internship?.status_id === 4
);

const getDocumentTypeId = (document) => document?.type_id || document?.document_type?.id;

export const getUploadableDocumentTypes = (
  internship,
  documentTypes = [],
  documents = []
) => {
  if (!isApprovedInternship(internship)) {
    return documentTypes;
  }

  const observedTypeIds = new Set(
    documents
      .filter((document) => document?.status === 'observed')
      .map(getDocumentTypeId)
      .filter(Boolean)
      .map(String)
  );

  return documentTypes.filter((documentType) => (
    observedTypeIds.has(String(documentType.id))
    || documentType.name === PRESENTATION_SLIDES_TYPE_NAME
  ));
};

export const canUploadDocuments = (internship) => {
  if (internship?.is_cancelled) {
    return false;
  }

  const statusTitle = getStatusTitle(internship);
  if (typeof statusTitle === 'string') {
    if (isApprovedInternship(internship)) {
      return true;
    }

    return !TERMINAL_INTERNSHIP_STATES.has(statusTitle);
  }

  if (isApprovedInternship(internship)) {
    return true;
  }

  return ![5, 6].includes(internship?.status_id);
};

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

    const response = await api.post(`/internships/${internshipId}/documents`, formData);
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
   * Obtiene el paquete documental DIRAE de una práctica.
   * GET /internships/{internship_id}/documents/package
   */
  async getDocumentPackage(internshipId) {
    const response = await api.get(`/internships/${internshipId}/documents/package`);
    return response.data;
  },

  /**
   * Exporta paquetes documentales DIRAE en CSV.
   * GET /dirae/document-packages/export
   */
  async exportDiraeDocumentPackages(internshipIds = []) {
    const query = new URLSearchParams();
    internshipIds.forEach((internshipId) => {
      query.append('internship_ids', internshipId);
    });

    const path = query.toString()
      ? `/dirae/document-packages/export?${query.toString()}`
      : '/dirae/document-packages/export';
    try {
      const response = await api.get(path, { responseType: 'blob' });
      const disposition = response.headers['content-disposition'] || '';
      const filenameMatch = disposition.match(/filename="?([^";]+)"?/i);

      return {
        blob: response.data,
        filename: filenameMatch?.[1] || 'dirae_document_packages.csv',
      };
    } catch (error) {
      if (error.response?.data instanceof Blob) {
        const text = await error.response.data.text();
        try {
          error.response.data = JSON.parse(text);
        } catch {
          error.response.data = { detail: text };
        }
      }

      throw error;
    }
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
    await api.delete(`/documents/${documentId}`);
  },
};

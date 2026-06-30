import api from './api';

const cleanParams = (filters = {}) => Object.fromEntries(
  Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== '')
);

const getFilename = (contentDisposition) => {
  const match = contentDisposition?.match(/filename="?([^";]+)"?/i);
  return match?.[1];
};

export const adminReportService = {
  async getDashboard(filters) {
    const response = await api.get('/admin/reports/dashboard', {
      params: cleanParams(filters),
    });
    return response.data;
  },

  async exportCsv(filters) {
    const response = await api.get('/admin/reports/export.csv', {
      params: cleanParams(filters),
      responseType: 'blob',
    });
    return {
      blob: response.data,
      filename: getFilename(response.headers['content-disposition']) || 'reporte_institucional.csv',
    };
  },

  async exportPdf(filters) {
    const response = await api.get('/admin/reports/export.pdf', {
      params: cleanParams(filters),
      responseType: 'blob',
    });
    return {
      blob: response.data,
      filename: getFilename(response.headers['content-disposition']) || 'reporte_institucional.pdf',
    };
  },
};

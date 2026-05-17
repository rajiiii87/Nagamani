import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Company API
export const companyAPI = {
  createOrUpdate: (data) => api.post('/company', data),
  get: () => api.get('/company'),
};

// Party API
export const partyAPI = {
  create: (data) => api.post('/parties', data),
  getAll: (search) => api.get('/parties', { params: { search } }),
  getById: (id) => api.get(`/parties/${id}`),
  update: (id, data) => api.put(`/parties/${id}`, data),
  delete: (id) => api.delete(`/parties/${id}`),
};

// Goods API
export const goodsAPI = {
  create: (data) => api.post('/goods', data),
  getAll: (search) => api.get('/goods', { params: { search } }),
  getById: (id) => api.get(`/goods/${id}`),
  update: (id, data) => api.put(`/goods/${id}`, data),
  delete: (id) => api.delete(`/goods/${id}`),
};

// Invoice API
export const invoiceAPI = {
  create: (data) => api.post('/invoices', data),
  getAll: (params) => api.get('/invoices', { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  generatePDF: (id) => {
    return api.post(`/invoices/${id}/pdf`, {}, {
      responseType: 'blob'
    }).then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
      window.URL.revokeObjectURL(url);
      return response;
    });
  },
  print: (id) => api.post(`/invoices/${id}/print`),
  cancel: (id) => api.post(`/invoices/${id}/cancel`),
  getMonthlyReport: (params) => api.get('/invoices/monthly-report', { params }),
  getPartyReport: (params) => api.get('/invoices/party-report', { params }),
};

export default api;

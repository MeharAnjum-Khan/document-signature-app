import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });

        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
  profile: () => api.get('/auth/profile'),
  logout: () => api.post('/auth/logout'),
};

// Document API
export const documentAPI = {
  upload: (formData: FormData) =>
    api.post('/docs/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAll: (params?: { status?: string; search?: string; page?: number; limit?: number }) =>
    api.get('/docs', { params }),
  getById: (id: string) => api.get(`/docs/${id}`),
  getFileUrl: (id: string) => `${API_BASE}/docs/${id}/file`,
  download: (id: string) => api.get(`/docs/${id}/download`, { responseType: 'blob' }),
  delete: (id: string) => api.delete(`/docs/${id}`),
};

// Signature API
export const signatureAPI = {
  create: (data: {
    documentId: string;
    signerEmail: string;
    signerName?: string;
    page: number;
    x: number;
    y: number;
    width?: number;
    height?: number;
  }) => api.post('/signatures', data),
  getByDocument: (docId: string) => api.get(`/signatures/document/${docId}`),
  getByToken: (token: string) => api.get(`/signatures/token/${token}`),
  sign: (token: string, data: { signatureData: string; signatureType: string }) =>
    api.post(`/signatures/sign/${token}`, data),
  reject: (token: string, data: { reason?: string }) =>
    api.post(`/signatures/reject/${token}`, data),
  delete: (id: string) => api.delete(`/signatures/${id}`),
};

// Share API
export const shareAPI = {
  send: (docId: string, data: { signerEmail: string; signerName?: string }) =>
    api.post(`/share/${docId}`, data),
};

// Audit API
export const auditAPI = {
  getByDocument: (fileId: string) => api.get(`/audit/${fileId}`),
};

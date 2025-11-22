import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/users/login/', { username, password }),
  register: (data: any) => api.post('/users/register/', data),
  logout: () => api.post('/users/logout/'),
  getCurrentUser: () => api.get('/users/me/'),
  requestPasswordReset: (email: string) =>
    api.post('/users/request_password_reset/', { email }),
  verifyPasswordReset: (email: string, otp: string, new_password: string) =>
    api.post('/users/verify_password_reset/', { email, otp, new_password }),
};

// Products APIs
export const productsAPI = {
  getAll: (params?: any) => api.get('/products/', { params }),
  getOne: (id: number) => api.get(`/products/${id}/`),
  create: (data: any) => api.post('/products/', data),
  update: (id: number, data: any) => api.put(`/products/${id}/`, data),
  delete: (id: number) => api.delete(`/products/${id}/`),
};

export const categoriesAPI = {
  getAll: (params?: any) => api.get('/categories/', { params }),
  create: (data: any) => api.post('/categories/', data),
};

export const unitsAPI = {
  getAll: (params?: any) => api.get('/units/', { params }),
  create: (data: any) => api.post('/units/', data),
};

// Warehouse APIs
export const warehousesAPI = {
  getAll: (params?: any) => api.get('/warehouses/', { params }),
  getOne: (id: number) => api.get(`/warehouses/${id}/`),
  create: (data: any) => api.post('/warehouses/', data),
  update: (id: number, data: any) => api.put(`/warehouses/${id}/`, data),
};

export const locationsAPI = {
  getAll: (params?: any) => api.get('/locations/', { params }),
  create: (data: any) => api.post('/locations/', data),
};

export const stockQuantsAPI = {
  getAll: (params?: any) => api.get('/stock-quants/', { params }),
};

// Operations APIs
export const receiptsAPI = {
  getAll: (params?: any) => api.get('/receipts/', { params }),
  getOne: (id: number) => api.get(`/receipts/${id}/`),
  create: (data: any) => api.post('/receipts/', data),
  validate: (id: number) => api.post(`/receipts/${id}/validate_receipt/`),
};

export const deliveriesAPI = {
  getAll: (params?: any) => api.get('/deliveries/', { params }),
  getOne: (id: number) => api.get(`/deliveries/${id}/`),
  create: (data: any) => api.post('/deliveries/', data),
  validate: (id: number) => api.post(`/deliveries/${id}/validate_delivery/`),
};

export const transfersAPI = {
  getAll: (params?: any) => api.get('/transfers/', { params }),
  getOne: (id: number) => api.get(`/transfers/${id}/`),
  create: (data: any) => api.post('/transfers/', data),
  validate: (id: number) => api.post(`/transfers/${id}/validate_transfer/`),
};

export const adjustmentsAPI = {
  getAll: (params?: any) => api.get('/adjustments/', { params }),
  getOne: (id: number) => api.get(`/adjustments/${id}/`),
  create: (data: any) => api.post('/adjustments/', data),
  validate: (id: number) => api.post(`/adjustments/${id}/validate_adjustment/`),
};

// Dashboard APIs
export const dashboardAPI = {
  getKPIs: () => api.get('/dashboard/kpis/'),
  getRecentMovements: (params?: any) =>
    api.get('/dashboard/recent-movements/', { params }),
  getStockLevels: (params?: any) =>
    api.get('/dashboard/stock-levels/', { params }),
};

// Stock Movements API
export const stockMovementsAPI = {
  getAll: (params?: any) => api.get('/movements/', { params }),
};

export default api;

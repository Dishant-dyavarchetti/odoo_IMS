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
  getProducts: (params?: any) => api.get('/products/', { params }),
  getProduct: (id: number) => api.get(`/products/${id}/`),
  createProduct: (data: any) => api.post('/products/', data),
  updateProduct: (id: number, data: any) => api.put(`/products/${id}/`, data),
  deleteProduct: (id: number) => api.delete(`/products/${id}/`),
  getCategories: (params?: any) => api.get('/categories/', { params }),
  getCategory: (id: number) => api.get(`/categories/${id}/`),
  createCategory: (data: any) => api.post('/categories/', data),
  updateCategory: (id: number, data: any) => api.put(`/categories/${id}/`, data),
  deleteCategory: (id: number) => api.delete(`/categories/${id}/`),
  getUOMs: (params?: any) => api.get('/units/', { params }),
  getUOM: (id: number) => api.get(`/units/${id}/`),
  createUOM: (data: any) => api.post('/units/', data),
  updateUOM: (id: number, data: any) => api.put(`/units/${id}/`, data),
  deleteUOM: (id: number) => api.delete(`/units/${id}/`),
};

// Warehouse APIs
export const warehousesAPI = {
  getWarehouses: (params?: any) => api.get('/warehouses/', { params }),
  getWarehouse: (id: number) => api.get(`/warehouses/${id}/`),
  createWarehouse: (data: any) => api.post('/warehouses/', data),
  updateWarehouse: (id: number, data: any) => api.put(`/warehouses/${id}/`, data),
  deleteWarehouse: (id: number) => api.delete(`/warehouses/${id}/`),
  getLocations: (params?: any) => api.get('/locations/', { params }),
  getLocation: (id: number) => api.get(`/locations/${id}/`),
  createLocation: (data: any) => api.post('/locations/', data),
  updateLocation: (id: number, data: any) => api.put(`/locations/${id}/`, data),
  deleteLocation: (id: number) => api.delete(`/locations/${id}/`),
  getStockQuants: (params?: any) => api.get('/stock-quants/', { params }),
};

// Operations APIs
export const receiptsAPI = {
  getReceipts: (params?: any) => api.get('/receipts/', { params }),
  getReceipt: (id: number) => api.get(`/receipts/${id}/`),
  createReceipt: (data: any) => api.post('/receipts/', data),
  updateReceipt: (id: number, data: any) => api.put(`/receipts/${id}/`, data),
  deleteReceipt: (id: number) => api.delete(`/receipts/${id}/`),
  validateReceipt: (id: number) => api.post(`/receipts/${id}/validate_receipt/`),
};

export const deliveriesAPI = {
  getDeliveries: (params?: any) => api.get('/deliveries/', { params }),
  getDelivery: (id: number) => api.get(`/deliveries/${id}/`),
  createDelivery: (data: any) => api.post('/deliveries/', data),
  updateDelivery: (id: number, data: any) => api.put(`/deliveries/${id}/`, data),
  deleteDelivery: (id: number) => api.delete(`/deliveries/${id}/`),
  validateDelivery: (id: number) => api.post(`/deliveries/${id}/validate_delivery/`),
};

export const transfersAPI = {
  getTransfers: (params?: any) => api.get('/transfers/', { params }),
  getTransfer: (id: number) => api.get(`/transfers/${id}/`),
  createTransfer: (data: any) => api.post('/transfers/', data),
  updateTransfer: (id: number, data: any) => api.put(`/transfers/${id}/`, data),
  deleteTransfer: (id: number) => api.delete(`/transfers/${id}/`),
  validateTransfer: (id: number) => api.post(`/transfers/${id}/validate_transfer/`),
};

export const adjustmentsAPI = {
  getAdjustments: (params?: any) => api.get('/adjustments/', { params }),
  getAdjustment: (id: number) => api.get(`/adjustments/${id}/`),
  createAdjustment: (data: any) => api.post('/adjustments/', data),
  updateAdjustment: (id: number, data: any) => api.put(`/adjustments/${id}/`, data),
  deleteAdjustment: (id: number) => api.delete(`/adjustments/${id}/`),
  validateAdjustment: (id: number) => api.post(`/adjustments/${id}/validate_adjustment/`),
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

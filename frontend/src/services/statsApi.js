// src/api/api.js

import axios from 'axios';
// No need to import the store if reading token from localStorage
// import { store } from '../app/store';

const apiClient = axios.create({
  baseURL: 'http://35.175.227.5:3001',
});

// The interceptor that adds the auth token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Your Existing API Functions ---
export const login = (credentials) => apiClient.post('/auth/signin', credentials);
// ... other auth and product functions ...
export const getProducts = () => apiClient.get('/products');
// ...


// --- STEP 1: ADD THE STATS FUNCTIONS HERE ---
// They now use the authenticated 'apiClient'
const STATS_BASE = '/products/stats';

export const getTotalInventoryValue = async () => {
  const response = await apiClient.get(`${STATS_BASE}/total-value`);
  return response.data; // axios puts the response in .data
};

export const getAveragePrice = async () => {
  const response = await apiClient.get(`${STATS_BASE}/average-price`);
  return response.data;
};

export const getPriceRange = async () => {
  const response = await apiClient.get(`${STATS_BASE}/price-range`);
  return response.data;
};

export const getProductCountPerCategory = async () => {
  const response = await apiClient.get(`${STATS_BASE}/category-count`);
  return response.data;
};

export const getOutOfStockProducts = async () => {
  const response = await apiClient.get(`${STATS_BASE}/out-of-stock`);
  return response.data;
};

export const getTopExpensiveProducts = async () => {
  const response = await apiClient.get(`${STATS_BASE}/top-expensive`);
  return response.data;
};

export const getRecentProducts = async (days = 7) => {
  const response = await apiClient.get(`${STATS_BASE}/recent?days=${days}`);
  return response.data;
};
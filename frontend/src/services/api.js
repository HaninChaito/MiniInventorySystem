import axios from 'axios';
import { store } from '../app/store'; // Import your central Redux store

// 1. Create a single, configured Axios instance
const apiClient = axios.create({
  baseURL: 'http://35.175.227.5:3001',
});

// 2. The Interceptor: This is the magic part.
// It runs BEFORE every single request is sent.
apiClient.interceptors.request.use(
  (config) => {
    // Get the current Redux state to find the auth token
    const state = store.getState();
    const token = state.auth.token;

    // If a token exists in our Redux store, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config; // Continue with the request
  },
  (error) => {
    // Handle any request errors
    return Promise.reject(error);
  }
);


// 3. Your Refactored API Functions
// They are now much cleaner and don't need to worry about headers or base URLs.

// --- AUTH FUNCTIONS ---
// (You'll need these for your login/signup pages)
export const login = (credentials) => apiClient.post('/auth/signin', credentials);
export const signup = (userData) => apiClient.post('/auth/signup', userData);
export const confirmSignup = (confirmationData) => apiClient.post('/auth/confirm-signup', confirmationData);


// --- PRODUCT FUNCTIONS (Your original functions, now updated) ---

export async function getProducts() {
  // Axios automatically throws an error for non-2xx responses and parses JSON.
  const response = await apiClient.get('/products');
  return response.data; // Axios puts the JSON response in `response.data`
}

export async function searchProducts({ category, minPrice, maxPrice, inStock }) {
  const params = {
    category: category === 'All' ? undefined : category,
    minPrice,
    maxPrice,
    inStock,
  };

  // Axios handles creating the query string from the `params` object.
  // It automatically ignores any keys that have an `undefined` value.
  const response = await apiClient.get('/products/search', { params });
  return response.data;
}

export const createProduct = async (data) => {
  // Axios automatically stringifies the 'data' object and sets the correct headers.
  const response = await apiClient.post('/products', data);
  return response.data;
};

export const updateProduct = async (id, data) => {
  const response = await apiClient.put(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id) => {
  // No return needed, Axios will throw if the delete fails.
  await apiClient.delete(`/products/${id}`);
};

export const semanticSearchProducts = async (query, top_k = 5) => {
  const response = await apiClient.get(`/products/search/${encodeURIComponent(query)}?top_k=${top_k}`);
  // --- DEBUG LOG #1 ---
  console.log('[API Client] Raw response from server:', response.data);
  return response.data;
};

// You can export the client itself if needed for special cases
export default apiClient;
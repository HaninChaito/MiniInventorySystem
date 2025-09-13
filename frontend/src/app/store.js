import { configureStore } from '@reduxjs/toolkit';
import productReducer from '../features/products/productsSlice';
import statsReducer from '../features/stats/statsSlice';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    products: productReducer,
    stats: statsReducer,
    
    auth: authReducer,

    
  },
});

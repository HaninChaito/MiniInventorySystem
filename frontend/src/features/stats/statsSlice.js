import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import * as statsApi from '../../services/statsApi'; 

export const fetchStats = createAsyncThunk('stats/fetchStats', async (_, { rejectWithValue }) => {
  try {
    const [
      totalValueData,
      averagePriceData,
      priceRangeData,
      categoryCountsData,
      outOfStockData,
      topExpensiveData,
      recentProductsData,
    ] = await Promise.all([
      statsApi.getTotalInventoryValue(),
      statsApi.getAveragePrice(),
      statsApi.getPriceRange(),
      statsApi.getProductCountPerCategory(),
      statsApi.getOutOfStockProducts(),
      statsApi.getTopExpensiveProducts(),
      statsApi.getRecentProducts(7),
    ]);
    

    return { 
      totalValue: totalValueData,
      averagePrice: averagePriceData,
      priceRange: priceRangeData,
      categoryCounts: categoryCountsData,
      outOfStock: outOfStockData,
      topExpensive: topExpensiveData,
      recentProducts: recentProductsData,
    };

  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch dashboard stats.';
    return rejectWithValue(message);
  }
});

const initialState = {
  totalValue: 0,
  averagePrice: 0,
  priceRange: { min: 0, max: 0 },
  categoryCounts: [],
  outOfStock: [],
  topExpensive: [],
  recentProducts: [],
  status: 'idle',
  error: null,
};

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStats.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.status = 'succeeded';
       
        
        state.totalValue = action.payload.totalValue ?? 0;
        state.averagePrice = action.payload.averagePrice ?? 0;
        state.priceRange = action.payload.priceRange ?? { min: 0, max: 0 };
        state.categoryCounts = action.payload.categoryCounts ?? [];
        state.outOfStock = action.payload.outOfStock ?? [];
        state.topExpensive = action.payload.topExpensive ?? [];
        state.recentProducts = action.payload.recentProducts ?? [];
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload; 
      });
  },
});

export default statsSlice.reducer;
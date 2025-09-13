import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { 
  getProducts, 
  createProduct as apiCreateProduct,
  deleteProduct as apiDeleteProduct, 
  updateProduct as apiUpdateProduct,
 semanticSearchProducts as apisemanticSearchProducts,
} from '../../services/api'; 


export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getProducts();
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return rejectWithValue(message);
    }
  }
);
export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const newProduct = await apiCreateProduct(productData);
      return newProduct;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return rejectWithValue(message);
    }
  }
);


export const deleteProduct = createAsyncThunk(
  'products/deleteProduct', 
  async (productId, { rejectWithValue }) => {
    try {
      
      await apiDeleteProduct(productId);
      return productId; 
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return rejectWithValue(message);
    }
  }
);


export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      
      const updatedProduct = await apiUpdateProduct(id, data);
      return updatedProduct;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return rejectWithValue(message);
    }
  }
);

export const searchByMeaning = createAsyncThunk(
  'products/searchByMeaning',
  async ({ query, top_k }, { rejectWithValue }) => {
    try {
      const searchResultsArray = await apisemanticSearchProducts(query, top_k);
      
      
      if (Array.isArray(searchResultsArray)) {
        const normalizedResults = searchResultsArray.map(item => ({
         
          id: item.id ?? item.item_id, 
          name: item.name,
          category: item.category,
          price: item.price,
          quantity: item.quantity,
          description: item.description,
          inStock: item.inStock ?? (item.quantity > 0), 
          createdAt: item.createdAt ?? new Date().toISOString(),
        }));
        
        // This log is no longer needed but shows what's happening
        // console.log('[Redux Thunk] Normalized data to be dispatched:', normalizedResults);
        return normalizedResults; // Return the array of standardized objects
      }
      
      // If the API returned something other than an array, return empty.
      console.error('[Redux Thunk] Expected an array from the API but received:', searchResultsArray);
      return []; 
      
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search by meaning failed');
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    status: 'idle', 
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      
      .addCase(deleteProduct.pending, (state) => {
       
        state.status = 'loading'; 
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.status = 'succeeded';
     
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      .addCase(updateProduct.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createProduct.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items.push(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

       .addCase(searchByMeaning.pending, (state) => {
        state.status = 'loading'; 
      })
      .addCase(searchByMeaning.fulfilled, (state, action) => {
              console.log('[Redux Reducer] Payload received in reducer:', action.payload);
        state.status = 'succeeded';
        state.items = action.payload; 
      })
      .addCase(searchByMeaning.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });


  },
});

export default productsSlice.reducer;
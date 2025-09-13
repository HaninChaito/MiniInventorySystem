import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../services/api'; // We will create/update this file next

// ---- Async Thunks ----
// A thunk for logging in a user
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.login(credentials);
      // The value we return becomes the `fulfilled` action payload
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// A thunk for signing up a new user
export const signup = createAsyncThunk(
  'auth/signup',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.signup(userData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// A thunk for confirming the signup
export const confirmSignup = createAsyncThunk(
    'auth/confirmSignup',
    async (confirmationData, { rejectWithValue }) => {
        try {
            const response = await api.confirmSignup(confirmationData);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);


// ---- The Slice ----
const initialState = {
  user: null,
  token: localStorage.getItem('accessToken') || null, // Initialize token from localStorage
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Standard reducer for logging out
    logout: (state) => {
      localStorage.removeItem('accessToken');
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // The payload here is the { accessToken, idToken, refreshToken } object
        state.token = action.payload.accessToken;
        // For now, we can decode the token to get user info if needed, or just set a flag
        state.user = { email: '...' }; // You would typically decode the idToken here
        state.error = null;
        // Save token to localStorage for persistence
        localStorage.setItem('accessToken', action.payload.accessToken);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Login failed';
      })
      // Signup cases (optional, depending on if you want to manage its state)
      .addCase(signup.pending, (state) => {
          state.status = 'loading';
      })
      .addCase(signup.fulfilled, (state) => {
          state.status = 'succeeded'; // Or a specific status like 'confirmation_pending'
      })
      .addCase(signup.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.payload?.message || 'Signup failed';
      });
  },
});

export const { logout } = authSlice.actions;

// ---- Selectors ----
// Selectors to easily get data from the store in your components
export const selectIsAuthenticated = (state) => !!state.auth.token;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;


export default authSlice.reducer;
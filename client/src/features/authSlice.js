import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

const initialState = {
  user: null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  loading: false,
  error: null,
};

// Async Thunks
export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Registration failed');
  }
});

export const loginUser = createAsyncThunk('auth/login', async (userData, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/login', userData);
    localStorage.setItem('accessToken', response.data.accessToken);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/auth/get-me');
    return response.data.user;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
    return null;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Logout failed');
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Me
      .addCase(getMe.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(getMe.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        localStorage.removeItem('accessToken'); // If getMe fails, token is probably fully invalid
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { toast } from 'react-toastify';

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', data);
    return res.data;
  } catch (err) {
    toast.error(err.response?.data?.message || 'Login failed');
    return rejectWithValue(err.response?.data?.message);
  }
});

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', data);
    return res.data;
  } catch (err) {
    toast.error(err.response?.data?.message || 'Registration failed');
    return rejectWithValue(err.response?.data?.message);
  }
});

export const verifyOTP = createAsyncThunk('auth/verifyOTP', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/verify-otp', data);
    return res.data;
  } catch (err) {
    toast.error(err.response?.data?.message || 'OTP verification failed');
    return rejectWithValue(err.response?.data?.message);
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout');
  } catch { /* ignore */ }
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/me');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:        null,
    accessToken: localStorage.getItem('accessToken') || null,
    loading:     false,
    initialized: false,
  },
  reducers: {
    setAccessToken: (state, action) => { state.accessToken = action.payload; localStorage.setItem('accessToken', action.payload); },
    updateUser:     (state, action) => { if (state.user) state.user = { ...state.user, ...action.payload }; },
    clearAuth:      (state) => { state.user = null; state.accessToken = null; localStorage.removeItem('accessToken'); },
  },
  extraReducers: (builder) => {
    const handlePending   = (state) => { state.loading = true; };
    const handleRejected  = (state) => { state.loading = false; };
    const handleAuthFulfilled = (state, action) => {
      state.loading     = false;
      state.user        = action.payload.user;
      state.accessToken = action.payload.accessToken;
      if (action.payload.accessToken) localStorage.setItem('accessToken', action.payload.accessToken);
    };

    builder
      .addCase(login.pending,    handlePending)
      .addCase(login.rejected,   handleRejected)
      .addCase(login.fulfilled,  handleAuthFulfilled)
      .addCase(register.pending,   handlePending)
      .addCase(register.rejected,  handleRejected)
      .addCase(register.fulfilled, handleAuthFulfilled)
      .addCase(verifyOTP.pending,    handlePending)
      .addCase(verifyOTP.rejected,   handleRejected)
      .addCase(verifyOTP.fulfilled,  handleAuthFulfilled)
      .addCase(logout.fulfilled, (state) => {
        state.user = null; state.accessToken = null;
        localStorage.removeItem('accessToken');
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload.data; state.initialized = true;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.initialized = true;
      });
  },
});

export const { setAccessToken, updateUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;

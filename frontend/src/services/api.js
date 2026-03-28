import axios from 'axios';
import { store } from '../store';
import { setAccessToken, clearAuth } from '../features/auth/authSlice';

const api = axios.create({
  baseURL:         process.env.REACT_APP_API_URL || '/api/v1',
  withCredentials: true,
  timeout:         15000,
});

// ─── Request interceptor — attach access token ────────────────────────────────
api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken || localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response interceptor — auto-refresh on 401 ───────────────────────────────
let isRefreshing   = false;
let failedQueue    = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (err.response?.status === 401 && !original._retry && !original.url?.includes('/auth/')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
          .then((token) => { original.headers.Authorization = `Bearer ${token}`; return api(original); })
          .catch(Promise.reject);
      }

      original._retry  = true;
      isRefreshing     = true;

      try {
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL || '/api/v1'}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        store.dispatch(setAccessToken(data.accessToken));
        processQueue(null, data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        store.dispatch(clearAuth());
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default api;

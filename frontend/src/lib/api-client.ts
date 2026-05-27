import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Auto-attach session token from localStorage
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('session_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 responses
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('session_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── API functions ──

export async function loginApi(app_key: string) {
  const res = await apiClient.post('/api/auth/login', { app_key });
  return res.data;
}

export async function verifyAuthApi() {
  const res = await apiClient.post('/api/auth/verify');
  return res.data;
}

export async function uploadImageApi(file: File) {
  const form = new FormData();
  form.append('file', file);
  const res = await apiClient.post('/api/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function searchMoviesApi(q: string, page = 1) {
  const res = await apiClient.get('/api/movies/search', { params: { q, page } });
  return res.data;
}

export async function getMovieDetailApi(id: string) {
  const res = await apiClient.get(`/api/movies/${id}`);
  return res.data;
}

export async function getTemplatesApi() {
  const res = await apiClient.get('/api/templates');
  return res.data;
}

export async function getConfigApi() {
  const res = await apiClient.get('/api/config');
  return res.data;
}

export async function startGenerationApi(params: Record<string, unknown>) {
  const res = await apiClient.post('/api/generate', params);
  return res.data;
}

export function getSSEUrl(taskId: string) {
  return `${API_BASE}/api/generate/${taskId}/status`;
}

export async function cancelGenerationApi(taskId: string) {
  const res = await apiClient.post(`/api/generate/${taskId}/cancel`);
  return res.data;
}

export async function getWorksApi(sort = 'desc', page = 1, limit = 20) {
  const res = await apiClient.get('/api/works', { params: { sort, page, limit } });
  return res.data;
}

export async function getWorkDetailApi(id: number) {
  const res = await apiClient.get(`/api/works/${id}`);
  return res.data;
}

export async function deleteWorkApi(id: number) {
  const res = await apiClient.delete(`/api/works/${id}`);
  return res.data;
}

export async function clearWorksApi() {
  const res = await apiClient.delete('/api/works');
  return res.data;
}

export function getWorkDownloadUrl(id: number) {
  return `${API_BASE}/api/works/${id}/download`;
}

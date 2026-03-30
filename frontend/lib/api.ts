/**
 * API client for communicating with the backend.
 * All requests use relative URLs (/api/...) and are proxied through
 * Next.js rewrites to the backend. This avoids CORS issues entirely.
 */

import axios from 'axios';

// Use relative URLs — Next.js rewrites proxy /api/* to the backend
// (both in development and production). No cross-origin requests needed.
const apiClient = axios.create({
    baseURL: '',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors — only redirect for genuine 401s, not network errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (
            error.response?.status === 401 &&
            !error.config?.url?.startsWith('/auth/') &&       // don't loop on auth endpoints
            typeof window !== 'undefined' &&
            window.location.pathname !== '/login'              // prevent redirect loops
        ) {
            window.dispatchEvent(new Event('auth:unauthorized'));
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: async (username: string, password: string) => {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        const response = await apiClient.post('/auth/login', formData, {
            headers: { 'Content-Type': undefined },
        });
        return response.data;
    },

    register: async (username: string, password: string, deviceName?: string) => {
        const response = await apiClient.post('/auth/register', {
            username,
            password,
            device_name: deviceName,
        });
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },
};

// Sessions API
export const sessionsAPI = {
    list: async (params?: {
        page?: number;
        page_size?: number;
        date_from?: string;
        date_to?: string;
        app_name?: string;
    }) => {
        const response = await apiClient.get('/api/sessions', { params });
        return response.data;
    },

    get: async (id: number) => {
        const response = await apiClient.get(`/api/sessions/${id}`);
        return response.data;
    },

    delete: async (id: number) => {
        await apiClient.delete(`/api/sessions/${id}`);
    },

    bulkDelete: async (ids: number[]) => {
        const response = await apiClient.post('/api/sessions/bulk-delete', { ids });
        return response.data;
    },

    getStats: async () => {
        const response = await apiClient.get('/api/sessions/stats/summary');
        return response.data;
    },
};

// Screenshots API
export const screenshotsAPI = {
    list: async (params?: {
        page?: number;
        page_size?: number;
        session_id?: number;
    }) => {
        const response = await apiClient.get('/api/screenshots', { params });
        return response.data;
    },

    getImageUrl: (id: number) => {
        const token = localStorage.getItem('access_token');
        return `/api/screenshots/${id}?token=${token}`;
    },

    getBySession: async (sessionId: number) => {
        const response = await apiClient.get(`/api/screenshots/session/${sessionId}`);
        return response.data;
    },

    delete: async (id: number) => {
        await apiClient.delete(`/api/screenshots/${id}`);
    },

    bulkDelete: async (ids: number[]) => {
        const response = await apiClient.post('/api/screenshots/bulk-delete', { ids });
        return response.data;
    },
};

// Analytics API
export const analyticsAPI = {
    getOverview: async (days: number = 7, source?: string) => {
        const response = await apiClient.get('/api/analytics/overview', {
            params: { days, source },
        });
        return response.data;
    },

    getAppDistribution: async (days: number = 7, source?: string) => {
        const response = await apiClient.get('/api/analytics/app-distribution', {
            params: { days, source },
        });
        return response.data;
    },

    getTimeline: async (date?: string, source?: string) => {
        const response = await apiClient.get('/api/analytics/timeline', {
            params: { date, source },
        });
        return response.data;
    },

    getTopApps: async (limit: number = 5, days: number = 7, source?: string) => {
        const response = await apiClient.get('/api/analytics/top-apps', {
            params: { limit, days, source },
        });
        return response.data;
    },

    exportCSV: async (params?: {
        date_from?: string;
        date_to?: string;
    }) => {
        const response = await apiClient.get('/api/analytics/export/csv', {
            params,
            responseType: 'blob',
        });
        return response.data;
    },

    getSummary: async (days: number = 7) => {
        const response = await apiClient.get('/api/analytics/export/summary', {
            params: { days },
        });
        return response.data;
    },
};

// ML Insights API
export const insightsAPI = {
    getProductivity: async (days: number = 7) => {
        const response = await apiClient.get('/api/insights/productivity', {
            params: { days },
        });
        return response.data;
    },

    getBurnout: async () => {
        const response = await apiClient.get('/api/insights/burnout');
        return response.data;
    },

    getForecast: async (days: number = 7) => {
        const response = await apiClient.get('/api/insights/forecast', {
            params: { days },
        });
        return response.data;
    },
};

// Data Upload API
export const uploadAPI = {
    uploadCSV: async (file: File) => {
        const form = new FormData();
        form.append('file', file);
        const response = await apiClient.post('/api/insights/upload', form, {
            headers: { 'Content-Type': undefined },
            timeout: 120000, // 120 second timeout (Render free tier can take 30-60s to wake up)
        });
        return response.data;
    },
};

export default apiClient;


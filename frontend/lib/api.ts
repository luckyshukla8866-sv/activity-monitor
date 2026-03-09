/**
 * API client for communicating with the backend.
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
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

// Handle auth errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            window.location.href = '/login';
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
        const response = await apiClient.post('/api/users/login', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    register: async (username: string, password: string, deviceName?: string) => {
        const response = await apiClient.post('/api/users/register', {
            username,
            password,
            device_name: deviceName,
        });
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await apiClient.get('/api/users/me');
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
        return `${API_BASE_URL}/api/screenshots/${id}?token=${token}`;
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
    getOverview: async () => {
        const response = await apiClient.get('/api/analytics/overview');
        return response.data;
    },

    getAppDistribution: async (days: number = 7) => {
        const response = await apiClient.get('/api/analytics/app-distribution', {
            params: { days },
        });
        return response.data;
    },

    getTimeline: async (date?: string) => {
        const response = await apiClient.get('/api/analytics/timeline', {
            params: { date },
        });
        return response.data;
    },

    getTopApps: async (limit: number = 5, days: number = 7) => {
        const response = await apiClient.get('/api/analytics/top-apps', {
            params: { limit, days },
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

// Monitoring Control API
export const monitoringAPI = {
    getStatus: async () => {
        const response = await apiClient.get('/api/monitoring/status');
        return response.data;
    },

    start: async () => {
        const response = await apiClient.post('/api/monitoring/start');
        return response.data;
    },

    stop: async () => {
        const response = await apiClient.post('/api/monitoring/stop');
        return response.data;
    },
};

export default apiClient;

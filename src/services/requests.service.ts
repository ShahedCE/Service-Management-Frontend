import { api } from './api';

export interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  progress: number;
  requeueCount: number;
  reviewComment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RequestStats {
  total: number;
  active: number;
  completed: number;
  failed: number;
  cancelled: number;
}

export const RequestsService = {
  getRequests: async (): Promise<ServiceRequest[]> => {
    const response = await api.get('/requests?limit=10&sortBy=createdAt&order=DESC');
    return response.data.data; // Because response is { success: true, data: [...] }
  },

  getStats: async (): Promise<RequestStats> => {
    const response = await api.get('/requests/stats');
    return response.data.data;
  },

  createRequest: async (data: { title: string; description: string; priority: string }): Promise<ServiceRequest> => {
    const response = await api.post('/requests', data);
    return response.data.data;
  },
};

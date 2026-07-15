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

export interface StatusHistory {
  id: string;
  oldStatus: string | null;
  newStatus: string;
  changedByType: string;
  comment: string | null;
  changedAt: string;
  changedBy?: { id: string; name: string; email: string } | null;
}

export const RequestsService = {
  getRequests: async (): Promise<ServiceRequest[]> => {
    const response = await api.get('/requests?limit=1000&sortBy=createdAt&order=DESC');
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

  updateRequest: async (id: string, data: { title?: string; description?: string }): Promise<ServiceRequest> => {
    const response = await api.patch(`/requests/${id}`, data);
    return response.data.data;
  },

  getHistory: async (id: string): Promise<StatusHistory[]> => {
    const response = await api.get(`/requests/${id}/history`);
    return response.data.data;
  },

  approveRequest: async (id: string): Promise<ServiceRequest> => {
    const response = await api.patch(`/requests/${id}/approve`);
    return response.data.data;
  },

  rejectRequest: async (id: string, reviewComment: string): Promise<ServiceRequest> => {
    const response = await api.patch(`/requests/${id}/reject`, { reviewComment });
    return response.data.data;
  },

  cancelRequest: async (id: string): Promise<ServiceRequest> => {
    const response = await api.patch(`/requests/${id}/cancel`);
    return response.data.data;
  },
};

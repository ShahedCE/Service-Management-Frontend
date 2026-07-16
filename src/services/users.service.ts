import { api } from "./api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password?: string;
  role: string;
  isActive?: boolean;
}

export interface UpdateUserData {
  name?: string;
  role?: string;
  isActive?: boolean;
}

export const UsersService = {
  getUsers: async (params?: Record<string, unknown>): Promise<{ data: User[], meta: { totalItems: number, totalPages: number } }> => {
    const response = await api.get("/users", { params });
    return { data: response.data.data, meta: response.data.meta };
  },

  createUser: async (data: CreateUserData): Promise<User> => {
    const response = await api.post<{ success: boolean; data: User }>("/users", data);
    return response.data.data;
  },

  updateUser: async (id: string, data: UpdateUserData): Promise<User> => {
    const response = await api.patch<{ success: boolean; data: User }>(`/users/${id}`, data);
    return response.data.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete<{ success: boolean }>(`/users/${id}`);
  },
};

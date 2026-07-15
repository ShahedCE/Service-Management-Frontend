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
  getUsers: async (): Promise<User[]> => {
    const response = await api.get<{ success: boolean; data: User[] }>("/users");
    return response.data.data;
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

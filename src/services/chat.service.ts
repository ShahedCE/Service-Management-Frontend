import { api } from './api';

export interface ChatMessage {
  id: string;
  operatorId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    role: string;
  };
  operator?: {
    id: string;
    name: string;
    role: string;
    email?: string;
  };
}

export interface ActiveChat {
  operator: {
    id: string;
    name: string;
    email?: string;
    role: string;
  };
  latestMessage: ChatMessage;
}

export const getActiveChats = async (): Promise<ActiveChat[]> => {
  const response = await api.get('/chat/active');
  return response.data;
};

export const getChatHistory = async (operatorId: string): Promise<ChatMessage[]> => {
  const response = await api.get(`/chat/${operatorId}`);
  return response.data;
};

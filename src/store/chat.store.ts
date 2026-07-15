import { create } from 'zustand';
import { ChatMessage, ActiveChat } from '../services/chat.service';
import { useAuthStore } from './auth.store';

interface ChatState {
  activeChats: ActiveChat[];
  messages: Record<string, ChatMessage[]>; // Maps operatorId to messages
  unreadCounts: Record<string, number>; // Maps operatorId to unread count
  isChatOpen: boolean;
  selectedOperatorId: string | null;
  
  setActiveChats: (chats: ActiveChat[]) => void;
  setMessages: (operatorId: string, messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  setChatOpen: (isOpen: boolean) => void;
  setSelectedOperatorId: (operatorId: string | null) => void;
  clearUnread: (operatorId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeChats: [],
  messages: {},
  unreadCounts: {},
  isChatOpen: false,
  selectedOperatorId: null,

  setActiveChats: (chats) => set({ activeChats: chats }),

  setMessages: (operatorId, messages) => 
    set((state) => ({
      messages: {
        ...state.messages,
        [operatorId]: messages,
      },
    })),

  addMessage: (message) => 
    set((state) => {
      const { operatorId } = message;
      const currentMessages = state.messages[operatorId] || [];
      
      // Prevent duplicates
      if (currentMessages.some((msg) => msg.id === message.id)) {
        return state;
      }

      const updatedMessages = {
        ...state.messages,
        [operatorId]: [...currentMessages, message],
      };

      // Update activeChats (move to top)
      const existingChatIndex = state.activeChats.findIndex(chat => chat.operator.id === operatorId);
      const updatedActiveChats = [...state.activeChats];
      
      if (existingChatIndex >= 0) {
        // Update latest message
        updatedActiveChats[existingChatIndex].latestMessage = message;
        // Move to top
        const [chat] = updatedActiveChats.splice(existingChatIndex, 1);
        updatedActiveChats.unshift(chat);
      } else if (message.operator) {
        // Add new active chat if operator details exist
        updatedActiveChats.unshift({
          operator: message.operator,
          latestMessage: message,
        });
      }

      // Update unread count if not currently viewing and not sent by self
      const updatedUnread = { ...state.unreadCounts };
      const currentUser = useAuthStore.getState().user;
      
      if (message.senderId !== currentUser?.id) {
        const isOperator = currentUser?.role === 'OPERATOR';
        const isCurrentlyViewing = isOperator ? state.isChatOpen : (state.selectedOperatorId === operatorId);
        
        if (!isCurrentlyViewing) {
          updatedUnread[operatorId] = (updatedUnread[operatorId] || 0) + 1;
        }
      }

      return {
        messages: updatedMessages,
        activeChats: updatedActiveChats,
        unreadCounts: updatedUnread,
      };
    }),

  setChatOpen: (isOpen) => set({ isChatOpen: isOpen }),
  
  setSelectedOperatorId: (operatorId) => set({ selectedOperatorId: operatorId }),

  clearUnread: (operatorId) => 
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [operatorId]: 0,
      }
    }))
}));

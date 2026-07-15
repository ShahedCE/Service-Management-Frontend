import { useEffect } from 'react';
import { useSocketInit } from './useSocketInit';
import { useChatStore } from '../store/chat.store';
import { useAuthStore } from '../store/auth.store';
import { ChatMessage } from '../services/chat.service';

export const useChatSocket = () => {
  const { socket } = useSocketInit();
  const addMessage = useChatStore((state) => state.addMessage);
  const setTypingStatus = useChatStore((state) => state.setTypingStatus);
  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: ChatMessage) => {
      addMessage(message);
    };

    const handleTyping = (data: { operatorId: string; isTyping: boolean; senderId: string }) => {
      if (data.senderId !== currentUser?.id) {
        setTypingStatus(data.operatorId, data.isTyping);
      }
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('userTyping', handleTyping);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('userTyping', handleTyping);
    };
  }, [socket, addMessage, setTypingStatus, currentUser?.id]);

  const sendMessage = (operatorId: string, content: string) => {
    if (socket) {
      socket.emit('sendMessage', { operatorId, content });
    }
  };

  const emitTyping = (operatorId: string, isTyping: boolean) => {
    if (socket) {
      socket.emit('typing', { operatorId, isTyping });
    }
  };

  return { sendMessage, emitTyping };
};

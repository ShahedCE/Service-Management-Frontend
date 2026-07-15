import { useEffect } from 'react';
import { useSocketInit } from './useSocketInit';
import { useChatStore } from '../store/chat.store';
import { ChatMessage } from '../services/chat.service';

export const useChatSocket = () => {
  const { socket } = useSocketInit();
  const addMessage = useChatStore((state) => state.addMessage);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: ChatMessage) => {
      addMessage(message);
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, addMessage]);

  const sendMessage = (operatorId: string, content: string) => {
    if (socket) {
      socket.emit('sendMessage', { operatorId, content });
    }
  };

  return { sendMessage };
};

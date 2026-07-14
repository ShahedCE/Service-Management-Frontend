import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface SocketState {
  socket: Socket | null;
  connect: (token: string) => void;
  disconnect: () => void;
}

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000';

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  connect: (token: string) => {
    // If already connected, do nothing
    if (get().socket?.connected) return;

    console.log('[Socket] Connecting...');
    const socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected with ID:', socketInstance.id);
    });

    socketInstance.on('disconnect', () => {
      console.log('[Socket] Disconnected');
    });

    socketInstance.on('connect_error', (err) => {
      console.error('[Socket] Connection Error:', err.message);
    });

    set({ socket: socketInstance });
  },
  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));

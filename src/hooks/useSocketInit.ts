import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useSocketStore } from '@/store/socket.store';

export function useSocketInit() {
  const token = useAuthStore((state) => state.token);
  const { connect, disconnect } = useSocketStore();

  useEffect(() => {
    if (token) {
      connect(token);
    } else {
      disconnect();
    }

    // Cleanup on unmount if needed, though we generally want it to persist across pages
    return () => {
      // We don't necessarily disconnect here because we want the socket 
      // to stay alive while navigating between dashboard pages.
      // Disconnection will happen when token becomes null (logout).
    };
  }, [token, connect, disconnect]);
}

import { useEffect } from 'react';
import { useAuth } from '~/lib/hooks/useAuth';
import { useMessagingStore } from '~/lib/stores/messaging';
import { WebSocketManager } from '~/lib/ws/WebSocketManager';
import { WS_BASE_URL } from '~/constants/config';

export function useMessagingRealtime(enabled = true): void {
  const { isAuthenticated, token } = useAuth();
  const handleRealtimePayload = useMessagingStore((s) => s.handleRealtimePayload);
  const setConnection = useMessagingStore((s) => s.setConnection);

  useEffect(() => {
    if (!enabled || !isAuthenticated || !token) {
      setConnection('disconnected');
      return;
    }

    const ws = WebSocketManager.getInstance();

    setConnection('connecting');
    ws.connect(WS_BASE_URL, token);

    const unsubscribe = ws.subscribe((data) => {
      setConnection('connected');
      handleRealtimePayload(data);
    });

    const readyCheck = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        setConnection('connected');
      } else if (ws.readyState === WebSocket.CLOSED) {
        setConnection('disconnected');
      }
    }, 3_000);

    return () => {
      clearInterval(readyCheck);
      unsubscribe();
      ws.disconnect();
      setConnection('disconnected');
    };
  }, [enabled, isAuthenticated, token, handleRealtimePayload, setConnection]);
}

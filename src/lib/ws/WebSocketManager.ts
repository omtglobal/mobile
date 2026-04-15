type MessageHandler = (data: unknown) => void;

const MAX_RECONNECT_ATTEMPTS = 12;
const MAX_RECONNECT_DELAY_MS = 30_000;
const BASE_DELAY_MS = 1_000;

export class WebSocketManager {
  private static instance: WebSocketManager | null = null;

  private ws: WebSocket | null = null;
  private handlers = new Set<MessageHandler>();
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private baseUrl: string | null = null;
  private token: string | null = null;
  private intentionalClose = false;

  private constructor() {}

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  get readyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  connect(baseUrl: string, token: string): void {
    this.baseUrl = baseUrl;
    this.token = token;
    this.intentionalClose = false;
    this.reconnectAttempts = 0;
    this.openSocket();
  }

  disconnect(): void {
    this.intentionalClose = true;
    this.clearReconnectTimer();
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
  }

  subscribe(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  sendJson(obj: Record<string, unknown>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(obj));
    }
  }

  sendTyping(
    conversationId: string,
    typing: boolean,
    recipientUserId: string,
  ): void {
    this.sendJson({
      event: typing ? 'typing.start' : 'typing.stop',
      conversation_id: conversationId,
      recipient_user_id: recipientUserId,
    });
  }

  private openSocket(): void {
    if (!this.baseUrl || !this.token) return;

    this.ws?.close();
    const url = `${this.baseUrl}/ws?token=${encodeURIComponent(this.token)}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event: WebSocketMessageEvent) => {
      try {
        const data: unknown = JSON.parse(String(event.data));
        this.handlers.forEach((h) => h(data));
      } catch {
        // ignore malformed frames
      }
    };

    this.ws.onerror = () => {
      // onclose will fire after onerror — reconnect logic lives there
    };

    this.ws.onclose = () => {
      this.ws = null;
      if (!this.intentionalClose) {
        this.scheduleReconnect();
      }
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) return;

    const jitter = Math.random() * 500;
    const delay = Math.min(
      BASE_DELAY_MS * Math.pow(2, this.reconnectAttempts) + jitter,
      MAX_RECONNECT_DELAY_MS,
    );
    this.reconnectAttempts += 1;

    this.reconnectTimer = setTimeout(() => {
      this.openSocket();
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

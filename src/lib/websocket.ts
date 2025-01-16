import { create } from 'zustand';

interface WebSocketStore {
  socket: WebSocket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  subscribe: (channel: string, callback: (data: any) => void) => () => void;
}

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://your-api/ws';

const subscribers = new Map<string, Set<(data: any) => void>>();

export const useWebSocket = create<WebSocketStore>((set, get) => ({
  socket: null,
  isConnected: false,

  connect: () => {
    const currentSocket = get().socket;
    if (currentSocket?.readyState === WebSocket.OPEN) return;

    const socket = new WebSocket(WEBSOCKET_URL);

    socket.onopen = () => {
      console.log('WebSocket connected');
      set({ isConnected: true });
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
      set({ isConnected: false });
      // Attempt to reconnect after 5 seconds
      setTimeout(() => get().connect(), 5000);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const channel = data.channel;
        
        if (subscribers.has(channel)) {
          subscribers.get(channel)?.forEach(callback => callback(data));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    set({ socket });
  },

  disconnect: () => {
    const socket = get().socket;
    if (socket) {
      socket.close();
      set({ socket: null, isConnected: false });
    }
  },

  subscribe: (channel: string, callback: (data: any) => void) => {
    if (!subscribers.has(channel)) {
      subscribers.set(channel, new Set());
    }
    
    subscribers.get(channel)?.add(callback);
    
    const socket = get().socket;
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ action: 'subscribe', channel }));
    }

    // Return unsubscribe function
    return () => {
      subscribers.get(channel)?.delete(callback);
      if (subscribers.get(channel)?.size === 0) {
        subscribers.delete(channel);
        socket?.send(JSON.stringify({ action: 'unsubscribe', channel }));
      }
    };
  },
})); 
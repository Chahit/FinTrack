import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { WebSocket, WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';

interface TradeMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}

const wss = new WebSocketServer({ noServer: true });
const messages: TradeMessage[] = [];
const clients = new Map<string, WebSocket>();

wss.on('connection', (ws: WebSocket, userId: string, username: string) => {
  clients.set(userId, ws);

  // Send last 50 messages to new client
  ws.send(JSON.stringify({
    type: 'history',
    messages: messages.slice(-50)
  }));

  ws.on('message', (data: string) => {
    const message: TradeMessage = {
      id: uuidv4(),
      userId,
      username,
      message: data.toString(),
      timestamp: new Date().toISOString()
    };
    
    messages.push(message);
    if (messages.length > 500) messages.shift(); // Keep last 500 messages

    // Broadcast to all clients
    const messageStr = JSON.stringify({ type: 'message', message });
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  });

  ws.on('close', () => {
    clients.delete(userId);
  });
});

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Return last 50 messages
  return NextResponse.json(messages.slice(-50));
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

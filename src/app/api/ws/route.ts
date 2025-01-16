import { NextRequest } from 'next/server';
import { WebSocketServer } from 'ws';
import Redis from 'ioredis';
import { createServer } from 'http';

const server = createServer();
const wss = new WebSocketServer({ server });
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export async function GET(req: NextRequest) {
  if (!req.headers.get('upgrade')?.includes('websocket')) {
    return new Response('Expected Upgrade: websocket', { status: 426 });
  }

  const { socket, response } = await new Promise<any>((resolve) => {
    const upgrade = (req: any, socket: any, head: Buffer) => {
      server.removeListener('upgrade', upgrade);
      resolve({ socket, head });
    };

    server.on('upgrade', upgrade);
  });

  wss.handleUpgrade(req as any, socket, Buffer.alloc(0), (ws) => {
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle different message types
        switch (data.type) {
          case 'subscribe':
            await handleSubscribe(ws, data.symbols);
            break;
          case 'unsubscribe':
            await handleUnsubscribe(ws, data.symbols);
            break;
          default:
            ws.send(JSON.stringify({ error: 'Unknown message type' }));
        }
      } catch (error) {
        console.error('Error handling message:', error);
        ws.send(JSON.stringify({ error: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      handleDisconnect(ws);
    });
  });

  return response;
}

async function handleSubscribe(ws: any, symbols: string[]) {
  for (const symbol of symbols) {
    await redis.sadd(`subscribers:${symbol}`, ws.id);
  }
  ws.send(JSON.stringify({ type: 'subscribed', symbols }));
}

async function handleUnsubscribe(ws: any, symbols: string[]) {
  for (const symbol of symbols) {
    await redis.srem(`subscribers:${symbol}`, ws.id);
  }
  ws.send(JSON.stringify({ type: 'unsubscribed', symbols }));
}

async function handleDisconnect(ws: any) {
  const keys = await redis.keys('subscribers:*');
  for (const key of keys) {
    await redis.srem(key, ws.id);
  }
}
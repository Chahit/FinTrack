const WebSocket = require('ws');
const http = require('http');

// Create HTTP server
const server = http.createServer();

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients with their auth info
const clients = new Map();

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);

      switch (message.type) {
        case 'auth':
          // Store client auth info
          clients.set(ws, {
            userId: message.userId,
            username: message.username
          });
          console.log(`User authenticated: ${message.username}`);
          break;

        case 'message':
          // Get sender info
          const sender = clients.get(ws);
          if (!sender) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Not authenticated'
            }));
            return;
          }

          // Broadcast message to all clients
          const broadcastMessage = {
            type: 'message',
            id: message.id || Date.now().toString(),
            userId: sender.userId,
            username: sender.username,
            message: message.message,
            timestamp: message.timestamp || new Date().toISOString()
          };

          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(broadcastMessage));
            }
          });
          break;

        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    // Remove client from authenticated clients
    clients.delete(ws);
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`WebSocket server is running on port ${PORT}`);
}); 
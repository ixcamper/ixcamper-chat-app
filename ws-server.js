// ws-server.js
const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 5001 });
console.log('🚀 Private 1x1 Chat Server running on ws://localhost:5001');

// Map to store connected clients: Key = username string, Value = WebSocket instance
const connectedUsers = new Map();

wss.on('connection', (ws) => {
  let currentUsername = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());

      // 1. Handle Registration Phase
      if (data.type === 'register') {
        currentUsername = data.username;
        connectedUsers.set(currentUsername, ws);
        console.log(`👤 User registered: "${currentUsername}"`);
        broadcastUserList();
        return;
      }

      // 2. Handle Private Messaging Phase
      if (data.type === 'private_message') {
        const { to, text, from, timestamp } = data;
        
        const recipientSocket = connectedUsers.get(to);
        const senderSocket = connectedUsers.get(from);

        const messagePayload = JSON.stringify({
          type: 'msg',
          from,
          to,
          text,
          timestamp
        });

        // Send to recipient if they are online
        if (recipientSocket && recipientSocket.readyState === 1) {
          recipientSocket.send(messagePayload);
        }
        
        // Send back to the sender so their UI updates as well
        if (senderSocket && senderSocket.readyState === 1) {
          senderSocket.send(messagePayload);
        }
      }
    } catch (err) {
      console.error('Error handling message package:', err);
    }
  });

  ws.on('close', () => {
    if (currentUsername) {
      connectedUsers.delete(currentUsername);
      console.log(`❌ User disconnected: "${currentUsername}"`);
      broadcastUserList();
    }
  });
});

// Helper function to send the updated active users list to everyone online
function broadcastUserList() {
  const userList = Array.from(connectedUsers.keys());
  const payload = JSON.stringify({ type: 'user_list', users: userList });
  
  for (let [_, clientSocket] of connectedUsers) {
    if (clientSocket.readyState === 1) {
      clientSocket.send(payload);
    }
  }
}

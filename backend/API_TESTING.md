# API Testing Examples

## 1. Authentication

### Register
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "testuser",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get Profile
```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 2. Music API

### Get All Songs
```bash
curl -X GET http://localhost:3001/api/music/songs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Upload Song
```bash
curl -X POST http://localhost:3001/api/music/songs/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@path/to/your/song.mp3" \
  -F "title=Song Title" \
  -F "artist=Artist Name" \
  -F "album=Album Name"
```

### Create Playlist
```bash
curl -X POST http://localhost:3001/api/music/playlists \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Playlist",
    "description": "My favorite songs",
    "isPublic": false
  }'
```

### Search Songs
```bash
curl -X GET "http://localhost:3001/api/music/songs/search?q=song%20title" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 3. Chat API

### Create Conversation
```bash
curl -X POST http://localhost:3001/api/chat/conversations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "participantIds": ["USER_ID_1", "USER_ID_2"],
    "type": "direct"
  }'
```

### Get Conversations
```bash
curl -X GET http://localhost:3001/api/chat/conversations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Send Message
```bash
curl -X POST http://localhost:3001/api/chat/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello, how are you?",
    "conversationId": "CONVERSATION_ID"
  }'
```

### Get Messages
```bash
curl -X GET http://localhost:3001/api/chat/conversations/CONVERSATION_ID/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 4. Call API

### Initiate Call
```bash
curl -X POST http://localhost:3001/api/call/initiate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "calleeId": "USER_ID",
    "type": "audio"
  }'
```

### Get Call History
```bash
curl -X GET http://localhost:3001/api/call/history \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Respond to Call
```bash
curl -X POST http://localhost:3001/api/call/CALL_ID/respond \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "accept"
  }'
```

## 5. WebSocket Connection Examples

### Chat WebSocket (JavaScript)
```javascript
import io from 'socket.io-client';

const chatSocket = io('http://localhost:3001/chat', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});

// Listen for messages
chatSocket.on('message:receive', (message) => {
  console.log('New message:', message);
});

// Send message
chatSocket.emit('message:send', {
  content: 'Hello!',
  conversationId: 'CONVERSATION_ID'
});

// Join conversation
chatSocket.emit('conversation:join', {
  conversationId: 'CONVERSATION_ID'
});
```

### Call WebSocket (JavaScript)
```javascript
const callSocket = io('http://localhost:3001/call', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});

// Listen for incoming calls
callSocket.on('call:incoming', (call) => {
  console.log('Incoming call:', call);
});

// Initiate call
callSocket.emit('call:initiate', {
  calleeId: 'USER_ID',
  type: 'video'
});

// Respond to call
callSocket.emit('call:respond', {
  callId: 'CALL_ID',
  action: 'accept'
});
```

## Environment Variables for Testing

Create `.env` file with:
```env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=music_chat_app
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=test-secret-key
AI_MODERATION_URL=http://localhost:8001
```

## Running with Docker

```bash
# Start databases
docker-compose up -d postgres redis

# Run the application
npm run start:dev
```

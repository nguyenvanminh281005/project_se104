# MusicChat Frontend

Một ứng dụng kết hợp nghe nhạc và chat real-time được xây dựng với Next.js, TypeScript và Tailwind CSS.

## Tính năng

- **🎵 Music Player**: Nghe nhạc với giao diện hiện đại, playlist, queue management
- **💬 Real-time Chat**: Chat với bạn bè qua WebSocket với AI moderation  
- **📹 Video/Audio Calls**: Gọi điện và video call sử dụng WebRTC
- **👥 Friends Management**: Quản lý danh sách bạn bè và xem trạng thái online
- **🔐 Authentication**: Đăng nhập/đăng ký với JWT
- **🌙 Dark Mode**: Giao diện tối hiện đại và responsive

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Real-time**: Socket.IO Client
- **WebRTC**: Gọi điện và video call
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Cài đặt

1. Clone repository:
```bash
git clone <repository-url>
cd frontend
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file environment:
```bash
cp .env.example .env.local
```

4. Cấu hình các biến môi trường trong `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
```

5. Chạy development server:
```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

## Cấu trúc Project

```
src/
├── app/                    # Next.js App Router
│   ├── auth/              # Trang đăng nhập/đăng ký
│   ├── chat/              # Trang chat
│   ├── music/             # Trang nghe nhạc
│   ├── friends/           # Trang quản lý bạn bè
│   └── page.tsx           # Trang chủ
├── components/            # React components
│   ├── ui/                # UI components cơ bản
│   ├── layout/            # Layout components
│   ├── music/             # Music player components
│   ├── chat/              # Chat components
│   ├── call/              # Video/Audio call components
│   └── providers/         # Context providers
├── lib/                   # Utilities và cấu hình
│   ├── store/             # Zustand stores
│   ├── api.ts             # API client
│   ├── socket.ts          # Socket.IO client
│   └── webrtc.ts          # WebRTC manager
└── types/                 # TypeScript type definitions
```

## Tính năng chính

### Music Player
- Play/pause, next/previous, shuffle, repeat
- Volume control và seek bar
- Queue management
- Hiển thị thông tin bài hát và ảnh bìa

### Chat System
- Real-time messaging qua WebSocket
- AI moderation cho tin nhắn
- Typing indicators
- Online/offline status
- Message history

### Video/Audio Calls
- WebRTC peer-to-peer calls
- Audio và video calling
- Auto-call system (15s timeout)
- Call controls (mute, camera toggle)

### Authentication
- JWT-based authentication
- Auto token refresh
- Persistent login state
- Protected routes

## Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build cho production
- `npm run start` - Chạy production server
- `npm run lint` - Chạy ESLint

## API Integration

Frontend tích hợp với backend qua:
- REST API cho authentication, user management
- WebSocket cho real-time chat
- WebRTC signaling cho video/audio calls
- AI moderation API cho chat content

## Responsive Design

Ứng dụng được thiết kế responsive cho:
- Desktop (1024px+)
- Tablet (768px - 1023px)  
- Mobile (320px - 767px)

## Dark Mode

Giao diện sử dụng dark theme mặc định với:
- Gray-scale color palette
- Blue accent colors
- Smooth transitions
- Modern UI components

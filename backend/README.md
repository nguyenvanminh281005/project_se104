# Music & Chat Backend API

Backend API cho ứng dụng nghe nhạc và chat real-time được phát triển với Node.js, TypeScript và NestJS.

## ✨ Tính năng chính

### 🔐 Authentication & User Management
- Đăng ký, đăng nhập với JWT
- Quản lý thông tin người dùng (tên, email, avatar, trạng thái online/offline)
- Middleware kiểm tra token cho các route bảo vệ

### 🎵 Music Service
- API CRUD playlist, bài hát
- API stream nhạc từ thư mục local
- API gợi ý bài hát dựa trên playlist
- Upload và quản lý file nhạc
- Hệ thống like và đếm lượt phát

### 💬 Chat Service
- WebSocket (Socket.IO) cho chat real-time
- API lấy danh sách tin nhắn, cuộc trò chuyện
- AI moderation service để kiểm tra tin nhắn nguy hiểm
- Upload file đính kèm (hình ảnh, audio, documents)
- Tìm kiếm tin nhắn

### 📞 Call Service
- WebRTC signaling server
- API khởi tạo cuộc gọi audio/video
- Auto-call timeout (15 giây)
- Lưu trữ lịch sử cuộc gọi

### 🔴 Presence & Notifications
- Redis lưu trạng thái online/offline
- Thông báo real-time khi có tin nhắn hoặc cuộc gọi mới

## 🛠️ Công nghệ sử dụng

- **Framework**: NestJS
- **Database**: PostgreSQL với TypeORM
- **Cache & Session**: Redis
- **Real-time**: Socket.IO
- **Authentication**: JWT với Passport
- **File Upload**: Multer
- **AI Integration**: REST API calls to Python FastAPI service

## 📋 Yêu cầu hệ thống

- Node.js 16+ 
- PostgreSQL 12+
- Redis 6+
- Python 3.8+ (cho AI moderation service)

## 🚀 Cài đặt

### 1. Clone repository
```bash
git clone <your-repo-url>
cd backend
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình môi trường
```bash
cp .env.example .env
```

Chỉnh sửa file `.env` với thông tin cấu hình của bạn:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=music_chat_app

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# AI Moderation Service
AI_MODERATION_URL=http://localhost:8001
```

### 4. Tạo database
```bash
# Tạo database PostgreSQL
createdb music_chat_app
```

### 5. Chạy ứng dụng

#### Development mode
```bash
npm run start:dev
```

#### Production mode
```bash
npm run build
npm run start:prod
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Đăng ký tài khoản mới |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/logout` | Đăng xuất |
| GET | `/api/auth/profile` | Lấy thông tin profile |
| PATCH | `/api/auth/profile` | Cập nhật profile |

### Music Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/music/songs/upload` | Upload bài hát |
| GET | `/api/music/songs` | Lấy danh sách bài hát |
| GET | `/api/music/songs/search?q=query` | Tìm kiếm bài hát |
| GET | `/api/music/songs/:id/stream` | Stream bài hát |
| POST | `/api/music/playlists` | Tạo playlist |
| GET | `/api/music/playlists/my` | Lấy playlist của user |
| POST | `/api/music/playlists/:id/songs` | Thêm bài hát vào playlist |

### Chat Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/conversations` | Tạo cuộc trò chuyện |
| GET | `/api/chat/conversations` | Lấy danh sách cuộc trò chuyện |
| GET | `/api/chat/conversations/:id/messages` | Lấy tin nhắn trong cuộc trò chuyện |
| POST | `/api/chat/messages` | Gửi tin nhắn |
| POST | `/api/chat/messages/upload` | Upload file đính kèm |

### Call Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/call/initiate` | Khởi tạo cuộc gọi |
| GET | `/api/call/history` | Lấy lịch sử cuộc gọi |
| GET | `/api/call/active` | Lấy cuộc gọi đang active |
| POST | `/api/call/:id/respond` | Trả lời cuộc gọi |
| POST | `/api/call/:id/end` | Kết thúc cuộc gọi |

## 🔌 WebSocket Events

### Chat Events (namespace: `/chat`)

| Event | Description |
|-------|-------------|
| `message:send` | Gửi tin nhắn |
| `message:receive` | Nhận tin nhắn |
| `conversation:join` | Tham gia cuộc trò chuyện |
| `message:typing` | Thông báo đang gõ |
| `user:online` | User online |
| `user:offline` | User offline |

### Call Events (namespace: `/call`)

| Event | Description |
|-------|-------------|
| `call:initiate` | Khởi tạo cuộc gọi |
| `call:incoming` | Cuộc gọi đến |
| `call:respond` | Trả lời cuộc gọi |
| `call:signaling` | WebRTC signaling |
| `call:end` | Kết thúc cuộc gọi |

## 🧪 Testing

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📁 Cấu trúc dự án

```
src/
├── auth/                 # Authentication module
│   ├── dto/
│   ├── strategies/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── music/                # Music module
│   ├── dto/
│   ├── music.controller.ts
│   ├── music.service.ts
│   └── music.module.ts
├── chat/                 # Chat module
│   ├── dto/
│   ├── chat.controller.ts
│   ├── chat.service.ts
│   ├── chat.gateway.ts
│   └── chat.module.ts
├── call/                 # Call module
│   ├── dto/
│   ├── call.controller.ts
│   ├── call.service.ts
│   ├── call.gateway.ts
│   └── call.module.ts
├── common/               # Common utilities
│   ├── decorators/
│   ├── guards/
│   ├── services/
│   └── common.module.ts
├── database/             # Database configuration
│   ├── entities/
│   └── database.module.ts
├── app.module.ts
└── main.ts
```

## 🔧 Cấu hình nâng cao

### Database Migration
Để chạy migration (nếu cần):

```bash
npm run typeorm migration:generate -- -n InitialMigration
npm run typeorm migration:run
```

### Redis Configuration
Đảm bảo Redis đang chạy:

```bash
# Ubuntu/Debian
sudo systemctl start redis-server

# macOS
brew services start redis

# Windows
# Download Redis from https://redis.io/download
```

### AI Moderation Service
Cần có Python FastAPI service chạy trên port 8001 với endpoint `/moderate`.

## 🚨 Lưu ý bảo mật

1. **JWT Secret**: Đổi `JWT_SECRET` trong production
2. **Database**: Sử dụng strong password cho database
3. **CORS**: Cấu hình CORS phù hợp với domain frontend
4. **File Upload**: Giới hạn kích thước và loại file upload
5. **Rate Limiting**: Implement rate limiting cho production

## 📝 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

Nếu bạn gặp vấn đề, hãy tạo issue trên GitHub repository.

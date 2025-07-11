# 🚂 Hệ Thống Quản Lý Vé Tàu Hỏa - VietRail Admin

Hệ thống quản lý toàn diện cho việc đặt vé và quản lý tàu hỏa, được xây dựng với Next.js 15 và TypeScript.

## 🌟 Tính năng chính

- ✅ **Quản lý người dùng** - CRUD với phân quyền
- ✅ **Quản lý tàu & toa tàu** - Thông tin chi tiết
- ✅ **Quản lý ga & tuyến đường** - Lập lịch trình
- ✅ **Quản lý chuyến tàu** - Theo dõi real-time
- ✅ **Quản lý đặt vé** - Xử lý booking
- ✅ **Dashboard & báo cáo** - Thống kê chi tiết
- ✅ **API Integration** - Kết nối backend Spring Boot

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **State Management**: React Hooks
- **API Client**: Fetch API với error handling
- **Icons**: Lucide React
- **Styling**: Tailwind CSS

## 📋 Yêu cầu hệ thống

- Node.js 18+ 
- Docker & Docker Compose
- Git

## 🐳 Docker Development Setup

### Chạy với Docker Compose (Khuyến nghị)

```bash
# Build và chạy development container
docker-compose up --build

# Chạy trong background
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng containers
docker-compose down
```

### Chạy với Docker trực tiếp

```bash
# Build image
docker build -f Dockerfile.dev -t ticket-admin-dev .

# Chạy container với volume mounting
docker run -p 3001:3001 -v $(pwd):/app ticket-admin-dev
```

### Docker Commands hữu ích

```bash
# Rebuild không cache
docker-compose build --no-cache

# Xóa tất cả containers và images
docker-compose down --rmi all --volumes --remove-orphans

# Vào container để debug
docker-compose exec ticket-admin-dev sh
```

## 🚀 Local Development (Không dùng Docker)

### 1. Clone repository

```bash
git clone <repository-url>
cd train-ticket-system
```

### 2. Cài đặt dependencies

```bash
pnpm install
```

### 3. Cấu hình environment

```bash
# Tạo file .env.local
cp .env.example .env.local
```

Cập nhật `.env.local`:
```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api

# Optional: Other configurations
NEXT_PUBLIC_APP_NAME=VietRail Admin
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 4. Chạy development server

```bash
pnpm dev
```

Mở [http://localhost:3001](http://localhost:3001) để xem ứng dụng.

## 📁 Cấu trúc project

```
train-ticket-system/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin pages
│   │   ├── users/         # User management
│   │   ├── trains/        # Train management
│   │   ├── routes/        # Route management
│   │   └── ...
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── admin-layout.tsx  # Admin layout
│   └── api-test.tsx      # API connection test
├── lib/                  # Utilities
│   ├── api.ts           # API client & types
│   └── utils.ts         # Helper functions
├── public/              # Static assets
└── styles/              # Global styles
```

## 🔌 API Integration

### Endpoints được hỗ trợ

```typescript
// User Management
GET    /api/users              # Lấy danh sách users (có pagination)
POST   /api/users              # Tạo user mới
PUT    /api/users/{id}         # Cập nhật user
DELETE /api/users/{id}         # Xóa user
PATCH  /api/users/{id}/toggle-status # Toggle trạng thái

// Query Parameters cho GET /api/users
?page=0&pageSize=10&searchTerm=admin&role=ROLE_ADMIN&status=active&sortBy=createdAt&sortDirection=desc
```

### Response Format

```json
{
  "content": [
    {
      "userId": 1,
      "username": "admin",
      "fullName": "Administrator",
      "email": "admin@example.com",
      "phone": "0123456789",
      "address": "Hanoi",
      "idCard": "123456789",
      "dateOfBirth": "1990-01-01",
      "createdAt": [2025, 5, 30, 10, 0, 0],
      "updatedAt": [2025, 5, 30, 10, 0, 0],
      "roles": [{"id": 1, "name": "ROLE_ADMIN"}],
      "lastLogin": [2025, 5, 30, 9, 30, 0],
      "status": "active"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10
  },
  "totalElements": 100,
  "totalPages": 10,
  "first": true,
  "last": false
}
```

## 🧪 Testing API Connection

1. Vào trang **Quản lý người dùng**
2. Click nút **"Kiểm tra API"**
3. Xem kết quả kết nối và debug nếu cần

## 🔍 Troubleshooting

### Lỗi CORS
```
Access to fetch at 'http://localhost:8080/api/users' from origin 'http://localhost:3001' has been blocked by CORS policy
```

**Giải pháp**: Cấu hình CORS trên Spring Boot backend

### API không phản hồi
```
TypeError: Failed to fetch
```

**Giải pháp**: Kiểm tra backend server có đang chạy không

### Docker issues
```bash
# Nếu có lỗi permission
sudo chown -R $USER:$USER .

# Nếu port đã được sử dụng
docker-compose down
docker system prune -f
```

## 📦 Dependencies

### Core Dependencies
- `next`: 15.2.4 - React framework
- `react`: ^19 - UI library
- `react-dom`: ^19 - React DOM
- `typescript`: ^5 - Type safety

### UI & Styling
- `tailwindcss`: ^3.4.17 - CSS framework
- `@radix-ui/*`: Various UI primitives
- `lucide-react`: ^0.454.0 - Icons
- `class-variance-authority`: ^0.7.1 - Component variants
- `clsx`: ^2.1.1 - Conditional classes
- `tailwind-merge`: ^2.5.5 - Tailwind class merging

### Forms & Validation
- `react-hook-form`: ^7.54.1 - Form handling
- `@hookform/resolvers`: ^3.9.1 - Form validation
- `zod`: ^3.24.1 - Schema validation

### Real-time & WebSocket
- `@stomp/stompjs`: ^7.1.1 - STOMP client
- `socket.io-client`: ^4.8.1 - Socket.IO client
- `sockjs-client`: ^1.6.1 - SockJS client

### Charts & Data
- `recharts`: 2.15.0 - Chart library
- `date-fns`: 4.1.0 - Date utilities

### Development
- `@types/node`: ^22 - Node.js types
- `@types/react`: ^19 - React types
- `@types/react-dom`: ^19 - React DOM types
- `@types/sockjs-client`: ^1.5.4 - SockJS types

---

**Happy Coding! 🚂✨**
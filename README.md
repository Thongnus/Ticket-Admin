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
- npm hoặc yarn
- Git

## 🚀 Cài đặt và chạy

### 1. Clone repository

\`\`\`bash
# Clone project từ v0
git clone <repository-url>
cd train-ticket-system
\`\`\`

### 2. Cài đặt dependencies

\`\`\`bash
npm install
# hoặc
yarn install
\`\`\`

### 3. Cấu hình environment

\`\`\`bash
# Tạo file .env.local
cp .env.example .env.local
\`\`\`

Cập nhật `.env.local`:
\`\`\`env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api

# Optional: Other configurations
NEXT_PUBLIC_APP_NAME=VietRail Admin
NEXT_PUBLIC_APP_VERSION=1.0.0
\`\`\`

### 4. Chạy development server

\`\`\`bash
npm run dev
# hoặc
yarn dev
\`\`\`

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## 🔧 Cấu hình API Backend

### Spring Boot CORS Configuration

\`\`\`java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://localhost:3000",
                    "http://127.0.0.1:3000",
                    "https://yourdomain.com"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
\`\`\`

### Hoặc sử dụng annotation

\`\`\`java
@CrossOrigin(origins = {"http://localhost:3000"})
@RestController
@RequestMapping("/api")
public class UserController {
    // Your endpoints
}
\`\`\`

## 📁 Cấu trúc project

\`\`\`
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
\`\`\`

## 🔌 API Integration

### Endpoints được hỗ trợ

\`\`\`typescript
// User Management
GET    /api/users              # Lấy danh sách users (có pagination)
POST   /api/users              # Tạo user mới
PUT    /api/users/{id}         # Cập nhật user
DELETE /api/users/{id}         # Xóa user
PATCH  /api/users/{id}/toggle-status # Toggle trạng thái

// Query Parameters cho GET /api/users
?page=0&pageSize=10&searchTerm=admin&role=ROLE_ADMIN&status=active&sortBy=createdAt&sortDirection=desc
\`\`\`

### Response Format

\`\`\`json
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
\`\`\`

## 🧪 Testing API Connection

1. Vào trang **Quản lý người dùng**
2. Click nút **"Kiểm tra API"**
3. Xem kết quả kết nối và debug nếu cần

## 🔍 Troubleshooting

### Lỗi CORS
\`\`\`
Access to fetch at 'http://localhost:8080/api/users' from origin 'http://localhost:3000' has been blocked by CORS policy
\`\`\`

**Giải pháp**: Cấu hình CORS trên Spring Boot backend

### API không phản hồi
\`\`\`
TypeError: Failed to fetch
\`\`\`

**Giải pháp**: 
- Kiểm tra backend có đang chạy không
- Kiểm tra URL trong `.env.local`
- Kiểm tra firewall/antivirus

### Dữ liệu không đúng format
\`\`\`
Invalid API response format
\`\`\`

**Giải pháp**: Đảm bảo API trả về đúng format như documented

## 📦 Build & Deploy

### Development
\`\`\`bash
npm run dev
\`\`\`

### Production Build
\`\`\`bash
npm run build
npm start
\`\`\`

### Deploy to Vercel
\`\`\`bash
npm install -g vercel
vercel
\`\`\`

## 🤝 Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra [Troubleshooting](#-troubleshooting)
2. Tạo issue trên GitHub
3. Liên hệ team phát triển

---

**Happy Coding! 🚂✨**
#   T i c k e t - A d m i n  
 
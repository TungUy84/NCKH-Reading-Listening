# English Learning Platform - Backend API

Backend cho website hỗ trợ luyện thi đầu ra tiếng Anh tại Trường Đại học Văn Lang.

## 🚀 Tính năng

### User Features
- ✅ Đăng ký tài khoản
- ✅ Đăng nhập/Đăng xuất
- ✅ Quên mật khẩu (reset qua email)
- ✅ Đổi mật khẩu
- ✅ Xem thông tin cá nhân
- ✅ Chỉnh sửa thông tin cá nhân

### Admin Features
- ✅ Tạo tài khoản người dùng
- ✅ Xem danh sách người dùng (có phân trang và tìm kiếm)
- ✅ Xem, sửa thông tin người dùng
- ✅ Phân quyền người dùng (admin/user)
- ✅ Kích hoạt/Vô hiệu hóa tài khoản
- ✅ Xóa tài khoản người dùng
- ✅ Xem thống kê người dùng
- ✅ Import đề kiểm tra từ Word/PDF/Excel kèm trình phân tích và kiểm tra trước khi lưu

## 🛠️ Công nghệ sử dụng

- **Node.js** + **Express.js** - Backend framework
- **MongoDB** + **Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **nodemailer** - Email service
- **express-validator** - Input validation

## 📦 Cài đặt và chạy

1. Cài đặt dependencies:
```bash
npm install
```

2. Cấu hình environment variables trong file `.env`:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://tunguykim:Qk21VuxbkcGrl0VD@nckh.qetgprq.mongodb.net/english_learning_app

JWT_SECRET=your_very_long_and_secure_jwt_secret_key
JWT_EXPIRE=30d

EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

CLIENT_URL=http://localhost:3000
```

3. Tạo admin user:
```bash
npm run create-admin
```

4. Chạy server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📚 API Endpoints

### Base URL: `http://localhost:5000/api`

### Authentication Routes (`/api/auth`)
- `POST /auth/register` - Đăng ký tài khoản
- `POST /auth/login` - Đăng nhập
- `GET /auth/profile` - Xem thông tin cá nhân
- `PUT /auth/profile` - Cập nhật thông tin cá nhân
- `PUT /auth/change-password` - Đổi mật khẩu
- `POST /auth/forgot-password` - Quên mật khẩu
- `PUT /auth/reset-password/:token` - Reset mật khẩu
- `POST /auth/logout` - Đăng xuất

### User Management Routes (`/api/users`) - Admin Only
- `GET /users` - Xem danh sách người dùng
- `GET /users/stats` - Xem thống kê người dùng
- `GET /users/:id` - Xem thông tin user theo ID
- `POST /users` - Tạo tài khoản người dùng
- `PUT /users/:id` - Cập nhật thông tin người dùng
- `DELETE /users/:id` - Xóa tài khoản người dùng
- `PUT /users/:id/toggle-status` - Kích hoạt/Vô hiệu hóa tài khoản
- `PUT /users/:id/role` - Phân quyền người dùng

### Authentication Headers
```
Authorization: Bearer <jwt_token>
```

## � Default Admin Account
- **Email:** tunguykim@gmail.com
- **Password:** Abc1232456
- **Role:** admin

## 🗄️ Database Schema

# 🧠 Hệ Thống Luyện Thi Nghe – Đọc Tiếng Anh

>Nền tảng giúp học sinh luyện kỹ năng **Listening / Reading** với lộ trình cá nhân hóa dựa trên trình độ (AV1–AV7), hỗ trợ làm placement test, luyện đề, mock test và xem kết quả phân tích chi tiết.

## 🚀 Tính Năng Chính

| Nhóm | Tính năng |
|------|-----------|
| Người dùng | Đăng ký / Đăng nhập (JWT), cập nhật profile, avatar upload |
| Placement Test | Làm bài, tính điểm, xác định cấp độ AV1–AV7, gợi ý lộ trình |
| Luyện tập & Thi thử | Các dạng câu hỏi đa dạng (multiple choice, fill blank, true/false/not given, v.v.) |
| Kết quả | Tính điểm, phần trăm, IELTS scale (planned), giải thích đáp án |
| Nội dung | Blog, roadmap, lessons (đang phát triển) |
| Hệ thống | Gửi email (Node mailer), auto-save (admin editor), phân quyền basic |

## 🛠️ Công Nghệ

**Frontend (User & Admin)**
- React 18, TypeScript
- React Router v6
- Tailwind CSS (custom theme)
- react-toastify, AOS animations

**Backend**
- Node.js + Express
- Mongoose (MongoDB)
- JSON Web Token (JWT) auth
- Multer (upload avatar), Nodemailer (email)

**Khác**
- REST API style
- Môi trường tách riêng dev/prod `.env`

## 📂 Cấu Trúc Dự Án

```
Server/        → Backend (Express API, port mặc định: 5000)
fe-admin/      → Frontend dành cho Admin (PORT 3000)
fe-user/       → Frontend dành cho Học viên/User (PORT 3002)
```

Lý do tách 2 frontend: tránh bundle cồng kềnh, phân vai trò rõ ràng, dễ deploy độc lập.

## 🌐 Cổng (Ports)

| Service | Port | Ghi chú |
|---------|------|--------|
| Backend (Server) | 5000 | API chính (có thể đổi trong `.env`) |
| fe-admin | 3000 | Create React App (CRA) |
| fe-user | 3002 | Đã đổi để tránh trùng 3000 |

Không cần chỉnh backend khi đổi port frontend. Chỉ đảm bảo biến môi trường phía FE trỏ đúng `API_BASE_URL`.

## 🔐 Biến Môi Trường Mẫu

### 1. Backend: `Server/.env`
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/placement_test
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
CLIENT_ORIGIN=http://localhost:3002
```

### 2. fe-admin: `fe-admin/.env`
```
PORT=3000
REACT_APP_API_BASE_URL=http://localhost:5000
```

### 3. fe-user: `fe-user/.env`
```
PORT=3002
REACT_APP_API_BASE_URL=http://localhost:5000
```

> Nếu deploy: thay bằng domain + HTTPS + bật CORS chính xác trong backend.

## ▶️ Chạy Dự Án (Dev)

### Backend
```bash
cd Server
npm install
npm run dev
```

### Admin FE
```bash
cd fe-admin
npm install
npm start
```

### User FE
```bash
cd fe-user
npm install
npm start
```

### Chạy song song (tùy chọn – tạo file `package.json` ở root):
```jsonc
{
    "scripts": {
        "dev": "concurrently \"npm --prefix Server run dev\" \"npm --prefix fe-admin start\" \"npm --prefix fe-user start\""
    },
    "devDependencies": {
        "concurrently": "^8.2.0"
    }
}
```
Rồi chạy:
```bash
npm run dev
```

## 📡 API Tổng Quan (Rút gọn)

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/tests/:id` (placement test lấy để làm)
- `POST /api/tests/submit` (nộp bài)
- `GET /api/users/me`

## 🧪 Các Dạng Câu Hỏi Hỗ Trợ
- Multiple Choice (nhiều đáp án)
- Fill in the Blank
- True / False / Not Given
- Yes / No / Not Given
- Matching (planned)
- Summary / Sentence Completion

## � Lưu Ý Phát Triển
- Đổi port FE không ảnh hưởng backend trừ khi cấu hình CORS sai.
- Luôn kiểm tra biến `REACT_APP_API_BASE_URL` sau khi đổi môi trường.
- Có thể tách component lớn (TakeTestPage) thêm nếu mở rộng logic review / flag.

## 🔮 Định Hướng Nâng Cấp (Planned)
- Flag câu hỏi để xem lại.
- Phím tắt: J/K hoặc ↑/↓ chuyển câu.
- Thêm mode “focus reading” (ẩn đáp án tạm thời).
- Bảng phân tích tiến trình (per skill / per question type).
- Thêm trang quản lý nội dung blog giàu định dạng (Markdown editor).

## 🧷 License
Internal project (chưa công bố license).

---
Nếu cần thêm phần: Docker, deploy hướng dẫn, hay CI/CD — cứ tạo issue hoặc báo cho mình nhé.

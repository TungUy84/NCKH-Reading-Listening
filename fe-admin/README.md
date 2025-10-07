# 🔧 FE-ADMIN - Admin Dashboard

Admin dashboard React TypeScript cho hệ thống luyện thi Nghe-Đọc tiếng Anh.

## 🚀 **Tính năng chính**

### ✅ **Dashboard:**
- Thống kê tổng quan hệ thống
- Biểu đồ và analytics
- Activity monitoring

### ✅ **Quản lý Tests:**
- CRUD operations cho placement tests
- Question management với multiple types
- Bulk actions (activate/deactivate/delete)

### ✅ **Authentication:**
- JWT-based admin login
- Role-based access control
- Session management

### ✅ **UI Components:**
- Modern admin interface
- Responsive sidebar navigation
- Data tables với pagination
- Modal dialogs và forms

## 📦 **Cài đặt và chạy**

### Bước 1: Cài đặt dependencies
```bash
cd fe-admin
npm install
```

### Bước 2: Chạy development server
```bash
npm start
```

### Bước 3: Truy cập admin panel
- URL: http://localhost:3001
- Login: admin@vanlang.edu.vn / admin123

## 🏗️ **Cấu trúc project**

```
fe-admin/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   └── Forms.tsx
│   │   └── charts/
│   │       └── Dashboard Charts
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── TestsPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── SettingsPage.tsx
│   ├── services/
│   │   ├── api.ts
│   │   └── auth.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useApi.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── helpers.ts
│   ├── App.tsx
│   ├── index.tsx
│   └── index.css
└── package.json
```

## 🔐 **Authentication**

### Admin Login:
- Email: admin@vanlang.edu.vn
- Password: admin123

### JWT Token được lưu trong localStorage
- Key: `admin_token`
- Auto-refresh khi gần expire

## 📊 **Dashboard Features**

### Thống kê:
- Tổng số tests, câu hỏi
- Tests theo category
- Điểm trung bình
- Activity charts

### Quản lý Tests:
- Tạo/sửa/xóa tests
- Question editor với rich features
- Media upload support
- Bulk operations

## 📥 Import bài test

- Upload trực tiếp đề thi từ các định dạng **Word (.docx), PDF (.pdf) và Excel (.xlsx)**.
- Công cụ nằm trong mục **Kiểm tra đầu vào → Import** với bản xem trước câu hỏi trước khi lưu.
- Có thể tinh chỉnh tiêu đề, mô tả, thời gian, hướng dẫn và trạng thái kích hoạt trước khi tạo test.
- Các file mẫu được đặt tại `fe-admin/public/import-samples/` và có thể tải ngay trong giao diện Import:
  - `sample-placement-test.docx`
  - `sample-placement-test.xlsx`
- Khi tự chuẩn bị file:
  - Word/PDF: khai báo metadata theo key-value, dùng `---` để phân cách phần câu hỏi; đánh dấu đáp án đúng bằng dấu `*` hoặc `[x]`.
  - Excel: Sheet `Metadata` chứa cột `Field`/`Value`; sheet `Questions` gồm các cột `QuestionNumber`, `Type`, `Content`, `Level`, `Skill`, `Points`, `Options`, `CorrectAnswers`, `MatchingPairs`, ... (ngăn cách nhiều giá trị bằng `|`).


## 🎨 **Design System**

### Colors:
- **Primary:** Blue (#0ea5e9 - #0c4a6e)
- **Success:** Green (#22c55e - #15803d)
- **Warning:** Yellow (#f59e0b - #b45309)
- **Danger:** Red (#ef4444 - #b91c1c)

### Components:
- `.btn-primary`, `.btn-secondary`, `.btn-danger`
- `.card`, `.card-header`, `.card-body`
- `.table`, `.table-header`, `.table-cell`
- `.sidebar-link-active`, `.sidebar-link-inactive`

## 🔌 **API Integration**

### Admin Endpoints:
- `POST /api/auth/login` - Admin login
- `GET /api/placement-tests/admin` - Get all tests (paginated)
- `GET /api/placement-tests/admin/stats` - Dashboard statistics
- `POST /api/placement-tests/admin` - Create test
- `PUT /api/placement-tests/admin/:id` - Update test
- `DELETE /api/placement-tests/admin/:id` - Delete test

### Headers Required:
```javascript
{
  'Authorization': 'Bearer {jwt_token}',
  'Content-Type': 'application/json'
}
```

## 🚀 **Deployment**

### Build:
```bash
npm run build
```

### Environment Variables:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_BASE_URL=http://localhost:3001
```

## 📋 **Development Workflow**

### 1. Start Backend:
```bash
cd ../Server
npm run dev
```

### 2. Start Admin Frontend:
```bash
npm start
```

### 3. Login và test features:
- Dashboard statistics
- Test management
- Question editing

**Status:** ✅ **Admin dashboard components sẵn sàng, cần install dependencies để chạy**

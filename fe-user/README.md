# 🎨 FE-USER - Frontend cho Sinh viên

Frontend React TypeScript cho hệ thống luyện thi Nghe-Đọc tiếng Anh, dành cho sinh viên làm bài test.

## 🚀 **Tính năng chính**

### ✅ **Đã hoàn thành:**
- **Home Page:** Hero section, features, process steps
- **Tests Page:** Danh sách bài test với filter và search  
- **Test Cards:** Hiển thị thông tin chi tiết từng bài test
- **Responsive Design:** Tối ưu cho mọi thiết bị
- **TypeScript:** Type safety đầy đủ
- **Tailwind CSS:** Styling hiện đại

### 🔄 **Đang phát triển:**
- **Test Taking Page:** Giao diện làm bài test
- **Result Page:** Hiển thị kết quả chi tiết
- **Audio Player:** Hỗ trợ bài listening
- **Progress Tracking:** Theo dõi tiến độ

## 📦 **Cài đặt và chạy**

### Bước 1: Cài đặt dependencies
```bash
cd fe-user
npm install
```

### Bước 2: Chạy development server
```bash
npm start
```

### Bước 3: Mở browser
- URL: http://localhost:3000
- API Backend: http://localhost:5000

## 🏗️ **Cấu trúc project**

```
fe-user/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── components/             # React components
│   │   ├── Header.tsx         # Navigation header
│   │   ├── Footer.tsx         # Site footer  
│   │   ├── HeroSection.tsx    # Landing hero
│   │   ├── FeaturesSection.tsx # Features showcase
│   │   ├── ProcessSection.tsx  # Process steps
│   │   └── TestCard.tsx       # Test display card
│   ├── pages/                 # Page components
│   │   ├── HomePage.tsx       # Landing page
│   │   └── TestsPage.tsx      # Tests listing
│   ├── services/              # API calls
│   │   └── api.ts             # Backend integration
│   ├── types/                 # TypeScript types
│   │   └── index.ts           # Type definitions
│   ├── App.tsx                # Main app component
│   ├── index.tsx              # React entry point
│   └── index.css              # Tailwind CSS
├── tailwind.config.js         # Tailwind configuration
├── package.json               # Dependencies
└── tsconfig.json              # TypeScript config
```

## 🔌 **API Integration**

### Endpoints sử dụng:
- `GET /api/placement-tests` - Lấy danh sách tests đang hoạt động
- `GET /api/placement-tests?category=listening` - Filter listening
- `GET /api/placement-tests?category=reading` - Filter reading
- `GET /api/placement-tests/:testId` - Lấy chi tiết test
- `POST /api/placement-tests/:testId/submissions` - Nộp bài và chấm điểm

### Environment Variables:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_BASE_URL=http://localhost:3000
```

## 🎨 **Design System**

### Colors:
- **Primary:** Blue (#3b82f6 - #1e3a8a)
- **Secondary:** Orange (#f97316 - #ea580c)  
- **Gray Scale:** (#f9fafb - #111827)

### Typography:
- **Font:** Inter (Google Fonts)
- **Sizes:** text-sm, text-base, text-lg, text-xl, text-2xl, text-4xl

### Components:
- **Buttons:** .btn-primary, .btn-secondary
- **Cards:** .card with hover effects
- **Containers:** .section-container for consistent spacing

## 📱 **Responsive Breakpoints**

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

## 🧪 **Development Guidelines**

### Component Structure:
```typescript
interface ComponentProps {
  // Props interface
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Component logic
  return (
    <div className="component-styles">
      {/* JSX content */}
    </div>
  );
};

export default Component;
```

### State Management:
- **Local State:** useState for component state
- **API Calls:** Custom hooks với useEffect
- **Error Handling:** Try-catch với user-friendly messages

### Styling:
- **Tailwind CSS:** Utility-first CSS framework
- **Custom Classes:** Defined in index.css với @apply
- **Responsive:** Mobile-first design approach

## 🚀 **Deployment**

### Build cho production:
```bash
npm run build
```

### Serve static files:
```bash
npx serve -s build
```

### Deploy options:
- **Netlify:** Auto deploy từ Git
- **Vercel:** React-optimized hosting
- **Firebase:** Google hosting service

## 📋 **To-Do List**

### High Priority:
- [ ] **Test Taking Page** - Giao diện làm bài chính
- [ ] **Question Components** - Single choice, Multiple choice, Fill blank
- [ ] **Timer Component** - Đếm ngược thời gian
- [ ] **Progress Bar** - Hiển thị tiến độ làm bài

### Medium Priority:
- [ ] **Audio Player** - Hỗ trợ file âm thanh
- [ ] **Result Page** - Hiển thị kết quả chi tiết
- [ ] **Loading States** - Skeleton loading
- [ ] **Error Boundaries** - Error handling

### Low Priority:
- [ ] **Dark Mode** - Theme switching
- [ ] **PWA Support** - Progressive Web App
- [ ] **Offline Mode** - Cached content
- [ ] **Analytics** - Usage tracking

## 🔧 **Troubleshooting**

### Common Issues:

#### 1. **API Connection Failed**
```bash
# Check backend server
cd ../Server
npm run dev

# Check environment variables
cat .env
```

#### 2. **Tailwind Not Working**
```bash
# Rebuild CSS
npm run build

# Check PostCSS config
cat postcss.config.js
```

#### 3. **TypeScript Errors**
```bash
# Type check
npx tsc --noEmit

# Install missing types
npm install @types/react @types/react-dom
```

## 📞 **Support**

- **Backend API:** Xem docs ở `../Server/docs/`
- **Postman Collection:** Import từ `../Server/docs/PlacementTest_Postman_Collection.json`
- **Component Library:** Tham khảo Tailwind UI examples

**Status:** ✅ **Core components sẵn sàng, cần phát triển test-taking flow**

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Thiết lập cấu hình chung cho máy chủ
const jsonBodyLimit = process.env.JSON_BODY_LIMIT || '10mb';
const uploadsDir = path.join(__dirname, 'uploads');
const audioMimeTypes = {
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
};
const audioExtensions = new Set(Object.keys(audioMimeTypes));

// Ẩn header mặc định để giảm thông tin lộ ra
app.disable('x-powered-by');

// Nạp các middleware cốt lõi
app.use(cors());
app.use(express.json({ limit: jsonBodyLimit }));
app.use(express.urlencoded({ extended: true }));

// Thư mục uploads và thiết lập header cho file audio
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (!audioExtensions.has(ext)) {
      return;
    }
    if (!res.getHeader('Content-Disposition')) {
      res.setHeader('Content-Disposition', 'inline');
    }
    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', audioMimeTypes[ext] || 'application/octet-stream');
    }
    res.setHeader('Accept-Ranges', 'bytes');
  },
}));

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Kết nối MongoDB thành công'))
  .catch((error) => {
    console.error('Lỗi kết nối MongoDB:', error);
  });

// Khai báo các tuyến API chính
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/placement-tests', require('./routes/placementTest'));
app.use('/api/practices', require('./routes/practice'));
app.use('/api/lessons', require('./routes/lesson'));
app.use('/api/roadmap', require('./routes/roadmap'));

// Middleware xử lý lỗi tập trung
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Đã xảy ra lỗi trên máy chủ', error: err.message });
});

// Xử lý 404 cho mọi route không tồn tại
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Đường dẫn không tồn tại' });
});

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`Server đang chạy tại cổng ${PORT}`);
});

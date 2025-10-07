const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const {
  // Public APIs
  getActivePlacementTests,
  getPlacementTestForTaking,
  checkPlacementTest, // Thay đổi từ submitPlacementTest
  
  // Admin APIs
  getAllPlacementTests,
  getPlacementTestById,
  createPlacementTest,
  updatePlacementTest,
  deletePlacementTest,
  getPlacementTestStats,
  importPlacementTest,
  updateTestContent
} = require('../controllers/placementTestController');

const { protect, authorize } = require('../middleware/auth');

// Tạo middleware cho admin  
const isAdmin = authorize('admin');

// Configure multer for placement test import files (Word/PDF/Excel)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/tests/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fallbackExt = path.extname(file.originalname) || allowedMimeTypes[file.mimetype] || '.bin';
    cb(null, 'test-' + uniqueSuffix + fallbackExt);
  }
});

const allowedMimeTypes = {
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx'
};

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    if (allowedMimeTypes[file.mimetype]) {
      cb(null, true);
    } else {
      cb(new Error('Định dạng không hỗ trợ. Vui lòng sử dụng file Word (.docx), PDF (.pdf) hoặc Excel (.xlsx).'), false);
    }
  }
});

// ======= PUBLIC ROUTES (Không cần đăng nhập) =======

// Lấy danh sách các bài test đang hoạt động (có thể filter theo category)
// GET /api/placement-tests/active?category=listening hoặc reading
router.get('/active', getActivePlacementTests);

// Lấy chi tiết bài test để làm bài
router.get('/take/:testId', getPlacementTestForTaking);

// Chấm điểm bài test ngay lập tức (không lưu database)
router.post('/check', checkPlacementTest);

// ======= ADMIN ROUTES (Cần đăng nhập và quyền admin) =======

// Lấy tất cả bài test với phân trang
router.get('/admin', protect, isAdmin, getAllPlacementTests);

// Lấy thống kê tổng quan
router.get('/admin/stats', protect, isAdmin, getPlacementTestStats);

// Lấy chi tiết bài test theo ID
router.get('/admin/:testId', protect, isAdmin, getPlacementTestById);

// Tạo bài test mới
router.post('/admin', protect, isAdmin, createPlacementTest);

// Cập nhật bài test
router.put('/admin/:testId', protect, isAdmin, updatePlacementTest);

// Cập nhật nội dung bài test (sections + questions)
router.put('/admin/:testId/content', protect, isAdmin, updateTestContent);

// Xóa bài test
router.delete('/admin/:testId', protect, isAdmin, deletePlacementTest);

// Import bài test từ file (Word/PDF/Excel)
router.post('/admin/import', protect, isAdmin, upload.single('testFile'), importPlacementTest);

module.exports = router;

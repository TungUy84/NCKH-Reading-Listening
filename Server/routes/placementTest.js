const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const {
  getActivePlacementTests,
  getPlacementTestForTaking,
  checkPlacementTest,
  getAllPlacementTests,
  getPlacementTestById,
  createPlacementTest,
  updatePlacementTest,
  deletePlacementTest,
  bulkDeletePlacementTests,
  bulkUpdatePlacementTestStatus,
  getPlacementTestStats,
  importPlacementTest,
  updateTestContent,
  uploadSectionMedia
} = require('../controllers/placementTestController');

const { protect, authorize } = require('../middleware/auth');

// Middleware chỉ dành cho admin
const isAdmin = authorize('admin');

// Configure multer for placement test import files (Word/PDF/Excel)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = 'uploads/tests/';
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
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

// Media upload (images/audios) for placement test sections
const mediaStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = 'uploads/tests/media/';
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || (file.mimetype.startsWith('audio/') ? '.mp3' : '.png');
    cb(null, 'media-' + uniqueSuffix + ext);
  }
});

const mediaUpload = multer({
  storage: mediaStorage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ hỗ trợ các định dạng hình ảnh hoặc audio'), false);
    }
  }
});

// ======= PUBLIC ROUTES =======

// Lấy danh sách bài test đang hoạt động (filter qua query category)
router.get('/', (req, res, next) => {
  if (req.query.scope === 'admin' || req.query.includeInactive === 'true') {
    return next('route');
  }
  return getActivePlacementTests(req, res, next);
});

// ======= ADMIN ROUTES (Yêu cầu đăng nhập admin) =======

// Lấy thống kê tổng quan bài test
router.get('/stats', protect, isAdmin, getPlacementTestStats);

// Import bài test từ file (Word/PDF/Excel)
router.post('/import', protect, isAdmin, upload.single('testFile'), importPlacementTest);

// Bulk operations cho bài test
router.post('/bulk-delete', protect, isAdmin, bulkDeletePlacementTests);
router.post('/bulk-update-status', protect, isAdmin, bulkUpdatePlacementTestStatus);

// Upload media cho passage (cho phép upload trước khi lưu test)
router.post('/media', protect, isAdmin, mediaUpload.array('files', 10), uploadSectionMedia);

// Lấy danh sách đầy đủ bài test (bao gồm cả chưa active)
router.get('/', protect, isAdmin, getAllPlacementTests);

// Tạo bài test mới
router.post('/', protect, isAdmin, createPlacementTest);

// Lấy chi tiết bài test đầy đủ (bao gồm đáp án) cho admin
router.get('/:testId/details', protect, isAdmin, getPlacementTestById);

// Cập nhật nội dung bài test (sections + questions)
router.put('/:testId/content', protect, isAdmin, updateTestContent);

// Cập nhật bài test cơ bản
router.put('/:testId', protect, isAdmin, updatePlacementTest);

// Xóa bài test
router.delete('/:testId', protect, isAdmin, deletePlacementTest);

// Gửi bài làm để chấm điểm (không lưu database)
router.post('/:testId/submissions', checkPlacementTest);

// Lấy chi tiết bài test cho thí sinh
router.get('/:testId', getPlacementTestForTaking);

module.exports = router;

const express = require('express');
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
  getPlacementTestStats
} = require('../controllers/placementTestController');

const { protect, authorize } = require('../middleware/auth');

// Tạo middleware cho admin  
const isAdmin = authorize('admin');

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

// Xóa bài test
router.delete('/admin/:testId', protect, isAdmin, deletePlacementTest);

module.exports = router;

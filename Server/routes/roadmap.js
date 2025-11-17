const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const roadmapController = require('../controllers/roadmapController');

// ============================================================================
// ADMIN ROUTES - Quản lý Roadmap Templates
// ============================================================================

// Lấy danh sách tất cả roadmap templates
router.get(
  '/admin',
  protect,
  authorize('admin'),
  roadmapController.getAdminRoadmaps
);

// Lấy chi tiết một roadmap template
router.get(
  '/admin/:id',
  protect,
  authorize('admin'),
  roadmapController.getAdminRoadmapDetail
);

// Cập nhật roadmap template
router.put(
  '/admin/:id',
  protect,
  authorize('admin'),
  roadmapController.updateRoadmap
);

// Lấy danh sách lessons/practices có thể thêm vào roadmap
router.get(
  '/admin/content/available',
  protect,
  authorize('admin'),
  roadmapController.getAvailableContent
);

// Check if test is used in any roadmap (before deletion)
router.get(
  '/admin/test-usage/:testId',
  protect,
  authorize('admin'),
  roadmapController.checkTestUsageInRoadmap
);

// Check if lesson is used in any roadmap (before deletion)
router.get(
  '/admin/lesson-usage/:lessonId',
  protect,
  authorize('admin'),
  roadmapController.checkLessonUsageInRoadmap
);

// Check if practice is used in any roadmap (before deletion)
router.get(
  '/admin/practice-usage/:practiceId',
  protect,
  authorize('admin'),
  roadmapController.checkPracticeUsageInRoadmap
);

// ============================================================================
// USER ROUTES - Quản lý User Roadmap
// ============================================================================

// Tạo roadmap cá nhân
router.post(
  '/user/create',
  protect,
  roadmapController.createUserRoadmap
);

// Lấy roadmap hiện tại của user
router.get(
  '/user/current',
  protect,
  roadmapController.getCurrentUserRoadmap
);

// Đồng bộ content từ template (sau khi admin update roadmap)
router.post(
  '/user/sync-content',
  protect,
  roadmapController.syncContentFromTemplate
);

// Lấy chi tiết một stage
router.get(
  '/user/stage/:levelGroup',
  protect,
  roadmapController.getStageDetail
);

// Cập nhật progress (xem lesson/làm practice)
router.post(
  '/user/progress',
  protect,
  roadmapController.updateProgress
);

// Submit checkpoint test result
router.post(
  '/user/checkpoint',
  protect,
  roadmapController.submitCheckpoint
);

// Lấy gợi ý level dựa trên placement test
router.get(
  '/user/suggested-level',
  protect,
  roadmapController.getSuggestedLevel
);

module.exports = router;

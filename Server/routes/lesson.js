const express = require('express');
const {
  getPublicLessons,
  getAdminLessons,
  getLessonDetails,
  getLessonForLearner,
  createLesson,
  updateLesson,
  deleteLesson
} = require('../controllers/lessonController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
const adminRouter = express.Router();
const isAdmin = authorize('admin');

adminRouter.get('/', getAdminLessons);
adminRouter.post('/', createLesson);
adminRouter.get('/:lessonId', getLessonDetails);
adminRouter.put('/:lessonId', updateLesson);
adminRouter.delete('/:lessonId', deleteLesson);

router.use('/admin', protect, isAdmin, adminRouter);

router.get('/', getPublicLessons);
router.get('/:lessonId', getLessonForLearner);

module.exports = router;

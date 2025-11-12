const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getPublicPractices,
  getAdminPractices,
  createPractice,
  getPracticeForLearner,
  getPracticeDetails,
  deletePractice,
  updatePracticeContent,
  uploadPracticeMedia,
  updatePracticeInfo,
  importPractice,
  submitPracticeAttempt,
  getMyPracticeAttempts,
  getPracticeAttemptsForAdmin,
  getPracticeAttemptDetails
} = require('../controllers/practiceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
const isAdmin = authorize('admin');

// Cấu hình multer để xử lý upload media cho bài ôn luyện
const practiceMediaStorage = multer.diskStorage({
  destination: function (req, file, cb) {
  const dest = 'uploads/practices/media/';
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || (file.mimetype.startsWith('audio/') ? '.mp3' : '.png');
    cb(null, 'practice-media-' + uniqueSuffix + ext);
  }
});

// Bộ lọc file để chỉ chấp nhận hình ảnh và audio
const practiceMediaUpload = multer({
  storage: practiceMediaStorage,
  limits: {
    fileSize: 20 * 1024 * 1024
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ hỗ trợ định dạng hình ảnh hoặc audio cho bài ôn luyện'), false);
    }
  }
});

const allowedImportMimeTypes = {
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx'
};

// Cấu hình multer để xử lý upload file import bài ôn luyện
const practiceImportStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = 'uploads/practices/import/';
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fallbackExt = path.extname(file.originalname) || allowedImportMimeTypes[file.mimetype] || '.bin';
    cb(null, 'practice-import-' + uniqueSuffix + fallbackExt);
  }
});

// Bộ lọc file để chỉ chấp nhận các định dạng Word, PDF, Excel
const practiceImportUpload = multer({
  storage: practiceImportStorage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: function (req, file, cb) {
    if (allowedImportMimeTypes[file.mimetype]) {
      cb(null, true);
    } else {
      cb(new Error('Định dạng không hỗ trợ. Vui lòng sử dụng file Word (.docx) hoặc Excel (.xlsx).'), false);
    }
  }
});

// ====== ROUTE CÔNG KHAI ======
router.get('/', (req, res, next) => {
  if (req.query.scope === 'admin' || req.query.includeInactive === 'true') {
    return next('route');
  }
  return getPublicPractices(req, res, next);
});

// ====== ROUTE ADMIN ======
router.get('/', protect, isAdmin, getAdminPractices);
router.post('/', protect, isAdmin, createPractice);
router.get('/:practiceId/details', protect, isAdmin, getPracticeDetails);
router.post('/media', protect, isAdmin, practiceMediaUpload.array('files', 10), uploadPracticeMedia);
router.post('/import', protect, isAdmin, practiceImportUpload.single('practiceFile'), importPractice);
router.put('/:practiceId/content', protect, isAdmin, updatePracticeContent);
router.put('/:practiceId', protect, isAdmin, updatePracticeInfo);
router.delete('/:practiceId', protect, isAdmin, deletePractice);
router.get('/:practiceId/attempts', protect, isAdmin, getPracticeAttemptsForAdmin);

// ====== ROUTE CHO NGƯỜI HỌC ======
router.post('/:practiceId/submit', protect, submitPracticeAttempt);
router.get('/:practiceId/attempts/mine', protect, getMyPracticeAttempts);
router.get('/attempts/:attemptId', protect, getPracticeAttemptDetails);
router.get('/:practiceId', getPracticeForLearner);

module.exports = router;

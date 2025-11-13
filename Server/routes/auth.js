const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const { 
  validateRegister, 
  validateLogin, 
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword 
} = require('../middleware/validation');

// Cấu hình multer để xử lý upload ảnh đại diện
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatars/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép tải lên định dạng hình ảnh'), false);
    }
  }
});

// Đăng ký, đăng nhập và đăng xuất
router.post('/register', validateRegister, authController.registerUser);
router.post('/login', validateLogin, authController.loginUser);
router.post('/logout', protect, authController.logoutUser);

// Quên mật khẩu và reset mật khẩu
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
router.put('/reset-password/:resetToken', validateResetPassword, authController.resetPassword);

// Quản lý profile cá nhân (cần đăng nhập)
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);
router.put('/change-password', protect, validateChangePassword, authController.changePassword);
router.post('/avatar', protect, upload.single('avatar'), authController.uploadAvatar);

module.exports = router;

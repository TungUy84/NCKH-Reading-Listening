const express = require('express');
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

module.exports = router;

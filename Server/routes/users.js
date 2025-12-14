const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { validateRegister } = require('../middleware/validation');

// Lấy thống kê công khai
router.get('/public/stats', userController.getPublicStats);

// Lấy thống kê users (Chỉ admin)
router.get('/stats', protect, authorize(['admin']), userController.getUserStats);

// Lấy danh sách tất cả users
router.get('/', protect, authorize(['admin']), userController.getAllUsers);

// Tạo user mới
router.post('/', protect, authorize(['admin']), validateRegister, userController.createUser);

// Lấy thông tin user theo ID
router.get('/:id', protect, authorize(['admin']), userController.getUserById);

// Cập nhật thông tin user
router.put('/:id', protect, authorize(['admin']), userController.updateUser);

// Xóa user
router.delete('/:id', protect, authorize(['admin']), userController.deleteUser);

module.exports = router;

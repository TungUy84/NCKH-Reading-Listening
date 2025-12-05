const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware bảo vệ routes - yêu cầu đăng nhập
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Lấy token từ header
      token = req.headers.authorization.split(' ')[1];

      // Xác minh token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Lấy thông tin user từ token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Không tìm thấy user' });
      }

      if (!req.user.isActive) {
        return res.status(401).json({ message: 'Tài khoản đã bị vô hiệu hóa' });
      }

      next();
    } catch (error) {
      console.error('Bảo vệ route thất bại:', error);
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Không có token, truy cập bị từ chối' });
  }
};

// Middleware kiểm tra đăng nhập nhưng không bắt buộc (cho route công khai có tính năng cá nhân hóa)
const optionalProtect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Token lỗi hoặc hết hạn thì coi như khách vãng lai, không throw error
      req.user = null;
    }
  }
  next();
};

// Middleware phân quyền theo role
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    next();
  };
};

// Tạo JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = { protect, optionalProtect, authorize, generateToken };

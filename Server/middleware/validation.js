const { body, validationResult } = require('express-validator');

// Xử lý lỗi validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Dữ liệu không hợp lệ',
      errors: errors.array()
    });
  }
  next();
};

// Validation đăng ký
const validateRegister = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Tên đăng nhập phải từ 3-30 ký tự')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Tên đăng nhập chỉ được chứa chữ, số và dấu gạch dưới'),
  
  body('email')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số'),
  
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Họ là bắt buộc và không quá 50 ký tự'),
  
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Tên là bắt buộc và không quá 50 ký tự'),
  
  body('phoneNumber')
    .optional()
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Số điện thoại phải có 10-11 chữ số'),
  
  body('studentId')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Mã sinh viên không quá 20 ký tự'),
    
  handleValidationErrors
];

// Validation đăng nhập
const validateLogin = [
  body('identifier')
    .optional()
    .trim()
    .custom((value) => {
      if (!value) {
        return true;
      }

      const isEmail = /\S+@\S+\.\S+/.test(value);
      const isUsername = /^[a-zA-Z0-9_]{3,30}$/.test(value);

      if (!isEmail && !isUsername) {
        throw new Error('Vui lòng nhập email hợp lệ hoặc tên đăng nhập từ 3-30 ký tự');
      }
      return true;
    }),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Mật khẩu là bắt buộc'),

  body()
    .custom(({ identifier, email }) => {
      if (!identifier && !email) {
        throw new Error('Email hoặc tên đăng nhập là bắt buộc');
      }
      return true;
    }),
    
  handleValidationErrors
];

// Validation cập nhật profile
const validateUpdateProfile = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Họ không quá 50 ký tự'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Tên không quá 50 ký tự'),
  
  body('phoneNumber')
    .optional()
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Số điện thoại phải có 10-11 chữ số'),
  
  body('studentId')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Mã sinh viên không quá 20 ký tự'),
    
  handleValidationErrors
];

// Validation đổi mật khẩu
const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Mật khẩu hiện tại là bắt buộc'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu mới phải có ít nhất 6 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Mật khẩu mới phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số'),
    
  handleValidationErrors
];

// Validation quên mật khẩu
const validateForgotPassword = [
  body('email')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),
    
  handleValidationErrors
];

// Validation reset mật khẩu
const validateResetPassword = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số'),
    
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword
};

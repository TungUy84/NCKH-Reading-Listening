const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');
const { generateResetToken, hashResetToken, sendPasswordResetEmail } = require('../utils/email');

// Đăng ký tài khoản
const registerUser = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, phoneNumber, studentId, dateOfBirth } = req.body;

    // Kiểm tra email trùng
    const existingUserEmail = await User.findOne({ email });
    if (existingUserEmail) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    // Kiểm tra username trùng
    const existingUserUsername = await User.findOne({ username });
    if (existingUserUsername) {
      return res.status(400).json({ message: 'Username đã được sử dụng' });
    }

    // Kiểm tra số điện thoại trùng
    if (phoneNumber) {
      const existingUserPhone = await User.findOne({ phoneNumber });
      if (existingUserPhone) {
        return res.status(400).json({ message: 'Số điện thoại đã được sử dụng' });
      }
    }

    // Tạo user mới
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      studentId,
      dateOfBirth
    });

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Đăng ký thành công',
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Lỗi server khi đăng ký' });
  }
};

// Đăng nhập
const loginUser = async (req, res) => {
  try {
  const { identifier, password, email } = req.body;

  const identifierInput = identifier ?? email;
  const trimmedIdentifier = identifierInput?.trim();

    if (!trimmedIdentifier) {
      return res.status(400).json({ message: 'Email hoặc tên đăng nhập là bắt buộc' });
    }

    let user;
    if (trimmedIdentifier.includes('@')) {
      user = await User.findOne({ email: trimmedIdentifier.toLowerCase() }).select('+password');
    } else {
      user = await User.findOne({ username: trimmedIdentifier }).select('+password');
    }
    if (!user) {
      return res.status(401).json({ message: 'Thông tin đăng nhập hoặc mật khẩu không đúng' });
    }

    // Kiểm tra tài khoản có bị vô hiệu hóa
    if (!user.isActive) {
      return res.status(401).json({ message: 'Tài khoản đã bị vô hiệu hóa. Liên hệ quản trị viên.' });
    }

    // Kiểm tra mật khẩu
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Thông tin đăng nhập hoặc mật khẩu không đúng' });
    }

    // Cập nhật thời gian đăng nhập cuối
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Lỗi server khi đăng nhập' });
  }
};

// Xem thông tin profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy thông tin profile' });
  }
};

// Cập nhật profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, dateOfBirth, studentId } = req.body;

    // Kiểm tra email trùng với user khác
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email đã được sử dụng bởi tài khoản khác' });
      }
    }

    // Kiểm tra số điện thoại trùng với user khác
    if (phoneNumber && phoneNumber !== req.user.phoneNumber) {
      const existingUser = await User.findOne({ phoneNumber, _id: { $ne: req.user._id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Số điện thoại đã được sử dụng bởi tài khoản khác' });
      }
    }

    // Cập nhật thông tin
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, email, phoneNumber, dateOfBirth, studentId },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Cập nhật profile thành công',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật profile' });
  }
};

// Đổi mật khẩu
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Lấy user với password
    const user = await User.findById(req.user._id).select('+password');

    // Kiểm tra mật khẩu hiện tại
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Lỗi server khi đổi mật khẩu' });
  }
};

// Quên mật khẩu - gửi email reset
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản với email này' });
    }

    // Kiểm tra tài khoản có bị vô hiệu hóa
    if (!user.isActive) {
      return res.status(400).json({ message: 'Tài khoản đã bị vô hiệu hóa. Liên hệ quản trị viên.' });
    }

    // Tạo reset token
    const resetToken = generateResetToken();
    const hashedToken = hashResetToken(resetToken);

    // Lưu token vào database
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 giờ
    await user.save();

    // Gửi email
    const emailResult = await sendPasswordResetEmail(user.email, resetToken);

    if (emailResult.success) {
      res.json({ message: 'Email reset mật khẩu đã được gửi thành công' });
    } else {
      // Xóa token nếu gửi email thất bại
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      res.status(500).json({
        message: 'Không thể gửi email reset mật khẩu',
        error: emailResult.message
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      message: 'Lỗi server khi reset mật khẩu',
      error: error.message
    });
  }
};

// Reset mật khẩu với token
const resetPassword = async (req, res) => {
  try {
    const { resetToken } = req.params;
    const { password } = req.body;

    // Hash token để so sánh
    const hashedToken = hashResetToken(resetToken);

    // Tìm user với token hợp lệ và chưa hết hạn
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    // Cập nhật mật khẩu mới và xóa token
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Reset mật khẩu thành công' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Lỗi server khi reset mật khẩu' });
  }
};

// Đăng xuất
const logoutUser = async (req, res) => {
  try {
    res.json({ message: 'Đăng xuất thành công' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Lỗi server khi đăng xuất' });
  }
};

// Upload avatar
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn file hình ảnh' });
    }

    // Get user from token
    const userId = req.user.id;

    // Create avatar URL
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Update user avatar in database
    const user = await User.findByIdAndUpdate(
      userId,
      { avatar: avatarUrl },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật avatar thành công',
      user: user,
      avatarUrl: avatarUrl
    });

  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      message: 'Lỗi server khi upload avatar',
      error: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  logoutUser,
  uploadAvatar
};

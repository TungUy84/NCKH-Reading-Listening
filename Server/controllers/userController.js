const User = require('../models/User');

// Lấy danh sách tất cả users (Chỉ admin)
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const role = req.query.role || '';
    const isActive = req.query.isActive;

    const skip = (page - 1) * limit;

    // Xây dựng query tìm kiếm
    let query = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const users = await User.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      message: 'Lấy danh sách người dùng thành công',
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách users' });
  }
};

// Lấy thống kê users (Chỉ admin)
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const regularUsers = await User.countDocuments({ role: 'user' });

    // Users đăng ký trong 30 ngày qua
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      message: 'Lấy thống kê người dùng thành công',
      statistics: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        adminUsers,
        regularUsers,
        newUsersLast30Days: newUsers
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy thống kê' });
  }
};

// Lấy thông tin user theo ID (Chỉ admin)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -resetPasswordToken -resetPasswordExpire');

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }

    res.json({ message: 'Lấy thông tin người dùng thành công', user });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID user không hợp lệ' });
    }
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy thông tin user' });
  }
};

// Tạo user mới (Chỉ admin)
const createUser = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      studentId,
      dateOfBirth,
      role = 'user'
    } = req.body;

    // Kiểm tra user đã tồn tại
    const existingUserEmail = await User.findOne({ email });
    if (existingUserEmail) {
      return res.status(400).json({ message: 'Email này đã được sử dụng' });
    }

    const existingUserUsername = await User.findOne({ username });
    if (existingUserUsername) {
      return res.status(400).json({ message: 'Tên đăng nhập đã được sử dụng' });
    }

    if (studentId) {
      const existingStudentId = await User.findOne({ studentId });
      if (existingStudentId) {
        return res.status(400).json({ message: 'Mã sinh viên đã tồn tại' });
      }
    }

    if (phoneNumber) {
      const existingPhoneNumber = await User.findOne({ phoneNumber });
      if (existingPhoneNumber) {
        return res.status(400).json({ message: 'Số điện thoại đã được sử dụng' });
      }
    }

    // Kiểm tra role hợp lệ
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role không hợp lệ' });
    }

    // Tạo user
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      studentId,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      role
    });

    res.status(201).json({
      message: 'Tạo user thành công',
      user
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Lỗi server khi tạo user' });
  }
};

// Cập nhật user (Chỉ admin)
const updateUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phoneNumber,
      studentId,
      dateOfBirth,
      avatar,
      role,
      isActive
    } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }

    // Ngăn admin vô hiệu hóa chính mình
    if (req.user.id === user._id.toString() && isActive === false) {
      return res.status(400).json({ message: 'Bạn không thể vô hiệu hóa tài khoản của chính mình' });
    }

    // Ngăn admin thay đổi role của chính mình thành user
    if (req.user.id === user._id.toString() && role === 'user') {
      return res.status(400).json({ message: 'Bạn không thể thay đổi role của chính mình' });
    }

    // Kiểm tra mã sinh viên đã tồn tại ở user khác
    if (studentId && studentId !== user.studentId) {
      const existingStudentId = await User.findOne({ studentId, _id: { $ne: user._id } });
      if (existingStudentId) {
        return res.status(400).json({ message: 'Mã sinh viên đã tồn tại' });
      }
    }

    // Kiểm tra số điện thoại đã tồn tại ở user khác
    if (phoneNumber && phoneNumber !== user.phoneNumber) {
      const existingPhoneNumber = await User.findOne({ phoneNumber, _id: { $ne: user._id } });
      if (existingPhoneNumber) {
        return res.status(400).json({ message: 'Số điện thoại đã được sử dụng' });
      }
    }

    // Kiểm tra role hợp lệ
    if (role && !['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role không hợp lệ' });
    }

    // Cập nhật các field
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (studentId !== undefined) user.studentId = studentId;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    if (avatar !== undefined) user.avatar = avatar;
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    const updatedUser = await user.save();

    res.json({
      message: 'Cập nhật user thành công',
      user: updatedUser
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID user không hợp lệ' });
    }
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật user' });
  }
};

// Xóa user (Chỉ admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }

    // Ngăn admin xóa chính mình
    if (req.user.id === user._id.toString()) {
      return res.status(400).json({ message: 'Bạn không thể xóa tài khoản của chính mình' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'Xóa user thành công' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID user không hợp lệ' });
    }
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa user' });
  }
};

module.exports = {
  getAllUsers,
  getUserStats,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};

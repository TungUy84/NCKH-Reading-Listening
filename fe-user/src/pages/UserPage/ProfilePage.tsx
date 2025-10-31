import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { updateProfile, uploadAvatar, changePassword } from '../../services/api';
import { getAvatarColor, getUserInitials, getUserDisplayName } from '../../utils/avatarUtils';
import {
  LockClosedIcon,
  KeyIcon,
  CheckBadgeIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

const ProfilePage: React.FC = () => {
  const { user, checkAuth } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
    studentId: user?.studentId || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '' // Convert to YYYY-MM-DD format
  });

  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  // Always keep reveal toggles rendered so users can show passwords without typing first
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        studentId: user.studentId || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : ''
      });
    }
  }, [user]);

  // Handle keyboard events for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showChangePasswordModal) {
        closePasswordModal();
      }
    };

    if (showChangePasswordModal) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showChangePasswordModal]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      toast.error('Tên đăng nhập không được để trống');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Email không được để trống');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Email không hợp lệ');
      return false;
    }
    if (!formData.firstName.trim()) {
      toast.error('Họ không được để trống');
      return false;
    }
    if (!formData.lastName.trim()) {
      toast.error('Tên không được để trống');
      return false;
    }
    if (formData.phoneNumber && !/^\d{10,11}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      toast.error('Số điện thoại không hợp lệ (10-11 chữ số)');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Only send fields that can be updated, filter out empty strings
      const updateData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim() || undefined,
        studentId: formData.studentId.trim() || undefined,
        dateOfBirth: formData.dateOfBirth || undefined
      };

      await updateProfile(updateData);
      toast.success('Cập nhật thông tin thành công!');
      setIsEditing(false);

      // Refresh user data
      await checkAuth();

    } catch (error: any) {
      console.error('Update profile error:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        studentId: user.studentId || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : ''
      });
    }
    setIsEditing(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 5MB');
      return;
    }

    setIsUploadingAvatar(true);

    try {
      await uploadAvatar(file);
      toast.success('Cập nhật avatar thành công!');

      // Refresh user data to get new avatar
      await checkAuth();

    } catch (error: any) {
      console.error('Upload avatar error:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Có lỗi xảy ra khi tải lên avatar. Vui lòng thử lại.');
      }
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePasswordForm = () => {
    if (!passwordFormData.currentPassword) {
      toast.error('Vui lòng nhập mật khẩu hiện tại');
      return false;
    }
    if (!passwordFormData.newPassword) {
      toast.error('Vui lòng nhập mật khẩu mới');
      return false;
    }
    if (passwordFormData.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordFormData.newPassword)) {
      toast.error('Mật khẩu mới phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số');
      return false;
    }
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return false;
    }
    if (passwordFormData.currentPassword === passwordFormData.newPassword) {
      toast.error('Mật khẩu mới phải khác mật khẩu hiện tại');
      return false;
    }
    return true;
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;

    setIsChangingPassword(true);

    try {
      await changePassword({
        currentPassword: passwordFormData.currentPassword,
        newPassword: passwordFormData.newPassword
      });

      toast.success('Đổi mật khẩu thành công!');
      setPasswordFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setTimeout(() => {
        setShowChangePasswordModal(false);
      }, 1000);

    } catch (error: any) {
      console.error('Change password error:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 400) {
        toast.error('Mật khẩu hiện tại không đúng');
      } else {
        toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const closePasswordModal = () => {
    setShowChangePasswordModal(false);
    setPasswordFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  if (!user) {
    return (
      <div className="section-container py-20 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Vui lòng đăng nhập</h1>
        <p className="text-gray-600 mb-8">Bạn cần đăng nhập để xem thông tin cá nhân.</p>
        <a href="/login" className="btn-primary">Đăng nhập</a>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-white via-blue-50/70 to-white p-8 shadow-xl shadow-blue-100/60 md:p-12" data-aos="fade-up">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between" data-aos="fade-down">
            <div>
              {/* <p className="text-sm font-semibold uppercase tracking-wide text-blue-500">Tài khoản</p> */}
              <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
                Thông tin cá nhân
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowChangePasswordModal(true)}
                className="inline-flex items-center justify-center rounded-lg border border-transparent bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Đổi mật khẩu
              </button>
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center rounded-lg border border-transparent bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-blue-600 hover:to-indigo-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang lưu...
                      </>
                    ) : (
                      'Lưu thay đổi'
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center justify-center rounded-lg border border-transparent bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-blue-600 hover:to-indigo-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Chỉnh sửa
                </button>
              )}
            </div>
          </div>

          {/* Profile Avatar Section */}
          <div className="mb-10 text-center" data-aos="fade-up" data-aos-delay="100">
            <div className="relative inline-block group">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full object-cover mx-auto cursor-pointer transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl border-4 border-white shadow-lg"
                  onClick={handleAvatarClick}
                />
              ) : (
                <div
                  className={`w-32 h-32 ${getAvatarColor(getUserDisplayName(user))} rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto cursor-pointer transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl border-4 border-white shadow-lg`}
                  onClick={handleAvatarClick}
                >
                  {getUserInitials(user)}
                </div>
              )}

              {/* Camera icon overlay with improved styling */}
              <button
                onClick={handleAvatarClick}
                disabled={isUploadingAvatar}
                className="absolute bottom-1 right-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full p-3 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-110 shadow-lg"
                title="Thay đổi avatar"
              >
                {isUploadingAvatar ? (
                  <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                )}
              </button>
            </div>
            {/* <p className="mt-4 text-gray-600 text-sm">📷 Click vào ảnh để thay đổi avatar</p> */}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />

            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              {getUserDisplayName(user)}
            </h2>
            <p className="text-gray-600 text-lg">{user.email}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div className="space-y-6" data-aos="fade-right" data-aos-delay="200">
              <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-blue-500 pb-3 flex items-center">
                <span className="mr-2">👤</span>
                Thông tin cơ bản
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên đăng nhập
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm bg-white shadow-sm hover:shadow-md"
                      placeholder="Nhập tên đăng nhập"
                    />
                  ) : (
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-l-4 border-blue-500 shadow-sm">
                      <span className="font-medium">{user.username}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📧 Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm bg-white shadow-sm hover:shadow-md"
                      placeholder="Nhập địa chỉ email"
                    />
                  ) : (
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-l-4 border-green-500 shadow-sm">
                      <span className="font-medium">{user.email}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      👤 Họ
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm bg-white shadow-sm hover:shadow-md"
                        placeholder="Nhập họ"
                      />
                    ) : (
                      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-l-4 border-purple-500 shadow-sm">
                        <span className="font-medium">{user.firstName || '-'}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      👤 Tên
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm bg-white shadow-sm hover:shadow-md"
                        placeholder="Nhập tên"
                      />
                    ) : (
                      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-l-4 border-purple-500 shadow-sm">
                        <span className="font-medium">{user.lastName || '-'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-6" data-aos="fade-left" data-aos-delay="300">
              <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-green-500 pb-3 flex items-center">
                <span className="mr-2">📋</span>
                Thông tin bổ sung
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📱 Số điện thoại
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm bg-white shadow-sm hover:shadow-md"
                      placeholder="Nhập số điện thoại"
                    />
                  ) : (
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-l-4 border-orange-500 shadow-sm">
                      <span className="font-medium">{user.phoneNumber || 'Chưa cập nhật'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🎓 Mã số sinh viên
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm bg-white shadow-sm hover:shadow-md"
                      placeholder="Nhập mã số sinh viên"
                    />
                  ) : (
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-l-4 border-indigo-500 shadow-sm">
                      <span className="font-medium">{user.studentId || 'Chưa cập nhật'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📅 Ngày sinh
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm bg-white shadow-sm hover:shadow-md"
                    />
                  ) : (
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-l-4 border-pink-500 shadow-sm">
                      <span className="font-medium">{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Account Statistics */}
          <div className="mt-10 pt-8 border-t-2 border-gray-200" data-aos="fade-up" data-aos-delay="400">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="mr-2">📊</span>
              Thống kê tài khoản
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl text-center shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105" data-aos="zoom-in" data-aos-delay="500">
                <div className="text-3xl font-bold text-blue-600 mb-2">📝 0</div>
                <div className="text-sm font-medium text-gray-700">Bài kiểm tra đã làm</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl text-center shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105" data-aos="zoom-in" data-aos-delay="600">
                <div className="text-3xl font-bold text-green-600 mb-2">⭐ 0</div>
                <div className="text-sm font-medium text-gray-700">Điểm trung bình</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl text-center shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105" data-aos="zoom-in" data-aos-delay="700">
                <div className="text-3xl font-bold text-purple-600 mb-2">🏆 -</div>
                <div className="text-sm font-medium text-gray-700">Cấp độ hiện tại</div>
              </div>
            </div>
          </div>

          {/* Note about editing */}
          {/* {!isEditing && (
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200" data-aos="fade-up" data-aos-delay="800">
              <div className="flex items-start">
                <div className="text-2xl mr-3">💡</div>
                <div>
                  <h3 className="font-bold text-blue-900 mb-2">Hướng dẫn sử dụng</h3>
                  <p className="text-sm text-blue-800">
                    Nhấn nút <strong>"✏️ Chỉnh sửa"</strong> để cập nhật thông tin cá nhân của bạn.
                    Tất cả các thông tin sẽ được lưu trữ an toàn trong hệ thống và được bảo mật tối đa.
                  </p>
                </div>
              </div>
            </div>
          )} */}

          {isEditing && (
            <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200" data-aos="fade-up" data-aos-delay="200">
              <div className="flex items-start">
                <div className="text-2xl mr-3">⚠️</div>
                <div>
                  <h3 className="font-bold text-orange-900 mb-2">Chế độ chỉnh sửa</h3>
                  <p className="text-sm text-orange-800">
                    Vui lòng kiểm tra kỹ thông tin trước khi lưu.
                    Nhấn <strong>"❌ Hủy"</strong> để quay lại chế độ xem hoặc <strong>"💾 Lưu thay đổi"</strong> để cập nhật.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm overflow-y-auto z-50 flex items-center justify-center p-4"
          onClick={closePasswordModal}
        >
          <div
            className="relative w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
            data-aos="zoom-in"
          >
            <div className="rounded-3xl bg-white shadow-2xl ring-1 ring-slate-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 via-indigo-400 to-purple-500 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="mt-2 text-2xl font-semibold text-white">Đổi mật khẩu</h3>
                  </div>
                  <button
                    onClick={closePasswordModal}
                    className="text-indigo-50 hover:text-white/80 transition-colors"
                    aria-label="Đóng"
                  >
                    <XMarkIcon className="w-6 h-6" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="px-8 py-8 space-y-7 bg-gradient-to-b from-white via-white to-indigo-50/30">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Mật khẩu hiện tại</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                        <LockClosedIcon className="w-4 h-4" aria-hidden="true" />
                      </span>
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordFormData.currentPassword}
                        onChange={handlePasswordInputChange}
                        className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-12 py-3 text-sm font-medium text-slate-700 shadow-sm transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(prev => !prev)}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition hover:text-indigo-500"
                        aria-label={showCurrentPassword ? 'Ẩn mật khẩu hiện tại' : 'Hiển thị mật khẩu hiện tại'}
                      >
                        {showCurrentPassword ? (
                          <EyeSlashIcon className="w-5 h-5" aria-hidden="true" />
                        ) : (
                          <EyeIcon className="w-5 h-5" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Mật khẩu mới</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                          <KeyIcon className="w-4 h-4" aria-hidden="true" />
                        </span>
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          name="newPassword"
                          value={passwordFormData.newPassword}
                          onChange={handlePasswordInputChange}
                          className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-12 py-3 text-sm font-medium text-slate-700 shadow-sm transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                          placeholder="Tạo mật khẩu mới"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(prev => !prev)}
                          className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition hover:text-indigo-500"
                          aria-label={showNewPassword ? 'Ẩn mật khẩu mới' : 'Hiển thị mật khẩu mới'}
                        >
                          {showNewPassword ? (
                            <EyeSlashIcon className="w-5 h-5" aria-hidden="true" />
                          ) : (
                            <EyeIcon className="w-5 h-5" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Xác nhận mật khẩu</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                          <CheckBadgeIcon className="w-4 h-4" aria-hidden="true" />
                        </span>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={passwordFormData.confirmPassword}
                          onChange={handlePasswordInputChange}
                          className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-12 py-3 text-sm font-medium text-slate-700 shadow-sm transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                          placeholder="Nhập lại mật khẩu mới"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(prev => !prev)}
                          className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition hover:text-indigo-500"
                          aria-label={showConfirmPassword ? 'Ẩn xác nhận mật khẩu' : 'Hiển thị xác nhận mật khẩu'}
                        >
                          {showConfirmPassword ? (
                            <EyeSlashIcon className="w-5 h-5" aria-hidden="true" />
                          ) : (
                            <EyeIcon className="w-5 h-5" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-indigo-100 bg-white/70 p-5 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
                    <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
                    <span>Mật khẩu an toàn cần:</span>
                  </div>
                  <ul className="mt-3 grid gap-2 text-xs text-indigo-600 sm:grid-cols-2">
                    <li className="inline-flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                      Ít nhất 6 ký tự
                    </li>
                    <li className="inline-flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                      Có chữ hoa và chữ thường
                    </li>
                    <li className="inline-flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                      Ít nhất 1 chữ số (0-9)
                    </li>
                    <li className="inline-flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                      Tránh thông tin dễ đoán
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 bg-white px-8 py-6">
                <button
                  onClick={closePasswordModal}
                  className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-700"
                >
                  Hủy
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isChangingPassword ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang cập nhật...
                    </>
                  ) : (
                    <>
                      Đổi mật khẩu
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

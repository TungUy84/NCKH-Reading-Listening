import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import { useAuth } from '../../contexts/AuthContext';
import { updateProfile, uploadAvatar, changePassword } from '../../services/api';
import { getAvatarColor, getUserInitials, getUserDisplayName, getAvatarUrl } from '../../utils/avatarUtils';
import {
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    CalendarIcon,
    IdentificationIcon,
    CameraIcon,
    ShieldCheckIcon,
    CheckIcon,
    PencilSquareIcon,
    ArrowRightOnRectangleIcon,
    ClockIcon,
    KeyIcon
} from '@heroicons/react/24/outline';

const ProfilePage: React.FC = () => {
    const { user, checkAuth, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<'general' | 'security'>('general');
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form Data
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        studentId: '',
        dateOfBirth: ''
    });

    // Password Form Data
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file ảnh');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Kích thước ảnh không được quá 5MB');
            return;
        }

        setIsUploadingAvatar(true);
        try {
            await uploadAvatar(file);
            toast.success('Cập nhật ảnh đại diện thành công');
            await checkAuth();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Lỗi khi tải ảnh lên');
        } finally {
            setIsUploadingAvatar(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleUpdateProfile = async () => {
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            toast.error('Họ và tên không được để trống');
            return;
        }

        setIsLoading(true);
        try {
            await updateProfile({
                ...formData,
                phoneNumber: formData.phoneNumber || undefined,
                studentId: formData.studentId || undefined,
                dateOfBirth: formData.dateOfBirth || undefined
            });
            toast.success('Cập nhật thông tin thành công');
            setIsEditing(false);
            await checkAuth();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Lỗi khi cập nhật thông tin');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }

        setIsChangingPassword(true);
        try {
            await changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Đổi mật khẩu thành công');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Lỗi khi đổi mật khẩu');
        } finally {
            setIsChangingPassword(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50/50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8" data-aos="fade-up">
                    <h1 className="text-2xl font-bold text-gray-900">Cài đặt tài khoản</h1>
                    <p className="text-gray-500 mt-1">Quản lý thông tin cá nhân và bảo mật</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <div className="w-full lg:w-64 flex-shrink-0 space-y-2" data-aos="fade-right" data-aos-delay="100">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === 'general'
                                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200'
                                    : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
                                }`}
                        >
                            <UserIcon className="w-5 h-5" />
                            Thông tin chung
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === 'security'
                                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200'
                                    : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
                                }`}
                        >
                            <ShieldCheckIcon className="w-5 h-5" />
                            Bảo mật
                        </button>

                        <div className="pt-4 mt-4 border-t border-gray-200">
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                            >
                                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                Đăng xuất
                            </button>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1" data-aos="fade-left" data-aos-delay="200">
                        {activeTab === 'general' ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                {/* Cover & Avatar */}
                                <div className="relative h-32 bg-gradient-to-r from-blue-500 to-indigo-600">
                                    <div className="absolute -bottom-12 left-8">
                                        <div className="relative group">
                                            <div className="w-24 h-24 rounded-full ring-4 ring-white bg-white overflow-hidden cursor-pointer" onClick={handleAvatarClick}>
                                                {user.avatar ? (
                                                    <img src={getAvatarUrl(user.avatar)} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className={`w-full h-full ${getAvatarColor(getUserDisplayName(user))} flex items-center justify-center text-white text-3xl font-bold`}>
                                                        {getUserInitials(user)}
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={handleAvatarClick}
                                                disabled={isUploadingAvatar}
                                                className="absolute bottom-0 right-0 p-1.5 bg-gray-900 text-white rounded-full hover:bg-gray-700 transition-colors shadow-sm ring-2 ring-white"
                                            >
                                                {isUploadingAvatar ? <ClipLoader size={12} color="#fff" /> : <CameraIcon className="w-4 h-4" />}
                                            </button>
                                            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                        </div>
                                    </div>
                                    <div className="absolute top-4 right-4">
                                        {!isEditing ? (
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-colors text-sm font-medium"
                                            >
                                                <PencilSquareIcon className="w-4 h-4" />
                                                Chỉnh sửa
                                            </button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setIsEditing(false)}
                                                    className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-colors text-sm font-medium"
                                                >
                                                    Hủy
                                                </button>
                                                <button
                                                    onClick={handleUpdateProfile}
                                                    disabled={isLoading}
                                                    className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium shadow-sm"
                                                >
                                                    {isLoading ? <ClipLoader size={14} color="#2563EB" /> : <CheckIcon className="w-4 h-4" />}
                                                    Lưu
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-16 px-8 pb-8">
                                    <div className="mb-8">
                                        <h2 className="text-xl font-bold text-gray-900">{getUserDisplayName(user)}</h2>
                                        <p className="text-gray-500">{user.email}</p>
                                        <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {user.isAdmin ? 'Quản trị viên' : 'Người dùng'}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Họ</label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Tên</label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Email</label>
                                            <div className="relative">
                                                <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditing}
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Số điện thoại</label>
                                            <div className="relative">
                                                <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="tel"
                                                    name="phoneNumber"
                                                    value={formData.phoneNumber}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditing}
                                                    placeholder="Chưa cập nhật"
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Mã số sinh viên</label>
                                            <div className="relative">
                                                <IdentificationIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    name="studentId"
                                                    value={formData.studentId}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditing}
                                                    placeholder="Chưa cập nhật"
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Ngày sinh</label>
                                            <div className="relative">
                                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="date"
                                                    name="dateOfBirth"
                                                    value={formData.dateOfBirth}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditing}
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <KeyIcon className="w-5 h-5 text-blue-600" />
                                        Đổi mật khẩu
                                    </h2>
                                    <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Mật khẩu hiện tại</label>
                                            <input
                                                type="password"
                                                name="currentPassword"
                                                value={passwordData.currentPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Mật khẩu mới</label>
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={passwordData.newPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                                placeholder="••••••••"
                                            />
                                            <p className="text-xs text-gray-500">Tối thiểu 6 ký tự</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={passwordData.confirmPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div className="pt-2">
                                            <button
                                                type="submit"
                                                disabled={isChangingPassword}
                                                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {isChangingPassword && <ClipLoader size={14} color="#fff" />}
                                                Cập nhật mật khẩu
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <ClockIcon className="w-5 h-5 text-gray-600" />
                                        Lịch sử đăng nhập
                                    </h2>
                                    <div className="text-sm text-gray-500 italic">
                                        Tính năng đang được phát triển...
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;

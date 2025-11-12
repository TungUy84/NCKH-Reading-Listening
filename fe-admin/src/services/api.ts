import axios from 'axios';
import {
  PlacementTest,
  TestFormData,
  AdminUser,
  LoginCredentials,
  AuthResponse,
  DashboardStats,
  AdminApiResponse,
  UsersListResult,
  UserQueryParams,
  CreateUserInput,
  UpdateUserInput,
  UserStats,
  PlacementTestImportResponse,
  SectionMedia,
  Practice,
  PracticePayload,
  PracticeUpdatePayload,
  PracticeListResult,
  PracticeQueryParams,
  PracticeMediaBlock,
  PracticeImportPreview,
  Lesson,
  LessonPayload,
  LessonQueryParams,
  LessonListResult
} from '../types';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
export const ASSET_BASE_URL = API_BASE_URL.replace(/\/?api\/?$/, '');

// Tạo instance axios dùng chung với header mặc định
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Quản lý token đăng nhập admin
export const authUtils = {
  setToken: (token: string) => {
    localStorage.setItem('adminToken', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  getToken: (): string | null => {
    return localStorage.getItem('adminToken');
  },

  removeToken: () => {
    localStorage.removeItem('adminToken');
    delete api.defaults.headers.common['Authorization'];
  },

  initToken: () => {
    const token = authUtils.getToken();
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }
};

// Thêm token vào mọi request nếu có
api.interceptors.request.use(
  (config) => {
    const token = authUtils.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý lỗi chung và tự động đăng xuất khi 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authUtils.removeToken();
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// API xác thực admin
export class AuthAPI {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', credentials);
      const authData = response.data;

      // Ghi nhớ token cho những request sau
      authUtils.setToken(authData.token);

      return authData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authUtils.removeToken();
    }
  }

  static async getCurrentUser(): Promise<AdminUser> {
    try {
      const response = await api.get('/auth/profile');
      return response.data.user;
    } catch (error) {
      console.error('Get current user error:', error);
      throw new Error('Không thể lấy thông tin người dùng');
    }
  }
}

// API thống kê dashboard
export class DashboardAPI {
  static async getStats(): Promise<DashboardStats> {
    try {
      const response = await api.get('/placement-tests/stats');
      return response.data.stats;
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw new Error('Không thể tải thống kê dashboard');
    }
  }
}

// API quản lý bài kiểm tra đầu vào
export class TestsAPI {
  // Lấy toàn bộ bài kiểm tra (dùng nội bộ)
  static async getAll(): Promise<PlacementTest[]> {
    try {
      const response = await api.get('/placement-tests', { params: { scope: 'admin' } });
      return response.data.tests;
    } catch (error) {
      console.error('Get all tests error:', error);
      throw new Error('Không thể tải danh sách bài test');
    }
  }

  // Cập nhật nhanh bài kiểm tra
  static async update(testId: string, updateData: Partial<PlacementTest>): Promise<PlacementTest> {
    try {
      const response = await api.put(`/placement-tests/${testId}`, updateData);
      return response.data.test;
    } catch (error) {
      console.error('Update test error:', error);
      throw new Error('Không thể cập nhật bài test');
    }
  }

  // Xóa bài kiểm tra nhanh
  static async delete(testId: string): Promise<void> {
    try {
      await api.delete(`/placement-tests/${testId}`);
    } catch (error) {
      console.error('Delete test error:', error);
      throw new Error('Không thể xóa bài test');
    }
  }

  // Lấy danh sách bài kiểm tra có phân trang
  static async getTests(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    isActive?: boolean;
  }): Promise<AdminApiResponse<PlacementTest[]>> {
    try {
      const response = await api.get('/placement-tests', { params: { scope: 'admin', ...params } });
      return {
        success: true,
        data: response.data.tests,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Get tests error:', error);
      throw new Error('Không thể tải danh sách bài test');
    }
  }

  // Lấy chi tiết bài kiểm tra (kèm đáp án)
  static async getTest(testId: string): Promise<PlacementTest> {
    try {
      const response = await api.get(`/placement-tests/${testId}/details`);
      return response.data.test;
    } catch (error) {
      console.error('Get test error:', error);
      throw new Error('Không thể tải chi tiết bài test');
    }
  }

  // Tạo mới bài kiểm tra
  static async createTest(testData: TestFormData): Promise<PlacementTest> {
    try {
      const response = await api.post('/placement-tests', testData);
      return response.data.test;
    } catch (error) {
      console.error('Create test error:', error);
      throw new Error('Không thể tạo bài test mới');
    }
  }

  // Cập nhật bài kiểm tra hiện có
  static async updateTest(testId: string, testData: Partial<TestFormData>): Promise<PlacementTest> {
    try {
      const response = await api.put(`/placement-tests/${testId}`, testData);
      return response.data.test;
    } catch (error) {
      console.error('Update test error:', error);
      throw new Error('Không thể cập nhật bài test');
    }
  }

  // Xóa bài kiểm tra
  static async deleteTest(testId: string): Promise<void> {
    try {
      await api.delete(`/placement-tests/${testId}`);
    } catch (error) {
      console.error('Delete test error:', error);
      throw new Error('Không thể xóa bài test');
    }
  }

  // Xóa nhiều bài kiểm tra cùng lúc
  static async bulkDelete(testIds: string[]): Promise<void> {
    try {
      await api.post('/placement-tests/bulk-delete', { testIds });
    } catch (error) {
      console.error('Bulk delete error:', error);
      throw new Error('Không thể xóa các bài test đã chọn');
    }
  }

  // Cập nhật trạng thái hàng loạt
  static async bulkUpdateStatus(testIds: string[], isActive: boolean): Promise<void> {
    try {
      await api.post('/placement-tests/bulk-update-status', { testIds, isActive });
    } catch (error) {
      console.error('Bulk update status error:', error);
      throw new Error('Không thể cập nhật trạng thái các bài test');
    }
  }
}

// API upload tệp
export class FileAPI {
  static async uploadFile(file: File, type: 'audio' | 'image'): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.url;
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error('Không thể upload file');
    }
  }

  // Upload file Word để import bài kiểm tra
  static async uploadTestFile(formData: FormData): Promise<PlacementTestImportResponse> {
    try {
      const response = await api.post('/placement-tests/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // Giới hạn 1 phút xử lý file
      });

      return response.data;
    } catch (error) {
      console.error('Test file upload error:', error);
      throw new Error('Không thể xử lý file. Vui lòng kiểm tra định dạng (Word/PDF/Excel) và thử lại.');
    }
  }
}

// API bài kiểm tra đầu vào nâng cao
export class PlacementTestAPI {
  // Lấy danh sách bài kiểm tra (có lọc)
  static async getTests(params: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    status?: 'active' | 'inactive';
  } = {}): Promise<AdminApiResponse<PlacementTest[]>> {
    try {
      const queryParams: Record<string, any> = { scope: 'admin' };
      if (params.page !== undefined) queryParams.page = params.page;
      if (params.limit !== undefined) queryParams.limit = params.limit;
      if (params.category) queryParams.category = params.category;
      if (params.search) queryParams.search = params.search;
      if (params.status) queryParams.status = params.status;

      const response = await api.get('/placement-tests', { params: queryParams });
      return {
        success: true,
        data: response.data.tests || response.data.data || [],
        pagination: response.data.pagination,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Get tests error:', error);
      throw new Error('Không thể tải danh sách bài test');
    }
  }

  // Lấy bài kiểm tra theo id
  static async getTestById(testId: string): Promise<PlacementTest> {
    try {
      const response = await api.get(`/placement-tests/${testId}/details`);
      return response.data.test;
    } catch (error) {
      console.error('Get test error:', error);
      throw new Error('Không thể tải bài test');
    }
  }

  // Tạo bài kiểm tra mới
  static async createTest(testData: TestFormData): Promise<PlacementTest> {
    try {
      const response = await api.post('/placement-tests', testData);
      return response.data.test;
    } catch (error) {
      console.error('Create test error:', error);
      throw new Error('Không thể tạo bài test mới');
    }
  }

  // Cập nhật bài kiểm tra
  static async updateTest(testId: string, testData: TestFormData): Promise<PlacementTest> {
    try {
      const response = await api.put(`/placement-tests/${testId}`, testData);
      return response.data.test;
    } catch (error) {
      throw new Error('Không thể cập nhật bài test');
    }
  }

  // Cập nhật thông tin tổng quát bài kiểm tra
  static async updateTestInfo(testId: string, testData: any): Promise<PlacementTest> {
    try {
      const response = await api.put(`/placement-tests/${testId}`, testData);
      return response.data.test;
    } catch (error) {
      throw new Error('Không thể cập nhật bài test');
    }
  }

  // Xóa bài kiểm tra
  static async deleteTest(testId: string): Promise<void> {
    try {
      await api.delete(`/placement-tests/${testId}`);
    } catch (error) {
      console.error('Delete test error:', error);
      throw new Error('Không thể xóa bài test');
    }
  }

  // Lấy thống kê dashboard
  static async getStats(): Promise<DashboardStats> {
    try {
      const response = await api.get('/placement-tests/stats');
      return response.data.stats;
    } catch (error) {
      console.error('Get stats error:', error);
      throw new Error('Không thể tải thống kê');
    }
  }

  // Xóa hàng loạt bài kiểm tra
  static async bulkDelete(testIds: string[]): Promise<void> {
    try {
      await api.post('/placement-tests/bulk-delete', { testIds });
    } catch (error) {
      console.error('Bulk delete error:', error);
      throw new Error('Không thể xóa các bài test đã chọn');
    }
  }

  // Bật tắt trạng thái hàng loạt
  static async bulkUpdateStatus(testIds: string[], isActive: boolean): Promise<void> {
    try {
      await api.post('/placement-tests/bulk-update-status', { testIds, isActive });
    } catch (error) {
      console.error('Bulk update status error:', error);
      throw new Error('Không thể cập nhật trạng thái các bài test');
    }
  }

  // Upload media cho section
  static async uploadSectionMedia(files: File[]): Promise<SectionMedia[]> {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));

      const response = await api.post('/placement-tests/media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.files;
    } catch (error) {
      console.error('Upload media error:', error);
      throw new Error('Không thể upload file media');
    }
  }

  // Cập nhật toàn bộ nội dung bài kiểm tra
  static async updateTestContent(testId: string, data: Partial<PlacementTest>): Promise<PlacementTest> {
    try {
      const response = await api.put(`/placement-tests/${testId}/content`, data);
      return response.data.test;
    } catch (error) {
      throw new Error('Không thể cập nhật nội dung bài test');
    }
  }
}

// API quản lý bài ôn luyện
export class PracticeAPI {
  // Lấy danh sách bài ôn luyện (admin)
  static async getPractices(params: PracticeQueryParams = {}): Promise<PracticeListResult> {
    try {
      const queryParams: Record<string, any> = {
        scope: 'admin',
      };

      if (params.page !== undefined) queryParams.page = params.page;
      if (params.limit !== undefined) queryParams.limit = params.limit;
      if (params.skill) queryParams.skill = params.skill;
      if (params.levelGroup) queryParams.levelGroup = params.levelGroup;
      if (params.keyword) queryParams.keyword = params.keyword;
      if (params.status === 'active') queryParams.isActive = 'true';
      if (params.status === 'inactive') queryParams.isActive = 'false';

      const response = await api.get('/practices', { params: queryParams });
      const payload = response.data?.data || {};
      const pagination = payload.pagination || {};

      return {
        items: payload.items || [],
        pagination: {
          page: pagination.page || queryParams.page || 1,
          limit: pagination.limit || queryParams.limit || 10,
          total: pagination.total || (payload.items ? payload.items.length : 0),
          totalPages: pagination.totalPages || 1,
        },
      };
    } catch (error) {
  console.error('Get practices error:', error);
  throw new Error('Không thể tải danh sách bài ôn luyện');
    }
  }

  // Lấy chi tiết bài ôn luyện (admin)
  static async getPractice(practiceId: string): Promise<Practice> {
    try {
      const response = await api.get(`/practices/${practiceId}/details`);
      return response.data.practice;
    } catch (error) {
  console.error('Get practice detail error:', error);
  throw new Error('Không thể tải chi tiết bài ôn luyện');
    }
  }

  // Tạo bài ôn luyện mới
  static async createPractice(payload: PracticePayload): Promise<Practice> {
    try {
      const response = await api.post('/practices', payload);
      return response.data.practice;
    } catch (error) {
  console.error('Create practice error:', error);
  throw new Error('Không thể tạo bài ôn luyện mới');
    }
  }

  // Cập nhật bài ôn luyện
  static async updatePractice(practiceId: string, payload: PracticeUpdatePayload): Promise<Practice> {
    try {
      const response = await api.put(`/practices/${practiceId}`, payload);
      return response.data.practice;
    } catch (error) {
  console.error('Update practice error:', error);
  throw new Error('Không thể cập nhật bài ôn luyện');
    }
  }

  // Cập nhật nội dung bài ôn luyện
  static async updatePracticeContent(practiceId: string, payload: Partial<Practice>): Promise<Practice> {
    try {
      const response = await api.put(`/practices/${practiceId}/content`, payload);
      return response.data.practice;
    } catch (error) {
      console.error('Update practice content error:', error);
      throw new Error('Không thể cập nhật nội dung bài ôn luyện');
    }
  }

  // Upload media cho section bài ôn luyện
  static async uploadPracticeMedia(files: File[]): Promise<PracticeMediaBlock[]> {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));

      const response = await api.post('/practices/media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.files || [];
    } catch (error) {
      console.error('Upload practice media error:', error);
      throw new Error('Không thể tải media cho bài ôn luyện');
    }
  }

  // Import bài ôn luyện từ file Word/PDF/Excel
  static async importPracticeFile(formData: FormData): Promise<PracticeImportPreview> {
    try {
      const response = await api.post('/practices/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      });

      return response.data.previewPractice;
    } catch (error) {
      console.error('Import practice file error:', error);
      throw new Error('Không thể xử lý file. Vui lòng kiểm tra định dạng (Word/PDF/Excel) và thử lại.');
    }
  }

  // Xóa bài ôn luyện
  static async deletePractice(practiceId: string): Promise<void> {
    try {
      await api.delete(`/practices/${practiceId}`);
    } catch (error) {
      console.error('Delete practice error:', error);
      throw new Error('Không thể xóa bài ôn luyện');
    }
  }
}

// API quản lý bài học lý thuyết
export class LessonAPI {
  // Lấy danh sách bài học cho admin (kèm phân trang và bộ lọc)
  static async getLessons(params: LessonQueryParams = {}): Promise<LessonListResult> {
    try {
      const queryParams: Record<string, any> = {};

      if (params.page !== undefined) queryParams.page = params.page;
      if (params.limit !== undefined) queryParams.limit = params.limit;
      if (params.keyword) queryParams.keyword = params.keyword;
      if (params.skill) queryParams.skill = params.skill;
      if (params.levelGroup) queryParams.levelGroup = params.levelGroup;
      if (params.status) queryParams.status = params.status;

      const response = await api.get('/lessons/admin', { params: queryParams });
      const payload = response.data?.data || {};
      const pagination = payload.pagination || {};

      return {
        items: payload.items || [],
        pagination: {
          page: pagination.page || Number(queryParams.page) || 1,
          limit: pagination.limit || Number(queryParams.limit) || 10,
          total: pagination.total || 0,
          totalPages: pagination.totalPages || 1
        }
      };
    } catch (error) {
      console.error('Get lessons error:', error);
      throw new Error('Không thể tải danh sách bài học');
    }
  }

  // Lấy chi tiết bài học phục vụ chỉnh sửa
  static async getLesson(lessonId: string): Promise<Lesson> {
    try {
  const response = await api.get(`/lessons/admin/${lessonId}`);
      return response.data.lesson;
    } catch (error) {
      console.error('Get lesson detail error:', error);
      throw new Error('Không thể tải chi tiết bài học');
    }
  }

  // Tạo mới bài học
  static async createLesson(payload: LessonPayload): Promise<Lesson> {
    try {
  const response = await api.post('/lessons/admin', payload);
      return response.data.lesson;
    } catch (error) {
      console.error('Create lesson error:', error);
      throw new Error('Không thể tạo bài học mới');
    }
  }

  // Cập nhật bài học hiện có
  static async updateLesson(lessonId: string, payload: Partial<LessonPayload>): Promise<Lesson> {
    try {
  const response = await api.put(`/lessons/admin/${lessonId}`, payload);
      return response.data.lesson;
    } catch (error) {
      console.error('Update lesson error:', error);
      throw new Error('Không thể cập nhật bài học');
    }
  }

  // Xóa bài học khỏi hệ thống
  static async deleteLesson(lessonId: string): Promise<void> {
    try {
  await api.delete(`/lessons/admin/${lessonId}`);
    } catch (error) {
      console.error('Delete lesson error:', error);
      throw new Error('Không thể xóa bài học');
    }
  }
}

// API quản lý người dùng
export class UsersAPI {
  static async getUsers(params: UserQueryParams = {}): Promise<UsersListResult> {
    try {
      // Làm sạch tham số để tránh gửi chuỗi rỗng
      const cleaned: Record<string, any> = {};
      if (params.page !== undefined) cleaned.page = params.page;
      if (params.limit !== undefined) cleaned.limit = params.limit;
      if (params.search) cleaned.search = params.search;
      if (params.role) cleaned.role = params.role;
      if (params.isActive !== '' && params.isActive !== undefined) cleaned.isActive = params.isActive;

      const response = await api.get('/users', { params: cleaned });
      return {
        users: response.data.users || [],
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error('Get users error:', error);
      throw new Error('Không thể tải danh sách người dùng');
    }
  }

  // Lấy thông tin người dùng theo ID
  static async getUserById(userId: string): Promise<AdminUser> {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data.user;
    } catch (error) {
      console.error('Get user error:', error);
      throw new Error('Không thể tải thông tin người dùng');
    }
  }

  // Tạo người dùng mới
  static async createUser(data: CreateUserInput): Promise<AdminUser> {
    try {
      const response = await api.post('/users', data);
      return response.data.user;
    } catch (error: any) {
      console.error('Create user error:', error);
      const res = error?.response?.data;
      let msg = res?.message || 'Không thể tạo người dùng';
      if (res?.errors && Array.isArray(res.errors)) {
        const details = res.errors.map((e: any) => e.msg || e.message).filter(Boolean).join('; ');
        if (details) msg = `${msg}: ${details}`;
      }
      throw new Error(msg);
    }
  }

  // Cập nhật người dùng
  static async updateUser(userId: string, data: UpdateUserInput): Promise<AdminUser> {
    try {
      const response = await api.put(`/users/${userId}`, data);
      return response.data.user;
    } catch (error) {
      console.error('Update user error:', error);
      throw new Error('Không thể cập nhật người dùng');
    }
  }

  static async deleteUser(userId: string): Promise<void> {
    try {
      await api.delete(`/users/${userId}`);
    } catch (error) {
      console.error('Delete user error:', error);
      throw new Error('Không thể xóa người dùng');
    }
  }

  // Bật/tắt trạng thái người dùng
  static async toggleUserStatus(userId: string, nextStatus: boolean): Promise<AdminUser> {
    try {
      const response = await api.put(`/users/${userId}`, { isActive: nextStatus });
      return response.data.user;
    } catch (error: any) {
      console.error('Toggle user status error:', error);
      const msg = error?.response?.data?.message || 'Không thể thay đổi trạng thái người dùng';
      throw new Error(msg);
    }
  }

  // Cập nhật quyền người dùng
  static async updateUserRole(userId: string, role: 'admin' | 'user'): Promise<AdminUser> {
    try {
      const response = await api.put(`/users/${userId}`, { role });
      return response.data.user;
    } catch (error: any) {
      console.error('Update user role error:', error);
      const msg = error?.response?.data?.message || 'Không thể cập nhật quyền người dùng';
      throw new Error(msg);
    }
  }

  static async getStats(): Promise<UserStats['statistics']> {
    try {
      const response = await api.get('/users/stats');
      return response.data.statistics;
    } catch (error) {
      console.error('Get user stats error:', error);
      throw new Error('Không thể tải thống kê người dùng');
    }
  }
}
// Các hàm để import
export const getUsers = UsersAPI.getUsers;
export const getUserById = UsersAPI.getUserById;
export const createUser = UsersAPI.createUser;
export const updateUser = UsersAPI.updateUser;
export const deleteUser = UsersAPI.deleteUser;
export const toggleUserStatus = UsersAPI.toggleUserStatus;
export const updateUserRole = UsersAPI.updateUserRole;
export const getUserStats = UsersAPI.getStats;

// Các hàm tiện ích để import nhanh
export const getPlacementTests = PlacementTestAPI.getTests;
export const getPlacementTestById = PlacementTestAPI.getTestById;
export const createPlacementTest = PlacementTestAPI.createTest;
export const updatePlacementTest = PlacementTestAPI.updateTestInfo;
export const updatePlacementTestContent = PlacementTestAPI.updateTestContent;
export const uploadSectionMediaFiles = PlacementTestAPI.uploadSectionMedia;
export const deletePlacementTest = PlacementTestAPI.deleteTest;
export const getTestStats = PlacementTestAPI.getStats;
export const uploadTestFile = FileAPI.uploadTestFile;
export const importPlacementTest = FileAPI.uploadTestFile;

// Nhóm xử lý lỗi API
export const adminApiUtils = {
  handleError: (error: any): string => {
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.message) {
      return error.message;
    }
    return 'Đã xảy ra lỗi không xác định';
  },

  formatResponse: <T>(response: any): AdminApiResponse<T> => {
    return {
      success: response.data?.success || true,
      data: response.data?.data || response.data,
      message: response.data?.message,
      pagination: response.data?.pagination,
    };
  },
};

// Khởi tạo token khi app load
authUtils.initToken();

export default api;

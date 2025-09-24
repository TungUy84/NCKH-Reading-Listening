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
  UserStats
} from '../types';

// Create axios instance with auth
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth token management
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

// Request interceptor to add auth token
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

// Response interceptor for error handling
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

// Authentication API
export class AuthAPI {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', credentials);
      const authData = response.data;
      
      // Set token for future requests
      authUtils.setToken(authData.token);
      
      return authData;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
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

// Dashboard API
export class DashboardAPI {
  static async getStats(): Promise<DashboardStats> {
    try {
      const response = await api.get('/placement-tests/admin/stats');
      return response.data.stats;
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw new Error('Không thể tải thống kê dashboard');
    }
  }
}

// Tests Management API
export class TestsAPI {
  // Get all tests (simplified method for TestsPage)
  static async getAll(): Promise<PlacementTest[]> {
    try {
      const response = await api.get('/placement-tests/admin');
      return response.data.tests;
    } catch (error) {
      console.error('Get all tests error:', error);
      throw new Error('Không thể tải danh sách bài test');
    }
  }

  // Update test (simplified method)
  static async update(testId: string, updateData: Partial<PlacementTest>): Promise<PlacementTest> {
    try {
      const response = await api.put(`/placement-tests/admin/${testId}`, updateData);
      return response.data.test;
    } catch (error) {
      console.error('Update test error:', error);
      throw new Error('Không thể cập nhật bài test');
    }
  }

  // Delete test (simplified method)
  static async delete(testId: string): Promise<void> {
    try {
      await api.delete(`/placement-tests/admin/${testId}`);
    } catch (error) {
      console.error('Delete test error:', error);
      throw new Error('Không thể xóa bài test');
    }
  }

  // Get all tests with pagination
  static async getTests(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    isActive?: boolean;
  }): Promise<AdminApiResponse<PlacementTest[]>> {
    try {
      const response = await api.get('/placement-tests/admin', { params });
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

  // Get single test with full details (including answers)
  static async getTest(testId: string): Promise<PlacementTest> {
    try {
      const response = await api.get(`/placement-tests/admin/${testId}`);
      return response.data.test;
    } catch (error) {
      console.error('Get test error:', error);
      throw new Error('Không thể tải chi tiết bài test');
    }
  }

  // Create new test
  static async createTest(testData: TestFormData): Promise<PlacementTest> {
    try {
      const response = await api.post('/placement-tests/admin', testData);
      return response.data.test;
    } catch (error) {
      console.error('Create test error:', error);
      throw new Error('Không thể tạo bài test mới');
    }
  }

  // Update existing test
  static async updateTest(testId: string, testData: Partial<TestFormData>): Promise<PlacementTest> {
    try {
      const response = await api.put(`/placement-tests/admin/${testId}`, testData);
      return response.data.test;
    } catch (error) {
      console.error('Update test error:', error);
      throw new Error('Không thể cập nhật bài test');
    }
  }

  // Delete test
  static async deleteTest(testId: string): Promise<void> {
    try {
      await api.delete(`/placement-tests/admin/${testId}`);
    } catch (error) {
      console.error('Delete test error:', error);
      throw new Error('Không thể xóa bài test');
    }
  }

  // Bulk operations
  static async bulkDelete(testIds: string[]): Promise<void> {
    try {
      await api.post('/placement-tests/admin/bulk-delete', { testIds });
    } catch (error) {
      console.error('Bulk delete error:', error);
      throw new Error('Không thể xóa các bài test đã chọn');
    }
  }

  static async bulkUpdateStatus(testIds: string[], isActive: boolean): Promise<void> {
    try {
      await api.post('/placement-tests/admin/bulk-update-status', { testIds, isActive });
    } catch (error) {
      console.error('Bulk update status error:', error);
      throw new Error('Không thể cập nhật trạng thái các bài test');
    }
  }
}

// File Upload API
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

  // Upload Word file for test import
  static async uploadTestFile(formData: FormData): Promise<any> {
    try {
      const response = await api.post('/placement-tests/admin/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 1 minute timeout for file processing
      });

      return response.data;
    } catch (error) {
      console.error('Test file upload error:', error);
      throw new Error('Không thể xử lý file Word. Vui lòng kiểm tra format và thử lại.');
    }
  }
}

// Placement Tests API - Updated with new functions
export class PlacementTestAPI {
  // Get all tests with pagination and filters
  static async getTests(params: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    status?: 'active' | 'inactive';
  } = {}): Promise<AdminApiResponse<PlacementTest[]>> {
    try {
      const queryString = adminApiUtils.buildQueryParams(params);
      const response = await api.get(`/placement-tests/admin?${queryString}`);
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

  // Get single test by ID
  static async getTestById(testId: string): Promise<PlacementTest> {
    try {
      const response = await api.get(`/placement-tests/admin/${testId}`);
      return response.data.test;
    } catch (error) {
      console.error('Get test error:', error);
      throw new Error('Không thể tải bài test');
    }
  }

  // Create new test
  static async createTest(testData: TestFormData): Promise<PlacementTest> {
    try {
      const response = await api.post('/placement-tests/admin', testData);
      return response.data.test;
    } catch (error) {
      console.error('Create test error:', error);
      throw new Error('Không thể tạo bài test mới');
    }
  }

  // Update test
  static async updateTest(testId: string, testData: TestFormData): Promise<PlacementTest> {
    try {
      const response = await api.put(`/placement-tests/admin/${testId}`, testData);
      return response.data.test;
    } catch (error) {
      console.error('Update test error:', error);
      throw new Error('Không thể cập nhật bài test');
    }
  }

  // Update test metadata only (without questions)
  static async updateTestInfo(testId: string, testData: any): Promise<PlacementTest> {
    try {
      const response = await api.put(`/placement-tests/admin/${testId}`, testData);
      return response.data.test;
    } catch (error) {
      console.error('Update test info error:', error);
      throw new Error('Không thể cập nhật bài test');
    }
  }

  // Delete test
  static async deleteTest(testId: string): Promise<void> {
    try {
      await api.delete(`/placement-tests/admin/${testId}`);
    } catch (error) {
      console.error('Delete test error:', error);
      throw new Error('Không thể xóa bài test');
    }
  }

  // Get dashboard stats
  static async getStats(): Promise<DashboardStats> {
    try {
      const response = await api.get('/placement-tests/admin/stats');
      return response.data.stats;
    } catch (error) {
      console.error('Get stats error:', error);
      throw new Error('Không thể tải thống kê');
    }
  }

  // Bulk operations
  static async bulkDelete(testIds: string[]): Promise<void> {
    try {
      await api.post('/placement-tests/admin/bulk-delete', { testIds });
    } catch (error) {
      console.error('Bulk delete error:', error);
      throw new Error('Không thể xóa các bài test đã chọn');
    }
  }

  static async bulkUpdateStatus(testIds: string[], isActive: boolean): Promise<void> {
    try {
      await api.post('/placement-tests/admin/bulk-update-status', { testIds, isActive });
    } catch (error) {
      console.error('Bulk update status error:', error);
      throw new Error('Không thể cập nhật trạng thái các bài test');
    }
  }

  // Upload media files (images, audio)
  static async uploadMedia(file: File, type: 'image' | 'audio'): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await api.post('/placement-tests/admin/upload-media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.url;
    } catch (error) {
      console.error('Upload media error:', error);
      throw new Error('Không thể upload file media');
    }
  }

  // Update full test content including sections and questions
  static async updateTestContent(testId: string, data: Partial<PlacementTest>): Promise<PlacementTest> {
    try {
      const response = await api.put(`/placement-tests/admin/${testId}/content`, data);
      return response.data.test;
    } catch (error) {
      console.error('Update test content error:', error);
      throw new Error('Không thể cập nhật nội dung bài test');
    }
  }
}

// Users Management API
export class UsersAPI {
  static async getUsers(params: UserQueryParams = {}): Promise<UsersListResult> {
    try {
      // Clean params to avoid sending empty string which backend treats as false
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

  static async getUserById(userId: string): Promise<AdminUser> {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data.user;
    } catch (error) {
      console.error('Get user error:', error);
      throw new Error('Không thể tải thông tin người dùng');
    }
  }

  static async createUser(data: CreateUserInput): Promise<AdminUser> {
    try {
      const response = await api.post('/users', data);
      return response.data.user;
    } catch (error: any) {
      console.error('Create user error:', error);
      const msg = error?.response?.data?.message || 'Không thể tạo người dùng';
      throw new Error(msg);
    }
  }

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

  static async toggleUserStatus(userId: string): Promise<AdminUser> {
    try {
      const response = await api.put(`/users/${userId}/toggle-status`);
      return response.data.user;
    } catch (error: any) {
      console.error('Toggle user status error:', error);
      const msg = error?.response?.data?.message || 'Không thể thay đổi trạng thái người dùng';
      throw new Error(msg);
    }
  }

  static async updateUserRole(userId: string, role: 'admin' | 'user'): Promise<AdminUser> {
    try {
      const response = await api.put(`/users/${userId}/role`, { role });
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

export const getUsers = UsersAPI.getUsers;
export const getUserById = UsersAPI.getUserById;
export const createUser = UsersAPI.createUser;
export const updateUser = UsersAPI.updateUser;
export const deleteUser = UsersAPI.deleteUser;
export const toggleUserStatus = UsersAPI.toggleUserStatus;
export const updateUserRole = UsersAPI.updateUserRole;
export const getUserStats = UsersAPI.getStats;

// Export convenient wrapper functions
export const getPlacementTests = PlacementTestAPI.getTests;
export const getPlacementTestById = PlacementTestAPI.getTestById;
export const createPlacementTest = PlacementTestAPI.createTest;
export const updatePlacementTest = PlacementTestAPI.updateTestInfo;
export const updatePlacementTestContent = PlacementTestAPI.updateTestContent;
export const uploadMediaFile = PlacementTestAPI.uploadMedia;
export const deletePlacementTest = PlacementTestAPI.deleteTest;
export const getTestStats = PlacementTestAPI.getStats;
export const uploadTestFile = FileAPI.uploadTestFile;
export const importPlacementTest = FileAPI.uploadTestFile;

// Utility functions
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

  buildQueryParams: (params: Record<string, any>): string => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    return searchParams.toString();
  },
};

// Initialize auth token on app start
authUtils.initToken();

export default api;

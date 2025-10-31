import axios from 'axios';

// Khởi tạo axios với cấu hình mặc định
const apiService = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động gắn token đăng nhập vào mọi request
apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Bắt lỗi response và xử lý các tình huống đặc biệt (vd: hết phiên)
apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Only handle 401 redirects for protected routes, not auth routes
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isAuthRoute = ['/login', '/register', '/forgot-password', '/reset-password'].includes(currentPath);
      
      if (!isAuthRoute) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// ========== NHÓM API CHO PLACEMENT TEST ==========
// Giữ nguyên đường dẫn giống backend

/**
 * Lấy danh sách bài test đang hoạt động (lọc theo category nếu cần)
 * Backend: GET /api/placement-tests?category=listening
 */
export const getActiveTests = async (category?: string) => {
  const params = category ? { category } : {};
  const response = await apiService.get('/placement-tests', { params });
  return response.data;
};

/**
 * Lấy chi tiết bài test để làm (không trả đáp án)
 * Backend: GET /api/placement-tests/:testId
 */
export const getTestForTaking = async (testId: string) => {
  const response = await apiService.get(`/placement-tests/${testId}`);
  return response.data;
};

/**
 * Lấy chi tiết bài test IELTS (giữ lại để tương thích component cũ)
 * Backend: GET /api/placement-tests/:testId
 */
export const getPlacementTestForTaking = async (testId: string) => {
  const response = await apiService.get(`/placement-tests/${testId}`);
  return response.data;
};

/**
 * Nộp bài test và nhận kết quả ngay
 * Backend: POST /api/placement-tests/:testId/submissions
 */
export const submitTest = async (submission: {
  testId: string;
  answers: Array<{
    questionId: string;
    selectedOptions?: string[];
    userAnswer?: string;
    matchingAnswers?: { prompt: string; selected: string }[];
  }>;
}) => {
  const { testId, answers } = submission;
  const response = await apiService.post(`/placement-tests/${testId}/submissions`, {
    testId,
    answers
  });
  return response.data;
};

/**
 * Nộp bài test IELTS
 * Backend: POST /api/placement-tests/:testId/submissions
 */
export const submitPlacementTest = async (testId: string, answers: Array<{
  questionNumber: number;
  selectedOptions?: string[];
  userAnswer?: string;
  matchingAnswers?: { prompt: string; selected: string }[];
}>) => {
  const response = await apiService.post(`/placement-tests/${testId}/submissions`, {
    testId,
    answers
  });
  return response.data;
};

// ========== NHÓM API AUTH ==========
// Đồng bộ với các route đăng nhập trên backend

/**
 * Đăng ký người dùng mới
 * Backend: POST /api/auth/register
 */
export const register = async (userData: {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  studentId?: string;
  dateOfBirth?: string;
}) => {
  const response = await apiService.post('/auth/register', userData);
  return response.data;
};

/**
 * Đăng nhập bằng email hoặc tên đăng nhập + mật khẩu
 * Backend: POST /api/auth/login
 */
export const login = async (credentials: {
  identifier: string;
  password: string;
}) => {
  const response = await apiService.post('/auth/login', credentials);
  return response.data;
};

/**
 * Đăng xuất khỏi hệ thống
 * Backend: POST /api/auth/logout
 */
export const logout = async () => {
  const response = await apiService.post('/auth/logout');
  return response.data;
};

/**
 * Lấy thông tin hồ sơ người dùng
 * Backend: GET /api/auth/profile
 */
export const getProfile = async () => {
  const response = await apiService.get('/auth/profile');
  return response.data;
};

/**
 * Cập nhật hồ sơ cá nhân
 * Backend: PUT /api/auth/profile
 */
export const updateProfile = async (profileData: {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  studentId?: string;
  dateOfBirth?: string;
}) => {
  const response = await apiService.put('/auth/profile', profileData);
  return response.data;
};

/**
 * Tải lên ảnh đại diện
 * Backend: POST /api/auth/avatar
 */
export const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  const response = await apiService.post('/auth/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Đổi mật khẩu
 * Backend: PUT /api/auth/change-password
 */
export const changePassword = async (passwordData: {
  currentPassword: string;
  newPassword: string;
}) => {
  const response = await apiService.put('/auth/change-password', passwordData);
  return response.data;
};

/**
 * Gửi yêu cầu đặt lại mật khẩu qua email
 * Backend: POST /api/auth/forgot-password
 */
export const forgotPassword = async (email: string) => {
  const response = await apiService.post('/auth/forgot-password', { email });
  return response.data;
};

/**
 * Đặt lại mật khẩu bằng token
 * Backend: PUT /api/auth/reset-password/:resetToken
 */
export const resetPassword = async (resetToken: string, newPassword: string) => {
  const response = await apiService.put(`/auth/reset-password/${resetToken}`, {
    password: newPassword,
  });
  return response.data;
};

// ========== HÀM TIỆN ÍCH ==========

/**
 * Kiểm tra token hiện tại còn hiệu lực hay không
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    // Basic token validation
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp > Date.now() / 1000;
  } catch {
    return false;
  }
};

/**
 * Lấy payload người dùng từ token JWT
 */
export const getCurrentUser = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
};

/**
 * Kiểm tra nhanh kết nối API
 */
export const testConnection = async () => {
  try {
    await apiService.get('/placement-tests');
    return true;
  } catch {
    return false;
  }
};

// Export the axios instance as default for direct use
export default apiService;

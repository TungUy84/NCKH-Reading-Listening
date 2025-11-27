import axios from 'axios';
import {
  PracticeSubmissionPayload,
  LessonSummary,
  LessonDetail,
  UserRoadmap,
  CreateUserRoadmapPayload,
  UpdateProgressPayload,
  SubmitCheckpointPayload,
  SuggestedLevelResponse,
  StageDetailResponse,
  RoadmapLevelGroup
} from '../types';

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
  // Thêm randomize=true cho placement test để shuffle câu hỏi
  const response = await apiService.get(`/placement-tests/${testId}?randomize=true`);
  return response.data;
};

/**
 * Lấy chi tiết bài test IELTS (giữ lại để tương thích component cũ)
 * Backend: GET /api/placement-tests/:testId
 */
export const getPlacementTestForTaking = async (testId: string) => {
  // Thêm randomize=true cho placement test để shuffle câu hỏi
  const response = await apiService.get(`/placement-tests/${testId}?randomize=true`);
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
 * Nộp bài test IELTS (LEGACY - không lưu kết quả)
 * Backend: POST /api/placement-tests/:testId/submissions
 */
export const checkPlacementTest = async (testId: string, answers: Array<{
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

// ========== NHÓM API CHO ÔN LUYỆN ==========

/**
 * Lấy danh sách bài ôn luyện công khai cho người học.
 * Backend: GET /api/practices
 */
export const getPublicPractices = async (params?: {
  skill?: 'reading' | 'listening';
  levelGroup?: string;
  keyword?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await apiService.get('/practices', { params });
  return response.data;
};

/**
 * Lấy chi tiết bài ôn luyện dành cho người học (không bao gồm đáp án).
 * Backend: GET /api/practices/:practiceId
 */
export const getPracticeForLearner = async (practiceId: string) => {
  const response = await apiService.get(`/practices/${practiceId}`);
  return response.data;
};

/**
 * Nộp bài ôn luyện và nhận lại kết quả chấm điểm.
 * Backend: POST /api/practices/:practiceId/submit
 */
export const submitPracticeAttempt = async (
  practiceId: string,
  payload: PracticeSubmissionPayload
) => {
  const response = await apiService.post(`/practices/${practiceId}/submit`, payload);
  return response.data;
};

/**
 * Lấy lịch sử làm bài của chính học viên cho một bài ôn luyện.
 * Backend: GET /api/practices/:practiceId/attempts/mine
 */
export const getMyPracticeAttempts = async (
  practiceId: string,
  params?: { page?: number; limit?: number }
) => {
  const response = await apiService.get(`/practices/${practiceId}/attempts/mine`, { params });
  return response.data;
};

/**
 * Lấy chi tiết một lần làm bài ôn luyện.
 * Backend: GET /api/practices/attempts/:attemptId
 */
export const getPracticeAttemptDetail = async (attemptId: string) => {
  const response = await apiService.get(`/practices/attempts/${attemptId}`);
  return response.data;
};

// ========== NHÓM API CHO BÀI HỌC ==========

/**
 * Lấy danh sách bài học công khai cho người học.
 * Backend: GET /api/lessons
 */
export const getPublicLessons = async (params?: {
  keyword?: string;
  skill?: 'reading' | 'listening';
  levelGroup?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await apiService.get('/lessons', { params });
  return response.data as {
    message: string;
    data: {
      items: LessonSummary[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
  };
};

/**
 * Lấy chi tiết một bài học đã xuất bản.
 * Backend: GET /api/lessons/:lessonId
 */
export const getLessonDetail = async (lessonId: string) => {
  const response = await apiService.get(`/lessons/${lessonId}`);
  return response.data as { message: string; lesson: LessonDetail };
};

// ========== NHÓM API CHO ROADMAP (LỘ TRÌNH HỌC TẬP) ==========

/**
 * Tạo lộ trình cá nhân cho user
 * Backend: POST /api/roadmap/user/create
 */
export const createUserRoadmap = async (payload: CreateUserRoadmapPayload) => {
  const response = await apiService.post('/roadmap/user/create', payload);
  return response.data as {
    success: boolean;
    message: string;
    data: UserRoadmap;
  };
};

/**
 * Lấy lộ trình hiện tại của user
 * Backend: GET /api/roadmap/user/current
 */
export const getCurrentUserRoadmap = async (): Promise<{
  success: boolean;
  hasRoadmap: boolean;
  message?: string;
  data?: UserRoadmap;
}> => {
  try {
    const response = await apiService.get('/roadmap/user/current');
    return response.data;
  } catch (error: any) {
    // Nếu 404 = chưa có roadmap, return hasRoadmap: false thay vì throw
    if (error.response?.status === 404) {
      return {
        success: false,
        hasRoadmap: false,
        message: error.response?.data?.message || 'Bạn chưa có lộ trình học tập',
        data: undefined
      };
    }
    // Các lỗi khác thì throw
    throw error;
  }
};

/**
 * Lấy chi tiết một stage cụ thể với full content
 * Backend: GET /api/roadmap/user/stage/:levelGroup
 */
export const getStageDetail = async (levelGroup: RoadmapLevelGroup) => {
  const response = await apiService.get(`/roadmap/user/stage/${levelGroup}`);
  return response.data as {
    success: boolean;
    data: StageDetailResponse;
  };
};

/**
 * Cập nhật progress khi user hoàn thành lesson/practice
 * Backend: POST /api/roadmap/user/progress
 */
export const updateRoadmapProgress = async (payload: UpdateProgressPayload) => {
  const response = await apiService.post('/roadmap/user/progress', payload);
  return response.data as {
    success: boolean;
    message: string;
    data: {
      stage: any;
      overallProgress: number;
    };
  };
};

/**
 * Đồng bộ content từ template (sau khi admin cập nhật roadmap)
 * Backend: POST /api/roadmap/user/sync-content
 */
export const syncRoadmapContent = async () => {
  const response = await apiService.post('/roadmap/user/sync-content');
  return response.data as {
    success: boolean;
    message: string;
    data: any;
  };
};

/**
 * Submit checkpoint test result và unlock stage tiếp theo
 * Backend: POST /api/roadmap/user/checkpoint
 */
export const submitCheckpoint = async (payload: SubmitCheckpointPayload) => {
  const response = await apiService.post('/roadmap/user/checkpoint', payload);
  return response.data as {
    success: boolean;
    passed: boolean;
    message: string;
    data: {
      currentStage: any;
      nextStage: any;
      score: number;
      passingScore: number;
      roadmapCompleted: boolean;
    };
  };
};

/**
 * Lấy gợi ý level dựa trên placement test gần nhất
 * Backend: GET /api/roadmap/user/suggested-level
 */
export const getSuggestedLevel = async () => {
  const response = await apiService.get('/roadmap/user/suggested-level');
  return response.data as SuggestedLevelResponse;
};

// ========== NEW APIs: PLACEMENT TEST RESULT (Submit và lưu kết quả) ==========

/**
 * Submit test và lưu kết quả vào database
 * Backend: POST /api/placement-tests/:testId/submit
 */
export const submitPlacementTest = async (testId: string, payload: {
  answers: Array<{
    questionId: string;
    selectedOptions?: string[];
    userAnswer?: string;
    matchingAnswers?: { prompt: string; selected: string }[];
  }>;
  durationSeconds?: number;
}) => {
  const response = await apiService.post(`/placement-tests/${testId}/submit`, payload);
  return response.data;
};

/**
 * Lấy chi tiết một lần làm bài
 * Backend: GET /api/placement-tests/attempts/:attemptId
 */
export const getTestAttemptDetail = async (attemptId: string) => {
  const response = await apiService.get(`/placement-tests/attempts/${attemptId}`);
  return response.data;
};

/**
 * Lấy lịch sử làm bài của user cho test cụ thể
 * Backend: GET /api/placement-tests/:testId/attempts/mine
 */
export const getMyTestHistory = async (testId: string, params?: any) => {
  const response = await apiService.get(`/placement-tests/${testId}/attempts/mine`, { params });
  return response.data;
};

/**
 * Lấy tất cả lịch sử làm bài của user (cross all tests)
 * Backend: GET /api/placement-tests/attempts/all
 */
export const getAllMyTestAttempts = async (params?: any) => {
  const response = await apiService.get('/placement-tests/attempts/all', { params });
  return response.data;
};

// ========== NHÓM API BLOG ==========

/**
 * Lấy danh sách blog đã được duyệt (public feed)
 * Backend: GET /api/blogs
 */
export const getBlogs = async (params?: { page?: number; limit?: number }) => {
  const response = await apiService.get('/blogs', { params });
  return response.data;
};

/**
 * Lấy danh sách blog của mình (tất cả trạng thái)
 * Backend: GET /api/blogs/my-posts
 */
export const getMyBlogs = async (params?: { page?: number; limit?: number }) => {
  const response = await apiService.get('/blogs/my-posts', { params });
  return response.data;
};

/**
 * Tải lên ảnh cho blog
 * Backend: POST /api/blogs/upload-images (multipart/form-data)
 */
export const uploadBlogImages = async (files: File[]) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });
  const response = await apiService.post('/blogs/upload-images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Tạo blog mới (status=pending)
 * Backend: POST /api/blogs
 */
export const createBlog = async (blogData: { title: string; content: string; images: string[] }) => {
  const response = await apiService.post('/blogs', blogData);
  return response.data;
};

/**
 * Cập nhật blog (chỉ pending/rejected, reset về pending)
 * Backend: PUT /api/blogs/:id
 */
export const updateBlog = async (blogId: string, blogData: { title?: string; content?: string; images?: string[] }) => {
  const response = await apiService.put(`/blogs/${blogId}`, blogData);
  return response.data;
};

/**
 * Xóa blog của mình
 * Backend: DELETE /api/blogs/:id
 */
export const deleteBlog = async (blogId: string) => {
  const response = await apiService.delete(`/blogs/${blogId}`);
  return response.data;
};

/**
 * Like/Unlike blog
 * Backend: POST /api/blogs/:id/like
 */
export const likeBlog = async (blogId: string) => {
  const response = await apiService.post(`/blogs/${blogId}/like`);
  return response.data;
};

/**
 * Thêm comment vào blog
 * Backend: POST /api/blogs/:id/comments
 */
export const addBlogComment = async (blogId: string, content: string) => {
  const response = await apiService.post(`/blogs/${blogId}/comments`, { content });
  return response.data;
};

// Export the axios instance as default for direct use
export default apiService;


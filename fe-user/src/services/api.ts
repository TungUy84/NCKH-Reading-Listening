import axios from 'axios';

// Create axios instance with base configuration
const apiService = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
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

// ========== PLACEMENT TEST API FUNCTIONS ==========
// These match the backend routes exactly

/**
 * Get all active placement tests
 * Backend: GET /api/placement-tests/active?category=listening
 */
export const getActiveTests = async (category?: string) => {
  const params = category ? { category } : {};
  const response = await apiService.get('/placement-tests/active', { params });
  return response.data; // Backend returns { tests: [...] }
};

/**
 * Get a specific test for taking (questions without correct answers)
 * Backend: GET /api/placement-tests/take/:testId
 */
export const getTestForTaking = async (testId: string) => {
  const response = await apiService.get(`/placement-tests/take/${testId}`);
  return response.data; // Backend returns { test: {...} }
};

/**
 * Submit test answers and get results immediately
 * Backend: POST /api/placement-tests/check
 */
export const submitTest = async (submission: {
  testId: string;
  answers: Array<{
    questionId: string;
    selectedOptions?: string[];
    userAnswer?: string;
  }>;
}) => {
  const response = await apiService.post('/placement-tests/check', submission);
  return response.data; // Backend returns { result: {...} }
};

// ========== AUTH API FUNCTIONS ==========
// These match the backend auth routes exactly

/**
 * Register a new user
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
 * Login user
 * Backend: POST /api/auth/login (accepts email and password)
 */
export const login = async (credentials: {
  email: string;
  password: string;
}) => {
  const response = await apiService.post('/auth/login', credentials);
  return response.data;
};

/**
 * Logout user
 * Backend: POST /api/auth/logout
 */
export const logout = async () => {
  const response = await apiService.post('/auth/logout');
  return response.data;
};

/**
 * Get user profile
 * Backend: GET /api/auth/profile
 */
export const getProfile = async () => {
  const response = await apiService.get('/auth/profile');
  return response.data;
};

/**
 * Update user profile
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
 * Upload user avatar
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
 * Change password
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
 * Request password reset
 * Backend: POST /api/auth/forgot-password
 */
export const forgotPassword = async (email: string) => {
  const response = await apiService.post('/auth/forgot-password', { email });
  return response.data;
};

/**
 * Reset password with token
 * Backend: PUT /api/auth/reset-password/:resetToken
 */
export const resetPassword = async (resetToken: string, newPassword: string) => {
  const response = await apiService.put(`/auth/reset-password/${resetToken}`, {
    password: newPassword,
  });
  return response.data;
};

// ========== HELPER FUNCTIONS ==========

/**
 * Check if user is authenticated
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
 * Get current user from token
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
 * Test API connection
 */
export const testConnection = async () => {
  try {
    await apiService.get('/placement-tests/active');
    return true;
  } catch {
    return false;
  }
};

// Export the axios instance as default for direct use
export default apiService;

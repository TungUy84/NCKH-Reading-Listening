import axios from "axios";

const apiService = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      const authRoutes = new Set([
        "/auth",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
      ]);

      if (!authRoutes.has(window.location.pathname)) {
        localStorage.removeItem("token");
        window.location.href = "/auth";
      }
    }

    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const getActiveTests = async (category?: string) => {
  const params = category ? { category } : undefined;
  const { data } = await apiService.get("/placement-tests", { params });
  return data;
};

export const getPlacementTestForTaking = async (testId: string) => {
  const { data } = await apiService.get(`/placement-tests/${testId}`);
  return data;
};

export const submitPlacementTest = async (
  testId: string,
  answers: Array<{
    questionId?: string;
    questionNumber?: number;
    selectedOptions?: string[];
    userAnswer?: string;
    matchingAnswers?: { prompt: string; selected: string }[];
  }>
) => {
  const { data } = await apiService.post(`/placement-tests/${testId}/submissions`, {
    testId,
    answers,
  });
  return data;
};

export const register = async (payload: {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  studentId?: string;
  dateOfBirth?: string;
}) => {
  const { data } = await apiService.post("/auth/register", payload);
  return data;
};

export const login = async (payload: { email: string; password: string }) => {
  const { data } = await apiService.post("/auth/login", payload);
  return data;
};

export const getProfile = async () => {
  const { data } = await apiService.get("/auth/profile");
  return data;
};

export const updateProfile = async (payload: {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  studentId?: string;
  dateOfBirth?: string;
}) => {
  const { data } = await apiService.put("/auth/profile", payload);
  return data;
};

export const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const { data } = await apiService.post("/auth/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

export const changePassword = async (payload: {
  currentPassword: string;
  newPassword: string;
}) => {
  const { data } = await apiService.put("/auth/change-password", payload);
  return data;
};

export const forgotPassword = async (email: string) => {
  const { data } = await apiService.post("/auth/forgot-password", { email });
  return data;
};

export const resetPassword = async (token: string, password: string) => {
  const { data } = await apiService.put(`/auth/reset-password/${token}`, {
    password,
  });
  return data;
};

export default apiService;

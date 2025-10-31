import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, getProfile } from '../services/api';

interface User {
  _id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  studentId?: string;
  dateOfBirth?: string;
  avatar?: string;
  isAdmin: boolean;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

// Chia sẻ trạng thái đăng nhập trên toàn ứng dụng
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook tiện lợi để truy cập nhanh vào context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Kiểm tra token hiện tại và lấy thông tin hồ sơ nếu hợp lệ
  const checkAuth = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return false;
      }

      const response = await getProfile();
      if (response.user) {
        setUser(response.user);
        setIsLoading(false);
        return true;
      } else {
        localStorage.removeItem('token');
        setUser(null);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Auth verification failed:', error);
      localStorage.removeItem('token');
      setUser(null);
      setIsLoading(false);
      return false;
    }
  };

  // Đăng nhập và lưu token + thông tin người dùng vào bộ nhớ
  const login = async (identifier: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiLogin({ identifier, password });

      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        setUser(response.user);
        return true;
      } else {
        return false;
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      // Don't throw the error, just return false to let the component handle the display
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Đăng ký tài khoản mới rồi đăng nhập ngay nếu thành công
  const register = async (userData: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiRegister(userData);

      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        setUser(response.user);
        setIsLoading(false);
        return true;
      } else {
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setIsLoading(false);
      return false;
    }
  };

  // Xóa token khỏi localStorage và reset người dùng
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

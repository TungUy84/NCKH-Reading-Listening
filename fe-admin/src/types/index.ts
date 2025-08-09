// Base types (copied from fe-user for admin independence)
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PlacementTest {
  _id: string;
  title: string;
  description: string;
  category: 'listening' | 'reading' | 'general';
  instructions: string[];
  timeLimit: number;
  questions: Question[];
  totalQuestions: number;
  totalPoints: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  _id: string;
  type: 'single_choice' | 'multiple_choice' | 'fill_blank' | 'essay';
  content: string;
  level: 'AV1' | 'AV2' | 'AV3' | 'AV4' | 'AV5' | 'AV6' | 'AV7';
  skill: 'listening' | 'reading' | 'speaking' | 'writing';
  passage?: string;
  media?: {
    audioUrl?: string;
    imageUrl?: string;
  };
  options?: Option[];
  correctAnswers: string[];
  points: number;
  explanation?: string;
}

export interface Option {
  text: string;
  isCorrect: boolean;
}

// Admin-specific types
export interface AdminUser {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: AdminUser;
}

// Dashboard Statistics
export interface DashboardStats {
  totalTests: number;
  activeTests: number;
  totalQuestions: number;
  totalAttempts: number;
  listeningTests: number;
  readingTests: number;
  avgScore: number;
  recentTests: PlacementTest[];
}

// Test Management
export interface TestFormData {
  title: string;
  description: string;
  category: 'listening' | 'reading' | 'general';
  instructions: string[];
  timeLimit: number;
  isActive: boolean;
  questions: QuestionFormData[];
}

export interface QuestionFormData {
  type: 'single_choice' | 'multiple_choice' | 'fill_blank' | 'essay';
  content: string;
  level: 'AV1' | 'AV2' | 'AV3' | 'AV4' | 'AV5' | 'AV6' | 'AV7';
  skill: 'listening' | 'reading' | 'speaking' | 'writing';
  passage?: string;
  media?: {
    audioUrl?: string;
    imageUrl?: string;
  };
  options?: OptionFormData[];
  correctAnswers: string[];
  points: number;
  explanation?: string;
}

export interface OptionFormData {
  text: string;
  isCorrect: boolean;
}

// Table and Pagination
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

// Modal and Form States
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface FormValidation {
  errors: Record<string, string>;
  isValid: boolean;
}

// Navigation and Sidebar
export interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  isActive?: boolean;
  badge?: number;
  children?: SidebarItem[];
}

// Notification System
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  onClick: () => void;
  style?: 'primary' | 'secondary';
}

// API Response with Admin context
export interface AdminApiResponse<T> extends ApiResponse<T> {
  pagination?: PaginationInfo;
  meta?: {
    totalCount: number;
    filters: Record<string, any>;
  };
}

// File Upload
export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
}

// Bulk Operations
export interface BulkAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: (selectedIds: string[]) => Promise<void>;
  confirmMessage?: string;
  destructive?: boolean;
}

// Settings and Configuration
export interface AdminSettings {
  siteName: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  defaultTimeLimit: number;
  maxQuestionsPerTest: number;
  emailNotifications: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
}

// Analytics and Reports
export interface AnalyticsData {
  testsCreated: TimeSeriesData[];
  testAttempts: TimeSeriesData[];
  avgScoresByCategory: CategoryScore[];
  popularTests: PopularTest[];
  userActivity: ActivityData[];
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface CategoryScore {
  category: string;
  avgScore: number;
  count: number;
}

export interface PopularTest {
  testId: string;
  title: string;
  attempts: number;
  avgScore: number;
}

export interface ActivityData {
  hour: number;
  count: number;
}

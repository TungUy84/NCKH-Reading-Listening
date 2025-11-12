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
  category: 'listening' | 'reading';
  instructions: string[];
  timeLimit: number;
  questions: Question[];
  sections?: TestSection[];
  totalQuestions: number;
  totalPoints: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type PracticeSkill = 'reading' | 'listening';
export type PracticeLevelGroup = 'AV1-AV3' | 'AV4-AV5' | 'AV6' | 'AV7';

export interface PracticeMediaBlock {
  id: string;
  type: 'image' | 'audio';
  url: string;
  originalName?: string;
  transcript?: string;
}

export interface PracticeSection {
  _id?: string;
  title: string;
  passage?: string;
  audio?: string;
  image?: string;
  mediaBlocks?: PracticeMediaBlock[];
}

export interface PracticeQuestionOption {
  text: string;
  isCorrect: boolean;
}

export interface PracticeMatchingPair {
  prompt: string;
  correctOption: string;
}

export interface PracticeQuestion {
  _id?: string;
  sectionId?: string;
  sectionIndex?: number;
  questionNumber: number;
  type: 'multi_choice' | 'short_answer' | 'matching' | 'dropdown';
  allowMultiple?: boolean;
  content: string;
  passage?: string;
  options?: PracticeQuestionOption[];
  matchingPairs?: PracticeMatchingPair[];
  correctAnswers?: string[];
  explanation?: string;
  points: number;
}

export interface Practice {
  _id: string;
  title: string;
  description?: string;
  skill: PracticeSkill;
  levelGroup: PracticeLevelGroup;
  estimatedTime?: number;
  sections: PracticeSection[];
  questions: PracticeQuestion[];
  totalQuestions: number;
  totalPoints: number;
  isActive: boolean;
  createdBy: string | AdminUser;
  createdAt: string;
  updatedAt: string;
}

export interface PracticePayload {
  title: string;
  description?: string;
  skill: PracticeSkill;
  levelGroup: PracticeLevelGroup;
  estimatedTime?: number;
  sections: PracticeSection[];
  questions: PracticeQuestion[];
  isActive?: boolean;
}

export interface PracticeImportPreview {
  title: string;
  description?: string;
  skill: PracticeSkill;
  levelGroup: PracticeLevelGroup;
  estimatedTime: number;
  sections: PracticeSection[];
  questions: PracticeQuestion[];
  totalPoints: number;
  totalQuestions: number;
  source?: string;
}

export type PracticeUpdatePayload = Partial<PracticePayload>;

export interface PracticePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PracticeListResult {
  items: Practice[];
  pagination: PracticePagination;
}

export interface PracticeQueryParams {
  page?: number;
  limit?: number;
  skill?: PracticeSkill | '';
  levelGroup?: PracticeLevelGroup | '';
  keyword?: string;
  status?: 'active' | 'inactive' | '';
}

export interface Lesson {
  _id: string;
  title: string;
  summary?: string;
  content: string;
  skill: PracticeSkill;
  levelGroup: PracticeLevelGroup;
  coverImage?: string;
  isActive: boolean;
  viewCount: number;
  createdBy?: string | AdminUser;
  createdAt: string;
  updatedAt: string;
}

export interface LessonPayload {
  title: string;
  summary?: string;
  content: string;
  skill: PracticeSkill;
  levelGroup: PracticeLevelGroup;
  coverImage?: string;
  isActive?: boolean;
}

export interface LessonQueryParams {
  page?: number;
  limit?: number;
  keyword?: string;
  skill?: PracticeSkill | '';
  levelGroup?: PracticeLevelGroup | '';
  status?: 'active' | 'inactive' | '';
}

export interface LessonListResult {
  items: Lesson[];
  pagination: PracticePagination;
}

export interface TestSection {
  _id?: string;
  sectionId?: number;
  title?: string;
  passage?: string;
  audio?: string;
  audioUrl?: string;
  image?: string;
  imageUrl?: string;
  mediaBlocks?: SectionMedia[];
  questions: Question[];
}
 
export interface Question {
  _id?: string;
  sectionId?: string;
  questionId?: number;
  questionNumber?: number;
  type: 'multi_choice' | 'short_answer' | 'matching' | 'dropdown';
  allowMultiple?: boolean;
  sectionIndex?: number;
  matchingPairs?: MatchingPair[];
  content?: string;
  text?: string;
  passage?: string;
  media?: {
    image?: string;
    audio?: string;
  };
  options?: QuestionOption[];
  correctAnswers: string[];
  points: number;
  explanation?: string;
}

export interface Option {
  text: string;
  isCorrect: boolean;
}

export interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

export interface MatchingPair {
  prompt: string;
  correctOption: string;
}

export interface SectionMedia {
  id: string;
  type: 'image' | 'audio';
  url: string;
  originalName?: string;
  transcript?: string;
}

export interface PlacementTestImportPreview {
  title: string;
  description: string;
  category: 'listening' | 'reading';
  timeLimit: number;
  instructions: string[];
  sections?: TestSection[];
  questions: Question[];
  totalPoints?: number;
  totalQuestions?: number;
  source?: string;
}

export interface PlacementTestImportResponse {
  message: string;
  previewTest: PlacementTestImportPreview;
  source?: string;
}

// Admin-specific types
export interface AdminUser {
  _id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phoneNumber?: string;
  studentId?: string;
  dateOfBirth?: string; // ISO string
  role: 'admin' | 'user';
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Users management types (admin)
export type UserRole = 'admin' | 'user';

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole | '';
  isActive?: boolean | '';
}

export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  studentId?: string;
  dateOfBirth?: string; // ISO string
  role?: UserRole;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  studentId?: string;
  dateOfBirth?: string | null; // allow clearing
  avatar?: string;
  role?: UserRole;
  isActive?: boolean;
  password?: string; // allow admin to set new password
}

export interface UserStats {
  statistics: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    adminUsers: number;
    regularUsers: number;
    newUsersLast30Days: number;
  };
}

export interface UsersListPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface UsersListResult {
  users: AdminUser[];
  pagination: UsersListPagination;
}

export interface LoginCredentials {
  identifier: string;
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
  categoryStats: {
    category: string;
    count: number;
  }[];
  note?: string;
}

// Test Management
export interface TestFormData {
  title: string;
  description: string;
  category: 'listening' | 'reading';
  instructions: string[];
  timeLimit: number;
  isActive: boolean;
  sections?: TestSection[];
  questions: QuestionFormData[];
}

export interface TestUpdateData {
  title: string;
  description: string;
  category: 'listening' | 'reading';
  instructions: string[];
  timeLimit: number;
  isActive: boolean;
  sections?: TestSection[];
  questions?: Question[];
}

export interface QuestionFormData {
  type: 'multi_choice' | 'short_answer' | 'matching' | 'dropdown';
  content: string;
  sectionIndex?: number;
  passage?: string;
  media?: {
    image?: string;
    audio?: string;
  };
  options?: OptionFormData[];
  allowMultiple?: boolean;
  matchingPairs?: MatchingPair[];
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

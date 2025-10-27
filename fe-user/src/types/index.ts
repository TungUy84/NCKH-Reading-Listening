// Kiểu dữ liệu phản hồi từ API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Bộ kiểu dữ liệu liên quan tới bài kiểm tra
export interface PlacementTest {
  _id: string;
  title: string;
  description: string;
  category: 'listening' | 'reading';
  instructions: string[];
  timeLimit: number;
  sections: TestSection[];
  questions: TestQuestion[];
  totalQuestions: number;
  totalPoints: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SectionMedia {
  id: string;
  type: 'image' | 'audio';
  url: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  transcript?: string;
}

export interface TestSection {
  _id: string;
  title: string;
  passage?: string;
  audio?: string;
  image?: string;
  mediaBlocks?: SectionMedia[];
}

export interface TestQuestion {
  _id?: string;
  sectionId: string;
  questionNumber: number;
  type: 'multi_choice' | 'short_answer' | 'matching' | 'dropdown';
  content: string;
  instructions?: string;
  options?: Option[];
  wordBank?: string[];
  correctAnswers?: string[];
  explanation?: string;
  points: number;
  level?: 'AV1' | 'AV2' | 'AV3' | 'AV4' | 'AV5' | 'AV6' | 'AV7';
  passage?: string; // dùng cho bối cảnh đọc hiểu
  media?: {
    audioUrl?: string;
    imageUrl?: string;
  }; // dùng cho bài nghe hoặc câu hỏi có hình
  allowMultiple?: boolean;
  matchingPairs?: MatchingPair[];
}

export interface Question {
  _id?: string;
  type: 'multi_choice' | 'short_answer' | 'matching' | 'dropdown';
  content: string;
  level: 'AV1' | 'AV2' | 'AV3' | 'AV4' | 'AV5' | 'AV6' | 'AV7';
  passage?: string;
  media?: {
    audioUrl?: string;
    imageUrl?: string;
  };
  options?: Option[];
  correctAnswers?: string[]; // Only visible to admin
  allowMultiple?: boolean;
  matchingPairs?: MatchingPair[];
  points: number;
  explanation?: string; // Only visible after submission
}

export interface Option {
  text: string;
  isCorrect?: boolean; // Hidden in take test, visible in admin
}

export interface MatchingPair {
  prompt: string;
  correctOption: string;
}

// Kiểu dữ liệu câu trả lời của học viên
export interface UserAnswer {
  selectedOptions: string[];
  userAnswer: string;
  matchingAnswers?: { prompt: string; selected: string }[];
}

export interface SubmittedAnswer extends UserAnswer {
  questionId: string;
}

export interface TestSubmission {
  testId: string;
  answers: SubmittedAnswer[];
}

// Kết quả bài thi (khớp với backend)
export interface TestResult {
  testTitle: string;
  category: string;
  score: {
    totalPoints: number;
    earnedPoints: number;
    percentage: number;
  };
  ieltsScore: string;
  avLevel: string;
  recommendation: string;
  detailedResults: DetailedResult[];
}

export interface DetailedResult {
  questionNumber: number;
  question: {
    type: string;
    content: string;
    passage?: string;
    media?: any;
    options?: any[];
    sectionId?: string;
    sectionTitle?: string;
  };
  userAnswer: {
    selectedOptions: string[];
    userAnswer: string;
    matchingAnswers?: { prompt: string; selected: string }[];
  };
  correctAnswers: string[];
  isCorrect: boolean;
  pointsEarned: number;
  explanation: string;
}

// Trạng thái UI trong quá trình làm bài
export interface TestState {
  currentTest: PlacementTest | null;
  currentQuestionIndex: number;
  answers: UserAnswer[];
  timeRemaining: number;
  isSubmitting: boolean;
  result: TestResult | null;
  isCompleted: boolean;
}

// Props cho các component tái sử dụng
export interface TestCardProps {
  test: PlacementTest;
  onStart: (testId: string) => void;
  isLoading?: boolean;
}

export interface QuestionComponentProps {
  question: Question;
  questionIndex: number;
  answer: UserAnswer;
  onAnswerChange: (answer: UserAnswer) => void;
  isReviewMode?: boolean;
}

export interface TimerProps {
  timeRemaining: number;
  onTimeUp: () => void;
  isActive: boolean;
}

export interface ProgressBarProps {
  current: number;
  total: number;
}

// Kiểu dữ liệu cho mục điều hướng
export interface NavigationItem {
  label: string;
  href: string;
  isActive?: boolean;
}

// Trạng thái loading và lỗi
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Bộ lọc dành cho danh sách bài test
export interface TestFilters {
  category?: 'listening' | 'reading' | 'all';
  level?: string;
  search?: string;
}

// Props cho trình phát audio ở bài nghe
export interface AudioPlayerProps {
  audioUrl: string;
  isPlaying: boolean;
  onPlayPause: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

// Props hiển thị kết quả
export interface ResultSummaryProps {
  result: TestResult;
  onRetakeTest?: () => void;
  onViewDetails?: () => void;
}

export interface ScoreDisplayProps {
  percentage: number;
  ieltsScore: number;
  avLevel: string;
  levelDescription: string;
}

// Dữ liệu form liên hệ/feedback
export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface FeedbackFormData {
  rating: number;
  comment: string;
  testId?: string;
}

// Kiểu dữ liệu cho error boundary
export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
}

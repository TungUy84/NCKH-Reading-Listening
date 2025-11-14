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

export interface QuestionMedia {
  audioUrl?: string;
  audioMimeType?: string;
  audioName?: string;
  imageUrl?: string;
  imageName?: string;
  transcript?: string;
}

export interface TestQuestion {
  _id?: string;
  sectionId: string;
  questionNumber: number;
  type: 'multi_choice' | 'short_answer' | 'matching' | 'dropdown';
  content: string;
  options?: Option[];
  correctAnswers?: string[];
  explanation?: string;
  points: number;
  level?: 'AV1' | 'AV2' | 'AV3' | 'AV4' | 'AV5' | 'AV6' | 'AV7';
  passage?: string; // dùng cho bối cảnh đọc hiểu
  media?: QuestionMedia; // dùng cho bài nghe hoặc câu hỏi có hình
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
    type: TestQuestion['type'];
    content: string;
    passage?: string;
    media?: QuestionMedia;
    options?: Option[];
    sectionId?: string;
    sectionTitle?: string;
    allowMultiple?: boolean;
    matchingPairs?: MatchingPair[];
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

// ===== LOẠI DỮ LIỆU CHO ÔN LUYỆN =====

export type PracticeSkill = 'reading' | 'listening';

export type PracticeLevelGroup = 'AV1-AV3' | 'AV4-AV5' | 'AV6' | 'AV7';

export interface PracticeSummary {
  _id: string;
  title: string;
  description?: string;
  skill: PracticeSkill;
  levelGroup: PracticeLevelGroup;
  estimatedTime?: number;
  totalQuestions: number;
  totalPoints: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PracticeSection {
  _id?: string;
  title: string;
  passage?: string;
  audio?: string;
  image?: string;
  mediaBlocks?: SectionMedia[];
}

export interface PracticeQuestion {
  _id?: string;
  sectionId?: string;
  questionNumber: number;
  type: 'multi_choice' | 'short_answer' | 'matching' | 'dropdown';
  allowMultiple?: boolean;
  content: string;
  options?: Option[];
  matchingPairs?: MatchingPair[];
  points: number;
  passage?: string;
}

export interface PracticeDetail extends PracticeSummary {
  sections: PracticeSection[];
  questions: PracticeQuestion[];
}

export interface PracticeAnswerInput {
  questionId?: string;
  questionNumber?: number;
  selectedOptions?: string[];
  userAnswer?: string;
  matchingAnswers?: { prompt: string; selected: string }[];
}

export interface PracticeAttemptAnswer {
  questionId?: string;
  questionNumber: number;
  type: PracticeQuestion['type'];
  allowMultiple?: boolean;
  selectedOptions: string[];
  userAnswer: string;
  matchingAnswers?: { prompt: string; selected: string }[];
  correctAnswers?: string[];
  earnedPoints: number;
  points: number;
  isCorrect: boolean;
  isSkipped?: boolean;
}

export interface PracticeAttemptSummary {
  _id: string;
  practiceId: PracticeSummary | string;
  userId: string;
  skill: PracticeSkill;
  levelGroup: PracticeLevelGroup;
  totalQuestions: number;
  totalPoints: number;
  earnedPoints: number;
  percentage: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  durationSeconds?: number;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PracticeAttemptDetail extends PracticeAttemptSummary {
  answers: PracticeAttemptAnswer[];
}

export interface PracticeSubmissionPayload {
  answers: PracticeAnswerInput[];
  durationSeconds?: number;
  startedAt?: string;
  completedAt?: string;
}

export interface PracticeSubmissionResponse {
  message: string;
  data: {
    attempt: PracticeAttemptDetail;
    practice: PracticeSummary;
  };
}

export interface PracticeHistoryResponse {
  message: string;
  data: {
    items: PracticeAttemptSummary[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// ===== LOẠI DỮ LIỆU CHO BÀI HỌC =====

export interface LessonSummary {
  _id: string;
  title: string;
  summary?: string;
  skill: PracticeSkill;
  levelGroup: PracticeLevelGroup;
  coverImage?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface LessonDetail extends LessonSummary {
  content: string;
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

// ============================================================================
// ROADMAP TYPES
// ============================================================================

export type RoadmapLevelGroup = 'AV1-AV3' | 'AV4-AV5' | 'AV6' | 'AV7';

export interface RoadmapContent {
  reading: {
    lessons: LessonSummary[];
    practices: PracticeSummary[];
  };
  listening: {
    lessons: LessonSummary[];
    practices: PracticeSummary[];
  };
}

export interface RoadmapRequirements {
  totalLessons: number;
  totalPractices: number;
  passingScore: number;
}

export interface Roadmap {
  _id: string;
  levelGroup: RoadmapLevelGroup;
  title: string;
  description: string;
  estimatedDuration: number;
  requirements: RoadmapRequirements;
  content: RoadmapContent;
  checkpointTest?: PlacementTest;
  createdAt: string;
  updatedAt: string;
}

export interface StageProgress {
  reading: {
    completedLessons: string[];
    completedPractices: string[];
  };
  listening: {
    completedLessons: string[];
    completedPractices: string[];
  };
  overallPercentage: number;
}

export interface CheckpointResult {
  attemptId: string;
  score: number;
  passed: boolean;
  attemptedAt: string;
}

export interface RoadmapStage {
  _id: string;
  levelGroup: RoadmapLevelGroup;
  roadmapId: string | Roadmap;
  status: 'locked' | 'in-progress' | 'checkpoint-ready' | 'completed';
  startedAt?: string;
  completedAt?: string;
  content: {
    reading: {
      lessons: string[];
      practices: string[];
    };
    listening: {
      lessons: string[];
      practices: string[];
    };
  };
  progress: StageProgress;
  checkpointTestId?: string;
  checkpointResult?: CheckpointResult;
}

export interface UserRoadmap {
  _id: string;
  userId: string;
  currentLevel: RoadmapLevelGroup;
  targetLevel: RoadmapLevelGroup;
  stages: RoadmapStage[];
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  lastActivityAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRoadmapPayload {
  currentLevel: RoadmapLevelGroup;
  targetLevel: RoadmapLevelGroup;
}

export interface UpdateProgressPayload {
  type: 'lesson' | 'practice';
  itemId: string;
}

export interface SubmitCheckpointPayload {
  levelGroup: RoadmapLevelGroup;
  testId: string;
  score: number;
}

export interface SuggestedLevelResponse {
  hasSuggestion: boolean;
  message?: string;
  data?: {
    suggestedLevel: RoadmapLevelGroup;
    avLevel: string;
    ieltsRange: { min: number; max: number };
    category: string;
    score: { percentage: number };
  };
}

export interface StageDetailResponse {
  stage: RoadmapStage;
  content: RoadmapContent;
  checkpointTest?: PlacementTest;
  requirements: RoadmapRequirements;
}


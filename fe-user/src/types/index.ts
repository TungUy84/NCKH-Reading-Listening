// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Test Related Types
export interface PlacementTest {
  _id: string;
  title: string;
  description: string;
  category: 'listening' | 'reading' | 'general';
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
}

export interface TestSection {
  _id: string;
  title: string;
  passage?: string;
  audio?: string;
  image?: string;
  timeLimit: number;
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
  passage?: string; // added for reading context
  media?: {
    audioUrl?: string;
    imageUrl?: string;
  }; // added for listening / images
  allowMultiple?: boolean;
  matchingPairs?: MatchingPair[];
}

export interface Question {
  _id?: string;
  type: 'multi_choice' | 'short_answer' | 'matching' | 'dropdown';
  content: string;
  level: 'AV1' | 'AV2' | 'AV3' | 'AV4' | 'AV5' | 'AV6' | 'AV7';
  skill: 'listening' | 'reading' | 'speaking' | 'writing';
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

// User Answer Types
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

// Test Result Types (matching backend response)
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

// UI State Types
export interface TestState {
  currentTest: PlacementTest | null;
  currentQuestionIndex: number;
  answers: UserAnswer[];
  timeRemaining: number;
  isSubmitting: boolean;
  result: TestResult | null;
  isCompleted: boolean;
}

// Component Props
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

// Navigation Types
export interface NavigationItem {
  label: string;
  href: string;
  isActive?: boolean;
}

// Loading and Error States
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Filter Types for Test Selection
export interface TestFilters {
  category?: 'listening' | 'reading' | 'all';
  level?: string;
  search?: string;
}

// Audio Player Types (for listening tests)
export interface AudioPlayerProps {
  audioUrl: string;
  isPlaying: boolean;
  onPlayPause: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

// Result Display Types
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

// Form Types
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

// Error Boundary Types
export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
}

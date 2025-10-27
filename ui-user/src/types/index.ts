export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PlacementTestSummary {
  _id: string;
  title: string;
  description?: string;
  category: "listening" | "reading";
  timeLimit: number;
  totalQuestions: number;
}

export interface TestSection {
  _id: string;
  title: string;
  passage?: string;
  audio?: string;
  image?: string;
}

export type QuestionType =
  | "multi_choice"
  | "short_answer"
  | "matching"
  | "dropdown";

export interface TestQuestion {
  _id: string;
  questionNumber: number;
  type: QuestionType;
  content: string;
  passage?: string;
  options?: Array<{
    text: string;
    isCorrect?: boolean;
  }>;
  correctAnswers?: string[];
  allowMultiple?: boolean;
  points: number;
  matchingPairs?: Array<{
    prompt: string;
    correctOption: string;
  }>;
  explanation?: string;
  media?: {
    audioUrl?: string;
    imageUrl?: string;
  };
}

export interface PlacementTestDetail {
  _id: string;
  title: string;
  description?: string;
  instructions?: string[];
  category: "listening" | "reading";
  timeLimit: number;
  sections: TestSection[];
  questions: TestQuestion[];
  totalQuestions: number;
  totalPoints: number;
}

export interface SubmittedAnswer {
  questionId?: string;
  questionNumber?: number;
  selectedOptions?: string[];
  userAnswer?: string;
  matchingAnswers?: Array<{
    prompt: string;
    selected: string;
  }>;
}

export interface SubmitTestPayload {
  testId: string;
  answers: SubmittedAnswer[];
}

export interface DetailedResult {
  questionNumber: number;
  question: {
    type: QuestionType;
    content: string;
    passage?: string;
    media?: {
      audioUrl?: string;
      imageUrl?: string;
    };
    options?: Array<{
      text: string;
    }>;
  };
  userAnswer: {
    selectedOptions: string[];
    userAnswer: string;
    matchingAnswers?: Array<{
      prompt: string;
      selected: string;
    }>;
  };
  correctAnswers: string[];
  isCorrect: boolean;
  pointsEarned: number;
  explanation?: string;
}

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

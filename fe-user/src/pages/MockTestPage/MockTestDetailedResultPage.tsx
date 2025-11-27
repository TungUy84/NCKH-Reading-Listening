import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CheckCircle, XCircle, ArrowLeft, Volume2, FileText, Clock } from 'lucide-react';
import { getTestAttemptDetail } from '../../services/api';
import { Button } from '../../components/ui/Button';

interface Answer {
  questionId: string;
  questionNumber: number;
  type: string;
  selectedOptions: string[];
  correctAnswers: string[];
  userAnswer?: string;
  isCorrect: boolean;
  earnedPoints: number;
  points: number;
  isSkipped?: boolean;
}

interface Question {
  _id: string;
  sectionId: string;
  questionNumber: number;
  type: string;
  content: string;
  options?: string[];
  correctAnswers: string[];
  points: number;
  explanation?: string;
}

interface Section {
  _id: string;
  title: string;
  passage?: string;
  audio?: string;
  questions: Question[];
}

interface TestData {
  _id: string;
  title: string;
  category: string;
  sections: Section[];
}

interface ResultData {
  _id: string;
  testTitle: string;
  category: string;
  totalQuestions: number;
  totalPoints: number;
  earnedPoints: number;
  percentage: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  durationSeconds: number;
  answers: Answer[];
  completedAt: string;
}

const normalizeId = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const extractText = (item: any): string => {
  return typeof item === 'string' ? item : item?.text || String(item);
};

const getStatusColor = (isSkipped: boolean, isCorrect: boolean) => {
  if (isSkipped) return {
    bg: 'bg-gray-50',
    border: 'border-gray-300',
    badge: 'bg-gray-200 text-gray-700',
    icon: 'text-gray-400'
  };
  if (isCorrect) return {
    bg: 'bg-green-50',
    border: 'border-green-400',
    badge: 'bg-green-200 text-green-800',
    icon: 'text-green-600'
  };
  return {
    bg: 'bg-red-50',
    border: 'border-red-400',
    badge: 'bg-red-200 text-red-800',
    icon: 'text-red-600'
  };
};

const MockTestDetailedResultPage: React.FC = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();

  const [result, setResult] = useState<ResultData | null>(null);
  const [test, setTest] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [panelHeight, setPanelHeight] = useState<number>(0);

  const gridRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const updatePanelHeight = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!gridRef.current || window.innerWidth < 1024) {
      setPanelHeight(0);
      return;
    }
    const { top } = gridRef.current.getBoundingClientRect();
    const safeTop = Math.max(top, 0);
    const available = Math.max(420, Math.floor(window.innerHeight - safeTop - 32));
    setPanelHeight(available);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', updatePanelHeight);
    return () => window.removeEventListener('resize', updatePanelHeight);
  }, [updatePanelHeight]);

  useEffect(() => {
    const fetchResult = async () => {
      if (!resultId) {
        setError('Không tìm thấy ID kết quả');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getTestAttemptDetail(resultId);
        
        const attemptData = response.data?.attempt || response.attempt;
        const testData = response.data?.test || response.test;
        
        setResult(attemptData);
        setTest(testData);
        
        setTimeout(updatePanelHeight, 100);
      } catch (err: any) {
        console.error('Failed to fetch result:', err);
        setError(err.response?.data?.message || 'Không thể tải kết quả');
        toast.error('Không thể tải kết quả chi tiết');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [resultId, updatePanelHeight]);

  const handlePlayAudio = () => {
    if (audioRef.current) {
      if (audioPlaying) {
        audioRef.current.pause();
        setAudioPlaying(false);
      } else {
        audioRef.current.play();
        setAudioPlaying(true);
      }
    }
  };

  const getAnswerForQuestion = useCallback((questionId: string): Answer | undefined => {
    return result?.answers.find(ans => ans.questionId === questionId);
  }, [result?.answers]);

  const allQuestions = useMemo(() => {
    if (!test) return [];
    return test.sections.flatMap(section => section.questions);
  }, [test]);

  const currentQuestion = allQuestions[currentQuestionIndex] ?? null;
  const currentSectionId = normalizeId(currentQuestion?.sectionId);

  const currentSection = useMemo(() => {
    if (!currentSectionId || !test) return null;
    return test.sections.find(section => normalizeId(section._id) === currentSectionId) ?? null;
  }, [currentSectionId, test]);

  const currentSectionIndex = useMemo(() => {
    if (!currentSectionId || !test) return -1;
    return test.sections.findIndex(section => normalizeId(section._id) === currentSectionId);
  }, [currentSectionId, test]);

  const hasPrevSection = currentSectionIndex > 0;
  const hasNextSection = test && currentSectionIndex >= 0 && currentSectionIndex < test.sections.length - 1;

  const goToPrevSection = useCallback(() => {
    if (!test || currentSectionIndex <= 0) return;
    const prevSection = test.sections[currentSectionIndex - 1];
    if (prevSection) {
      const firstQuestionIndex = allQuestions.findIndex(q => 
        normalizeId(q.sectionId) === normalizeId(prevSection._id)
      );
      if (firstQuestionIndex >= 0) {
        setCurrentQuestionIndex(firstQuestionIndex);
      }
    }
  }, [test, currentSectionIndex, allQuestions]);

  const goToNextSection = useCallback(() => {
    if (!test || currentSectionIndex < 0) return;
    const nextSection = test.sections[currentSectionIndex + 1];
    if (nextSection) {
      const firstQuestionIndex = allQuestions.findIndex(q => 
        normalizeId(q.sectionId) === normalizeId(nextSection._id)
      );
      if (firstQuestionIndex >= 0) {
        setCurrentQuestionIndex(firstQuestionIndex);
      }
    }
  }, [test, currentSectionIndex, allQuestions]);

  const renderQuestionContent = useCallback((question: Question) => {
    const answer = getAnswerForQuestion(question._id);
    if (!answer) return null;

    const isCorrect = answer.isCorrect;
    const isSkipped = !!answer.isSkipped;
    const colors = getStatusColor(isSkipped, isCorrect);

    return (
      <div className={`rounded-xl border-2 p-6 ${colors.bg} ${colors.border}`}>
        {/* Question Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {isSkipped ? (
              <FileText className={`w-6 h-6 ${colors.icon} flex-shrink-0`} />
            ) : isCorrect ? (
              <CheckCircle className={`w-6 h-6 ${colors.icon} flex-shrink-0`} />
            ) : (
              <XCircle className={`w-6 h-6 ${colors.icon} flex-shrink-0`} />
            )}
            <h3 className="font-bold text-lg text-gray-900">
              Câu {question.questionNumber}
            </h3>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${colors.badge}`}>
            {isSkipped ? 'Bỏ qua' : isCorrect ? 'Đúng' : 'Sai'} ({answer.earnedPoints}/{answer.points} điểm)
          </div>
        </div>

        {/* Question Content */}
        <div className="mb-4 p-4 bg-white rounded-lg">
          <p className="text-gray-900 font-medium mb-3">{question.content}</p>

          {/* Multiple Choice Options */}
          {question.type === 'multi_choice' && question.options && (
            <div className="space-y-2">
              {question.options.map((option: any, idx) => {
                const optionText = extractText(option);
                const optionLetter = String.fromCharCode(65 + idx);
                const isSelected = answer.selectedOptions.some((sel: any) => extractText(sel) === optionText);
                const isCorrectOption = question.correctAnswers.some((correct: any) => extractText(correct) === optionText);

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border-2 ${
                      isCorrectOption
                        ? 'border-green-500 bg-green-50'
                        : isSelected
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-700">{optionLetter}.</span>
                      <span className={isCorrectOption || isSelected ? 'font-semibold' : ''}>
                        {optionText}
                      </span>
                      {isCorrectOption && (
                        <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                      )}
                      {isSelected && !isCorrectOption && (
                        <XCircle className="w-4 h-4 text-red-600 ml-auto" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Short Answer */}
          {question.type === 'short_answer' && (
            <div className="space-y-2">
              {!isSkipped && answer.userAnswer && (
                <div className={`p-3 rounded-lg ${
                  isCorrect ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <p className="text-sm text-gray-600 mb-1">Câu trả lời của bạn:</p>
                  <p className="font-semibold text-gray-900">{answer.userAnswer}</p>
                </div>
              )}
              <div className="p-3 rounded-lg bg-green-100">
                <p className="text-sm text-gray-600 mb-1">Đáp án đúng:</p>
                <p className="font-semibold text-green-800">
                  {question.correctAnswers.map(extractText).join(' / ')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Explanation */}
        {question.explanation && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Giải thích
            </h4>
            <p className="text-gray-700 leading-relaxed">{question.explanation}</p>
          </div>
        )}
      </div>
    );
  }, [getAnswerForQuestion]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin mx-auto" />
          <p className="text-sm text-gray-600">Đang tải chi tiết...</p>
        </div>
      </div>
    );
  }

  if (error || !result || !test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-2xl border border-red-100">
          <XCircle className="mx-auto mb-6 h-20 w-20 text-red-500" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">
            Lỗi tải kết quả
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            {error || 'Không tìm thấy kết quả'}
          </p>
          <button
            onClick={() => navigate('/mock-test')}
            className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-8 py-4 rounded-xl font-bold hover:from-purple-700 hover:to-violet-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <span className="mr-2 inline-flex items-center justify-center">
              <ArrowLeft className="h-5 w-5" />
            </span>
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const totalQuestions = allQuestions.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-purple-50/80 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="flex w-full flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-12">
          <div className="space-y-1">
            <h1 className="text-lg font-semibold text-slate-900 leading-tight">{test.title}</h1>
            <p className="text-xs text-slate-500">Xem đáp án chi tiết</p>
          </div>

          {/* Question Navigator */}
          <div className="flex-1 min-w-[260px] max-w-full">
            <div className="flex flex-col items-center gap-2">
              <div className="flex flex-wrap gap-2 justify-center">
                {allQuestions.map((question, index) => {
                  if (!question) return null;
                  const answer = getAnswerForQuestion(question._id);
                  const isCorrect = answer?.isCorrect;
                  const isSkipped = answer?.isSkipped;
                  const isCurrent = index === currentQuestionIndex;

                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`flex h-8 w-8 items-center justify-center rounded-md border text-[11px] font-semibold transition shadow-sm ${
                        isCurrent
                          ? 'bg-purple-600 text-white border-purple-600 shadow'
                          : isSkipped
                          ? 'bg-gray-200 text-gray-600 border-gray-300'
                          : isCorrect
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100'
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm bg-purple-600" />
                  Đang xem
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm border border-emerald-500 bg-emerald-300" />
                  Đúng
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm border border-red-500 bg-red-300" />
                  Sai
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm border border-slate-300 bg-slate-200" />
                  Bỏ qua
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 sm:gap-4">
            <div className="bg-white/20 px-4 py-2 rounded-2xl font-semibold text-sm border border-purple-200 bg-gradient-to-r from-purple-50 via-white to-purple-100 text-purple-600">
              {result.percentage.toFixed(1)}% ({result.correctCount}/{result.totalQuestions})
            </div>
            <Button
              onClick={() => navigate(`/mock-test/result/${resultId}`)}
              variant="outline"
              size="md"
              className="text-sm font-semibold"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full px-4 sm:px-6 lg:px-12">
          <div className="relative h-1 w-full overflow-hidden rounded-full bg-slate-200/70">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-50 via-violet-50 to-purple-100 opacity-50" />
            <div
              className="relative h-full rounded-r-full bg-gradient-to-r from-purple-600 via-violet-500 to-purple-600 shadow-sm transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / Math.max(totalQuestions, 1)) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full">
        <div className="mx-auto flex h-full w-full max-w-none px-4 pt-6 sm:px-6 lg:px-12">
          <div
            ref={gridRef}
            className="grid h-full w-full grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-8"
          >
            {/* Left Panel - Section/Passage */}
            <div
              className="overflow-y-auto rounded-2xl border border-slate-200/60 bg-white shadow-lg"
              style={{ maxHeight: panelHeight > 0 ? `${panelHeight}px` : undefined }}
            >
              <div className="sticky top-0 z-10 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-violet-50 px-6 py-4">
                <h2 className="text-xl font-bold text-slate-900">{currentSection?.title}</h2>
                {test.sections.length > 1 && (
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      onClick={goToPrevSection}
                      disabled={!hasPrevSection}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      ← Part trước
                    </Button>
                    <Button
                      onClick={goToNextSection}
                      disabled={!hasNextSection}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      Part sau →
                    </Button>
                  </div>
                )}
              </div>

              <div className="p-6">
                {/* Audio Player */}
                {result.category === 'listening' && currentSection?.audio && (
                  <div className="mb-6 bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <audio
                      ref={audioRef}
                      src={currentSection.audio}
                      onEnded={() => setAudioPlaying(false)}
                      className="hidden"
                    />
                    <Button
                      onClick={handlePlayAudio}
                      className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                    >
                      <Volume2 className="w-5 h-5" />
                      {audioPlaying ? 'Đang phát...' : 'Phát audio'}
                    </Button>
                    <p className="text-xs text-gray-600 mt-2 text-center">
                      Bạn có thể nghe lại audio
                    </p>
                  </div>
                )}

                {/* Passage/Transcript */}
                {currentSection?.passage && (
                  <div className="prose prose-sm max-w-none">
                    <div
                      className="text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: currentSection.passage }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Questions */}
            <div
              className="overflow-y-auto rounded-2xl border border-slate-200/60 bg-white shadow-lg"
              style={{ maxHeight: panelHeight > 0 ? `${panelHeight}px` : undefined }}
            >
              <div className="p-6 space-y-6">
                {currentQuestion && renderQuestionContent(currentQuestion)}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                    variant="outline"
                  >
                    ← Câu trước
                  </Button>
                  <span className="text-sm text-gray-600">
                    {currentQuestionIndex + 1} / {totalQuestions}
                  </span>
                  <Button
                    onClick={() => setCurrentQuestionIndex(Math.min(totalQuestions - 1, currentQuestionIndex + 1))}
                    disabled={currentQuestionIndex === totalQuestions - 1}
                    variant="outline"
                  >
                    Câu sau →
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MockTestDetailedResultPage;

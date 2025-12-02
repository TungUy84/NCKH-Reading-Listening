import React, { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { TestResult, DetailedResult } from '../../types';
import Button from '../../components/ui/Button';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  MinusCircleIcon,
  StarIcon,
  TrophyIcon,
  SparklesIcon,
  AcademicCapIcon
} from '@heroicons/react/24/solid';
import {
  ArrowLeftIcon,
  EyeIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  ArrowPathIcon,
  MapIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface QuestionTypeStats {
  total: number;
  correct: number;
  incorrect: number;
  skipped: number;
}

const getLevelGroup = (level: string | undefined) => {
  if (!level) return 'Chưa xác định';
  // Check if it's already a group
  if (level.includes('-')) return level;
  
  const num = parseInt(level.replace(/\D/g, '')); // Extract number
  if (isNaN(num)) return level;
  
  if (num >= 1 && num <= 3) return 'AV1-AV3';
  if (num >= 4 && num <= 5) return 'AV4-AV5';
  if (num === 6) return 'AV6';
  if (num === 7) return 'AV7';
  return level;
};

const TestSummaryPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { testId } = useParams<{ testId: string }>();
  
  const result = location.state?.result as TestResult | undefined;

  // Calculate statistics
  const stats = useMemo(() => {
    if (!result) return null;

    let correct = 0;
    let incorrect = 0;
    let skipped = 0;
    const byType: Record<string, QuestionTypeStats> = {};

    result.detailedResults.forEach(detail => {
      const isSkipped = 
        (!detail.userAnswer.selectedOptions || detail.userAnswer.selectedOptions.length === 0) &&
        (!detail.userAnswer.userAnswer || detail.userAnswer.userAnswer.trim() === '') &&
        (!detail.userAnswer.matchingAnswers || detail.userAnswer.matchingAnswers.length === 0);
      
      if (isSkipped) skipped++;
      else if (detail.isCorrect) correct++;
      else incorrect++;

      const type = detail.question.type;
      if (!byType[type]) {
        byType[type] = { total: 0, correct: 0, incorrect: 0, skipped: 0 };
      }
      
      byType[type].total++;
      if (isSkipped) byType[type].skipped++;
      else if (detail.isCorrect) byType[type].correct++;
      else byType[type].incorrect++;
    });

    return { correct, incorrect, skipped, byType };
  }, [result]);

  const getAnswerLabel = (detail: DetailedResult, type: 'user' | 'correct') => {
    const { question, userAnswer, correctAnswers } = detail;
    const toLetter = (idx: number) => String.fromCharCode(65 + idx);

    if (question.type === 'multi_choice' && question.options) {
      if (type === 'user') {
        if (!userAnswer.selectedOptions || userAnswer.selectedOptions.length === 0) return 'Missed';
        const selectedText = userAnswer.selectedOptions[0];
        const idx = question.options.findIndex(opt => opt.text === selectedText);
        return idx !== -1 ? toLetter(idx) : selectedText;
      } else {
        if (!correctAnswers || correctAnswers.length === 0) return '-';
        const correctText = correctAnswers[0];
        const idx = question.options.findIndex(opt => opt.text === correctText);
        return idx !== -1 ? toLetter(idx) : correctText;
      }
    }

    if (type === 'user') {
      if (userAnswer.userAnswer) return userAnswer.userAnswer;
      if (userAnswer.selectedOptions?.length > 0) return userAnswer.selectedOptions.join(', ');
      return 'Missed';
    } else {
      return correctAnswers?.join(', ') || '-';
    }
  };

  if (!result || !stats) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center border border-slate-100">
          <XCircleIcon className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Không tìm thấy kết quả</h2>
          <p className="text-slate-500 mb-6">Không thể tải dữ liệu bài kiểm tra.</p>
          <Button variant="primary" onClick={() => navigate('/tests')}>
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const { score, testTitle, category, avLevel } = result;
  const isListening = category === 'listening';
  const displayLevel = getLevelGroup(avLevel);
  
  const theme = {
    gradient: isListening ? 'from-violet-600 via-fuchsia-600 to-purple-600' : 'from-cyan-500 via-blue-600 to-indigo-600',
    shadow: isListening ? 'shadow-fuchsia-500/30' : 'shadow-cyan-500/30',
    text: isListening ? 'text-fuchsia-600' : 'text-cyan-600',
    bg: isListening ? 'bg-fuchsia-50' : 'bg-cyan-50',
    border: isListening ? 'border-fuchsia-200' : 'border-cyan-200',
    lightBg: isListening ? 'bg-fuchsia-50/50' : 'bg-cyan-50/50',
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans pb-20">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-50 via-white to-slate-50 -z-10" />
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-purple-400/10 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Navigation */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/tests')}
            className="group flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-6 font-medium w-fit bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 shadow-sm hover:shadow-md"
          >
            <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Kiểm tra đầu vào</span>
          </button>
          
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-4">
              Kết quả <span className={clsx("text-transparent bg-clip-text bg-gradient-to-r", theme.gradient)}>đánh giá năng lực</span>
            </h1>
            <p className="text-lg text-slate-600 font-medium">{testTitle}</p>
          </div>
        </div>

        {/* Top Summary Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-xl shadow-slate-200/50 overflow-hidden mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-slate-50/50 -z-10" />
          
          <div className="p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-12">
            
            {/* Left: Score Circle & Level */}
            <div className="flex flex-col md:flex-row items-center gap-12 flex-1">
              <div className="relative w-56 h-56 flex-shrink-0">
                {/* Circular Progress */}
                <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl">
                  <circle
                    cx="112"
                    cy="112"
                    r="90"
                    stroke="#f1f5f9"
                    strokeWidth="16"
                    fill="transparent"
                  />
                  <circle
                    cx="112"
                    cy="112"
                    r="90"
                    stroke={score.percentage >= 50 ? "url(#gradient-score)" : "#f43f5e"}
                    strokeWidth="16"
                    fill="transparent"
                    strokeDasharray={565.48}
                    strokeDashoffset={565.48 - (565.48 * score.percentage) / 100}
                    className="transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient-score" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={isListening ? "#8b5cf6" : "#06b6d4"} />
                      <stop offset="100%" stopColor={isListening ? "#d946ef" : "#3b82f6"} />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={clsx("text-5xl font-black tracking-tighter", score.percentage >= 50 ? "text-slate-800" : "text-rose-600")}>
                    {stats.correct}<span className="text-3xl text-slate-400">/{result.detailedResults.length}</span>
                  </span>
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-2">Câu đúng</span>
                </div>
              </div>

              <div className="text-center md:text-left space-y-6">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 mb-3">
                    {score.percentage >= 80 ? "Xuất sắc!" : score.percentage >= 50 ? "Làm tốt lắm!" : "Cần cố gắng hơn!"}
                  </h2>
                  
                  {avLevel && (
                    <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 text-amber-800 font-bold text-xl shadow-sm mb-4">
                      <TrophyIcon className="w-6 h-6 text-amber-500" />
                      <span>Level: {displayLevel}</span>
                    </div>
                  )}
                  
                  <p className="text-slate-500 text-lg max-w-md leading-relaxed">
                    Bạn đã hoàn thành bài kiểm tra. Dưới đây là chi tiết kết quả và đánh giá năng lực của bạn.
                  </p>
                </div>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                  <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-2xl border border-emerald-100 shadow-sm">
                    <CheckCircleIcon className="w-5 h-5" />
                    <span className="font-bold text-lg">{stats.correct}</span> <span className="font-medium">Đúng</span>
                  </div>
                  <div className="flex items-center gap-2 bg-rose-50 text-rose-700 px-5 py-2.5 rounded-2xl border border-rose-100 shadow-sm">
                    <XCircleIcon className="w-5 h-5" />
                    <span className="font-bold text-lg">{stats.incorrect}</span> <span className="font-medium">Sai</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-100 text-slate-600 px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
                    <MinusCircleIcon className="w-5 h-5" />
                    <span className="font-bold text-lg">{stats.skipped}</span> <span className="font-medium">Bỏ qua</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex flex-col gap-4 w-full lg:w-80">
              <Button
                variant="primary"
                onClick={() => navigate(`/test/${testId}/result/details`, { state: { result } })}
                className={clsx(
                  "w-full py-4 rounded-2xl border-none text-lg font-bold shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1", 
                  `bg-gradient-to-r ${theme.gradient}`
                )}
              >
                <div className="flex items-center justify-center gap-2">
                  <EyeIcon className="w-6 h-6" />
                  <span>Xem chi tiết đáp án</span>
                </div>
              </Button>
              
              <Button
                variant="primary"
                onClick={() => navigate('/roadmap/setup')}
                className="w-full py-4 rounded-2xl border-none text-lg font-bold shadow-lg shadow-blue-200 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all hover:-translate-y-1"
              >
                <div className="flex items-center justify-center gap-2">
                  <MapIcon className="w-6 h-6" />
                  <span>Tạo lộ trình học</span>
                </div>
              </Button>

              <Button
                variant="ghost"
                onClick={() => navigate('/tests')}
                className="w-full py-3 rounded-2xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 font-semibold"
              >
                <div className="flex items-center justify-center gap-2">
                  <ArrowPathIcon className="w-5 h-5" />
                  <span>Làm lại bài kiểm tra</span>
                </div>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            {/* Statistics Table */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-lg overflow-hidden h-full">
              <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                <div className={clsx("p-2 rounded-xl", theme.bg)}>
                  <ChartBarIcon className={clsx("w-6 h-6", theme.text)} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Thống kê theo dạng bài</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50/80">
                      <th className="text-left py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Dạng câu hỏi</th>
                      <th className="text-center py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Tổng</th>
                      <th className="text-center py-4 px-6 font-bold text-emerald-600 uppercase tracking-wider text-xs">Đúng</th>
                      <th className="text-center py-4 px-6 font-bold text-rose-600 uppercase tracking-wider text-xs">Sai</th>
                      <th className="text-center py-4 px-6 font-bold text-slate-400 uppercase tracking-wider text-xs">Bỏ qua</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(stats.byType).map(([type, stat]) => (
                      <tr key={type} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6 font-semibold text-slate-700 capitalize">
                          {type.replace(/_/g, ' ')}
                        </td>
                        <td className="text-center py-4 px-6 text-slate-900 font-bold">{stat.total}</td>
                        <td className="text-center py-4 px-6">
                          <span className="inline-block min-w-[2rem] py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg">{stat.correct}</span>
                        </td>
                        <td className="text-center py-4 px-6">
                          <span className="inline-block min-w-[2rem] py-1 bg-rose-50 text-rose-700 font-bold rounded-lg">{stat.incorrect}</span>
                        </td>
                        <td className="text-center py-4 px-6 text-slate-400 font-medium">{stat.skipped}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
             {/* Recommendation Card */}
             <div className="bg-white rounded-[2rem] border border-slate-200 shadow-lg overflow-hidden h-full flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-amber-50/30">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
                  <SparklesIcon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Đánh giá & Lời khuyên</h3>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="prose prose-slate max-w-none mb-6 flex-1">
                  <p className="text-slate-600 leading-relaxed text-base">
                    {result.recommendation || "Bạn đã hoàn thành bài kiểm tra. Hãy xem lại chi tiết các câu trả lời để rút kinh nghiệm cho lần sau nhé!"}
                  </p>
                </div>
                
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 mt-auto">
                  <div className="flex items-start gap-3">
                    <AcademicCapIcon className="w-6 h-6 text-indigo-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-indigo-900 mb-1">Gợi ý lộ trình</h4>
                      <p className="text-sm text-indigo-700">
                        Dựa trên kết quả này, hệ thống đề xuất bạn nên bắt đầu với lộ trình <strong>{displayLevel || 'Cơ bản'}</strong>.
                      </p>
                    </div>
                  </div>
                  <Button 
                    fullWidth 
                    variant="primary"
                    onClick={() => navigate('/roadmap/setup')}
                    className="mt-4 justify-center py-3 rounded-xl border-none bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
                  >
                    Thiết lập lộ trình ngay
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full">
            {/* Answer Key List */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-lg overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                <div className={clsx("p-2 rounded-xl", theme.bg)}>
                  <ClipboardDocumentCheckIcon className={clsx("w-6 h-6", theme.text)} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Đáp án chi tiết</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-4">
                  {result.detailedResults.map((detail, index) => {
                    const isSkipped = 
                      (!detail.userAnswer.selectedOptions || detail.userAnswer.selectedOptions.length === 0) &&
                      (!detail.userAnswer.userAnswer || detail.userAnswer.userAnswer.trim() === '') &&
                      (!detail.userAnswer.matchingAnswers || detail.userAnswer.matchingAnswers.length === 0);
                    
                    const userLabel = getAnswerLabel(detail, 'user');
                    const correctLabel = getAnswerLabel(detail, 'correct');
                    
                    // Determine status color
                    let statusColor = 'bg-slate-100 text-slate-500'; // Skipped
                    if (!isSkipped) {
                      statusColor = detail.isCorrect 
                        ? 'bg-emerald-500 text-white shadow-emerald-200 shadow-md' 
                        : 'bg-rose-500 text-white shadow-rose-200 shadow-md';
                    } else {
                       statusColor = 'bg-slate-500 text-white';
                    }

                    return (
                      <div key={index} className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 rounded-lg px-2 transition-colors">
                        {/* Question Number Circle */}
                        <div className={clsx(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-transform hover:scale-110",
                          statusColor
                        )}>
                          {detail.questionNumber}
                        </div>

                        {/* Answer Comparison */}
                        <div className="flex items-center gap-3 text-sm font-medium flex-1">
                          <span className={clsx(
                            "font-bold",
                            isSkipped ? "text-slate-400 italic" : 
                            detail.isCorrect ? "text-emerald-600" : "text-rose-600"
                          )}>
                            {userLabel}
                          </span>
                          
                          {!detail.isCorrect && (
                            <>
                              <span className="text-slate-300">|</span>
                              <span className="text-emerald-600 font-bold">{correctLabel}</span>
                            </>
                          )}
                        </div>
                        
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TestSummaryPage;
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DetailedResult, TestResult } from '../../types';

interface PassageGroup {
  passage?: string;
  sectionTitle?: string;
  questions: DetailedResult[];
}

const buildPassageGroups = (details: DetailedResult[] = []): PassageGroup[] => {
  const groups: PassageGroup[] = [];

  details.forEach((detail) => {
    const passage = detail.question?.passage?.trim();
    const sectionTitle = detail.question?.sectionTitle?.trim();
    const lastGroup = groups[groups.length - 1];

    if (passage) {
      if (
        lastGroup &&
        lastGroup.passage === passage &&
        (lastGroup.sectionTitle || '') === (sectionTitle || '')
      ) {
        lastGroup.questions.push(detail);
      } else {
        groups.push({ passage, sectionTitle, questions: [detail] });
      }
    } else if (lastGroup && !lastGroup.passage) {
      lastGroup.questions.push(detail);
    } else {
      groups.push({ sectionTitle, questions: [detail] });
    }
  });

  return groups;
};

const TestResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Nhận kết quả được truyền từ trang làm bài thi
  const result = location.state?.result as TestResult | undefined;

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy kết quả</h1>
          <p className="text-gray-600 mb-4">Kết quả bài thi không tồn tại hoặc đã hết hạn.</p>
          <button
            onClick={() => navigate('/tests')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Quay lại danh sách bài thi
          </button>
        </div>
      </div>
    );
  }

  const groupedDetails = buildPassageGroups(Array.isArray(result.detailedResults) ? result.detailedResults : []);

  const getOptionLabel = (index: number) => String.fromCharCode(65 + index);

  const isSameText = (a?: string, b?: string) => (a || '').trim().toLowerCase() === (b || '').trim().toLowerCase();

  const renderOptionAnswers = (detail: DetailedResult) => {
    const options = Array.isArray(detail.question.options) ? detail.question.options : [];
    const selected = Array.isArray(detail.userAnswer.selectedOptions)
      ? detail.userAnswer.selectedOptions.map((opt) => (opt || '').trim())
      : [];
    const allowMultiple = Boolean((detail.question as any)?.allowMultiple);

    if (!options.length) {
      return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Không có đáp án để hiển thị.
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {options.map((option: any, optionIndex: number) => {
          const optionText = typeof option?.text === 'string' ? option.text : '';
          const isCorrect = Boolean(option?.isCorrect) || (detail.correctAnswers || []).some((answer) => isSameText(answer, optionText));
          const isSelected = selected.some((answer) => isSameText(answer, optionText));
          const isWrongSelection = isSelected && !isCorrect;
          const baseClasses = 'flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm transition-colors shadow-sm';
          const stateClasses = isCorrect
            ? 'border-emerald-500/80 bg-emerald-50 text-emerald-900'
            : isWrongSelection
              ? 'border-rose-500/80 bg-rose-50 text-rose-900'
              : 'border-slate-200 bg-white text-slate-700';

          return (
            <div key={`${detail.questionNumber}-option-${optionIndex}`} className={`${baseClasses} ${stateClasses}`}>
              <span
                className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
                  isCorrect
                    ? 'border-emerald-500/80 bg-white text-emerald-600'
                    : isWrongSelection
                      ? 'border-rose-400 bg-white text-rose-500'
                      : 'border-slate-300 text-slate-500'
                }`}
              >
                {getOptionLabel(optionIndex)}
              </span>
              <div className="flex-1">
                <p className="font-medium leading-relaxed">{optionText || '—'}</p>
                {isWrongSelection && (
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-rose-500">Đáp án bạn đã chọn</p>
                )}
                {isCorrect && (
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-emerald-600">Đáp án đúng</p>
                )}
              </div>
            </div>
          );
        })}
        {allowMultiple ? (
          <p className="text-xs text-slate-500">Có thể chọn nhiều đáp án.</p>
        ) : null}
      </div>
    );
  };

  const renderShortAnswer = (detail: DetailedResult) => {
    const userAnswer = (detail.userAnswer.userAnswer || '').trim();
    const answered = Boolean(userAnswer);
    const isCorrect = detail.isCorrect;
    const baseClasses = 'rounded-xl border px-4 py-3 text-sm font-medium';
    const stateClasses = isCorrect
      ? 'border-emerald-500/80 bg-emerald-50 text-emerald-700'
      : answered
        ? 'border-rose-500/80 bg-rose-50 text-rose-700'
        : 'border-rose-300/80 bg-rose-50 text-rose-600';

    return (
      <div className="space-y-3">
        <div className={`${baseClasses} ${stateClasses}`}>
          {answered ? userAnswer : 'Không trả lời'}
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm">
          <span className="font-semibold text-emerald-700">Đáp án đúng: </span>
          <span className="font-medium text-emerald-600">{(detail.correctAnswers || []).join(', ') || '—'}</span>
        </div>
      </div>
    );
  };

  const renderMatchingAnswer = (detail: DetailedResult) => {
    const expectedPairs = Array.isArray((detail.question as any)?.matchingPairs)
      ? (detail.question as any).matchingPairs
      : [];
    const submittedPairs = Array.isArray(detail.userAnswer.matchingAnswers) ? detail.userAnswer.matchingAnswers : [];

    if (!expectedPairs.length) {
      return renderOptionAnswers(detail);
    }

    return (
      <div className="space-y-3">
        {expectedPairs.map((pair: any, pairIndex: number) => {
          const prompt = pair?.prompt || '';
          const correctOption = pair?.correctOption || '';
          const userSelection = submittedPairs.find((answer) => isSameText(answer?.prompt, prompt));
          const selectedValue = userSelection?.selected || '';
          const hasSelection = Boolean(selectedValue);
          const isCorrect = hasSelection && isSameText(selectedValue, correctOption);
          const isWrong = hasSelection && !isCorrect;
          const baseClasses = 'rounded-2xl border px-4 py-3 text-sm transition-colors';
          const stateClasses = isCorrect
            ? 'border-emerald-500/80 bg-emerald-50 text-emerald-800'
            : isWrong
              ? 'border-rose-500/80 bg-rose-50 text-rose-800'
              : 'border-slate-200 bg-white text-slate-700';

          return (
            <div key={`${detail.questionNumber}-pair-${pairIndex}`} className={`${baseClasses} ${stateClasses}`}>
              <div className="font-semibold text-slate-800">{prompt}</div>
              <div className="mt-2 flex flex-col gap-1 text-sm">
                <span className="text-slate-600">
                  <span className="font-semibold">Bạn chọn: </span>
                  <span className={isWrong ? 'text-rose-600 font-medium' : 'text-slate-700'}>
                    {hasSelection ? selectedValue : 'Không trả lời'}
                  </span>
                </span>
                <span className="text-emerald-600">
                  <span className="font-semibold">Đáp án đúng: </span>
                  <span className="font-medium">{correctOption}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderAnswerBlock = (detail: DetailedResult) => {
    switch (detail.question.type) {
      case 'multi_choice':
      case 'dropdown':
        return renderOptionAnswers(detail);
      case 'matching':
        return renderMatchingAnswer(detail);
      case 'short_answer':
      default:
        return renderShortAnswer(detail);
    }
  };

  // Gán màu để trực quan hóa cấp độ ngôn ngữ AV
  const getLevelColor = (avLevel: string) => {
    const level = avLevel.toLowerCase();
    if (level.includes('av1') || level.includes('av2')) return 'text-red-600 bg-red-100';
    if (level.includes('av3') || level.includes('av4')) return 'text-yellow-600 bg-yellow-100';
    if (level.includes('av5') || level.includes('av6')) return 'text-green-600 bg-green-100';
    if (level.includes('av7')) return 'text-blue-600 bg-blue-100';
    return 'text-gray-600 bg-gray-100';
  };

  // Đổi màu điểm tổng theo mức độ đạt được
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50/80 py-10">
      <div className="mx-auto w-full max-w-[1300px] px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="mt-4 text-4xl font-bold text-slate-900">Kết quả bài kiểm tra</h1>
          <p className="mt-2 text-sm text-slate-500">Bạn đã hoàn thành bài kiểm tra đánh giá trình độ đầu vào</p>
          <p className="mt-3 text-lg font-semibold text-blue-600">{result.testTitle}</p>
        </div>

        {/* Score Overview */}
        <div className="rounded-3xl border border-blue-100 bg-white/95 p-8 shadow-xl shadow-blue-100/60 md:p-10">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Overall Score */}
            <div className="rounded-2xl bg-gradient-to-br from-white via-red-50/70 to-white px-6 py-6 text-center shadow-sm">
              <div className={`text-5xl font-bold ${getScoreColor(result.score.percentage)}`}>
                {result.score.percentage}%
              </div>
              <p className="mt-2 text-sm font-medium text-slate-600">Tổng điểm</p>
              <p className="text-xs text-slate-500">
                {result.score.earnedPoints}/{result.score.totalPoints} điểm
              </p>
            </div>

            {/* IELTS Score */}
            <div className="rounded-2xl bg-gradient-to-br from-white via-blue-50/70 to-white px-6 py-6 text-center shadow-sm">
              <div className="text-5xl font-bold text-blue-600">
                {result.ieltsScore}
              </div>
              <p className="mt-2 text-sm font-medium text-slate-600">Điểm IELTS tương đương</p>
            </div>

            {/* AV Level */}
            <div className="rounded-2xl bg-gradient-to-br from-white via-emerald-50/70 to-white px-6 py-6 text-center shadow-sm">
              <span className={`inline-flex items-center justify-center rounded-full px-5 py-2 text-lg font-semibold ${getLevelColor(result.avLevel)}`}>
                {result.avLevel}
              </span>
              <p className="mt-2 text-sm font-medium text-slate-600">Trình độ hiện tại</p>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="mt-10 rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 via-indigo-50/70 to-blue-50 p-7 shadow-inner">
          <h2 className="text-lg font-semibold text-blue-800">Khuyến nghị cho bạn</h2>
          <p className="mt-2 text-sm text-blue-700">{result.recommendation}</p>
        </div>

        {/* Detailed Results */}
        <div className="mt-10 rounded-3xl border border-slate-200/70 bg-white/95 p-8 shadow-lg shadow-slate-200/60 md:p-10">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">Chi tiết kết quả</h2>
            <span className="text-sm text-slate-500">
              {result.detailedResults?.length || 0} câu hỏi
            </span>
          </div>
          
          <div className="space-y-6">
            {groupedDetails.length > 0 ? (
              groupedDetails.map((group, groupIndex) => {
                const hasPassage = Boolean(group.passage);

                return (
                  <div key={groupIndex} className="space-y-4">
                    {hasPassage && (
                      <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6 shadow-inner">
                        {group.sectionTitle ? (
                          <div className="flex flex-col gap-2">
                            <h3 className="text-lg font-semibold text-blue-800">{group.sectionTitle}</h3>
                          </div>
                        ) : null}
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                          {group.passage}
                        </p>
                      </div>
                    )}

                    {group.questions.map((detail, index) => {
                      const showInlinePassage = !hasPassage && detail.question.passage;

                      return (
                        <div key={`${groupIndex}-${index}`} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-4">
                            <div>
                              <h3 className="text-base font-semibold text-slate-900">
                                Câu {detail.questionNumber}
                              </h3>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${
                                detail.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                              }`}>
                                {detail.isCorrect ? 'Đúng' : 'Sai'}
                              </span>
                            </div>
                          </div>

                          <div className="px-5 py-5 space-y-4">
                            <div>
                              <p className="text-sm text-slate-800 leading-relaxed">{detail.question.content}</p>
                              {showInlinePassage && (
                                <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{detail.question.passage}</p>
                                </div>
                              )}
                            </div>

                            {renderAnswerBlock(detail)}

                            {detail.explanation ? (
                              <div className="rounded-xl border border-amber-100 bg-amber-50/80 px-4 py-3">
                                <h4 className="text-xs font-semibold uppercase tracking-wide text-amber-600">Giải thích</h4>
                                <p className="mt-1 text-sm text-amber-700 leading-relaxed">{detail.explanation}</p>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center">Không có dữ liệu chi tiết</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => navigate('/tests')}
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-blue-600 hover:to-indigo-600"
          >
            Làm bài thi khác
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestResultPage;
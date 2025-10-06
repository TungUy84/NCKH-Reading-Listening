import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PlacementTest, UserAnswer } from '../types';
import { getTestForTaking, submitTest } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const TakeTestPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  
  const [test, setTest] = useState<PlacementTest | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTest = async () => {
      if (!testId) return;
      
      try {
        const response = await getTestForTaking(testId);
        if (response.test) {
          setTest(response.test);
          setTimeRemaining(response.test.timeLimit * 60); // Convert to seconds
          setAnswers(new Array(response.test.questions.length).fill({ 
            selectedOptions: [], 
            userAnswer: '' 
          }));
        } else {
          throw new Error('Không tìm thấy bài test');
        }
      } catch (error) {
        console.error('Error fetching test:', error);
        toast.error('❌ Không thể tải bài thi. Vui lòng thử lại.');
        navigate('/tests');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTest();
  }, [testId, navigate]);

  const handleSubmit = useCallback(async () => {
    if (!test || !testId) return;

    setIsSubmitting(true);
    try {
      const submission = {
        testId,
        answers: answers.map((answer, index) => ({
          questionId: test.questions[index]._id || `question_${index}`,
          selectedOptions: answer.selectedOptions,
          userAnswer: answer.userAnswer
        }))
      };
      
      const response = await submitTest(submission);
      if (response.result) {
        toast.success('🎉 Nộp bài thành công!');
        navigate(`/test/${testId}/result`, { state: { result: response.result } });
      } else {
        throw new Error('Không nhận được kết quả');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('❌ Không thể nộp bài. Vui lòng thử lại.');
      setIsSubmitting(false);
    }
  }, [test, testId, answers, navigate]);

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0 && test && !isSubmitting) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && test && !isSubmitting) {
      handleSubmit();
    }
  }, [timeRemaining, test, isSubmitting, handleSubmit]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionIndex: number, answer: UserAnswer) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answer;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (test && currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const typeLabel = (t: string) => {
    switch (t) {
      case 'multiple_choice': return 'Nhiều lựa chọn';
      case 'fill_blank': return 'Điền vào chỗ trống';
      case 'true_false_not_given': return 'True / False / Not Given';
      case 'yes_no_not_given': return 'Yes / No / Not Given';
      case 'summary_completion': return 'Tóm tắt';
      case 'matching': return 'Matching';
      case 'sentence_completion': return 'Hoàn thành câu';
      default: return t;
    }
  };

  // Scroll active question into view (must be before any early return)
  useEffect(() => {
    if (!isLoading && test) {
      const el = document.getElementById(`question-${currentQuestionIndex}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentQuestionIndex, isLoading, test]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-2xl border border-red-100" data-aos="zoom-in">
          <div className="text-8xl mb-6">❌</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">
            Không tìm thấy bài thi
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Bài thi này có thể đã bị xóa hoặc không khả dụng 😕
          </p>
          <button
            onClick={() => navigate('/tests')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <span className="mr-2">🔙</span>
            Quay lại danh sách bài thi
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];

  // Compute current section & its questions
  const currentSection = test.sections.find(s => s._id === currentQuestion.sectionId);
  const sectionQuestions = test.questions
    .map((q, idx) => ({ q, globalIndex: idx }))
    .filter(item => item.q.sectionId === currentQuestion.sectionId);

  const goToNextSection = () => {
    if (!currentSection) return;
    const currentSectionIndex = test.sections.findIndex(s => s._id === currentSection._id);
    const nextSection = test.sections[currentSectionIndex + 1];
    if (nextSection) {
      const firstQuestionIndex = test.questions.findIndex(q => q.sectionId === nextSection._id);
      if (firstQuestionIndex >= 0) setCurrentQuestionIndex(firstQuestionIndex);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky header */}
  <div className="sticky top-0 z-20 backdrop-blur border-b border-gray-200 bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-gray-900 leading-tight">{test.title}</h1>
            <p className="text-xs text-gray-500">Câu {currentQuestionIndex + 1} / {test.questions.length}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 rounded-md bg-blue-50 text-blue-600 font-mono text-sm tracking-wide">
              {formatTime(timeRemaining)}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              variant="danger"
              size="sm"
              loading={isSubmitting}
            >
              {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
            </Button>
          </div>
        </div>
        <div className="h-1 w-full bg-gray-200/70 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 opacity-40" />
          <div
            className="h-full relative bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 transition-all duration-300 shadow-sm"
            style={{ width: `${((currentQuestionIndex + 1) / test.questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Left column: Passage + navigation */}
            <div className="lg:col-span-5 space-y-6">
              {(() => {
                // Determine current section
                const section = test.sections.find(s => s._id === currentQuestion.sectionId);
                return (
                  <Card className="sticky top-[88px] max-h-[calc(100vh-120px)] overflow-y-auto hide-scrollbar" padding="lg">
                    <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h2 className="text-sm font-semibold text-gray-800">{section?.title || 'Phần hiện tại'}</h2>
                        <p className="text-xs text-gray-500">Đoạn văn / Tư liệu dùng cho các câu thuộc phần này</p>
                      </div>
                      <div className="text-[10px] uppercase tracking-wide bg-gray-100 text-gray-600 px-2 py-1 rounded-md">Section</div>
                    </div>
                    {section?.audio && (
                      <div className="mb-4">
                        <audio controls className="w-full">
                          <source src={section.audio} type="audio/mpeg" />
                          Trình duyệt của bạn không hỗ trợ phát audio.
                        </audio>
                      </div>
                    )}
                    {section?.image && (
                      <div className="mb-4">
                        <img src={section.image} alt="Section illustration" className="rounded-lg border border-gray-200 max-h-60 object-cover w-full" />
                      </div>
                    )}
                    {section?.passage ? (
                      <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {section.passage}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">Không có đoạn văn cho phần này.</p>
                    )}
                    {/* Quick mini section navigation if more than 1 section */}
                    {test.sections.length > 1 && (
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        <div className="text-xs font-medium text-gray-600 mb-2">Các phần khác</div>
                        <div className="flex flex-wrap gap-2">
                          {test.sections.map(sec => {
                            const firstQuestionIndex = test.questions.findIndex(q => q.sectionId === sec._id);
                            const isActive = sec._id === section?._id;
                            return (
                              <button
                                key={sec._id}
                                onClick={() => firstQuestionIndex >= 0 && goToQuestion(firstQuestionIndex)}
                                className={`px-3 py-1 rounded-md text-xs border transition ${isActive ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                              >
                                {sec.title}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })()}

              {/* Question navigation moved under passage on large screens */}
              <Card padding="md">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900 text-sm">Câu hỏi</h3>
                  <span className="text-xs text-gray-500">Chọn để chuyển nhanh</span>
                </div>
                <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2 mb-4">
                  {test.questions.map((_, index) => {
                    const answered = !!(answers[index]?.selectedOptions.length || answers[index]?.userAnswer);
                    const isCurrent = index === currentQuestionIndex;
                    return (
                      <button
                        key={index}
                        onClick={() => goToQuestion(index)}
                        className={`h-8 w-8 rounded-md text-xs font-medium flex items-center justify-center border transition ${
                          isCurrent
                            ? 'bg-blue-600 text-white border-blue-600 shadow'
                            : answered
                            ? 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
                            : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'
                        }`}
                        aria-label={`Câu ${index + 1}${answered ? ' đã trả lời' : ''}`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-3 mt-1">
                  <div className="flex items-center gap-1 text-[10px] text-gray-500"><span className="h-3 w-3 rounded-sm bg-blue-600 inline-block"></span>Hiện tại</div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-500"><span className="h-3 w-3 rounded-sm bg-green-400 inline-block border border-green-600"></span>Đã trả lời</div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-500"><span className="h-3 w-3 rounded-sm bg-gray-200 inline-block border border-gray-400"></span>Chưa trả lời</div>
                </div>
              </Card>
            </div>

          {/* Right column: All questions for current section */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">Phần hiện tại: {currentSection?.title}</h2>
              <span className="text-xs text-gray-500">Hiển thị {sectionQuestions.length} câu hỏi</span>
            </div>
            {sectionQuestions.map(({ q, globalIndex }) => {
              const answer = answers[globalIndex] || { selectedOptions: [], userAnswer: '' };
              const selectedCount = answer.selectedOptions.length;
              return (
                <Card key={q._id || globalIndex} padding="lg" id={`question-${globalIndex}`} className={globalIndex === currentQuestionIndex ? 'ring-1 ring-blue-300' : ''}>
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-blue-600 font-semibold mb-1">{typeLabel(q.type)}</div>
                      <div className="text-base font-medium text-gray-900">Câu {globalIndex + 1}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{q.points} điểm</div>
                      {selectedCount > 0 && (
                        <div className="text-[10px] text-green-600 font-medium">Đã chọn {selectedCount}</div>
                      )}
                    </div>
                  </div>
                  {q.media?.audioUrl && (
                    <div className="mb-4">
                      <audio controls className="w-full">
                        <source src={q.media.audioUrl} type="audio/mpeg" />
                        Trình duyệt của bạn không hỗ trợ phát audio.
                      </audio>
                    </div>
                  )}
                  <div className="text-gray-800 leading-relaxed mb-5">
                    {q.content}
                  </div>
                  <div className="space-y-4">
                    {q.type === 'multiple_choice' && (
                      <div className="flex flex-col gap-2">
                        {q.options?.map((option, optionIndex) => {
                          const selected = answer.selectedOptions.includes(option.text);
                          return (
                            <button
                              key={optionIndex}
                              type="button"
                              onClick={() => {
                                const newSelected = selected
                                  ? answer.selectedOptions.filter(item => item !== option.text)
                                  : [...answer.selectedOptions, option.text];
                                handleAnswerChange(globalIndex, {
                                  selectedOptions: newSelected,
                                  userAnswer: newSelected.join(', ')
                                });
                                setCurrentQuestionIndex(globalIndex); // focus highlight
                              }}
                              className={`relative w-full text-left px-4 py-3 rounded-lg border transition shadow-sm text-sm font-medium flex items-start gap-3 ${
                                selected
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                                  : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              <span className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold flex-shrink-0 ${
                                selected ? 'bg-white text-blue-600 border-blue-600' : 'bg-gray-100 text-gray-500 border-gray-300'
                              }`}>{String.fromCharCode(65 + optionIndex)}</span>
                              <span className="flex-1 leading-relaxed">{option.text}</span>
                              {selected && (
                                <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-white shadow-inner" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {q.type === 'fill_blank' && (
                      <div>
                        <textarea
                          value={answer.userAnswer || ''}
                          onChange={(e) => {
                            handleAnswerChange(globalIndex, {
                              selectedOptions: [],
                              userAnswer: e.target.value
                            });
                            setCurrentQuestionIndex(globalIndex);
                          }}
                          placeholder="Nhập câu trả lời của bạn..."
                          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white shadow-sm"
                          rows={4}
                        />
                        <p className="mt-2 text-xs text-gray-500">Trả lời bằng tiếng Anh, kiểm tra lỗi chính tả trước khi nộp.</p>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-gray-500">Phần này có {sectionQuestions.length} câu.</div>
              {(() => {
                const currentSectionIndex = currentSection ? test.sections.findIndex(s => s._id === currentSection._id) : -1;
                const hasNextSection = currentSectionIndex >= 0 && currentSectionIndex < test.sections.length - 1;
                if (hasNextSection) {
                  return (
                    <Button variant="secondary" size="sm" onClick={goToNextSection}>Sang phần tiếp →</Button>
                  );
                }
                return (
                  <Button variant="danger" size="sm" onClick={handleSubmit} disabled={isSubmitting} loading={isSubmitting}>
                    {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
                  </Button>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeTestPage;

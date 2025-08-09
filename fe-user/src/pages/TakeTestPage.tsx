import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlacementTest, UserAnswer } from '../types';
import { getTestForTaking, submitTest } from '../services/api';

const TakeTestPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  
  const [test, setTest] = useState<PlacementTest | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setError('Không thể tải bài thi. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTest();
  }, [testId]);

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
        navigate(`/test/${testId}/result`, { state: { result: response.result } });
      } else {
        throw new Error('Không nhận được kết quả');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setError('Không thể nộp bài. Vui lòng thử lại.');
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Lỗi</h1>
          <p className="text-gray-600 mb-4">{error || 'Không tìm thấy bài thi'}</p>
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

  const currentQuestion = test.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with timer and progress */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{test.title}</h1>
              <p className="text-sm text-gray-500">
                Câu {currentQuestionIndex + 1} / {test.questions.length}
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-lg font-mono text-blue-600">
                {formatTime(timeRemaining)}
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
              </button>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / test.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Question navigation sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Câu hỏi</h3>
              <div className="grid grid-cols-5 gap-2">
                {test.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToQuestion(index)}
                    className={`w-10 h-10 rounded text-sm font-medium ${
                      index === currentQuestionIndex
                        ? 'bg-blue-600 text-white'
                        : answers[index]?.selectedOptions.length > 0 || answers[index]?.userAnswer
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-gray-100 text-gray-600 border border-gray-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main question area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-8">
              {/* Question content */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-blue-600">
                    {currentQuestion.type === 'single_choice' ? 'Một lựa chọn' :
                     currentQuestion.type === 'multiple_choice' ? 'Nhiều lựa chọn' :
                     currentQuestion.type === 'fill_blank' ? 'Điền vào chỗ trống' : 'Tự luận'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {currentQuestion.points} điểm
                  </span>
                </div>
                
                {/* Audio player for listening questions */}
                {currentQuestion.media?.audioUrl && (
                  <div className="mb-6">
                    <audio controls className="w-full">
                      <source src={currentQuestion.media.audioUrl} type="audio/mpeg" />
                      Trình duyệt của bạn không hỗ trợ phát audio.
                    </audio>
                  </div>
                )}

                {/* Reading passage */}
                {currentQuestion.passage && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Đoạn văn:</h4>
                    <div className="text-gray-700 whitespace-pre-wrap">
                      {currentQuestion.passage}
                    </div>
                  </div>
                )}

                {/* Question text */}
                <div className="text-lg text-gray-900 mb-6">
                  <span className="font-medium">Câu {currentQuestionIndex + 1}:</span>{' '}
                  {currentQuestion.content}
                </div>
              </div>

              {/* Answer options */}
              <div className="space-y-3">
                {currentQuestion.type === 'single_choice' && currentQuestion.options?.map((option, optionIndex) => (
                  <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${currentQuestionIndex}`}
                      value={option.text}
                      checked={answers[currentQuestionIndex]?.selectedOptions[0] === option.text}
                      onChange={(e) => handleAnswerChange(currentQuestionIndex, {
                        selectedOptions: [e.target.value],
                        userAnswer: e.target.value
                      })}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-gray-700">{option.text}</span>
                  </label>
                ))}

                {currentQuestion.type === 'multiple_choice' && currentQuestion.options?.map((option, optionIndex) => (
                  <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      value={option.text}
                      checked={answers[currentQuestionIndex]?.selectedOptions.includes(option.text)}
                      onChange={(e) => {
                        const currentAnswer = answers[currentQuestionIndex] || { selectedOptions: [], userAnswer: '' };
                        const newSelected = e.target.checked
                          ? [...currentAnswer.selectedOptions, option.text]
                          : currentAnswer.selectedOptions.filter(item => item !== option.text);
                        
                        handleAnswerChange(currentQuestionIndex, {
                          selectedOptions: newSelected,
                          userAnswer: newSelected.join(', ')
                        });
                      }}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-gray-700">{option.text}</span>
                  </label>
                ))}

                {(currentQuestion.type === 'fill_blank' || currentQuestion.type === 'essay') && (
                  <textarea
                    value={answers[currentQuestionIndex]?.userAnswer || ''}
                    onChange={(e) => handleAnswerChange(currentQuestionIndex, {
                      selectedOptions: [],
                      userAnswer: e.target.value
                    })}
                    placeholder="Nhập câu trả lời của bạn..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={currentQuestion.type === 'essay' ? 6 : 2}
                  />
                )}
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={prevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Câu trước
                </button>
                
                {currentQuestionIndex === test.questions.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
                  </button>
                ) : (
                  <button
                    onClick={nextQuestion}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Câu tiếp →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeTestPage;

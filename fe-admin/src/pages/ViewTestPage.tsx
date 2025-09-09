import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PlacementTest } from '../types';
import { getPlacementTestById } from '../services/api';

const ViewTestPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const [test, setTest] = useState<PlacementTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTest = useCallback(async () => {
    try {
      setLoading(true);
      const test = await getPlacementTestById(testId!);
      console.log('Loaded test data:', test);
      console.log('Test sections:', test.sections);
      console.log('Test questions:', test.questions);
      if (test.questions && test.questions.length > 0) {
        console.log('First question sample:', test.questions[0]);
      }
      setTest(test);
    } catch (error: any) {
      console.error('Fetch test error:', error);
      setError(error.message || 'Không thể tải chi tiết bài test');
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    if (testId) {
      fetchTest();
    }
  }, [testId, fetchTest]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Lỗi</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <div className="mt-6">
            <Link
              to="/admin/placement-tests"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link
            to="/admin/placement-tests"
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết bài test</h1>
            <p className="text-gray-600 mt-1">Xem thông tin đầy đủ của bài kiểm tra</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link
            to={`/admin/placement-tests/${test._id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Chỉnh sửa
          </Link>
        </div>
      </div>

      {/* Test Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="border-b border-gray-200 pb-4 mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{test.title}</h2>
          <p className="text-gray-600 mb-4">{test.description}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-sm text-gray-500">Loại:</span>
              <p className="font-medium text-gray-900">{test.category}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Số câu:</span>
              <p className="font-medium text-gray-900">{test.totalQuestions} câu</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Thời gian:</span>
              <p className="font-medium text-gray-900">{test.timeLimit} phút</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Trạng thái:</span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                test.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {test.isActive ? 'Hoạt động' : 'Tạm dừng'}
              </span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        {test.instructions && test.instructions.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Hướng dẫn</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {test.instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Sections */}
      {test.sections && test.sections.length > 0 ? (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">Các phần ({test.sections.length})</h3>
          
          {test.sections.map((section: any, sectionIndex: number) => (
            <div key={sectionIndex} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h4 className="text-lg font-medium text-gray-900">
                  Phần {sectionIndex + 1}
                  {section.title && ` - ${section.title}`}
                </h4>
              </div>
              
              <div className="p-6">
                {/* Passage */}
                {section.passage && (
                  <div className="mb-6">
                    <h5 className="text-md font-medium text-gray-900 mb-3">Đoạn văn:</h5>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {section.passage}
                      </p>
                    </div>
                  </div>
                )}

                {/* Audio/Image */}
                {section.audio && (
                  <div className="mb-6">
                    <h5 className="text-md font-medium text-gray-900 mb-3">Audio:</h5>
                    <audio controls className="w-full">
                      <source src={section.audio} type="audio/mpeg" />
                      Trình duyệt không hỗ trợ audio.
                    </audio>
                  </div>
                )}

                {section.image && (
                  <div className="mb-6">
                    <h5 className="text-md font-medium text-gray-900 mb-3">Hình ảnh:</h5>
                    <img src={section.image} alt={`Section ${sectionIndex + 1} content`} className="max-w-full h-auto rounded-lg border" />
                  </div>
                )}

                {/* Questions for this section from test.questions */}
                {test.questions && test.questions.length > 0 && test.sections && (() => {
                  // Lấy section ID từ sections array
                  const currentSection = test.sections[sectionIndex];
                  const sectionQuestions = test.questions.filter((q: any) => {
                    return q.sectionId === (currentSection as any)?._id || q.sectionIndex === sectionIndex;
                  });
                  // Hiển thị câu hỏi nếu có
                  return sectionQuestions.length > 0 ? (
                    <div>
                      <h5 className="text-md font-medium text-gray-900 mb-4">
                        Câu hỏi ({sectionQuestions.length})
                      </h5>
                      <div className="space-y-4">
                        {sectionQuestions.map((question: any, questionIndex: number) => (
                          <div key={question._id || questionIndex} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                                {question.questionNumber || questionIndex + 1}
                              </span>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 mb-2">
                                  {question.content || question.question || question.text}
                                </p>
                                {/* Instructions */}
                                {question.instructions && (
                                  <p className="text-sm text-gray-600 italic mb-2">
                                    {question.instructions}
                                  </p>
                                )}
                                <div className="text-sm text-gray-500 mb-3">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-2">
                                    {question.type}
                                  </span>
                                  <span className="text-gray-600">{question.points || 1} điểm</span>
                                </div>
                                {/* Options cho các câu hỏi trắc nghiệm */}
                                {question.options && question.options.length > 0 && (
                                  <div className="space-y-2 mb-3">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Các lựa chọn:</p>
                                    {question.options.map((option: any, optionIndex: number) => (
                                      <div
                                        key={option._id || optionIndex}
                                        className="p-2 rounded text-sm bg-gray-50 border border-gray-200 text-gray-700"
                                      >
                                        <div className="flex items-center">
                                          <span className="font-medium mr-2">
                                            {String.fromCharCode(65 + optionIndex)}.
                                          </span>
                                          {option.text}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                {/* Đáp án đúng */}
                                {(() => {
                                  // Tìm đáp án đúng từ nhiều nguồn khác nhau
                                  let correctAnswer = '';
                                  let correctOptionLetter = '';
                                  
                                  // 1. Kiểm tra correctAnswer (string)
                                  if (question.correctAnswer) {
                                    correctAnswer = question.correctAnswer;
                                  }
                                  // 2. Kiểm tra correctAnswers (array) - cho câu điền từ
                                  else if (question.correctAnswers && question.correctAnswers.length > 0) {
                                    correctAnswer = question.correctAnswers.join(' hoặc ');
                                  }
                                  // 3. Tìm từ options có isCorrect = true - cho câu trắc nghiệm
                                  else if (question.options && question.options.length > 0) {
                                    const correctOptionIndex = question.options.findIndex((opt: any) => opt.isCorrect === true);
                                    if (correctOptionIndex !== -1) {
                                      correctAnswer = question.options[correctOptionIndex].text;
                                      correctOptionLetter = String.fromCharCode(65 + correctOptionIndex); // A, B, C, D...
                                    }
                                  }
                                  
                                  return correctAnswer ? (
                                    <div className="text-sm mb-3 p-2 bg-green-50 border border-green-200 rounded">
                                      <span className="font-medium text-green-800">Đáp án đúng: </span>
                                      <span className="text-green-700 font-medium">
                                        {correctOptionLetter && `${correctOptionLetter}. `}{correctAnswer}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="text-sm mb-3 p-2 bg-red-50 border border-red-200 rounded">
                                      <span className="font-medium text-red-800">Không tìm thấy đáp án đúng trong dữ liệu</span>
                                    </div>
                                  );
                                })()}
                                
                                {/* Giải thích */}
                                {question.explanation && (
                                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                                    <span className="text-sm font-medium text-blue-800">Giải thích: </span>
                                    <span className="text-sm text-blue-700">{question.explanation}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Questions */}
                {section.questions && section.questions.length > 0 && (
                  <div>
                    <h5 className="text-md font-medium text-gray-900 mb-4">
                      Câu hỏi ({section.questions.length})
                    </h5>
                    
                    <div className="space-y-4">
                      {section.questions.map((question: any, questionIndex: number) => (
                        <div key={questionIndex} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                              {questionIndex + 1}
                            </span>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 mb-2">
                                {question.text || question.content}
                              </p>
                              
                              <div className="text-sm text-gray-500 mb-3">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-2">
                                  {question.type}
                                </span>
                                {question.points && (
                                  <span className="text-gray-600">{question.points} điểm</span>
                                )}
                              </div>

                              {/* Options */}
                              {question.options && question.options.length > 0 && (
                                <div className="space-y-2">
                                  {question.options.map((option: any, optionIndex: number) => (
                                    <div 
                                      key={optionIndex} 
                                      className={`p-2 rounded text-sm ${
                                        option.isCorrect 
                                          ? 'bg-green-50 border border-green-200 text-green-800' 
                                          : 'bg-gray-50 border border-gray-200 text-gray-700'
                                      }`}
                                    >
                                      <div className="flex items-center">
                                        <span className="font-medium mr-2">
                                          {String.fromCharCode(65 + optionIndex)}.
                                        </span>
                                        {option.text}
                                        {option.isCorrect && (
                                          <svg className="w-4 h-4 ml-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                          </svg>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Correct Answers for other question types */}
                              {(!question.options || question.options.length === 0) && question.correctAnswers && question.correctAnswers.length > 0 && (
                                <div className="mt-3">
                                  <span className="text-sm font-medium text-gray-700">Đáp án đúng: </span>
                                  <span className="text-sm text-green-700 font-medium">
                                    {question.correctAnswers.join(', ')}
                                  </span>
                                </div>
                              )}

                              {/* Explanation */}
                              {question.explanation && (
                                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                                  <span className="text-sm font-medium text-blue-800">Giải thích: </span>
                                  <span className="text-sm text-blue-700">{question.explanation}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Fallback for old format tests without sections
        test.questions && test.questions.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Câu hỏi ({test.questions.length})</h3>
            
            <div className="space-y-4">
              {test.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                      {questionIndex + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-2">{question.content}</p>
                      
                      <div className="text-sm text-gray-500 mb-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-2">
                          {question.type}
                        </span>
                        <span className="text-gray-600">{question.points} điểm</span>
                      </div>

                      {question.options && question.options.length > 0 && (
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <div 
                              key={optionIndex} 
                              className={`p-2 rounded text-sm ${
                                option.isCorrect 
                                  ? 'bg-green-50 border border-green-200 text-green-800' 
                                  : 'bg-gray-50 border border-gray-200 text-gray-700'
                              }`}
                            >
                              <div className="flex items-center">
                                <span className="font-medium mr-2">
                                  {String.fromCharCode(65 + optionIndex)}.
                                </span>
                                {option.text}
                                {option.isCorrect && (
                                  <svg className="w-4 h-4 ml-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default ViewTestPage;

// TestResultPage component
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TestResult } from '../types';

const TestResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
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

  const getLevelColor = (avLevel: string) => {
    const level = avLevel.toLowerCase();
    if (level.includes('av1') || level.includes('av2')) return 'text-red-600 bg-red-100';
    if (level.includes('av3') || level.includes('av4')) return 'text-yellow-600 bg-yellow-100';
    if (level.includes('av5') || level.includes('av6')) return 'text-green-600 bg-green-100';
    if (level.includes('av7')) return 'text-blue-600 bg-blue-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kết quả bài thi</h1>
          <p className="text-gray-600">Bạn đã hoàn thành bài thi placement test</p>
          <p className="text-lg font-medium text-blue-600 mt-2">{result.testTitle}</p>
        </div>

        {/* Score Overview */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Score */}
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${getScoreColor(result.score.percentage)}`}>
                {result.score.percentage}%
              </div>
              <p className="text-gray-600">Tổng điểm</p>
              <p className="text-sm text-gray-500">
                {result.score.earnedPoints}/{result.score.totalPoints} điểm
              </p>
            </div>

            {/* IELTS Score */}
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {result.ieltsScore}
              </div>
              <p className="text-gray-600">Điểm IELTS tương đương</p>
            </div>

            {/* AV Level */}
            <div className="text-center">
              <div className={`inline-block px-4 py-2 rounded-full text-lg font-semibold mb-2 ${getLevelColor(result.avLevel)}`}>
                {result.avLevel}
              </div>
              <p className="text-gray-600">Trình độ hiện tại</p>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Khuyến nghị cho bạn</h2>
          <p className="text-blue-800">{result.recommendation}</p>
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Chi tiết kết quả</h2>
          
          <div className="space-y-4">
            {result.detailedResults && result.detailedResults.length > 0 ? 
              result.detailedResults.map((detail, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-gray-900">
                      Câu {detail.questionNumber}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        detail.isCorrect 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {detail.isCorrect ? 'Đúng' : 'Sai'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {detail.pointsEarned} điểm
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-gray-900 mb-2">{detail.question.content}</p>
                    {detail.question.passage && (
                      <div className="bg-gray-50 p-3 rounded mb-2">
                        <p className="text-sm text-gray-700">{detail.question.passage}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Câu trả lời của bạn:</h4>
                      <p className={`text-sm ${detail.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {detail.userAnswer.selectedOptions.length > 0 
                          ? detail.userAnswer.selectedOptions.join(', ') 
                          : detail.userAnswer.userAnswer || 'Không trả lời'}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Đáp án đúng:</h4>
                      <p className="text-sm text-green-600">
                        {detail.correctAnswers.join(', ')}
                      </p>
                    </div>
                  </div>

                  {detail.explanation && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Giải thích:</h4>
                      <p className="text-sm text-gray-600">{detail.explanation}</p>
                    </div>
                  )}
                </div>
              )) : (
                <p className="text-gray-500 text-center">Không có dữ liệu chi tiết</p>
              )
            }
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate('/tests')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Làm bài thi khác
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestResultPage;
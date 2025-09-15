import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { uploadTestFile, createPlacementTest } from '../services/api';

interface PreviewQuestion {
  type: string;
  content: string;
  options?: string[];
  correctAnswers?: string[];
  points: number;
  skill: string;
  passage?: string;
}

interface PreviewTest {
  title: string;
  description: string;
  category: string;
  timeLimit: number;
  instructions: string[];
  questions: PreviewQuestion[];
}

const ImportTestPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploading, setUploading] = useState(false);
  const [previewTest, setPreviewTest] = useState<PreviewTest | null>(null);
  const [applying, setApplying] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.docx')) {
      toast.error('Chỉ chấp nhận file Word (.docx)');
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('testFile', file);
      
      const response = await uploadTestFile(formData);
      
      if (response.previewTest) {
        setPreviewTest(response.previewTest);
      } else {
        throw new Error('Không thể xử lý file');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Lỗi khi upload file. Vui lòng kiểm tra format và thử lại.';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleApply = async () => {
    if (!previewTest) return;

    setApplying(true);
    try {
      const testData = {
        title: previewTest.title,
        description: previewTest.description,
        category: previewTest.category as 'listening' | 'reading' | 'general',
        timeLimit: previewTest.timeLimit,
        instructions: previewTest.instructions,
        isActive: true,
        questions: previewTest.questions.map(q => ({
          type: q.type as 'single_choice' | 'multiple_choice' | 'fill_blank' | 'essay',
          content: q.content,
          skill: q.skill as 'listening' | 'reading' | 'grammar' | 'vocabulary',
          passage: q.passage,
          options: q.options?.map(text => ({ text, isCorrect: false })) || [],
          correctAnswers: q.correctAnswers || [],
          points: q.points,
          explanation: ''
        }))
      };

      await createPlacementTest(testData);
      toast.success('Đã tạo bài test thành công!');
      navigate('/admin/placement-tests');
    } catch (error: any) {
      const errorMessage = error.message || 'Lỗi khi tạo bài test. Vui lòng thử lại.';
      toast.error(errorMessage);
    } finally {
      setApplying(false);
    }
  };

  const resetForm = () => {
    setPreviewTest(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Import bài kiểm tra đầu vào</h1>
          <p className="text-gray-600 mt-1">Upload file Word để tạo bài kiểm tra mới</p>
        </div>
        <button
          onClick={() => navigate('/admin/placement-tests')}
          className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Quay lại</span>
        </button>
      </div>

      {!previewTest ? (
        /* Upload Section */
        <div className="max-w-2xl mx-auto">
          {/* File Format Guide */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Format file Word yêu cầu</h3>
            <div className="text-blue-800 space-y-2">
              <p><strong>Cấu trúc file:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Tiêu đề:</strong> Dòng đầu tiên là tiêu đề bài test</li>
                <li><strong>Mô tả:</strong> Dòng thứ 2 là mô tả bài test</li>
                <li><strong>Loại:</strong> listening/reading/general</li>
                <li><strong>Thời gian:</strong> Số phút (ví dụ: 60)</li>
                <li><strong>Hướng dẫn:</strong> Mỗi hướng dẫn trên một dòng</li>
                <li><strong>---</strong> (Dấu phân cách)</li>
                <li><strong>Câu hỏi:</strong> Theo format cụ thể</li>
              </ul>
              <p className="mt-3"><strong>Format câu hỏi:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Q[số]: [nội dung câu hỏi] (Skill: listening/reading, Points: số điểm)</li>
                <li>A) [đáp án A]</li>
                <li>B) [đáp án B] *</li>
                <li>C) [đáp án C]</li>
                <li>D) [đáp án D]</li>
              </ul>
              <p className="text-sm italic">* Đáp án đúng được đánh dấu bằng dấu sao</p>
            </div>
          </div>

          {/* Upload Area */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <div className="mt-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    {uploading ? 'Đang xử lý file...' : 'Chọn file Word (.docx)'}
                  </span>
                  <input
                    ref={fileInputRef}
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    accept=".docx"
                    className="sr-only"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  Chỉ chấp nhận file .docx, tối đa 10MB
                </p>
              </div>
              {uploading && (
                <div className="mt-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Preview Section */
        <div className="space-y-6">
          {/* Test Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin bài test</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                <p className="text-gray-900">{previewTest.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại</label>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {previewTest.category}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian</label>
                <p className="text-gray-900">{previewTest.timeLimit} phút</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số câu hỏi</label>
                <p className="text-gray-900">{previewTest.questions.length} câu</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <p className="text-gray-900">{previewTest.description}</p>
              </div>
            </div>
          </div>

          {/* Questions Preview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Danh sách câu hỏi ({previewTest.questions.length} câu)
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {previewTest.questions.map((question, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">Câu {index + 1}</h3>
                    <div className="flex space-x-2">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {question.skill}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {question.points} điểm
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-2">{question.content}</p>
                  {question.passage && (
                    <div className="bg-gray-50 p-3 rounded mb-2">
                      <p className="text-sm text-gray-600 font-medium mb-1">Đoạn văn:</p>
                      <p className="text-sm text-gray-700">{question.passage}</p>
                    </div>
                  )}
                  {question.options && question.options.length > 0 && (
                    <div className="space-y-1">
                      {question.options.map((option, optIndex) => (
                        <div 
                          key={optIndex} 
                          className={`text-sm p-2 rounded ${
                            question.correctAnswers?.includes(option) 
                              ? 'bg-green-50 text-green-800 border border-green-200' 
                              : 'bg-gray-50 text-gray-700'
                          }`}
                        >
                          {String.fromCharCode(65 + optIndex)}) {option}
                          {question.correctAnswers?.includes(option) && (
                            <span className="ml-2 text-green-600">✓</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <button
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Upload file khác
            </button>
            <div className="space-x-3">
              <button
                onClick={() => navigate('/admin/placement-tests')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleApply}
                disabled={applying}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {applying && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{applying ? 'Đang tạo...' : 'Áp dụng'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportTestPage;

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PlacementTestAPI } from '../services/api';
import ContentEditor from '../components/ContentEditor';
import { PlacementTest, TestSection, Question } from '../types';

const EditTestPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  
  // Tab state - using string union type
  const [activeTab, setActiveTab] = useState('basic' as 'basic' | 'content');

  // Basic Info State
  const [test, setTest] = useState<PlacementTest | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'reading' | 'listening' | 'general'>('reading');
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [timeLimit, setTimeLimit] = useState(30);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Content State - adapted to work with ContentEditor's expected interface
  const [sections, setSections] = useState<TestSection[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedSection, setSelectedSection] = useState<number>(0);
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);

  const loadTest = useCallback(async () => {
    try {
      setLoading(true);
      const testData = await PlacementTestAPI.getTestById(testId!);
      
      setTest(testData);
      setTitle(testData.title);
      setDescription(testData.description);
      setCategory(testData.category);
      setInstructions(testData.instructions || ['']);
      setTimeLimit(testData.timeLimit || 30);
      
      // Convert backend data structure to ContentEditor format
      console.log('Backend Data Debug:', {
        testData,
        sections: testData.sections,
        questions: testData.questions,
        sectionsLength: testData.sections?.length,
        questionsLength: testData.questions?.length
      });
      
      if (testData.sections && testData.questions) {
        // Group questions by sectionId
        const sectionsWithQuestions = testData.sections.map((section: any, index: number) => {
          const sectionQuestions = testData.questions.filter((q: any) => 
            q.sectionId === section._id || q.sectionId === section.sectionId
          );
          
          console.log(`Section ${index} Debug:`, {
            section,
            sectionId: section._id,
            sectionQuestions,
            allQuestions: testData.questions.map((q: any) => ({
              id: q._id,
              sectionId: q.sectionId,
              content: q.content || q.text
            }))
          });
          
          return {
            sectionId: index,
            title: section.title || `Phần ${index + 1}`,
            passage: section.passage || '',
            audio: section.audio || '',
            audioUrl: section.audioUrl || section.audio || '',
            image: section.image || '',
            imageUrl: section.imageUrl || section.image || '',
            questions: sectionQuestions.map((q: any, qIndex: number) => ({
              _id: q._id,
              questionId: qIndex,
              type: q.type,
              content: q.content || q.text || '',
              text: q.content || q.text || '',
              options: q.options || [],
              correctAnswers: q.correctAnswers || [],
              points: q.points || 1,
              explanation: q.explanation || ''
            }))
          };
        });
        
        setSections(sectionsWithQuestions);
        setQuestions(testData.questions); // Keep original questions for API calls
        
        if (sectionsWithQuestions.length > 0) {
          setSelectedSection(0);
        }
      } else if (testData.sections) {
        setSections(testData.sections);
        if (testData.sections.length > 0) {
          setSelectedSection(0);
        }
      }
      
      if (testData.questions) {
        setQuestions(testData.questions);
      }
      
    } catch (err: any) {
      console.error('EditTestPage - Error loading test:', err);
      toast.error(err.message || 'Không thể tải thông tin bài test');
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    if (testId) {
      loadTest();
    } else {
      toast.error('Không tìm thấy ID bài test trong URL');
      setLoading(false);
    }
  }, [testId, loadTest]); // Include loadTest since it's wrapped in useCallback

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setSaving(true);

      await PlacementTestAPI.updateTestInfo(testId!, {
        title: title.trim(),
        description: description.trim(),
        category,
        instructions: instructions.filter(inst => inst.trim()),
        timeLimit
      });

      // Also update content if we have sections/questions
      if (sections.length > 0 || questions.length > 0) {
        await PlacementTestAPI.updateTestContent(testId!, {
          sections,
          questions
        });
      }

      toast.success('Đã lưu bài test thành công!');
      navigate('/admin/placement-tests');
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra khi lưu bài test');
    } finally {
      setSaving(false);
    }
  };

  const addInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      setInstructions(instructions.filter((_, i) => i !== index));
    }
  };

  // Content management functions - adapted to ContentEditor interface
  const handleAddSection = () => {
    const newSection: TestSection = {
      sectionId: sections.length,
      title: `Phần ${sections.length + 1}`,
      passage: '',
      audio: '',
      audioUrl: '',
      image: '',
      imageUrl: '',
      questions: []
    };
    setSections([...sections, newSection]);
    setSelectedSection(sections.length);
  };

  const handleUpdateSection = (sectionIndex: number, updates: Partial<TestSection>) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], ...updates };
    setSections(updatedSections);
  };

  const handleDeleteSection = (sectionIndex: number) => {
    const updatedSections = sections.filter((_, index) => index !== sectionIndex);
    // Reindex remaining sections
    const reindexedSections = updatedSections.map((section, index) => ({
      ...section,
      sectionId: index
    }));
    setSections(reindexedSections);
    
    if (selectedSection === sectionIndex) {
      setSelectedSection(reindexedSections.length > 0 ? 0 : 0);
    } else if (selectedSection > sectionIndex) {
      setSelectedSection(selectedSection - 1);
    }
  };

  const handleAddQuestion = (sectionIndex?: number) => {
    const targetSection = sectionIndex ?? selectedSection ?? 0;
    const newQuestion: Question = {
      questionId: questions.length,
      type: 'single_choice',
      content: '',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ],
      correctAnswers: [],
      points: 1
    };
    
    setQuestions([...questions, newQuestion]);
    
    // Add question to section
    const updatedSections = [...sections];
    if (updatedSections[targetSection]) {
      updatedSections[targetSection].questions = updatedSections[targetSection].questions || [];
      updatedSections[targetSection].questions.push(newQuestion);
      setSections(updatedSections);
    }
  };

  const handleUpdateQuestion = (sectionIndex: number, questionIndex: number, updates: Partial<Question>) => {
    // Update in questions array
    const updatedQuestions = [...questions];
    const globalQuestionIndex = questions.findIndex(q => q.questionId === questionIndex);
    if (globalQuestionIndex !== -1) {
      updatedQuestions[globalQuestionIndex] = { ...updatedQuestions[globalQuestionIndex], ...updates };
      setQuestions(updatedQuestions);
    }

    // Update in sections
    const updatedSections = [...sections];
    if (updatedSections[sectionIndex] && updatedSections[sectionIndex].questions) {
      const sectionQuestionIndex = updatedSections[sectionIndex].questions!.findIndex(q => q.questionId === questionIndex);
      if (sectionQuestionIndex !== -1) {
        updatedSections[sectionIndex].questions![sectionQuestionIndex] = 
          { ...updatedSections[sectionIndex].questions![sectionQuestionIndex], ...updates };
        setSections(updatedSections);
      }
    }
  };

  const handleDeleteQuestion = (sectionIndex: number, questionIndex: number) => {
    // Remove from questions array
    const updatedQuestions = questions.filter(q => q.questionId !== questionIndex);
    setQuestions(updatedQuestions);

    // Remove from section
    const updatedSections = [...sections];
    if (updatedSections[sectionIndex] && updatedSections[sectionIndex].questions) {
      updatedSections[sectionIndex].questions = updatedSections[sectionIndex].questions!.filter(q => q.questionId !== questionIndex);
      setSections(updatedSections);
    }
  };

  const handleAddOption = (sectionIndex: number, questionIndex: number) => {
    const question = questions.find(q => q.questionId === questionIndex);
    if (question && question.options) {
      const updatedOptions = [...question.options, { text: '', isCorrect: false }];
      handleUpdateQuestion(sectionIndex, questionIndex, { options: updatedOptions });
    }
  };

  const handleUpdateOption = (sectionIndex: number, questionIndex: number, optionIndex: number, updates: Partial<{text: string, isCorrect: boolean}>) => {
    const question = questions.find(q => q.questionId === questionIndex);
    if (question && question.options) {
      const updatedOptions = [...question.options];
      updatedOptions[optionIndex] = { ...updatedOptions[optionIndex], ...updates };
      handleUpdateQuestion(sectionIndex, questionIndex, { options: updatedOptions });
    }
  };

  const handleDeleteOption = (sectionIndex: number, questionIndex: number, optionIndex: number) => {
    const question = questions.find(q => q.questionId === questionIndex);
    if (question && question.options && question.options.length > 2) {
      const updatedOptions = question.options.filter((_, index) => index !== optionIndex);
      handleUpdateQuestion(sectionIndex, questionIndex, { options: updatedOptions });
    }
  };

  const handleFileUpload = async (file: File, type: 'image' | 'audio', sectionIndex?: number): Promise<string> => {
    try {
      const response = await PlacementTestAPI.uploadMedia(file, type);
      return response || '';
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Không tìm thấy bài test</h2>
          <Link to="/admin/placement-tests" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {activeTab === 'content' ? (
        // Full screen ContentEditor with 2-column IELTS layout
        <ContentEditor 
          sections={sections}
          questions={questions}
          onSectionsChange={setSections}
          onQuestionsChange={setQuestions}
          selectedSection={selectedSection}
          onSelectSection={setSelectedSection}
          selectedQuestion={selectedQuestion}
          onSelectQuestion={setSelectedQuestion}
          onFileUpload={handleFileUpload}
          onAddSection={handleAddSection}
          onUpdateSection={handleUpdateSection}
          onDeleteSection={handleDeleteSection}
          onAddQuestion={handleAddQuestion}
          onUpdateQuestion={handleUpdateQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          onAddOption={handleAddOption}
          onUpdateOption={handleUpdateOption}
          onDeleteOption={handleDeleteOption}
        />
      ) : (
        // Basic info form tab
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center mb-6">
            <Link
              to="/admin/placement-tests"
              className="text-gray-400 hover:text-gray-600 mr-4"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa bài test</h1>
              <p className="text-gray-600">Chỉnh sửa thông tin và nội dung bài test</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex">
              <nav className="-mb-px flex space-x-8">
                <button
                  type="button"
                  onClick={() => setActiveTab('basic')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'basic'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Thông tin cơ bản
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('content')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    (activeTab as string) === 'content'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Nội dung bài test
                </button>
              </nav>
            </div>
          </div>

          {/* Basic Info Form */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiêu đề bài test <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập tiêu đề bài test..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại bài test
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as 'reading' | 'listening' | 'general')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="reading">Reading</option>
                      <option value="listening">Listening</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả bài test <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập mô tả bài test..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thời gian làm bài (phút)
                    </label>
                    <input
                      type="number"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(Number(e.target.value))}
                      min="1"
                      max="180"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hướng dẫn làm bài
                  </label>
                  <div className="space-y-2">
                    {instructions.map((instruction, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={instruction}
                          onChange={(e) => updateInstruction(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Nhập hướng dẫn..."
                        />
                        {instructions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeInstruction(index)}
                            className="text-red-600 hover:text-red-800 p-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addInstruction}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Thêm hướng dẫn
                    </button>
                  </div>
                </div>

                {/* Test Info Display */}
                {test && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Thông tin bài test</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Số câu hỏi:</span>
                        <p className="font-medium">{test.totalQuestions} câu</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Tổng điểm:</span>
                        <p className="font-medium">{test.totalPoints} điểm</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Số phần:</span>
                        <p className="font-medium">{sections.length} phần</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Ngày tạo:</span>
                        <p className="font-medium">{new Date(test.createdAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <Link
                    to="/admin/placement-tests"
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Hủy
                  </Link>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {saving && (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditTestPage;

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { TestSection, Question, QuestionOption } from '../types';

interface ContentEditorProps {
  sections: TestSection[];
  questions: Question[];
  onSectionsChange: (sections: TestSection[]) => void;
  onQuestionsChange: (questions: Question[]) => void;
  selectedSection: number;
  onSelectSection: (index: number) => void;
  selectedQuestion: number | null;
  onSelectQuestion: (index: number | null) => void;
  onFileUpload: (file: File, type: 'image' | 'audio', sectionIndex?: number) => Promise<string>;
  onAddSection: () => void;
  onUpdateSection: (sectionIndex: number, updates: Partial<TestSection>) => void;
  onDeleteSection: (sectionIndex: number) => void;
  onAddQuestion: (sectionIndex?: number) => void;
  onUpdateQuestion: (sectionIndex: number, questionIndex: number, updates: Partial<Question>) => void;
  onDeleteQuestion: (sectionIndex: number, questionIndex: number) => void;
  onAddOption: (sectionIndex: number, questionIndex: number) => void;
  onUpdateOption: (sectionIndex: number, questionIndex: number, optionIndex: number, updates: Partial<QuestionOption>) => void;
  onDeleteOption: (sectionIndex: number, questionIndex: number, optionIndex: number) => void;
}

const ContentEditor: React.FC<ContentEditorProps> = ({
  sections,
  questions,
  onQuestionsChange,
  selectedSection,
  onSelectSection,
  selectedQuestion,
  onSelectQuestion,
  onFileUpload,
  onAddSection,
  onUpdateSection,
  onDeleteSection,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onAddOption,
  onUpdateOption,
  onDeleteOption,
}) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'audio', sectionIndex: number) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await onFileUpload(file, type, sectionIndex);
        toast.success(`Upload ${type === 'image' ? 'hình ảnh' : 'audio'} thành công!`);
      } catch (error) {
        console.error('Upload failed:', error);
        toast.error(`Lỗi upload ${type === 'image' ? 'hình ảnh' : 'audio'}`);
      }
    }
  };

  return (
    <div className="p-6 h-screen overflow-hidden">
      {/* Header with Section Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold">Nội dung bài test</h2>
          {sections && sections.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Phần:</span>
              <select
                value={selectedSection !== null ? selectedSection : 0}
                onChange={(e) => onSelectSection(parseInt(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {sections.map((section, index) => (
                  <option key={index} value={index}>
                    {section.title || `Phần ${index + 1}`}
                  </option>
                ))}
              </select>
              <button
                onClick={onAddSection}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                + Phần mới
              </button>
            </div>
          )}
        </div>
        
        {!sections || sections.length === 0 ? (
          <button
            onClick={onAddSection}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Tạo phần đầu tiên
          </button>
        ) : (
          <button
            onClick={() => onAddQuestion()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Thêm câu hỏi
          </button>
        )}
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="grid grid-cols-2 gap-6 h-full">
        {/* Left Column - Questions */}
        <div className="bg-white border rounded-lg p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              Câu hỏi {sections && sections[selectedSection] 
                ? `- ${sections[selectedSection].title || `Phần ${selectedSection + 1}`}`
                : ''
              }
            </h3>
            <span className="text-sm text-gray-500">
              Questions {sections && sections[selectedSection] 
                ? `1-${sections[selectedSection].questions?.length || 0}` 
                : `(${questions.length})`
              }
            </span>
          </div>

          {/* Render Questions */}
          {(() => {
            console.log('ContentEditor Questions Debug:', {
              selectedSection,
              sections,
              sectionsCount: sections?.length,
              selectedSectionExists: sections && sections[selectedSection],
              selectedSectionData: sections?.[selectedSection],
              selectedSectionQuestions: sections?.[selectedSection]?.questions,
              questionsCount: sections?.[selectedSection]?.questions?.length || 0
            });
            return null;
          })()}
          {sections && sections[selectedSection] ? (
            <QuestionsPanel
              questions={sections[selectedSection].questions || []}
              sectionIndex={selectedSection}
              selectedQuestion={selectedQuestion}
              onSelectQuestion={onSelectQuestion}
              onUpdateQuestion={onUpdateQuestion}
              onDeleteQuestion={onDeleteQuestion}
              onAddQuestion={() => onAddQuestion(selectedSection)}
              onAddOption={onAddOption}
              onUpdateOption={onUpdateOption}
              onDeleteOption={onDeleteOption}
            />
          ) : (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mb-4">Chưa có câu hỏi nào</p>
              <button
                onClick={() => onAddQuestion(selectedSection)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Thêm câu hỏi đầu tiên
              </button>
            </div>
          )}
        </div>

        {/* Right Column - Passage/Content */}
        <div className="bg-white border rounded-lg p-4 overflow-y-auto">
          {sections && sections[selectedSection] ? (
            <PassagePanel
              section={sections[selectedSection]}
              sectionIndex={selectedSection}
              onUpdateSection={onUpdateSection}
              onDeleteSection={onDeleteSection}
              onFileUpload={handleFileChange}
            />
          ) : (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mb-4">Tạo phần đầu tiên để bắt đầu</p>
              <button
                onClick={onAddSection}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Tạo phần 1
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface QuestionEditorProps {
  question: Question;
  questionIndex: number;
  sectionIndex: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdateQuestion: (sectionIndex: number, questionIndex: number, updates: Partial<Question>) => void;
  onDeleteQuestion: (sectionIndex: number, questionIndex: number) => void;
  onAddOption: (sectionIndex: number, questionIndex: number) => void;
  onUpdateOption: (sectionIndex: number, questionIndex: number, optionIndex: number, updates: Partial<QuestionOption>) => void;
  onDeleteOption: (sectionIndex: number, questionIndex: number, optionIndex: number) => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  questionIndex,
  sectionIndex,
  isSelected,
  onSelect,
  onUpdateQuestion,
  onDeleteQuestion,
  onAddOption,
  onUpdateOption,
  onDeleteOption,
}) => {
  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-900">Câu {questionIndex + 1}</span>
        <div className="flex items-center space-x-2">
          <select
            value={question.type}
            onChange={(e) => onUpdateQuestion(sectionIndex, questionIndex, { 
              type: e.target.value as Question['type'] 
            })}
            className="text-xs px-2 py-1 border rounded"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="multiple_choice">Trắc nghiệm</option>
            <option value="fill_blank">Điền từ</option>
            <option value="true_false_not_given">True/False/Not Given</option>
            <option value="essay">Tự luận</option>
          </select>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteQuestion(sectionIndex, questionIndex);
            }}
            className="text-red-500 hover:text-red-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {isSelected && (
        <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung câu hỏi</label>
            <textarea
              value={question.text || question.content || ''}
              onChange={(e) => onUpdateQuestion(sectionIndex, questionIndex, { text: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập nội dung câu hỏi..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Điểm</label>
              <input
                type="number"
                value={question.points}
                onChange={(e) => onUpdateQuestion(sectionIndex, questionIndex, { points: parseInt(e.target.value) || 1 })}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Options for multiple choice */}
          {question.type === 'multiple_choice' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Các lựa chọn</label>
                <button
                  onClick={() => onAddOption(sectionIndex, questionIndex)}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Thêm lựa chọn
                </button>
              </div>
              <div className="space-y-2">
                {(question.options || []).map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={option.isCorrect}
                      onChange={(e) => onUpdateOption(sectionIndex, questionIndex, optionIndex, { isCorrect: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => onUpdateOption(sectionIndex, questionIndex, optionIndex, { text: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Lựa chọn ${optionIndex + 1}...`}
                    />
                    <button
                      onClick={() => onDeleteOption(sectionIndex, questionIndex, optionIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Correct answers for other types */}
          {question.type !== 'multiple_choice' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Đáp án đúng</label>
              <input
                type="text"
                value={question.correctAnswers?.join(', ') || ''}
                onChange={(e) => onUpdateQuestion(sectionIndex, questionIndex, { 
                  correctAnswers: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập đáp án (phân cách bằng dấu phẩy)..."
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giải thích</label>
            <textarea
              value={question.explanation || ''}
              onChange={(e) => onUpdateQuestion(sectionIndex, questionIndex, { explanation: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập giải thích cho câu hỏi..."
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Questions Panel Component
interface QuestionsPanelProps {
  questions: Question[];
  sectionIndex: number;
  selectedQuestion: number | null;
  onSelectQuestion: (index: number | null) => void;
  onUpdateQuestion: (sectionIndex: number, questionIndex: number, updates: Partial<Question>) => void;
  onDeleteQuestion: (sectionIndex: number, questionIndex: number) => void;
  onAddQuestion: () => void;
  onAddOption: (sectionIndex: number, questionIndex: number) => void;
  onUpdateOption: (sectionIndex: number, questionIndex: number, optionIndex: number, updates: Partial<QuestionOption>) => void;
  onDeleteOption: (sectionIndex: number, questionIndex: number, optionIndex: number) => void;
}

const QuestionsPanel: React.FC<QuestionsPanelProps> = ({
  questions,
  sectionIndex,
  selectedQuestion,
  onSelectQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onAddQuestion,
  onAddOption,
  onUpdateOption,
  onDeleteOption,
}) => {
  console.log('QuestionsPanel Debug:', {
    sectionIndex,
    questions,
    questionsLength: questions?.length,
    questionsArray: questions
  });

  return (
    <div className="space-y-4">
      {questions.map((question, questionIndex) => (
        <div key={questionIndex} className="border rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                {questionIndex + 1}
              </span>
              <span className="text-sm font-medium">
                {question.type === 'multiple_choice' ? 'Trắc nghiệm' : 
                 question.type === 'fill_blank' ? 'Điền từ' : 
                 question.type === 'true_false_not_given' ? 'True/False/Not Given' : 'Tự luận'}
              </span>
            </div>
            <button
              onClick={() => onDeleteQuestion(sectionIndex, questionIndex)}
              className="text-red-500 hover:text-red-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {/* Question Content */}
          <div 
            className="cursor-pointer hover:bg-gray-50 p-2 rounded mb-3"
            onClick={() => onSelectQuestion(selectedQuestion === questionIndex ? null : questionIndex)}
          >
            <p className="text-gray-900 mb-2">{question.content || question.text || 'Click để thêm nội dung câu hỏi...'}</p>
            
            {/* Options for multiple choice */}
            {question.type === 'multiple_choice' && question.options && (
              <div className="space-y-1 ml-4">
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center space-x-2">
                    <span className={`w-4 h-4 rounded border ${option.isCorrect ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}`}></span>
                    <span className="text-sm text-gray-700">{option.text || `Lựa chọn ${optionIndex + 1}`}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Correct answers for other types */}
            {question.type !== 'multiple_choice' && question.correctAnswers && question.correctAnswers.length > 0 && (
              <div className="ml-4">
                <span className="text-sm text-green-600">Đáp án: {question.correctAnswers.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Edit Form when selected */}
          {selectedQuestion === questionIndex && (
            <QuestionEditor
              question={question}
              questionIndex={questionIndex}
              sectionIndex={sectionIndex}
              isSelected={true}
              onSelect={() => {}}
              onUpdateQuestion={onUpdateQuestion}
              onDeleteQuestion={onDeleteQuestion}
              onAddOption={onAddOption}
              onUpdateOption={onUpdateOption}
              onDeleteOption={onDeleteOption}
            />
          )}
        </div>
      ))}

      {/* Add Question Button */}
      <button
        onClick={onAddQuestion}
        className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-green-500 hover:text-green-600 transition-colors"
      >
        <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Thêm câu hỏi
      </button>
    </div>
  );
};

// Passage Panel Component
interface PassagePanelProps {
  section: TestSection;
  sectionIndex: number;
  onUpdateSection: (sectionIndex: number, updates: Partial<TestSection>) => void;
  onDeleteSection: (sectionIndex: number) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'audio', sectionIndex: number) => void;
}

const PassagePanel: React.FC<PassagePanelProps> = ({
  section,
  sectionIndex,
  onUpdateSection,
  onDeleteSection,
  onFileUpload,
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingPassage, setEditingPassage] = useState(false);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        {editingTitle ? (
          <input
            type="text"
            value={section.title || ''}
            onChange={(e) => onUpdateSection(sectionIndex, { title: e.target.value })}
            onBlur={() => setEditingTitle(false)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
            className="text-xl font-semibold bg-transparent border-b-2 border-blue-500 focus:outline-none"
            autoFocus
          />
        ) : (
          <h3 
            className="text-xl font-semibold cursor-pointer hover:text-blue-600"
            onClick={() => setEditingTitle(true)}
          >
            {section.title || `Phần ${sectionIndex + 1}`}
          </h3>
        )}
        
        <button
          onClick={() => onDeleteSection(sectionIndex)}
          className="text-red-500 hover:text-red-700 p-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Passage Content */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Đoạn văn (Passage)</h4>
          <button
            onClick={() => setEditingPassage(!editingPassage)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {editingPassage ? 'Xong' : 'Chỉnh sửa'}
          </button>
        </div>
        
        {editingPassage ? (
          <textarea
            value={section.passage || ''}
            onChange={(e) => onUpdateSection(sectionIndex, { passage: e.target.value })}
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nhập nội dung đoạn văn..."
          />
        ) : (
          <div 
            className="prose max-w-none cursor-pointer hover:bg-gray-50 p-2 rounded min-h-[200px]"
            onClick={() => setEditingPassage(true)}
          >
            {section.passage ? (
              <p className="whitespace-pre-wrap">{section.passage}</p>
            ) : (
              <p className="text-gray-500 italic">Click để thêm đoạn văn...</p>
            )}
          </div>
        )}
      </div>

      {/* Media Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Image Upload */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Hình ảnh</h4>
          {section.imageUrl ? (
            <div className="relative">
              <img
                src={section.imageUrl}
                alt="Section"
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => onUpdateSection(sectionIndex, { imageUrl: '' })}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <label className="block w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-sm text-gray-500">Thêm hình ảnh</span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onFileUpload(e, 'image', sectionIndex)}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Audio Upload */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">File âm thanh</h4>
          {section.audioUrl ? (
            <div className="space-y-2">
              <audio controls className="w-full">
                <source src={section.audioUrl} />
              </audio>
              <button
                onClick={() => onUpdateSection(sectionIndex, { audioUrl: '' })}
                className="w-full bg-red-500 text-white rounded p-2 hover:bg-red-600"
              >
                Xóa file âm thanh
              </button>
            </div>
          ) : (
            <label className="block w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-sm text-gray-500">Thêm file âm thanh</span>
              </div>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => onFileUpload(e, 'audio', sectionIndex)}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;
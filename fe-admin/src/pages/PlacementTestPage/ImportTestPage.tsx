import React, { ChangeEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FileAPI, PlacementTestAPI } from '../../services/api';
import { PlacementTestImportPreview } from '../../types';

const ACCEPTED_EXT = '.xlsx';

const typeLabel: Record<string, string> = {
  multi_choice: 'Nhiều lựa chọn',
  dropdown: 'Dropdown',
  short_answer: 'Trả lời ngắn',
  matching: 'Ghép cặp'
};

const categoryLabel: Record<'listening' | 'reading', string> = {
  listening: 'Listening',
  reading: 'Reading'
};

const testTypeLabel: Record<'placement' | 'mock-exam' | 'checkpoint', string> = {
  placement: 'Kiểm tra đầu vào',
  'mock-exam': 'Thi thử',
  checkpoint: 'Checkpoint'
};

// Trang import bài test từ file Word/PDF/Excel và xem trước nội dung
const ImportTestPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PlacementTestImportPreview | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [meta, setMeta] = useState({
    title: '',
    description: '',
    category: 'reading' as 'listening' | 'reading',
    testType: 'placement' as 'placement' | 'mock-exam' | 'checkpoint',
    timeLimit: 60,
    instructionsText: '',
    isActive: true,
  });

  // Tổng hợp nhanh số lượng câu hỏi theo loại để hiển thị
  const summary = useMemo(() => {
    if (!preview) return null;
    const multiChoice = preview.questions.filter((q) => q.type === 'multi_choice').length;
    const dropdown = preview.questions.filter((q) => q.type === 'dropdown').length;
    const shortAnswer = preview.questions.filter((q) => q.type === 'short_answer').length;
    const matching = preview.questions.filter((q) => q.type === 'matching').length;
    return {
      total: preview.questions.length,
      multiChoice,
      dropdown,
      shortAnswer,
      matching
    };
  }, [preview]);

  // Đưa form và preview về trạng thái ban đầu
  const resetState = () => {
    setPreview(null);
    setMeta({
      title: '',
      description: '',
      category: 'reading',
      testType: 'placement',
      timeLimit: 60,
      instructionsText: '',
      isActive: true
    });
    setSelectedFile(null);
    setErrorMessage(null);
  };

  // Lưu file người dùng chọn và xóa preview cũ
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setPreview(null);
    setErrorMessage(null);
  };

  // Gửi file lên server để trích xuất câu hỏi và thông tin bài test
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Vui lòng chọn file trước khi import.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    try {
      const formData = new FormData();
      formData.append('testFile', selectedFile);
      const response = await FileAPI.uploadTestFile(formData);
      const previewTest = response.previewTest;
      if (!previewTest || !previewTest.questions) {
        throw new Error('Phản hồi không hợp lệ từ máy chủ');
      }
      setPreview(previewTest);
      setMeta({
        title: previewTest.title,
        description: previewTest.description,
        category: previewTest.category,
        testType: (previewTest as any).testType || meta.testType || 'placement',
        timeLimit: previewTest.timeLimit,
        instructionsText: (previewTest.instructions || []).join('\n'),
        isActive: true
      });
      toast.success('Phân tích file thành công. Vui lòng kiểm tra thông tin trước khi lưu.');
    } catch (error: any) {
      console.error('Import test error:', error);
      const message = error?.message || 'Không thể xử lý file. Vui lòng kiểm tra định dạng và thử lại.';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  // Lưu bài test xuống hệ thống dựa trên dữ liệu đã phân tích
  const handleCreateTest = async () => {
    if (!preview) {
      toast.error('Chưa có dữ liệu để import. Vui lòng upload file trước.');
      return;
    }

    if (!meta.title.trim()) {
      toast.error('Tiêu đề không được để trống.');
      return;
    }

    if (meta.timeLimit <= 0) {
      toast.error('Thời gian làm bài phải lớn hơn 0.');
      return;
    }

    const instructions = meta.instructionsText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const payload = {
      title: meta.title.trim(),
      description: meta.description.trim(),
      category: meta.category,
      testType: meta.testType,
      instructions,
      timeLimit: meta.timeLimit,
      isActive: meta.isActive,
      sections: preview.sections || [],
      questions: preview.questions.map((question, index) => ({
        questionNumber: question.questionNumber || index + 1,
        type: question.type,
        allowMultiple: Boolean(question.allowMultiple),
        content: question.content || question.text || '',
        passage: question.passage,
        sectionIndex: typeof question.sectionIndex === 'number' ? question.sectionIndex : 0,
        options: (question.options || []).map((option) => ({
          text: option.text,
          isCorrect: Boolean(option.isCorrect)
        })),
        matchingPairs: question.matchingPairs || [],
        correctAnswers: question.correctAnswers || [],
        explanation: question.explanation || ''
      }))
    };

    setIsSaving(true);
    try {
      await PlacementTestAPI.createTest(payload);
      toast.success('Import bài test thành công!');
      navigate('/admin/placement-tests');
    } catch (error: any) {
      console.error('Create test from import error:', error);
      const message = error?.message || 'Không thể lưu bài test. Vui lòng thử lại sau.';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Import bài test</h1>
          <p className="text-slate-500">Hỗ trợ định dạng Excel (.xlsx)</p>
        </div>
        <button
          onClick={() => navigate('/admin/placement-tests')}
          className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
        >
          Quay lại danh sách
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">1. Chọn file cần import</h2>
              <p className="text-sm text-slate-500">
                Mỗi file nên tuân thủ đúng mẫu định dạng. Bạn có thể tải mẫu bên cạnh để tham khảo.
              </p>
            </div>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">File Excel (.xlsx)</span>
              <input
                type="file"
                accept={ACCEPTED_EXT}
                onChange={handleFileChange}
                className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </label>
            {selectedFile && (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <div className="font-medium text-slate-700">File đã chọn:</div>
                <div>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)</div>
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading || !selectedFile}
                className={`px-4 py-2 rounded-lg text-white flex items-center gap-2 ${isUploading || !selectedFile ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
              >
                {isUploading ? 'Đang xử lý...' : 'Phân tích file'}
              </button>
              <button
                type="button"
                onClick={resetState}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Làm mới
              </button>
            </div>
            {errorMessage && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-3 py-2">
                {errorMessage}
              </div>
            )}
          </div>

          {preview && (
            <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">2. Kiểm tra & chỉnh sửa thông tin</h2>
                <p className="text-sm text-slate-500">Có thể chỉnh sửa lại tiêu đề, mô tả, loại bài test, thời gian và hướng dẫn trước khi lưu.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-slate-700">Tiêu đề</span>
                  <input
                    type="text"
                    value={meta.title}
                    onChange={(e) => setMeta((prev) => ({ ...prev, title: e.target.value }))}
                    className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Nhập tiêu đề bài test"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-slate-700">Loại bài test</span>
                  <select
                    value={meta.category}
                    onChange={(e) => setMeta((prev) => ({ ...prev, category: e.target.value as typeof prev.category }))}
                    className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="reading">Reading</option>
                    <option value="listening">Listening</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-slate-700">Loại bài</span>
                  <select
                    value={meta.testType}
                    onChange={(e) => setMeta((prev) => ({ ...prev, testType: e.target.value as typeof prev.testType }))}
                    className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="placement">Kiểm tra đầu vào</option>
                    <option value="mock-exam">Thi thử</option>
                    <option value="checkpoint">Bài kiểm tra Checkpoint</option>
                  </select>
                </label>
                <label className="md:col-span-2 flex flex-col gap-1 text-sm">
                  <span className="font-medium text-slate-700">Mô tả</span>
                  <textarea
                    value={meta.description}
                    onChange={(e) => setMeta((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Mô tả ngắn gọn về bài test"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-slate-700">Thời gian làm bài (phút)</span>
                  <input
                    type="number"
                    min={1}
                    value={meta.timeLimit}
                    onChange={(e) => setMeta((prev) => ({ ...prev, timeLimit: Number(e.target.value) }))}
                    className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={meta.isActive}
                    onChange={(e) => setMeta((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-medium text-slate-700">Kích hoạt bài test ngay sau khi import</span>
                </label>
              </div>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-slate-700">Hướng dẫn (mỗi dòng một hướng dẫn)</span>
                <textarea
                  value={meta.instructionsText}
                  onChange={(e) => setMeta((prev) => ({ ...prev, instructionsText: e.target.value }))}
                  rows={4}
                  className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder={`Ví dụ:\n- Đọc kỹ từng câu hỏi\n- Không sử dụng tài liệu ngoài`}
                />
              </label>

              {summary && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm font-semibold text-slate-700">Thống kê câu hỏi</div>
                    <ul className="mt-2 space-y-1 text-sm text-slate-600">
                      <li>Tổng: <span className="font-medium text-slate-800">{summary.total}</span> câu</li>
                      <li>Multi-choice: {summary.multiChoice}</li>
                      <li>Dropdown: {summary.dropdown}</li>
                      <li>Short answer: {summary.shortAnswer}</li>
                      <li>Matching: {summary.matching}</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm font-semibold text-slate-700">Thông tin chung</div>
                    <ul className="mt-2 space-y-1 text-sm text-slate-600">
                      <li><span className="font-medium text-slate-700">Tiêu đề:</span> {meta.title}</li>
                      <li><span className="font-medium text-slate-700">Kỹ năng:</span> {categoryLabel[meta.category]}</li>
                      <li><span className="font-medium text-slate-700">Loại bài:</span> {testTypeLabel[meta.testType]}</li>
                      <li><span className="font-medium text-slate-700">Thời gian:</span> {meta.timeLimit} phút</li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-base font-semibold text-slate-800">Danh sách câu hỏi ({preview.questions.length})</h3>
                <div className="space-y-3">
                  {preview.questions.map((question, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold text-slate-800">Câu {question.questionNumber || idx + 1}</div>
                          <div className="text-xs text-indigo-600 font-medium uppercase tracking-wide">{typeLabel[question.type] || question.type}</div>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-slate-700 whitespace-pre-line">
                        {(question.content || question.text || '').substring(0, 250)}
                        {(question.content || question.text || '').length > 250 ? '…' : ''}
                      </p>
                      {question.type === 'multi_choice' || question.type === 'dropdown' ? (
                        <ul className="mt-2 grid sm:grid-cols-2 gap-2 text-sm">
                          {(question.options || []).map((option, optionIdx) => (
                            <li
                              key={optionIdx}
                              className={`rounded-lg border px-3 py-2 ${option.isCorrect ? 'border-green-400 bg-green-50 text-green-700' : 'border-slate-200 bg-white text-slate-600'}`}
                            >
                              {option.text}
                              {option.isCorrect && <span className="ml-2 text-xs font-semibold">(Đúng)</span>}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      {question.type === 'short_answer' && (
                        <div className="mt-2 text-sm text-slate-600">
                          <span className="font-medium text-slate-700">Đáp án đúng:</span> {(question.correctAnswers || []).join(', ')}
                        </div>
                      )}
                      {question.type === 'matching' && (
                        <ul className="mt-2 text-sm text-slate-600 space-y-1">
                          {(question.matchingPairs || []).map((pair, pairIdx) => (
                            <li key={pairIdx}>
                              <span className="font-medium text-slate-700">{pair.prompt}</span>
                              <span className="mx-2 text-slate-400">→</span>
                              <span>{pair.correctOption}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/admin/placement-tests/create')}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Chỉnh sửa thủ công
                </button>
                <button
                  type="button"
                  onClick={handleCreateTest}
                  disabled={isSaving}
                  className={`px-4 py-2 rounded-lg text-white flex items-center gap-2 ${isSaving ? 'bg-emerald-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                >
                  {isSaving ? 'Đang lưu...' : 'Import & tạo bài test'}
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">Hướng dẫn định dạng Excel</h2>
            <div className="space-y-3 text-sm text-slate-600">
              <div>
                <div className="font-semibold text-slate-700 mb-2">Cấu trúc file Excel (.xlsx)</div>
                <ul className="mt-1 list-disc list-inside space-y-2">
                  <li>
                    <strong>Sheet "Metadata":</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>Cột <em>Field</em>: Title, Description, Category, TimeLimit, TestType, Instructions</li>
                      <li>Cột <em>Value</em>: Giá trị tương ứng cho từng field</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Sheet "Questions":</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>QuestionNumber: Số thứ tự câu hỏi</li>
                      <li>Type: multi_choice, dropdown, short_answer, matching</li>
                      <li>Content: Nội dung câu hỏi</li>
                      <li>Points: Điểm số (thường là 1)</li>
                      <li>SectionIndex: Chỉ số phần (0, 1, 2...)</li>
                      <li>Options: Các đáp án, phân cách bằng <code>|</code></li>
                      <li>CorrectAnswers: Đáp án đúng, phân cách bằng <code>|</code></li>
                      <li>MatchingPairs: Cặp ghép (Prompt→Answer), phân cách bằng <code>|</code></li>
                    </ul>
                  </li>
                  <li>
                    <strong>Lưu ý:</strong> Tải file mẫu bên dưới để xem cấu trúc chi tiết
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">Tải mẫu tham khảo</h2>
            <p className="text-sm text-slate-600">Sử dụng file mẫu Excel dưới đây để bắt đầu nhanh hơn.</p>
            <div className="flex flex-col gap-2">
              <a
                href="/import-samples/sample-placement-test.xlsx"
                download
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <span className="text-xl">📊</span>
                <div>
                  <div className="font-medium">Mẫu bài test (Excel)</div>
                  <div className="text-xs text-slate-500">Định dạng .xlsx chuẩn</div>
                </div>
              </a>
            </div>
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-xs text-blue-800">
              <p className="font-medium mb-1">💡 Mẹo:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Điền đầy đủ thông tin trong sheet Metadata</li>
                <li>Đánh dấu đáp án đúng bằng cách liệt kê trong cột CorrectAnswers</li>
                <li>Sử dụng dấu <code>|</code> để phân tách nhiều options hoặc answers</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ImportTestPage;

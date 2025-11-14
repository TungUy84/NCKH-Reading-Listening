import React, { ChangeEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PracticeAPI } from '../../services/api';
import {
  PracticeImportPreview,
  PracticeLevelGroup,
  PracticeMediaBlock,
  PracticeQuestion,
  PracticeSkill,
  PracticeSection
} from '../../types';

const ACCEPTED_EXT = '.docx,.xlsx';

const SAMPLE_FILES: Array<{ label: string; href: string }> = [
  { label: 'Tải mẫu Word', href: '/import-samples/sample-practice-import.docx' },
  { label: 'Tải mẫu Excel', href: '/import-samples/sample-practice-import.xlsx' }
];

const SKILL_LABEL: Record<PracticeSkill, string> = {
  reading: 'Reading',
  listening: 'Listening'
};

const LEVEL_LABEL: Record<PracticeLevelGroup, string> = {
  'AV1-AV3': 'AV1 - AV3',
  'AV4-AV5': 'AV4 - AV5',
  AV6: 'AV6',
  AV7: 'AV7'
};

const TYPE_LABEL: Record<PracticeQuestion['type'], string> = {
  multi_choice: 'Nhiều lựa chọn',
  dropdown: 'Dropdown',
  short_answer: 'Trả lời ngắn',
  matching: 'Ghép cặp'
};

const generateMediaId = (): string => {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch (error) {
    // bỏ qua lỗi và dùng fallback
  }
  return Math.random().toString(36).slice(2, 10);
};

const sanitizeMediaBlocks = (blocks?: PracticeMediaBlock[]): PracticeMediaBlock[] => {
  if (!Array.isArray(blocks)) {
    return [];
  }
  return blocks
    .filter(Boolean)
    .map((block): PracticeMediaBlock => {
      const type: PracticeMediaBlock['type'] = block.type === 'audio' ? 'audio' : 'image';
      return {
        id: block.id || generateMediaId(),
        type,
        url: block.url || '',
        originalName: block.originalName || '',
        transcript: block.transcript || ''
      };
    })
    .filter((block) => !!block.id && !!block.url);
};

// Trang import bài ôn luyện từ file Word/PDF/Excel
const ImportPracticePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PracticeImportPreview | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [meta, setMeta] = useState({
    title: '',
    description: '',
    skill: 'reading' as PracticeSkill,
    levelGroup: 'AV1-AV3' as PracticeLevelGroup,
    estimatedTime: 45,
    isActive: true
  });

  const summary = useMemo(() => {
    if (!preview) return null;
    const counts = preview.questions.reduce(
      (acc, question) => {
        acc.total += 1;
        acc.totalPoints += question.points || 1;
        acc[question.type] = (acc[question.type] || 0) + 1;
        return acc;
      },
      { total: 0, totalPoints: 0, multi_choice: 0, dropdown: 0, short_answer: 0, matching: 0 } as Record<string, number>
    );
    return counts;
  }, [preview]);

  const resetState = () => {
    setSelectedFile(null);
    setPreview(null);
    setErrorMessage(null);
    setMeta({
      title: '',
      description: '',
      skill: 'reading',
      levelGroup: 'AV1-AV3',
      estimatedTime: 45,
      isActive: true
    });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setPreview(null);
    setErrorMessage(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Vui lòng chọn file trước khi import.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    try {
      const formData = new FormData();
      formData.append('practiceFile', selectedFile);
      const previewData = await PracticeAPI.importPracticeFile(formData);
      if (!previewData || !Array.isArray(previewData.questions)) {
        throw new Error('Phản hồi không hợp lệ từ máy chủ');
      }
      setPreview(previewData);
      setMeta({
        title: previewData.title || '',
        description: previewData.description || '',
        skill: previewData.skill || 'reading',
        levelGroup: previewData.levelGroup || 'AV1-AV3',
        estimatedTime: previewData.estimatedTime || 45,
        isActive: true
      });
      toast.success('Phân tích file thành công. Vui lòng kiểm tra thông tin trước khi lưu.');
    } catch (error: any) {
      console.error('Import practice error:', error);
      const message = error?.message || 'Không thể xử lý file. Vui lòng kiểm tra định dạng và thử lại.';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const buildPracticePayload = () => {
    if (!preview) {
      throw new Error('Chưa có dữ liệu import');
    }

    const sections: PracticeSection[] = (preview.sections || []).map((section, index) => ({
      title: section.title || `Section ${index + 1}`,
      passage: section.passage || '',
      audio: section.audio || '',
      image: section.image || '',
      mediaBlocks: sanitizeMediaBlocks(section.mediaBlocks)
    }));

    const questions: PracticeQuestion[] = (preview.questions || []).map((question, index) => ({
      questionNumber: question.questionNumber || index + 1,
      type: question.type,
      allowMultiple: Boolean(question.allowMultiple),
      content: question.content || '',
      passage: question.passage,
      options: (question.options || []).map((option) => ({
        text: option.text || '',
        isCorrect: Boolean(option.isCorrect)
      })),
      matchingPairs: question.matchingPairs || [],
      correctAnswers: question.correctAnswers || [],
      explanation: question.explanation || '',
      points: question.points || 1,
      sectionIndex: typeof question.sectionIndex === 'number' ? question.sectionIndex : 0
    }));

    return {
      title: meta.title.trim(),
      description: meta.description.trim(),
      skill: meta.skill,
      levelGroup: meta.levelGroup,
      estimatedTime: meta.estimatedTime,
      sections,
      questions,
      isActive: meta.isActive
    };
  };

  const handleCreatePractice = async () => {
    if (!preview) {
      toast.error('Chưa có dữ liệu để import. Vui lòng upload file trước.');
      return;
    }

    if (!meta.title.trim()) {
      toast.error('Tiêu đề không được để trống.');
      return;
    }

    if (!meta.estimatedTime || meta.estimatedTime <= 0) {
      toast.error('Thời lượng ước tính phải lớn hơn 0.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = buildPracticePayload();
      await PracticeAPI.createPractice(payload);
      toast.success('Import bài ôn luyện thành công!');
      navigate('/admin/practice');
    } catch (error: any) {
      console.error('Create practice from import error:', error);
      const message = error?.message || 'Không thể lưu bài ôn luyện. Vui lòng thử lại sau.';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const renderSection = (section: PracticeSection, index: number) => (
    <div key={`section-${index}`} className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Phần {index + 1}: {section.title || 'Không tiêu đề'}</h3>
      </div>
      {section.passage ? (
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{section.passage}</p>
      ) : (
        <p className="mt-3 text-sm text-slate-500">Không có passage.</p>
      )}
      {(section.audio || section.image) ? (
        <div className="mt-4 space-y-2 text-sm text-slate-600">
          {section.audio ? <div>Audio: {section.audio}</div> : null}
          {section.image ? <div>Image: {section.image}</div> : null}
        </div>
      ) : null}
    </div>
  );

  const renderQuestion = (question: PracticeQuestion, index: number) => (
    <div key={`question-${index}`} className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-slate-800">Câu {question.questionNumber || index + 1}</h4>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
            {TYPE_LABEL[question.type]}
          </span>
        </div>
        <p className="text-sm text-slate-600 whitespace-pre-wrap">{question.content}</p>
        {question.options && question.options.length > 0 ? (
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {question.options.map((option, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="font-medium">{String.fromCharCode(65 + idx)}.</span>
                <span>{option.text}</span>
                {option.isCorrect ? (
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">Đúng</span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
        {question.matchingPairs && question.matchingPairs.length > 0 ? (
          <div className="mt-3 text-sm text-slate-600">
            <p className="font-medium">Cặp ghép:</p>
            <ul className="mt-1 space-y-1">
              {question.matchingPairs.map((pair, idx) => (
                <li key={idx}>
                  <span className="font-medium">{pair.prompt}</span> → <span>{pair.correctOption}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {question.correctAnswers && question.correctAnswers.length > 0 ? (
          <div className="mt-2 text-sm text-emerald-600">
            Đáp án: {question.correctAnswers.join(', ')}
          </div>
        ) : null}
        {question.explanation ? (
          <p className="mt-2 text-sm text-slate-500 whitespace-pre-wrap">Giải thích: {question.explanation}</p>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Import bài ôn luyện</h1>
          <p className="text-slate-500">Hỗ trợ định dạng Word (.docx) và Excel (.xlsx)</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/practice')}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Quay lại danh sách
          </button>
          {preview ? (
            <button
              onClick={resetState}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Làm lại
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">1. Chọn file cần import</h2>
              <p className="text-sm text-slate-500">Chỉ hỗ trợ file Word (.docx) hoặc Excel (.xlsx). Có thể tải mẫu bên dưới.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="file"
                accept={ACCEPTED_EXT}
                onChange={handleFileChange}
                disabled={isUploading}
                className="block w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
              {selectedFile ? (
                <div className="text-sm text-slate-600">
                  {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                </div>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-3">
              {SAMPLE_FILES.map((file) => (
                <a
                  key={file.href}
                  href={file.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:border-blue-300 hover:text-blue-600"
                >
                  {file.label}
                </a>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploading ? 'Đang phân tích...' : 'Phân tích file'}
              </button>
            </div>
            {errorMessage ? (
              <p className="text-sm text-rose-600">{errorMessage}</p>
            ) : null}
          </div>

          {preview ? (
            <div className="space-y-6">
              <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-4">
                <h2 className="text-lg font-semibold text-slate-800">2. Thông tin tổng quan</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1 text-sm">
                    <span className="text-slate-500">Tiêu đề</span>
                    <input
                      value={meta.title}
                      onChange={(event) => setMeta((prev) => ({ ...prev, title: event.target.value }))}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                      placeholder="Nhập tiêu đề bài ôn luyện"
                    />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="text-slate-500">Kỹ năng</span>
                    <select
                      value={meta.skill}
                      onChange={(event) => setMeta((prev) => ({ ...prev, skill: event.target.value as PracticeSkill }))}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    >
                      {Object.entries(SKILL_LABEL).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1 text-sm sm:col-span-2">
                    <span className="text-slate-500">Mô tả</span>
                    <textarea
                      value={meta.description}
                      onChange={(event) => setMeta((prev) => ({ ...prev, description: event.target.value }))}
                      className="w-full min-h-[96px] rounded-lg border border-slate-300 px-3 py-2"
                      placeholder="Mô tả ngắn gọn về bài ôn luyện"
                    />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="text-slate-500">Nhóm trình độ</span>
                    <select
                      value={meta.levelGroup}
                      onChange={(event) => setMeta((prev) => ({ ...prev, levelGroup: event.target.value as PracticeLevelGroup }))}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    >
                      {Object.entries(LEVEL_LABEL).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="text-slate-500">Thời lượng ước tính (phút)</span>
                    <input
                      type="number"
                      min={1}
                      value={meta.estimatedTime}
                      onChange={(event) => setMeta((prev) => ({ ...prev, estimatedTime: Number(event.target.value) }))}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={meta.isActive}
                      onChange={(event) => setMeta((prev) => ({ ...prev, isActive: event.target.checked }))}
                      className="h-4 w-4"
                    />
                    <span>Kích hoạt ngay sau khi import</span>
                  </label>
                </div>
              </div>

              {summary ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">Tổng số câu</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.total}</p>
                  </div>
                  <div className="rounded-xl border bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">Điểm tổng</p>
                    <p className="mt-1 text-2xl font-semibold text-blue-600">{summary.totalPoints}</p>
                  </div>
                  <div className="rounded-xl border bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">Multiple choice</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">{summary.multi_choice}</p>
                  </div>
                  <div className="rounded-xl border bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">Short answer</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">{summary.short_answer}</p>
                  </div>
                </div>
              ) : null}

              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-800">3. Nội dung từng phần</h2>
                <div className="space-y-4">
                  {preview.sections && preview.sections.length > 0 ? (
                    preview.sections.map((section, index) => renderSection(section, index))
                  ) : (
                    <p className="text-sm text-slate-500">Không có section nào trong file.</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-800">4. Danh sách câu hỏi</h2>
                <div className="space-y-4">
                  {preview.questions && preview.questions.length > 0 ? (
                    preview.questions.map((question, index) => renderQuestion(question, index))
                  ) : (
                    <p className="text-sm text-slate-500">Không tìm thấy câu hỏi nào.</p>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800">Bước thực hiện</h3>
            <ol className="mt-4 space-y-3 text-sm text-slate-600">
              <li>1. Tải file mẫu Word hoặc Excel và điền câu hỏi theo định dạng chuẩn.</li>
              <li>2. Upload file (.docx/.xlsx) và đợi hệ thống phân tích.</li>
              <li>3. Kiểm tra lại thông tin, chỉnh sửa siêu dữ liệu nếu cần.</li>
              <li>4. Nhấn "Lưu bài ôn luyện" để tạo mới.</li>
            </ol>
            <button
              onClick={handleCreatePractice}
              disabled={!preview || isSaving}
              className="mt-5 w-full rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Đang lưu...' : 'Lưu bài ôn luyện'}
            </button>
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm text-sm text-slate-600">
            <p className="font-semibold text-slate-700">Lưu ý</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Mỗi câu hỏi cần ít nhất một đáp án đúng (hoặc đáp án tự luận).</li>
              <li>Ôn luyện listening nên điền link audio trong phần Section Audio.</li>
              <li>Hệ thống tự động nối câu hỏi vào section dựa theo chỉ số SectionIndex.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ImportPracticePage;

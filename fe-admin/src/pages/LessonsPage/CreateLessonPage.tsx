import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LessonPayload, PracticeLevelGroup, PracticeSkill } from '../../types';
import { LessonAPI } from '../../services/api';
import RichTextEditor from '../../components/RichTextEditor';

interface LessonFormState {
  title: string;
  summary: string;
  content: string;
  skill: PracticeSkill;
  levelGroup: PracticeLevelGroup;
  coverImage: string;
  isActive: boolean;
}

const SKILL_OPTIONS: { value: PracticeSkill; label: string }[] = [
  { value: 'reading', label: 'Reading' },
  { value: 'listening', label: 'Listening' }
];

const LEVEL_OPTIONS: { value: PracticeLevelGroup; label: string }[] = [
  { value: 'AV1-AV3', label: 'AV1 - AV3' },
  { value: 'AV4-AV5', label: 'AV4 - AV5' },
  { value: 'AV6', label: 'AV6' },
  { value: 'AV7', label: 'AV7' }
];

const DEFAULT_FORM_STATE: LessonFormState = {
  title: '',
  summary: '',
  content: '',
  skill: 'reading',
  levelGroup: 'AV1-AV3',
  coverImage: '',
  isActive: false
};

const CreateLessonPage: React.FC = () => {
  const navigate = useNavigate();
  const [formState, setFormState] = useState<LessonFormState>(DEFAULT_FORM_STATE);
  const [saving, setSaving] = useState<boolean>(false);

  // Hàm xử lý tạo bài học mới
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload: LessonPayload = {
        title: formState.title.trim(),
        summary: formState.summary.trim(),
        content: formState.content,
        skill: formState.skill,
        levelGroup: formState.levelGroup,
        coverImage: formState.coverImage.trim(),
        isActive: formState.isActive
      };

      if (!payload.title) {
        toast.warn('Vui lòng nhập tiêu đề bài học');
        setSaving(false);
        return;
      }

      if (!payload.content || payload.content === '<p><br></p>') {
        toast.warn('Vui lòng nhập nội dung bài học');
        setSaving(false);
        return;
      }

      await LessonAPI.createLesson(payload);
      toast.success('Tạo bài học thành công');
      navigate('/admin/lessons');
    } catch (error: any) {
      console.error('Create lesson error:', error);
      toast.error(error.message || 'Không thể tạo bài học');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Tạo bài học mới</h1>
          <p className="text-sm text-slate-500">Điền đầy đủ thông tin để tạo bài học cho học viên.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/lessons')}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          ← Quay lại
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-slate-900">Thông tin cơ bản</h2>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Tiêu đề bài học *</label>
              <input
                type="text"
                value={formState.title}
                onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="VD: Chiến lược làm bài Reading Part 1"
                required
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Kỹ năng *</label>
                <select
                  value={formState.skill}
                  onChange={(event) => setFormState((prev) => ({ ...prev, skill: event.target.value as PracticeSkill }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  {SKILL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nhóm trình độ *</label>
                <select
                  value={formState.levelGroup}
                  onChange={(event) => setFormState((prev) => ({ ...prev, levelGroup: event.target.value as PracticeLevelGroup }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  {LEVEL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Link ảnh bìa (URL)</label>
              <input
                type="url"
                value={formState.coverImage}
                onChange={(event) => setFormState((prev) => ({ ...prev, coverImage: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Tóm tắt ngắn gọn</label>
              <textarea
                value={formState.summary}
                onChange={(event) => setFormState((prev) => ({ ...prev, summary: event.target.value }))}
                className="h-24 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Mô tả ngắn gọn nội dung chính của bài học"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-800">Kích hoạt bài học</p>
                <p className="text-xs text-slate-500">Khi bật, bài học sẽ hiển thị cho học viên ở giao diện người dùng.</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={formState.isActive}
                  onChange={(event) => setFormState((prev) => ({ ...prev, isActive: event.target.checked }))}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-slate-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-200"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-slate-900">Nội dung bài học *</h2>

          <RichTextEditor
            value={formState.content}
            onChange={(content) => setFormState((prev) => ({ ...prev, content }))}
            placeholder="Nhập nội dung chi tiết cho bài học. Sử dụng toolbar để định dạng văn bản, chèn ảnh và video..."
          />

          <p className="mt-4 text-xs text-slate-500">
            💡 <strong>Hướng dẫn:</strong> Sử dụng các công cụ trên toolbar để định dạng văn bản. Bạn có thể thay đổi kích thước chữ, màu sắc, căn lề, chèn ảnh và video vào nội dung bài học.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
          <button
            type="button"
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            onClick={() => navigate('/admin/lessons')}
            disabled={saving}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={saving}
          >
            {saving ? 'Đang tạo...' : 'Tạo bài học'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateLessonPage;

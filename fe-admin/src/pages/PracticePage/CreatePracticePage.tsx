import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PracticeAPI } from '../../services/api';
import { PracticeLevelGroup, PracticePayload, PracticeSkill } from '../../types';

const DEFAULT_SKILL: PracticeSkill = 'reading';
const DEFAULT_LEVEL: PracticeLevelGroup = 'AV1-AV3';

// Trang tạo bài ôn luyện với thông tin cơ bản (title, kỹ năng, level)
const CreatePracticePage: React.FC = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skill, setSkill] = useState<PracticeSkill>(DEFAULT_SKILL);
  const [levelGroup, setLevelGroup] = useState<PracticeLevelGroup>(DEFAULT_LEVEL);
  const [estimatedTime, setEstimatedTime] = useState<number>(45);
  const [isActive, setIsActive] = useState(true);

  const levelOptions = useMemo(() => (
    [
      { value: 'AV1-AV3', label: 'AV1 - AV3' },
      { value: 'AV4-AV5', label: 'AV4 - AV5' },
      { value: 'AV6', label: 'AV6' },
      { value: 'AV7', label: 'AV7' },
    ] satisfies { value: PracticeLevelGroup; label: string }[]
  ), []);

  const skillOptions = useMemo(() => (
    [
      { value: 'reading', label: 'Reading' },
      { value: 'listening', label: 'Listening' },
    ] satisfies { value: PracticeSkill; label: string }[]
  ), []);

  // Gửi yêu cầu tạo mới bài ôn luyện
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề');
      return;
    }
    try {
      setSaving(true);
      const payload: PracticePayload = {
        title: title.trim(),
        description: description.trim(),
        skill,
        levelGroup,
        estimatedTime: Number.isFinite(estimatedTime) ? estimatedTime : 0,
        isActive,
        sections: [],
        questions: [],
      };
      await PracticeAPI.createPractice(payload);
      toast.success('Đã tạo bài ôn luyện');
      navigate('/admin/practice');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Không thể tạo bài ôn luyện');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 -mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Tạo bài ôn luyện</h1>
          <p className="text-slate-500">Nhập thông tin cơ bản trước khi bổ sung nội dung chi tiết.</p>
        </div>
        <Link to="/admin/practice" className="px-4 py-2 rounded-lg border text-slate-700 hover:bg-slate-100">Danh sách</Link>
      </div>

      <form onSubmit={onSubmit} className="bg-white rounded-xl border p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Tiêu đề *</label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: Reading Intensive - AV4"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Mô tả</label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tóm tắt mục tiêu, nội dung chính của bài ôn luyện"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Kỹ năng</label>
            <select
              value={skill}
              onChange={(event) => setSkill(event.target.value as PracticeSkill)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {skillOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Nhóm level</label>
            <select
              value={levelGroup}
              onChange={(event) => setLevelGroup(event.target.value as PracticeLevelGroup)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {levelOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Thời lượng ước tính (phút)</label>
            <input
              type="number"
              min={0}
              value={estimatedTime}
              onChange={(event) => setEstimatedTime(parseInt(event.target.value || '0', 10))}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Trạng thái</label>
            <div className="w-full h-[42px] px-3 border rounded-lg flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsActive((prev) => !prev)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${isActive ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
              <span className={`text-sm ${isActive ? 'text-emerald-700' : 'text-slate-600'}`}>
                {isActive ? 'Hoạt động' : 'Tạm ẩn'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? 'Đang tạo...' : 'Tạo bài ôn luyện'}
          </button>
          <Link to="/admin/practice" className="px-4 py-2 rounded-lg border">Hủy</Link>
        </div>
      </form>
    </div>
  );
};

export default CreatePracticePage;

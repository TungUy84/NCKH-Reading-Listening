import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PlacementTestAPI } from '../../services/api';

// Form tạo bài kiểm tra đầu vào mới với thông tin cơ bản
const CreateTestPage: React.FC = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'reading' | 'listening'>('reading');
  const [timeLimit, setTimeLimit] = useState<number>(60);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [isActive, setIsActive] = useState<boolean>(true);

  // Quản lý danh sách hướng dẫn hiển thị cho thí sinh
  const addInstruction = () => setInstructions((prev) => [...prev, '']);
  const removeInstruction = (idx: number) => setInstructions((prev) => prev.filter((_, i) => i !== idx));
  const updateInstruction = (idx: number, value: string) => setInstructions((prev) => prev.map((v, i) => (i === idx ? value : v)));

  // Gửi yêu cầu tạo bài test dựa trên thông tin cơ bản
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) { toast.error('Vui lòng nhập tiêu đề và mô tả'); return; }
    try {
      setSaving(true);
      const sanitizedInstructions = instructions.map((i) => i.trim()).filter(Boolean);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        timeLimit,
        instructions: sanitizedInstructions,
        isActive,
        sections: [], // create without content first
        questions: [],
      } satisfies {
        title: string;
        description: string;
        category: 'reading' | 'listening';
        timeLimit: number;
        instructions: string[];
        isActive: boolean;
        sections: unknown[];
        questions: unknown[];
      };
      const created = await PlacementTestAPI.createTest(payload);
      toast.success('Tạo bài test thành công');
      navigate(`/admin/placement-tests/${created._id}/edit`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Không thể tạo bài test');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 -mb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Tạo bài test mới</h1>
        <Link to="/admin/placement-tests" className="px-4 py-2 rounded-lg border">Danh sách</Link>
      </div>

      {/* Basic info only (no content editor here) */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <form onSubmit={onSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm mb-1">Tiêu đề</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm mb-1">Mô tả</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-1">Loại bài test</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as 'reading' | 'listening')} className="w-full px-3 py-2 border rounded-lg">
                <option value="reading">Reading</option>
                <option value="listening">Listening</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Thời gian (phút)</label>
              <input type="number" min={1} value={timeLimit} onChange={(e) => setTimeLimit(parseInt(e.target.value || '0', 10))} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm mb-1">Trạng thái</label>
              <div className="w-full h-[42px] px-3 border rounded-lg flex items-center gap-2">
                <button type="button" onClick={() => setIsActive((v) => !v)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-green-500' : 'bg-slate-300'}`}>
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${isActive ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
                <span className={`text-sm ${isActive ? 'text-green-700' : 'text-slate-600'}`}>{isActive ? 'Hoạt động' : 'Tạm ẩn'}</span>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm mb-2">Hướng dẫn</label>
            <div className="space-y-2">
              {instructions.map((inst, idx) => (
                <div key={idx} className="flex gap-2">
                  <input value={inst} onChange={(e) => updateInstruction(idx, e.target.value)} className="flex-1 px-3 py-2 border rounded-lg" />
                  <button type="button" onClick={() => removeInstruction(idx)} className="px-3 py-2 rounded-lg border">Xóa</button>
                </div>
              ))}
              <button type="button" onClick={addInstruction} className="px-4 py-2 rounded-lg border">+ Thêm hướng dẫn</button>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50">Tạo và tiếp tục chỉnh sửa</button>
            <Link to="/admin/placement-tests" className="px-4 py-2 rounded-lg border">Hủy</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTestPage;

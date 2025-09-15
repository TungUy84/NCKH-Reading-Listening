import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PlacementTestAPI } from '../../services/api';
import { PlacementTest } from '../../types';

const EditTestPage: React.FC = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'reading'|'listening'|'general'>('reading');
  const [timeLimit, setTimeLimit] = useState<number>(60);
  const [instructions, setInstructions] = useState<string[]>(['']);

  useEffect(() => {
    const load = async () => {
      if (!testId) return;
      try {
        setLoading(true);
        const data: PlacementTest = await PlacementTestAPI.getTestById(testId);
        setTitle(data.title);
        setDescription(data.description || '');
        setCategory(data.category);
        setTimeLimit(data.timeLimit || 60);
        setInstructions(data.instructions && data.instructions.length ? data.instructions : ['']);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || 'Không thể tải bài test');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [testId]);

  const addInstruction = () => setInstructions((prev) => [...prev, '']);
  const removeInstruction = (idx: number) => setInstructions((prev) => prev.filter((_, i) => i !== idx));
  const updateInstruction = (idx: number, value: string) => setInstructions((prev) => prev.map((v, i) => i === idx ? value : v));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testId) return;
    if (!title.trim() || !description.trim()) {
      toast.error('Vui lòng nhập tiêu đề và mô tả');
      return;
    }
    try {
      setSaving(true);
      await PlacementTestAPI.updateTestInfo(testId, {
        title: title.trim(),
        description: description.trim(),
        category,
        timeLimit,
        instructions: instructions.filter((i) => i.trim()),
      });
      toast.success('Đã lưu bài test');
      navigate(`/admin/placement-tests/${testId}/view`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Không thể lưu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Đang tải...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Chỉnh sửa bài test</h1>
        <div className="flex gap-2">
          <Link to={`/admin/placement-tests/${testId}/view`} className="px-4 py-2 rounded-lg border">Xem</Link>
          <Link to="/admin/placement-tests" className="px-4 py-2 rounded-lg bg-slate-800 text-white">Danh sách</Link>
        </div>
      </div>

      <form onSubmit={onSubmit} className="bg-white rounded-xl border p-4 space-y-4 max-w-3xl">
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
            <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="w-full px-3 py-2 border rounded-lg">
              <option value="reading">Reading</option>
              <option value="listening">Listening</option>
              <option value="general">General</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Thời gian (phút)</label>
            <input type="number" min={1} value={timeLimit} onChange={(e) => setTimeLimit(parseInt(e.target.value || '0', 10))} className="w-full px-3 py-2 border rounded-lg" />
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
          <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50">Lưu</button>
          <Link to={`/admin/placement-tests/${testId}/view`} className="px-4 py-2 rounded-lg border">Hủy</Link>
        </div>
      </form>
    </div>
  );
};

export default EditTestPage;

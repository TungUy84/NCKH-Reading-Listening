import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PlacementTestAPI } from '../../services/api';
import { PlacementTest } from '../../types';

const ViewTestPage: React.FC = () => {
  const { testId } = useParams();
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<PlacementTest | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!testId) return;
      try {
        setLoading(true);
        const data = await PlacementTestAPI.getTestById(testId);
        setTest(data);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || 'Không thể tải bài test');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [testId]);

  if (loading) {
    return <div className="p-6">Đang tải...</div>;
  }

  if (!test) {
    return <div className="p-6">Không tìm thấy bài test</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">{test.title}</h1>
          <div className="text-slate-500">{test.category.toUpperCase()} • {test.timeLimit} phút • {test.totalQuestions} câu hỏi</div>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/admin/placement-tests/${test._id}/edit`}
            className="px-4 py-2 rounded-lg border hover:bg-slate-50"
          >Sửa</Link>
          <Link
            to="/admin/placement-tests"
            className="px-4 py-2 rounded-lg bg-slate-800 text-white"
          >Quay lại</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border p-4">
            <h2 className="font-semibold mb-2">Mô tả</h2>
            <p className="text-slate-700 whitespace-pre-wrap">{test.description || '—'}</p>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <h2 className="font-semibold mb-2">Hướng dẫn</h2>
            <ul className="list-disc pl-5 text-slate-700 space-y-1">
              {(test.instructions || []).map((i, idx) => (
                <li key={idx}>{i}</li>
              ))}
            </ul>
          </div>

          {test.sections && test.sections.length > 0 && (
            <div className="bg-white rounded-xl border p-4">
              <h2 className="font-semibold mb-3">Các phần (Sections)</h2>
              <div className="space-y-4">
                {test.sections.map((s, idx) => (
                  <div key={idx} className="border rounded-lg p-3">
                    <div className="font-medium">Phần {idx + 1}: {s.title || `Section ${idx + 1}`}</div>
                    {s.passage && (
                      <p className="mt-2 text-slate-600 line-clamp-4">{s.passage}</p>
                    )}
                    <div className="text-sm text-slate-500 mt-2">Câu hỏi: {s.questions?.length ?? 0}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border p-4">
            <h3 className="font-semibold mb-2">Thông tin</h3>
            <ul className="text-slate-700 space-y-1 text-sm">
              <li>Trạng thái: {test.isActive ? 'Đang hoạt động' : 'Tạm ẩn'}</li>
              <li>Tổng điểm: {test.totalPoints}</li>
              <li>Tạo lúc: {new Date(test.createdAt).toLocaleString()}</li>
              <li>Cập nhật: {new Date(test.updatedAt).toLocaleString()}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTestPage;

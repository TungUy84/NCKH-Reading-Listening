import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { RoadmapAPI } from '../../services/api';
import { Roadmap } from '../../types';

// Trang quản lý lộ trình học tập cho Admin
const RoadmapPage: React.FC = () => {
  const navigate = useNavigate();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadRoadmaps();
  }, []);

  const loadRoadmaps = async () => {
    try {
      setLoading(true);
      const res = await RoadmapAPI.getAdminRoadmaps();
      setRoadmaps(res.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể tải danh sách lộ trình');
    } finally {
      setLoading(false);
    }
  };

  const filteredRoadmaps = roadmaps.filter(r => 
    r.levelGroup.toLowerCase().includes(search.toLowerCase()) ||
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  const getTotalContent = (roadmap: Roadmap) => {
    const totalLessons = 
      (roadmap.content.reading.lessons?.length || 0) + 
      (roadmap.content.listening.lessons?.length || 0);
    const totalPractices = 
      (roadmap.content.reading.practices?.length || 0) + 
      (roadmap.content.listening.practices?.length || 0);
    return { totalLessons, totalPractices };
  };

  const getCheckpointTestTitle = (roadmap: Roadmap) => {
    if (!roadmap.checkpointTest) return 'Chưa thiết lập';
    return typeof roadmap.checkpointTest === 'string' 
      ? roadmap.checkpointTest 
      : roadmap.checkpointTest.title;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            Quản lý lộ trình học tập
          </h1>
          <p className="text-slate-500">
            Cấu hình nội dung cho từng cấp độ
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm theo level group..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-slate-600">Đang tải...</p>
        </div>
      ) : filteredRoadmaps.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-slate-500">Không tìm thấy lộ trình nào</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level Group
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tiêu đề
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nội dung
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Checkpoint Test
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRoadmaps.map((roadmap) => {
                const { totalLessons, totalPractices } = getTotalContent(roadmap);
                return (
                  <tr key={roadmap._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {roadmap.levelGroup}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{roadmap.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {roadmap.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{totalLessons}</span> Lessons + 
                        <span className="font-medium"> {totalPractices}</span> Practices
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        ~{roadmap.estimatedDuration} tuần
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {getCheckpointTestTitle(roadmap)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => navigate(`/admin/roadmap/edit/${roadmap._id}`)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        ✏️ Sửa
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 Click vào nút "Sửa" để cấu hình nội dung cho từng cấp độ
        </p>
      </div>
    </div>
  );
};

export default RoadmapPage;

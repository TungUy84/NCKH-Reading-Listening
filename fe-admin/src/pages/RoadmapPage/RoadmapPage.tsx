import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MapIcon, BookOpenIcon, AcademicCapIcon, CheckBadgeIcon, PencilSquareIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
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
    const readingLessons = roadmap.content.reading.lessons?.length || 0;
    const listeningLessons = roadmap.content.listening.lessons?.length || 0;
    const readingPractices = roadmap.content.reading.practices?.length || 0;
    const listeningPractices = roadmap.content.listening.practices?.length || 0;
    
    return { 
      totalLessons: readingLessons + listeningLessons,
      totalPractices: readingPractices + listeningPractices,
      readingLessons,
      listeningLessons,
      readingPractices,
      listeningPractices
    };
  };

  const getCheckpointTestTitle = (roadmap: Roadmap) => {
    if (!roadmap.checkpointTest) return null;
    return typeof roadmap.checkpointTest === 'string' 
      ? roadmap.checkpointTest 
      : roadmap.checkpointTest.title;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <MapIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Quản lý Lộ trình học tập
              </h1>
              <p className="text-slate-600 mt-1">
                Cấu hình nội dung lessons, practices và checkpoint test cho từng level group
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mt-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo level group hoặc tiêu đề..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
            <p className="mt-4 text-slate-600 font-medium">Đang tải lộ trình...</p>
          </div>
        </div>
      ) : filteredRoadmaps.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <MapIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg text-slate-600 font-medium">Không tìm thấy lộ trình nào</p>
          <p className="text-sm text-slate-400 mt-2">Thử tìm kiếm với từ khóa khác</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRoadmaps.map((roadmap) => {
            const content = getTotalContent(roadmap);
            const checkpointTitle = getCheckpointTestTitle(roadmap);
            
            return (
              <div 
                key={roadmap._id} 
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Header Card */}
                <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm text-white mb-3">
                        {roadmap.levelGroup}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {roadmap.title}
                      </h3>
                      {roadmap.description && (
                        <p className="text-emerald-50 text-sm line-clamp-2">
                          {roadmap.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => navigate(`/admin/roadmap/edit/${roadmap._id}`)}
                      className="p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all group"
                      title="Chỉnh sửa lộ trình"
                    >
                      <PencilSquareIcon className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Body Card */}
                <div className="p-6 space-y-4">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Lessons */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                          <BookOpenIcon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Bài học</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-gray-900">{content.totalLessons}</p>
                        <div className="flex gap-2 text-xs">
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-medium">
                            {content.listeningLessons} Listen
                          </span>
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                            {content.readingLessons} Read
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Practices */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                          <AcademicCapIcon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Ôn luyện</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-gray-900">{content.totalPractices}</p>
                        <div className="flex gap-2 text-xs">
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-medium">
                            {content.listeningPractices} Listen
                          </span>
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                            {content.readingPractices} Read
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Checkpoint Test */}
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckBadgeIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Checkpoint Test</p>
                        {checkpointTitle ? (
                          <p className="text-sm text-gray-900 font-medium truncate">{checkpointTitle}</p>
                        ) : (
                          <p className="text-sm text-amber-600 italic">Chưa thiết lập checkpoint test</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Điểm đạt: <span className="font-semibold text-amber-600">{roadmap.requirements.passingScore}%</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer Info */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>~{roadmap.estimatedDuration} tuần</span>
                    </div>
                    <button
                      onClick={() => navigate(`/admin/roadmap/edit/${roadmap._id}`)}
                      className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
                    >
                      <span>Chỉnh sửa</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-indigo-500 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-indigo-900 mb-1">Hướng dẫn sử dụng</p>
            <p className="text-sm text-indigo-700">
              Click vào nút "Chỉnh sửa" để cấu hình lessons, practices và checkpoint test cho từng level group. 
              Mỗi lộ trình bao gồm nội dung cho cả Reading và Listening skills.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapPage;

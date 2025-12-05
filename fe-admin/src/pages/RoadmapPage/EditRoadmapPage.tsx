import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { ArrowLeft, Save, Loader2, Trash2, BookOpen, Headphones, Target } from 'lucide-react';
import { RoadmapAPI, PlacementTestAPI } from '../../services/api';
import { Roadmap, Lesson, Practice, PlacementTest } from '../../types';

// Modal để chọn Lessons/Practices
interface ContentSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'lesson' | 'practice';
  skill: 'reading' | 'listening';
  levelGroup: string;
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
}

const ContentSelector: React.FC<ContentSelectorProps> = ({
  isOpen,
  onClose,
  type,
  skill,
  levelGroup,
  selectedIds,
  onSelect
}) => {
  const [items, setItems] = useState<(Lesson | Practice)[]>([]);
  const [loading, setLoading] = useState(false);
  const [tempSelected, setTempSelected] = useState<string[]>(selectedIds);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadContent();
      setTempSelected(selectedIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedIds]);

  const loadContent = async () => {
    try {
      setLoading(true);
      const res = await RoadmapAPI.getAvailableContent({ skill, levelGroup });
      const content = type === 'lesson' ? res.data.lessons : res.data.practices;
      setItems(content);
    } catch (err: any) {
      toast.error('Không thể tải danh sách');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (id: string) => {
    setTempSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    onSelect(tempSelected);
    onClose();
  };

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Chọn {type === 'lesson' ? 'Lessons' : 'Practices'} - {skill === 'reading' ? 'Reading' : 'Listening'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <span className="text-2xl">×</span>
            </button>
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-3 w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Không có {type === 'lesson' ? 'lesson' : 'practice'} nào
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map(item => (
                <label
                  key={item._id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={tempSelected.includes(item._id)}
                    onChange={() => handleToggle(item._id)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-gray-500">
                      {item.skill} • {item.levelGroup}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Đã chọn: {tempSelected.length} {type === 'lesson' ? 'lessons' : 'practices'}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Thêm vào lộ trình
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Edit Roadmap Page
const EditRoadmapPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState(6);
  const [passingScore, setPassingScore] = useState(70);
  const [checkpointTestId, setCheckpointTestId] = useState('');

  const [readingLessons, setReadingLessons] = useState<string[]>([]);
  const [readingPractices, setReadingPractices] = useState<string[]>([]);
  const [listeningLessons, setListeningLessons] = useState<string[]>([]);
  const [listeningPractices, setListeningPractices] = useState<string[]>([]);

  const [tests, setTests] = useState<PlacementTest[]>([]);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectorConfig, setSelectorConfig] = useState<{
    type: 'lesson' | 'practice';
    skill: 'reading' | 'listening';
  }>({ type: 'lesson', skill: 'reading' });

  useEffect(() => {
    if (id) {
      loadRoadmap();
      loadTests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadRoadmap = async () => {
    try {
      setLoading(true);
      const res = await RoadmapAPI.getRoadmapDetail(id!);
      const data = res.data;
      
      setRoadmap(data);
      setTitle(data.title);
      setDescription(data.description);
      setEstimatedDuration(data.estimatedDuration);
      setPassingScore(data.requirements.passingScore);
      setCheckpointTestId(typeof data.checkpointTest === 'object' ? data.checkpointTest._id : data.checkpointTest || '');

      // Extract IDs from content
      setReadingLessons(data.content.reading.lessons.map(l => typeof l === 'string' ? l : l._id));
      setReadingPractices(data.content.reading.practices.map(p => typeof p === 'string' ? p : p._id));
      setListeningLessons(data.content.listening.lessons.map(l => typeof l === 'string' ? l : l._id));
      setListeningPractices(data.content.listening.practices.map(p => typeof p === 'string' ? p : p._id));
    } catch (err: any) {
      toast.error('Không thể tải roadmap');
      navigate('/admin/roadmap');
    } finally {
      setLoading(false);
    }
  };

  const loadTests = async () => {
    try {
      const res = await PlacementTestAPI.getTests({ testType: 'checkpoint' });
      setTests(res.data || []);
    } catch (err) {
      console.error('Failed to load tests');
    }
  };

  const openSelector = (type: 'lesson' | 'practice', skill: 'reading' | 'listening') => {
    setSelectorConfig({ type, skill });
    setSelectorOpen(true);
  };

  const handleContentSelect = (ids: string[]) => {
    const { type, skill } = selectorConfig;
    if (type === 'lesson') {
      if (skill === 'reading') setReadingLessons(ids);
      else setListeningLessons(ids);
    } else {
      if (skill === 'reading') setReadingPractices(ids);
      else setListeningPractices(ids);
    }
  };

  const removeContent = (type: 'lesson' | 'practice', skill: 'reading' | 'listening', id: string) => {
    if (type === 'lesson') {
      if (skill === 'reading') setReadingLessons(prev => prev.filter(x => x !== id));
      else setListeningLessons(prev => prev.filter(x => x !== id));
    } else {
      if (skill === 'reading') setReadingPractices(prev => prev.filter(x => x !== id));
      else setListeningPractices(prev => prev.filter(x => x !== id));
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề');
      return;
    }

    const result = await Swal.fire({
      title: 'Xác nhận lưu',
      text: 'Bạn có chắc muốn lưu thay đổi?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Lưu',
      cancelButtonText: 'Hủy'
    });

    if (!result.isConfirmed) return;

    try {
      setSaving(true);
      await RoadmapAPI.updateRoadmap(id!, {
        title,
        description,
        estimatedDuration,
        requirements: {
          passingScore
        },
        content: {
          reading: {
            lessons: readingLessons,
            practices: readingPractices
          },
          listening: {
            lessons: listeningLessons,
            practices: listeningPractices
          }
        },
        checkpointTest: checkpointTestId || undefined
      });

      toast.success('Cập nhật roadmap thành công');
      navigate('/admin/roadmap');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể cập nhật roadmap');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-slate-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!roadmap) return null;

  const ContentList: React.FC<{
    items: string[];
    allItems: (Lesson | Practice)[];
    type: 'lesson' | 'practice';
    skill: 'reading' | 'listening';
  }> = ({ items, allItems, type, skill }) => {
    const populatedItems = roadmap!.content[skill][type === 'lesson' ? 'lessons' : 'practices'] as (Lesson | Practice)[];
    
    return (
      <div className="space-y-2">
        {items.map((itemId, index) => {
          const item = populatedItems.find(i => (typeof i === 'string' ? i : i._id) === itemId);
          const itemObj = typeof item === 'string' ? null : item;
          
          return (
            <div key={itemId} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50">
              <span className="text-gray-400 text-sm w-8">{index + 1}.</span>
              <span className="flex-1 text-sm">{itemObj?.title || itemId}</span>
              <button
                onClick={() => removeContent(type, skill, itemId)}
                title="Xóa"
                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Chỉnh sửa lộ trình: {roadmap.levelGroup}
            </h1>
            <p className="text-slate-500">Cấu hình nội dung và checkpoint test</p>
          </div>
          <button
            onClick={() => navigate('/admin/roadmap')}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-lg text-slate-800">Thông tin cơ bản</h2>
          
          <div>
            <label className="block text-sm font-medium mb-1">Level Group (Cố định)</label>
            <input
              type="text"
              value={roadmap.levelGroup}
              disabled
              className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tiêu đề *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all"
              placeholder="VD: Lộ trình AV1-AV3 - Nền tảng cơ bản"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all"
              placeholder="Mô tả về lộ trình này..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Thời gian dự kiến (tuần)</label>
              <input
                type="number"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                min={1}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Điểm đạt checkpoint (%)</label>
              <input
                type="number"
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
                min={0}
                max={100}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Reading Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Reading Content</span>
          </h2>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Lessons</label>
              <button
                onClick={() => openSelector('lesson', 'reading')}
                className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                + Thêm
              </button>
            </div>
            {readingLessons.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Chưa có lesson nào</p>
            ) : (
              <ContentList items={readingLessons} allItems={[]} type="lesson" skill="reading" />
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Practices</label>
              <button
                onClick={() => openSelector('practice', 'reading')}
                className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                + Thêm
              </button>
            </div>
            {readingPractices.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Chưa có practice nào</p>
            ) : (
              <ContentList items={readingPractices} allItems={[]} type="practice" skill="reading" />
            )}
          </div>
        </div>

        {/* Listening Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
            <Headphones className="w-5 h-5 text-purple-600" />
            <span>Listening Content</span>
          </h2>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Lessons</label>
              <button
                onClick={() => openSelector('lesson', 'listening')}
                className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                + Thêm
              </button>
            </div>
            {listeningLessons.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Chưa có lesson nào</p>
            ) : (
              <ContentList items={listeningLessons} allItems={[]} type="lesson" skill="listening" />
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Practices</label>
              <button
                onClick={() => openSelector('practice', 'listening')}
                className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                + Thêm
              </button>
            </div>
            {listeningPractices.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Chưa có practice nào</p>
            ) : (
              <ContentList items={listeningPractices} allItems={[]} type="practice" skill="listening" />
            )}
          </div>
        </div>

        {/* Checkpoint Test */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            <span>Checkpoint Test</span>
          </h2>
          
          <div>
            <label className="block text-sm font-medium mb-1">Chọn bài test</label>
            <select
              value={checkpointTestId}
              onChange={(e) => setCheckpointTestId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all"
            >
              <option value="">-- Chưa chọn --</option>
              {tests.map(test => (
                <option key={test._id} value={test._id}>
                  {test.title} ({test.category} • {test.totalQuestions} câu)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 sticky bottom-0 bg-white border-t p-4 shadow-lg">
          <button
            onClick={() => navigate('/admin/roadmap')}
            disabled={saving}
            className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 hover:shadow-md disabled:opacity-50 flex items-center gap-2 transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Lưu thay đổi</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content Selector Modal */}
      <ContentSelector
        isOpen={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        type={selectorConfig.type}
        skill={selectorConfig.skill}
        levelGroup={roadmap.levelGroup}
        selectedIds={
          selectorConfig.type === 'lesson'
            ? selectorConfig.skill === 'reading' ? readingLessons : listeningLessons
            : selectorConfig.skill === 'reading' ? readingPractices : listeningPractices
        }
        onSelect={handleContentSelect}
      />
    </>
  );
};

export default EditRoadmapPage;

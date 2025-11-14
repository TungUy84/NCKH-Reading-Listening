import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { PracticeAPI } from '../../services/api';
import { Practice, PracticeMediaBlock, PracticeQuestion } from '../../types';

const mediaPlaceholderRegex = /\[\[media:([^\]]+)\]\]/g;

// Tạo định danh ngẫu nhiên cho media khi dữ liệu trả về chưa có sẵn khóa id.
const generateMediaId = (): string => {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch (error) {
    // Bỏ qua lỗi 
  }
  return Math.random().toString(36).slice(2, 10);
};

// Chuẩn hóa danh sách media để đảm bảo đầy đủ id, url và metadata cần thiết cho việc render.
const normalizeMediaBlocks = (blocks: unknown): PracticeMediaBlock[] => {
  if (!Array.isArray(blocks)) return [];
  return blocks
    .filter(Boolean)
    .map((block: any) => ({
      ...block,
      id: block?.id || block?._id || generateMediaId(),
      type: block?.type === 'audio' ? 'audio' : 'image',
      url: block?.url || block?.path || '',
      originalName: block?.originalName || block?.name || '',
      transcript: block?.transcript || '',
    }))
    .filter((block: PracticeMediaBlock) => !!block.id);
};

// Chuẩn hóa danh sách media để đảm bảo đầy đủ id, url và metadata cần thiết cho việc render.
const normalizeId = (value: unknown): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (value && typeof (value as any).toString === 'function') {
    return (value as any).toString();
  }
  return '';
};

// Chuẩn hóa chuỗi thời gian ISO sang định dạng dễ đọc, fallback khi dữ liệu không hợp lệ.
const formatDateTime = (value?: string): string => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleString('vi-VN');
};

// Chuyển thông tin người tạo thành chuỗi hiển thị thân thiện.
const formatUserDisplay = (value: unknown): string => {
  if (!value) return '—';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const user = value as Record<string, any>;
    const candidateNames = [user.fullName, [user.firstName, user.lastName].filter(Boolean).join(' ')].filter(
      (candidate) => typeof candidate === 'string' && candidate.trim().length > 0
    );
    if (candidateNames.length > 0) {
      return candidateNames[0];
    }
    if (user.email) return String(user.email);
    if (user.username) return String(user.username);
    if (user._id || user.id) return String(user._id || user.id);
  }
  return String(value);
};

// Bản đồ nhãn hiển thị cho từng loại câu hỏi.
const questionTypeLabelMap: Record<PracticeQuestion['type'], string> = {
  multi_choice: 'Trắc nghiệm',
  short_answer: 'Tự luận ngắn',
  matching: 'Nối cặp',
  dropdown: 'Chọn đáp án',
};

// Lấy nhãn hiển thị dành cho loại câu hỏi.
const getQuestionTypeLabel = (type: PracticeQuestion['type']): string => {
  return questionTypeLabelMap[type] || 'Khác';
};

// Render khối media (ảnh hoặc audio) cùng các thông tin đi kèm.
const renderMediaBlock = (block: PracticeMediaBlock, key: string | number): ReactNode => {
  if (block.type === 'audio') {
    return (
      <div key={`media-audio-${key}`} className="my-4">
        <audio
          controls
          controlsList="nodownload"
          preload="auto"
          className="w-full"
          onContextMenu={(event) => event.preventDefault()}
        >
          <source src={block.url} />
          Trình duyệt không hỗ trợ audio.
        </audio>
        {block.transcript ? (
          <div className="mt-3 rounded-lg bg-slate-100 p-3 text-sm text-slate-700 whitespace-pre-wrap">
            {block.transcript}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <figure key={`media-image-${key}`} className="my-4 flex justify-center">
      <img
        src={block.url}
        alt={block.originalName || `Media ${block.id}`}
        className="max-w-full rounded-lg border"
      />
    </figure>
  );
};

// Phân tích đoạn văn và thay thế placeholder [[media:ID]] bằng media tương ứng.
const renderPassageContent = (passage: string, mediaBlocks: PracticeMediaBlock[] = []): ReactNode => {
  if (!passage) return null;
  mediaPlaceholderRegex.lastIndex = 0;
  const nodes: ReactNode[] = [];
  const mediaMap = new Map<string, PracticeMediaBlock>();

  mediaBlocks.forEach((block) => {
    const addKey = (value: unknown) => {
      const key = normalizeId(value);
      if (key) {
        mediaMap.set(key, block);
      }
    };

    addKey(block?.id);
    addKey((block as any)?._id);
  });

  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  while ((match = mediaPlaceholderRegex.exec(passage)) !== null) {
    const text = passage.slice(lastIndex, match.index);
    if (text) {
      nodes.push(
        <p key={`text-${key++}`} className="whitespace-pre-wrap text-slate-800 leading-relaxed">
          {text}
        </p>
      );
    }

    const mediaId = match[1]?.trim();
    if (mediaId) {
      const normalizedKey = normalizeId(mediaId);
      const block = mediaMap.get(mediaId) || mediaMap.get(normalizedKey);
      if (block) {
        nodes.push(renderMediaBlock(block, key++));
      } else {
        nodes.push(
          <p key={`missing-${key++}`} className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
            Media không tìm thấy: {mediaId}
          </p>
        );
      }
    }

    lastIndex = match.index + match[0].length;
  }

  const tail = passage.slice(lastIndex);
  if (tail) {
    nodes.push(
      <p key={`text-${key++}`} className="whitespace-pre-wrap text-slate-800 leading-relaxed">
        {tail}
      </p>
    );
  }

  return nodes;
};

// Gom đáp án của câu hỏi theo từng loại để hiển thị rõ ràng cho admin.
const getQuestionAnswers = (question: PracticeQuestion): string[] => {
  if (!question) return [];
  const { type, options, correctAnswers, matchingPairs } = question;

  if ((type === 'multi_choice' || type === 'dropdown') && Array.isArray(options)) {
    return options.filter((option: any) => option?.isCorrect).map((option: any) => option?.text || '—');
  }

  if (type === 'matching' && Array.isArray(matchingPairs)) {
    return matchingPairs.map((pair: any) => `${pair?.prompt || '—'} → ${pair?.correctOption || '—'}`);
  }

  if (Array.isArray(correctAnswers) && correctAnswers.length) {
    return correctAnswers.map((answer) => String(answer || '—'));
  }

  return [];
};

// Component hiển thị giao diện xem chi tiết bài ôn luyện với bố cục hai cột.
const ViewPracticePage: React.FC = () => {
  const { practiceId } = useParams();
  const [loading, setLoading] = useState(true);
  const [practice, setPractice] = useState<Practice | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const [panelHeight, setPanelHeight] = useState<number>(0);

  // Tính toán chiều cao panel dựa trên vị trí hiện tại để đồng bộ giữa hai cột.
  useEffect(() => {
    const updateHeight = () => {
      const top = gridRef.current?.getBoundingClientRect().top ?? 0;
      const height = Math.max(360, Math.floor(window.innerHeight - top - 24));
      setPanelHeight(height);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Nạp dữ liệu bài ôn luyện từ API và chuẩn hóa media trước khi hiển thị.
  useEffect(() => {
    const load = async () => {
      if (!practiceId) return;
      try {
        setLoading(true);
        const data = await PracticeAPI.getPractice(practiceId);
        setPractice({
          ...data,
          sections: (data.sections || []).map((section: any) => ({
            ...section,
            mediaBlocks: normalizeMediaBlocks(section?.mediaBlocks),
          })),
        });
      } catch (error: any) {
        console.error(error);
        toast.error(error?.message || 'Không thể tải bài ôn luyện');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [practiceId]);

  const currentSection = useMemo(() => {
    if (!practice?.sections || practice.sections.length === 0) return undefined;
    return practice.sections[Math.min(currentSectionIndex, practice.sections.length - 1)];
  }, [practice, currentSectionIndex]);

  const sectionQuestions = useMemo(() => {
    if (!practice?.questions) return [] as PracticeQuestion[];
    if (!practice.sections || !practice.sections.length) {
      return [...practice.questions].sort((a, b) => (a.questionNumber || 0) - (b.questionNumber || 0));
    }

    if (!currentSection) return [] as PracticeQuestion[];

    const hasSectionId = !!(currentSection as any)?._id;
    const sectionId = hasSectionId ? normalizeId((currentSection as any)?._id) : '';

    return practice.questions
      .filter((question: any) => {
        if (hasSectionId) {
          return normalizeId(question?.sectionId) === sectionId;
        }
        const sectionIndex = typeof question?.sectionIndex === 'number' ? question.sectionIndex : null;
        return sectionIndex !== null ? sectionIndex === currentSectionIndex : false;
      })
      .sort((a, b) => (a.questionNumber || 0) - (b.questionNumber || 0));
  }, [practice, currentSection, currentSectionIndex]);

  const totalSections = practice?.sections?.length || 0;
  const totalQuestions = practice?.totalQuestions ?? practice?.questions?.length ?? 0;

  // Hiển thị đoạn mã ID ngắn giúp dễ nhận diện thực thể trên giao diện.
  const practiceIdSuffix = practice?._id ? practice._id.slice(-8) : '—';

  // Tổng hợp số liệu header để hiển thị dạng thống kê nhanh.
  const headerStats = useMemo(
    () => [
      { label: 'Kỹ năng', value: practice?.skill ? practice.skill.toUpperCase() : '—' },
      { label: 'Nhóm trình độ', value: practice?.levelGroup || '—' },
      { label: 'Thời lượng ước tính', value: practice?.estimatedTime ? `${practice.estimatedTime} phút` : '—' },
      { label: 'Số phần', value: `${totalSections} phần` },
      { label: 'Tổng câu hỏi', value: `${totalQuestions} câu` },
      { label: 'Tổng điểm', value: `${practice?.totalPoints ?? 0} điểm` },
      { label: 'Người tạo', value: formatUserDisplay(practice?.createdBy) },
      { label: 'Cập nhật', value: formatDateTime(practice?.updatedAt) },
    ],
    [practice, totalSections, totalQuestions]
  );

  // Chuyển sang phần được chọn khi người dùng bấm nút điều hướng.
  const handleSelectSection = (index: number) => {
    setCurrentSectionIndex(index);
  };

  // Điều hướng sang phần kế tiếp.
  const nextSection = () => {
    if (!practice?.sections) return;
    setCurrentSectionIndex((index) => Math.min(practice.sections!.length - 1, index + 1));
  };

  // Điều hướng về phần trước đó.
  const prevSection = () => {
    setCurrentSectionIndex((index) => Math.max(0, index - 1));
  };

  if (loading) {
    return <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">Đang tải thông tin bài ôn luyện...</div>;
  }

  if (!practice) {
    return <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">Không tìm thấy bài ôn luyện.</div>;
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-8 text-white">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 space-y-2 pr-4">
              <p className="text-xs uppercase tracking-[0.25rem] text-slate-400">Practice Preview</p>
              <h1 className="truncate text-3xl font-semibold">{practice.title}</h1>
              <div className="text-sm text-slate-300">
                {practice.skill.toUpperCase()} • {practice.levelGroup}
                {practice.estimatedTime ? ` • ${practice.estimatedTime} phút` : ''}
                {' • '}
                {totalSections} phần • {totalQuestions} câu hỏi
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-white/70">
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${practice.isActive ? 'bg-emerald-500/20 text-emerald-200' : 'bg-amber-500/20 text-amber-200'
                  }`}>
                  <span className="h-2 w-2 rounded-full bg-current" />
                  {practice.isActive ? 'Đang hoạt động' : 'Tạm ẩn'}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 font-medium">
                  ID: {practiceIdSuffix}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to={`/admin/practice/${practice._id}/edit`}
                className="inline-flex items-center justify-center rounded-xl border border-slate-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-white hover:text-slate-900"
              >
                Chỉnh sửa bài
              </Link>
              <Link
                to="/admin/practice"
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Quay lại danh sách
              </Link>
            </div>
          </div>
        </div>
        <div className="px-6 py-6">
          {practice.description ? (
            <p className="text-sm text-slate-600 whitespace-pre-wrap">
              {practice.description}
            </p>
          ) : (
            <p className="text-sm italic text-slate-400">Chưa có mô tả cho bài ôn luyện này.</p>
          )}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
            {headerStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{stat.label}</p>
                <p className="mt-2 text-base font-semibold text-slate-800">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {totalSections === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
          Bài ôn luyện chưa có phần nội dung nào. Hãy bổ sung ở trang chỉnh sửa để xem tại đây.
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Nội dung bài ôn luyện</h2>
                <p className="text-sm text-slate-500">Chọn phần để xem đoạn văn, media và danh sách câu hỏi tương ứng.</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span>Đang xem phần</span>
                <span className="inline-flex h-9 min-w-[2.75rem] items-center justify-center rounded-full bg-slate-900 px-3 text-xs font-semibold uppercase tracking-wide text-white">
                  {currentSectionIndex + 1}/{totalSections}
                </span>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(practice.sections || []).map((section, index) => {
                const isActive = currentSectionIndex === index;
                return (
                  <button
                    key={section?._id || index}
                    type="button"
                    onClick={() => handleSelectSection(index)}
                    className={`group flex items-center gap-2 rounded-2xl border px-4 py-2 text-left transition ${isActive
                      ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                      : 'border-slate-200 bg-slate-100 text-slate-600 hover:border-slate-300 hover:bg-slate-200'
                      }`}
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide">Phần {index + 1}</span>
                    <span className="line-clamp-1 text-sm font-medium">
                      {section?.title?.trim() || 'Chưa đặt tiêu đề'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div ref={gridRef} className="grid gap-0 lg:grid-cols-[minmax(0,3fr),minmax(0,2fr)]">
            <div
              className="flex flex-col border-b border-slate-200 bg-white lg:border-b-0 lg:border-r"
              style={{ height: panelHeight }}
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Đoạn văn</p>
                  <h3 className="text-base font-semibold text-slate-800">
                    {currentSection?.title || `Phần ${currentSectionIndex + 1}`}
                  </h3>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {sectionQuestions.length} câu hỏi
                </span>
              </div>
              <div className="flex-1 overflow-auto px-6 py-5">
                {currentSection?.passage ? (
                  <div className="prose prose-slate max-w-none text-sm">
                    {renderPassageContent(currentSection.passage, currentSection.mediaBlocks as PracticeMediaBlock[])}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                    Phần này chưa có đoạn văn. Bạn có thể thêm nội dung tại trang chỉnh sửa.
                  </div>
                )}
              </div>
              <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-4">
                <button
                  type="button"
                  onClick={prevSection}
                  disabled={currentSectionIndex === 0}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50 hover:border-slate-400 hover:bg-white"
                >
                  <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
                  <span>Phần trước</span>
                </button>
              </div>
            </div>

            <div
              className="flex flex-col bg-white"
              style={{ height: panelHeight }}
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Danh sách câu hỏi</p>
                  <h3 className="text-base font-semibold text-slate-800">Phần {currentSectionIndex + 1}</h3>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                  {sectionQuestions.length ? `${sectionQuestions.length} câu` : 'Chưa có câu hỏi'}
                </span>
              </div>
              <div className="flex-1 overflow-auto px-6 py-5">
                {sectionQuestions.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                    Chưa có câu hỏi cho phần này.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sectionQuestions.map((question, index) => {
                      const answers = getQuestionAnswers(question);
                      const options = Array.isArray(question.options) ? question.options : [];
                      const matchingPairs = Array.isArray(question.matchingPairs) ? question.matchingPairs : [];
                      const typeLabel = getQuestionTypeLabel(question.type);

                      return (
                        <div
                          key={question._id || `${question.questionNumber}-${index}`}
                          className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="text-xs uppercase tracking-wide text-slate-500">
                                Câu {question.questionNumber ?? index + 1}
                              </div>
                              <p className="font-medium text-slate-800 whitespace-pre-wrap">
                                {question.content || '—'}
                              </p>
                            </div>
                            <span className="inline-flex shrink-0 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                              {typeLabel}
                            </span>
                          </div>

                          {options.length > 0 && (
                            <div className="mt-3 space-y-1 text-sm text-slate-700">
                              {options.map((option, optionIdx) => (
                                <div
                                  key={`${optionIdx}-${option.text || optionIdx}`}
                                  className={`flex items-start gap-2 rounded-xl border px-3 py-2 ${option.isCorrect
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                    : 'border-transparent bg-white text-slate-700'
                                    }`}
                                >
                                  <span className="mt-0.5 text-xs font-semibold text-slate-500">
                                    {String.fromCharCode(65 + optionIdx)}.
                                  </span>
                                  <span className="flex-1">{option.text || '—'}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {matchingPairs.length > 0 && (
                            <div className="mt-3 grid gap-2">
                              {matchingPairs.map((pair, pairIdx) => (
                                <div
                                  key={`${pairIdx}-${pair?.prompt || pairIdx}`}
                                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                                >
                                  <div className="font-medium">{pair?.prompt || '—'}</div>
                                  <div className="text-xs text-slate-500">Đáp án: {pair?.correctOption || '—'}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                            <span className="font-semibold">Đáp án:</span>{' '}
                            {answers.length ? answers.join(', ') : '—'}
                          </div>

                          {question.explanation ? (
                            <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                              <span className="font-semibold">Giải thích:</span> {question.explanation}
                            </div>
                          ) : null}

                          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                            <span className="rounded-full bg-slate-200/60 px-3 py-1 font-semibold text-slate-700">
                              Điểm: {typeof question.points === 'number' ? question.points : 0}
                            </span>
                            {question.allowMultiple ? (
                              <span className="rounded-full bg-slate-200/60 px-3 py-1 font-semibold text-slate-700">
                                Cho phép nhiều đáp án
                              </span>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-4 text-right">
                <button
                  type="button"
                  onClick={nextSection}
                  disabled={currentSectionIndex >= totalSections - 1}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50 hover:border-slate-400 hover:bg-white"
                >
                  <span>Phần kế tiếp</span>
                  <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewPracticePage;

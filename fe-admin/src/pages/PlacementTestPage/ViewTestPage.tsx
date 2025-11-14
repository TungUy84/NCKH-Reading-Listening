import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { PlacementTestAPI } from '../../services/api';
import { PlacementTest, SectionMedia } from '../../types';

const mediaPlaceholderRegex = /\[\[media:([^\]]+)\]\]/g;

// Sinh ID dự phòng khi backend không trả về.
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

// Chuẩn hóa media block để đảm bảo luôn có id, url và thông tin hiển thị.
const normalizeMediaBlocks = (blocks: unknown): SectionMedia[] => {
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
    .filter((block: SectionMedia) => !!block.id);
};

// Chuẩn hóa danh sách section trước khi render.
const sanitizeSections = (sections: any[] | undefined) => {
  return (sections || []).map((section: any) => ({
    ...section,
    mediaBlocks: normalizeMediaBlocks(section?.mediaBlocks),
  }));
};

// Bản đồ nhãn hiển thị cho từng loại câu hỏi.
const questionTypeLabelMap = {
  multi_choice: 'Trắc nghiệm',
  short_answer: 'Tự luận ngắn',
  matching: 'Nối cặp',
  dropdown: 'Chọn đáp án',
} as const;

// Lấy nhãn hiển thị phù hợp với loại câu hỏi.
const getQuestionTypeLabel = (type: keyof typeof questionTypeLabelMap): string => {
  return questionTypeLabelMap[type] || 'Khác';
};

// Định dạng chuỗi thời gian ISO sang tiếng Việt, tránh lỗi khi thiếu dữ liệu.
const formatDateTime = (value?: string): string => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleString('vi-VN');
};

// Chuyển thông tin người tạo thành chuỗi dễ đọc.
const formatUserDisplay = (value: unknown): string => {
  if (!value) return '—';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const user = value as Record<string, any>;
    const nameCandidates = [user.fullName, [user.firstName, user.lastName].filter(Boolean).join(' ')].filter(
      (candidate) => !!candidate && candidate.trim().length > 0
    );
    if (nameCandidates.length > 0) {
      return nameCandidates[0];
    }
    if (user.email) {
      return user.email;
    }
    if (user.username) {
      return user.username;
    }
    if (user._id || user.id) {
      return String(user._id || user.id);
    }
  }
  return String(value);
};

type MatchingPairDisplay = { key: string; prompt: string; answer: string };

const collectAnswerStrings = (value: unknown): string[] => {
  if (value == null) return [];
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }
  if (typeof value === 'number' || typeof value === 'boolean') return [String(value)];
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectAnswerStrings(item));
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const preferredKeys = ['text', 'answer', 'value', 'label', 'content'];
    for (const key of preferredKeys) {
      if (key in record) {
        const nested = collectAnswerStrings(record[key]);
        if (nested.length) return nested;
      }
    }
    const nestedValues = Object.values(record).flatMap((item) => collectAnswerStrings(item));
    if (nestedValues.length) return nestedValues;
  }
  return [];
};

const formatAnswerText = (value: unknown): string => {
  const normalized = collectAnswerStrings(value);
  if (normalized.length) return normalized.join(', ');
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || '—';
  }
  return '—';
};

const getMatchingPairs = (question: any): MatchingPairDisplay[] => {
  const pairsSource = Array.isArray(question?.matchingPairs)
    ? question.matchingPairs
    : Array.isArray(question?.pairs)
      ? question.pairs
      : [];

  return pairsSource.map((pair: any, index: number) => ({
    key: pair?._id ? String(pair._id) : `${question?._id || 'pair'}-${index}`,
    prompt: formatAnswerText(pair?.prompt ?? pair?.question ?? pair?.stem ?? pair?.left),
    answer: formatAnswerText(
      pair?.correctOption ?? pair?.match ?? pair?.answer ?? pair?.response ?? pair?.value ?? pair?.right
    ),
  }));
};

const getQuestionAnswers = (question: any): string[] => {
  if (!question) return [];
  const type = question.type as keyof typeof questionTypeLabelMap;

  if (Array.isArray(question.options) && question.options.length) {
    return question.options
      .filter((option: any) => option?.isCorrect)
      .map((option: any) => option?.text || '—');
  }

  if (type === 'matching') {
    const pairs = getMatchingPairs(question);
    if (pairs.length) {
      return pairs.map((pair) => `${pair.prompt} → ${pair.answer}`);
    }
  }

  const sources = [
    question.correctAnswers,
    question.correctAnswer,
    question.answer,
    question.answers,
    question.answerKey,
  ];

  for (const source of sources) {
    const normalized = collectAnswerStrings(source);
    if (normalized.length) {
      return normalized;
    }
  }

  return [];
};

// Hiển thị media tương ứng với placeholder trong đề bài.
const renderMediaBlock = (block: SectionMedia, key: string | number): ReactNode => {
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

// Phân tách đoạn văn và chèn media dựa trên placeholder [[media:ID]].
const renderPassageContent = (passage: string, mediaBlocks: SectionMedia[] = []): ReactNode => {
  if (!passage) return null;
  mediaPlaceholderRegex.lastIndex = 0;
  const nodes: ReactNode[] = [];
  const mediaMap = new Map<string, SectionMedia>();
  mediaBlocks.forEach((block) => {
    if (block?.id) {
      mediaMap.set(String(block.id), block);
    }
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
      const block = mediaMap.get(mediaId);
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

// Component xem chi tiết bài kiểm tra đầu vào.
const ViewTestPage: React.FC = () => {
  const { testId } = useParams();
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<PlacementTest | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const [panelHeight, setPanelHeight] = useState<number>(0);

  // Tính chiều cao panel để hai cột cân bằng.
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

  // Nạp dữ liệu bài test và chuẩn hóa media trước khi hiển thị.
  useEffect(() => {
    const load = async () => {
      if (!testId) return;
      try {
        setLoading(true);
        const data = await PlacementTestAPI.getTestById(testId);
        setTest({
          ...data,
          sections: sanitizeSections(data.sections) as any,
        });
      } catch (error: any) {
        console.error(error);
        toast.error(error?.message || 'Không thể tải bài kiểm tra');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [testId]);

  const currentSection = useMemo(() => {
    if (!test?.sections || test.sections.length === 0) return undefined;
    return test.sections[Math.min(currentSectionIndex, test.sections.length - 1)];
  }, [test, currentSectionIndex]);

  const sectionQuestions = useMemo(() => {
    if (!test?.questions || !test.sections || !test.sections.length) return [];
    if (!currentSection?._id) return [];

    const currentId = (currentSection as any)?._id?.toString
      ? (currentSection as any)._id.toString()
      : String(currentSection._id);

    return test.questions
      .filter((question) => {
        const sectionId = (question as any)?.sectionId?.toString
          ? (question as any).sectionId.toString()
          : question.sectionId
            ? String(question.sectionId)
            : '';
        return sectionId === currentId;
      })
      .sort((a, b) => (a.questionNumber || 0) - (b.questionNumber || 0));
  }, [test, currentSection]);

  const totalSections = test?.sections?.length || 0;
  const totalQuestions = test?.totalQuestions ?? test?.questions?.length ?? 0;

  // Thống kê nhanh cho phần đầu trang.
  const headerStats = useMemo(
    () => [
      { label: 'Danh mục', value: test?.category ? test.category.toUpperCase() : '—' },
      { label: 'Thời lượng', value: test?.timeLimit ? `${test.timeLimit} phút` : '—' },
      { label: 'Số phần', value: `${totalSections} phần` },
      { label: 'Tổng câu hỏi', value: `${totalQuestions} câu` },
      { label: 'Tổng điểm', value: `${test?.totalPoints ?? 0} điểm` },
      { label: 'Người tạo', value: formatUserDisplay(test?.createdBy) },
      { label: 'Ngày tạo', value: formatDateTime(test?.createdAt) },
      { label: 'Cập nhật', value: formatDateTime(test?.updatedAt) },
    ],
    [test, totalSections, totalQuestions]
  );

  // Rút gọn ID để hiển thị trong phần header.
  const testIdSuffix = test?._id ? test._id.slice(-8) : '—';

  // Điều hướng đến phần kế tiếp.
  const nextSection = () => {
    if (!test?.sections) return;
    setCurrentSectionIndex((index) => Math.min(test.sections!.length - 1, index + 1));
  };

  // Điều hướng về phần trước đó.
  const prevSection = () => {
    setCurrentSectionIndex((index) => Math.max(0, index - 1));
  };

  // Cho phép chọn phần thông qua thanh điều hướng nhanh.
  const handleSelectSection = (index: number) => {
    setCurrentSectionIndex(index);
  };

  if (loading) {
    return <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">Đang tải thông tin bài kiểm tra...</div>;
  }

  if (!test) {
    return <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">Không tìm thấy bài kiểm tra.</div>;
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-8 text-white">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 space-y-2 pr-4">
              <p className="text-xs uppercase tracking-[0.25rem] text-slate-400">Placement Test Preview</p>
              <h1 className="truncate text-3xl font-semibold">{test.title}</h1>
              <div className="text-sm text-slate-300">
                {test.category.toUpperCase()} • {test.timeLimit} phút • {totalQuestions} câu hỏi
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-white/70">
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                  test.isActive ? 'bg-emerald-500/20 text-emerald-200' : 'bg-amber-500/20 text-amber-200'
                }`}>
                  <span className="h-2 w-2 rounded-full bg-current" />
                  {test.isActive ? 'Đang hoạt động' : 'Tạm ẩn'}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 font-medium">
                  ID: {testIdSuffix}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to={`/admin/placement-tests/${test._id}/edit`}
                className="inline-flex items-center justify-center rounded-xl border border-slate-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-white hover:text-slate-900"
              >
                Chỉnh sửa bài
              </Link>
              <Link
                to="/admin/placement-tests"
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Quay lại danh sách
              </Link>
            </div>
          </div>
        </div>
        <div className="px-6 py-6 space-y-6">
          {test.description ? (
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{test.description}</p>
          ) : (
            <p className="text-sm italic text-slate-400">Chưa có mô tả cho bài kiểm tra này.</p>
          )}

          {Array.isArray(test.instructions) && test.instructions.length ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hướng dẫn</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {test.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="mt-0.5 text-xs font-semibold text-slate-400">{index + 1}.</span>
                    <span className="flex-1">{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
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
          Bài kiểm tra chưa có phần nội dung nào. Vui lòng thêm phần trong trang chỉnh sửa để xem tại đây.
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Cấu trúc bài kiểm tra</h2>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span>Đang xem phần</span>
                <span className="inline-flex h-9 min-w-[2.75rem] items-center justify-center rounded-full bg-slate-900 px-3 text-xs font-semibold uppercase tracking-wide text-white">
                  {currentSectionIndex + 1}/{totalSections}
                </span>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(test.sections || []).map((section, index) => {
                const isActive = currentSectionIndex === index;
                return (
                  <button
                    key={section?._id || index}
                    type="button"
                    onClick={() => handleSelectSection(index)}
                    className={`group flex items-center gap-2 rounded-2xl border px-4 py-2 text-left transition ${
                      isActive
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
              </div>
              <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
                {currentSection?.passage ? (
                  <div className="prose prose-slate max-w-none text-sm">
                    {renderPassageContent(currentSection.passage || '', (currentSection.mediaBlocks || []) as SectionMedia[])}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                    Phần này chưa có đoạn văn. Bạn có thể bổ sung trong trang chỉnh sửa.
                  </div>
                )}

                {currentSection?.audio ? (
                  <audio
                    controls
                    controlsList="nodownload"
                    preload="auto"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    onContextMenu={(event) => event.preventDefault()}
                  >
                    <source src={currentSection.audio} />
                    Trình duyệt không hỗ trợ audio.
                  </audio>
                ) : null}

                {currentSection?.image ? (
                  <figure className="overflow-hidden rounded-2xl border border-slate-200">
                    <img src={currentSection.image} alt="Section" className="w-full object-cover" />
                  </figure>
                ) : null}
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
                      const options = Array.isArray(question.options) ? question.options : [];
                      const answers = getQuestionAnswers(question);
                      const typeLabel = getQuestionTypeLabel(question.type as keyof typeof questionTypeLabelMap);
                      const matchingPairs = getMatchingPairs(question);

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
                                {question.content || question.text || '—'}
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
                                  className={`flex items-start gap-2 rounded-xl border px-3 py-2 ${
                                    option.isCorrect
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
                              {matchingPairs.map((pair) => (
                                <div
                                  key={pair.key}
                                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                                >
                                  <div className="font-medium">{pair.prompt}</div>
                                  <div className="text-xs text-slate-500">Đáp án: {pair.answer}</div>
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

export default ViewTestPage;

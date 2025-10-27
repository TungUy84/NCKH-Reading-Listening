import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState, } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { PlacementTest, SectionMedia, TestQuestion, TestSection, UserAnswer } from '../../types';
import { getTestForTaking, submitTest } from '../../services/api';
import { Button } from '../../components/ui/Button';

const mediaPlaceholderRegex = /\[\[media:([^\]]+)\]\]/g;

const EMPTY_SECTIONS: TestSection[] = [];
const EMPTY_QUESTIONS: TestQuestion[] = [];

const normalizeId = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'object' && 'toString' in value) {
    try {
      return (value as { toString: () => string }).toString();
    } catch {
      /* noop */
    }
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const isQuestionAnswered = (answer?: UserAnswer | null): boolean => {
  if (!answer) {
    return false;
  }
  const hasMatching = answer.matchingAnswers?.some((pair) => pair.selected && pair.selected.trim().length > 0) ?? false;
  const hasSelectedOption = (answer.selectedOptions?.length ?? 0) > 0;
  const hasInput = !!answer.userAnswer && answer.userAnswer.trim().length > 0;
  return hasSelectedOption || hasInput || hasMatching;
};

const generateMediaId = (): string => {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    /* noop */
  }
  return Math.random().toString(36).slice(2, 10);
};

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
      mimeType: block?.mimeType || block?.mimetype || '',
      size: block?.size,
      transcript: block?.transcript || '',
    }))
    .filter((block: SectionMedia) => !!block.id && !!block.url);
};

const sanitizeSections = (sections: TestSection[] = []): TestSection[] => {
  return sections.map((section) => ({
    ...section,
    mediaBlocks: normalizeMediaBlocks(section?.mediaBlocks),
  }));
};

const renderMediaBlock = (block: SectionMedia, key: string | number): ReactNode => {
  if (!block?.url) {
    return (
      <div
        key={`media-missing-${key}`}
        className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700"
      >
        Không tìm thấy nội dung media.
      </div>
    );
  }

  if (block.type === 'audio') {
    return (
      <div key={`media-audio-${key}`} className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wide text-blue-700 mb-2">Audio</div>
        <audio
          controls
          controlsList="nodownload"
          preload="auto"
          className="w-full"
          onContextMenu={(event) => event.preventDefault()}
        >
          <source src={block.url} type={block.mimeType ?? 'audio/mpeg'} />
          Trình duyệt của bạn không hỗ trợ phát audio.
        </audio>
        {block.transcript ? (
          <p className="mt-3 text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
            {block.transcript}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <figure
      key={`media-image-${key}`}
      className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
    >
      <img
        src={block.url}
        alt={block.originalName || `Media ${block.id}`}
        className="w-full h-auto object-contain"
      />
      {block.originalName ? (
        <figcaption className="px-4 py-2 text-xs text-gray-500 border-t border-gray-100">
          {block.originalName}
        </figcaption>
      ) : null}
    </figure>
  );
};

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
    const textSegment = passage.slice(lastIndex, match.index);
    if (textSegment) {
      nodes.push(
        <p key={`text-${key++}`} className="whitespace-pre-wrap leading-relaxed text-gray-800">
          {textSegment}
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
          <p key={`missing-${key++}`} className="text-xs text-amber-600">
            Media với mã {mediaId} không khả dụng.
          </p>
        );
      }
    }

    lastIndex = match.index + match[0].length;
  }

  const tail = passage.slice(lastIndex);
  if (tail) {
    nodes.push(
      <p key={`text-${key++}`} className="whitespace-pre-wrap leading-relaxed text-gray-800">
        {tail}
      </p>
    );
  }

  return nodes;
};

interface SectionPanelProps {
  section: TestSection | null;
  panelHeight: number;
  hasPrevSection: boolean;
  hasNextSection: boolean;
  onPrevSection: () => void;
  onNextSection: () => void;
}

const SectionPanel: React.FC<SectionPanelProps> = ({
  section,
  panelHeight,
  hasPrevSection,
  hasNextSection,
  onPrevSection,
  onNextSection,
}) => {
  const panelStyle = { minHeight: 420, height: panelHeight > 0 ? panelHeight : 'auto' };

  return (
    <div
      className="flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white/98 shadow-xl shadow-slate-200/60"
      style={panelStyle}
      data-lenis-prevent
    >
      <div className="border-b border-slate-200/80 px-6 py-4">
        <div className="text-sm font-semibold text-slate-900 truncate">
          {section?.title || 'Phần hiện tại'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4" style={{ scrollbarWidth: 'thin' }}>
        {section?.passage ? (
          <div className="prose prose-sm max-w-none text-slate-800">
            {renderPassageContent(section.passage, section.mediaBlocks || [])}
          </div>
        ) : section?.mediaBlocks && section.mediaBlocks.length ? (
          <div className="space-y-4">
            {section.mediaBlocks.map((block, index) => renderMediaBlock(block, block.id || index))}
          </div>
        ) : (
          <p className="text-sm italic text-slate-500">Không có đoạn văn cho phần này.</p>
        )}

        {section?.audio ? (
          <div>
            <audio
              controls
              controlsList="nodownload"
              preload="auto"
              className="w-full"
              onContextMenu={(event) => event.preventDefault()}
            >
              <source src={section.audio} type="audio/mpeg" />
              Trình duyệt của bạn không hỗ trợ phát audio.
            </audio>
          </div>
        ) : null}

        {section?.image ? (
          <div>
            <img
              src={section.image}
              alt={section?.title || 'Section illustration'}
              className="rounded-lg border border-gray-200 w-full max-h-64 object-cover"
            />
          </div>
        ) : null}
      </div>
      <div className="border-t border-slate-200/80 bg-slate-50/80 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={onPrevSection} disabled={!hasPrevSection}>
            Phần trước
          </Button>
          <Button variant="primary" size="sm" onClick={onNextSection} disabled={!hasNextSection}>
            Phần sau
          </Button>
        </div>
      </div>
    </div>
  );
};

interface SectionQuestion {
  question: TestQuestion;
  globalIndex: number;
}

interface QuestionNavigatorProps {
  questions: TestQuestion[];
  answers: UserAnswer[];
  currentQuestionIndex: number;
  onSelect: (index: number) => void;
  className?: string;
  gridClassName?: string;
  showLegend?: boolean;
}

const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  questions,
  answers,
  currentQuestionIndex,
  onSelect,
  className,
  gridClassName,
  showLegend = true,
}) => {
  const containerClass = ['space-y-3', className].filter(Boolean).join(' ');
  const baseGridClass = 'grid gap-2';
  const columnClass = gridClassName || 'grid-cols-5';
  const composedGridClass = [baseGridClass, columnClass].filter(Boolean).join(' ');

  return (
    <div className={containerClass}>
      <div className={composedGridClass}>
        {questions.map((_, index) => {
          const answered = isQuestionAnswered(answers[index]);
          const isCurrent = index === currentQuestionIndex;

          return (
            <button
              key={index}
              onClick={() => onSelect(index)}
              className={`flex h-8 w-8 items-center justify-center rounded-md border text-[11px] font-semibold transition shadow-sm ${isCurrent
                ? 'bg-blue-600 text-white border-blue-600 shadow'
                : answered
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              aria-label={`Câu ${index + 1}${answered ? ' đã trả lời' : ''}`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      {showLegend ? (
        <div className="flex flex-wrap gap-4 text-[11px] text-slate-500">
          <div className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm bg-blue-600" />
            Hiện tại
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm border border-emerald-500 bg-emerald-300" />
            Đã trả lời
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm border border-slate-300 bg-slate-200" />
            Chưa trả lời
          </div>
        </div>
      ) : null}
    </div>
  );
};

interface OverviewPanelProps {
  questions: TestQuestion[];
  answers: UserAnswer[];
  sectionQuestionCount: number;
  currentSectionIndex: number;
  totalSections: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  answeredCount: number;
  panelHeight: number;
  onSelectQuestion: (index: number) => void;
}

// Khung tổng quan ở desktop giúp chọn câu nhanh và theo dõi tiến độ
const OverviewPanel: React.FC<OverviewPanelProps> = ({
  questions,
  answers,
  sectionQuestionCount,
  currentSectionIndex,
  totalSections,
  currentQuestionIndex,
  totalQuestions,
  answeredCount,
  panelHeight,
  onSelectQuestion,
}) => {
  const panelStyle = { minHeight: 420, height: panelHeight > 0 ? panelHeight : 'auto' };

  return (
    <div
      className="hidden h-full flex-col gap-5 rounded-3xl border border-blue-100/80 bg-gradient-to-br from-white via-blue-50/60 to-white p-6 shadow-lg shadow-blue-100/70 lg:flex"
      style={panelStyle}
      data-lenis-prevent
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">Câu hỏi trong phần này</div>
          {/* <p className="mt-1 text-xs text-slate-500">
            Hiển thị {sectionQuestionCount} câu • Phần {totalSections > 0 && currentSectionIndex >= 0 ? currentSectionIndex + 1 : 0}/
            {totalSections || 0}
          </p> */}
        </div>
        {/* <span className="inline-flex items-center rounded-xl bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600 shadow-inner">
          Câu {currentQuestionIndex + 1} / {totalQuestions || 0}
        </span> */}
      </div>

      <div className="flex-1 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
        <QuestionNavigator
          questions={questions}
          answers={answers}
          currentQuestionIndex={currentQuestionIndex}
          onSelect={onSelectQuestion}
          showLegend={false}
          className="space-y-4"
          gridClassName="grid-cols-5"
        />
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-4 text-[11px] text-slate-500">
          <div className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm bg-blue-600" />
            Hiện tại
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm border border-emerald-500 bg-emerald-300" />
            Đã trả lời
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm border border-slate-300 bg-slate-200" />
            Chưa trả lời
          </div>
        </div>
        <div className="text-xs text-slate-500">
          Đã trả lời {answeredCount}/{totalQuestions || 0} câu
        </div>
      </div>
    </div>
  );
};

interface QuestionPanelProps {
  sectionQuestions: SectionQuestion[];
  questions: TestQuestion[];
  answers: UserAnswer[];
  panelHeight: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  currentSectionIndex: number;
  totalSections: number;
  answeredCount: number;
  onGoToQuestion: (index: number) => void;
  onFocusQuestion: (index: number) => void;
  onPrevQuestion: () => void;
  onNextQuestion: () => void;
  onAnswerChange: (index: number, partial: Partial<UserAnswer>) => void;
}

const QuestionPanel: React.FC<QuestionPanelProps> = ({
  sectionQuestions,
  questions,
  answers,
  panelHeight,
  currentQuestionIndex,
  totalQuestions,
  currentSectionIndex,
  totalSections,
  answeredCount,
  onGoToQuestion,
  onFocusQuestion,
  onPrevQuestion,
  onNextQuestion,
  onAnswerChange,
}) => {
  const panelStyle = { minHeight: 420, height: panelHeight > 0 ? panelHeight : 'auto' };

  return (
    <div
      className="flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white/98 shadow-xl shadow-slate-200/60"
      style={panelStyle}
      data-lenis-prevent
    >
      <div className="border-b border-slate-200/80 bg-slate-50/80 px-6 py-4 lg:hidden">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">Câu hỏi trong phần này</div>
            {/* <p className="mt-1 text-xs text-slate-500">
              Hiển thị {sectionQuestions.length} câu • Phần {currentSectionIndex >= 0 ? currentSectionIndex + 1 : '-'} /{' '}
              {totalSections || 0}
            </p>
          </div>
          <div className="inline-flex items-center rounded-md bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 shadow-inner">
            Câu {currentQuestionIndex + 1} / {totalQuestions} */}
          </div>
        </div>
        <QuestionNavigator
          className="mt-4"
          questions={questions}
          answers={answers}
          currentQuestionIndex={currentQuestionIndex}
          onSelect={onGoToQuestion}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5" style={{ scrollbarWidth: 'thin' }}>
        {sectionQuestions.length === 0 ? (
          <div className="text-sm text-slate-500">Chưa có câu hỏi cho phần này.</div>
        ) : (
          sectionQuestions.map(({ question, globalIndex }) => {
            const answer = answers[globalIndex] ?? { selectedOptions: [], userAnswer: '', matchingAnswers: [] };
            const allowMultiple = question.allowMultiple ?? false;
            const matchingCount =
              answer.matchingAnswers?.filter((pair) => pair.selected && pair.selected.trim().length > 0).length || 0;
            const selectedCount = answer.selectedOptions.length || matchingCount || (answer.userAnswer ? 1 : 0);
            const isCurrent = globalIndex === currentQuestionIndex;

            return (
              <div
                key={question._id || globalIndex}
                id={`question-${globalIndex}`}
                className={`rounded-2xl border bg-white shadow-sm transition ${isCurrent ? 'border-blue-400 ring-2 ring-blue-100 shadow-md' : 'border-slate-200 hover:border-blue-200/70'
                  }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-blue-100/70 bg-blue-50/60 px-5 py-4">
                  <div className="mt-1 text-base font-medium text-gray-900">
                    Câu {question.questionNumber ?? globalIndex + 1}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {selectedCount > 0 ? (
                      <span className="text-[11px] font-medium text-green-600">Đã chọn {selectedCount}</span>
                    ) : null}
                  </div>
                </div>

                <div className="px-5 py-5 space-y-4">
                  {question.media?.audioUrl ? (
                    <div>
                      <audio
                        controls
                        controlsList="nodownload"
                        preload="auto"
                        className="w-full"
                        onContextMenu={(event) => event.preventDefault()}
                      >
                        <source src={question.media.audioUrl} type="audio/mpeg" />
                        Trình duyệt của bạn không hỗ trợ phát audio.
                      </audio>
                    </div>
                  ) : null}

                  <div className="text-slate-800 leading-relaxed whitespace-pre-wrap">{question.content}</div>

                  {question.type === 'multi_choice' ? (
                    <div className="flex flex-col gap-2">
                      {question.options?.map((option, optionIndex) => {
                        const selected = answer.selectedOptions.includes(option.text);
                        return (
                          <button
                            key={optionIndex}
                            type="button"
                            onClick={() => {
                              let newSelected: string[];
                              if (allowMultiple) {
                                newSelected = selected
                                  ? answer.selectedOptions.filter((item) => item !== option.text)
                                  : Array.from(new Set([...answer.selectedOptions, option.text]));
                              } else {
                                newSelected = selected ? [] : [option.text];
                              }
                              onAnswerChange(globalIndex, {
                                selectedOptions: newSelected,
                                userAnswer: allowMultiple ? newSelected.join(', ') : '',
                                matchingAnswers: answer.matchingAnswers ?? [],
                              });
                              onFocusQuestion(globalIndex);
                            }}
                            className={`relative flex items-start gap-3 w-full text-left px-4 py-3 rounded-lg border transition shadow-sm text-sm font-medium ${selected
                              ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                              : 'bg-white border-slate-200 hover:border-blue-200/70 hover:bg-blue-50/40 text-slate-700'
                              }`}
                          >
                            <span
                              className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold flex-shrink-0 ${selected ? 'bg-white text-blue-600 border-blue-600' : 'bg-slate-100 text-slate-500 border-slate-300'
                                }`}
                            >
                              {String.fromCharCode(65 + optionIndex)}
                            </span>
                            <span className="flex-1 leading-relaxed">{option.text}</span>
                            {selected ? (
                              <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-white shadow-inner" />
                            ) : null}
                          </button>
                        );
                      })}
                      {allowMultiple ? <p className="text-xs text-slate-500">Có thể chọn nhiều đáp án.</p> : null}
                    </div>
                  ) : null}

                  {question.type === 'dropdown' ? (
                    <div className="space-y-2">
                      <select
                        value={answer.selectedOptions[0] || ''}
                        onChange={(event) => {
                          onAnswerChange(globalIndex, {
                            selectedOptions: event.target.value ? [event.target.value] : [],
                            userAnswer: '',
                            matchingAnswers: answer.matchingAnswers ?? [],
                          });
                          onFocusQuestion(globalIndex);
                        }}
                        className="w-full p-3 border border-slate-300 rounded-lg bg-white text-slate-700 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-400/60"
                      >
                        <option value="">Chọn đáp án...</option>
                        {question.options?.map((option, optionIndex) => (
                          <option key={optionIndex} value={option.text}>
                            {option.text}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}

                  {question.type === 'short_answer' ? (
                    <div>
                      <input
                        value={answer.userAnswer || ''}
                        onChange={(event) => {
                          onAnswerChange(globalIndex, {
                            selectedOptions: [],
                            userAnswer: event.target.value,
                            matchingAnswers: answer.matchingAnswers ?? [],
                          });
                          onFocusQuestion(globalIndex);
                        }}
                        placeholder="Nhập câu trả lời của bạn..."
                        className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-400/60"
                        type="text"
                      />
                    </div>
                  ) : null}

                  {question.type === 'matching' ? (
                    <div className="space-y-3">
                      {(question.matchingPairs || []).map((pair, pairIndex) => {
                        const current = answer.matchingAnswers?.find((ans) => ans.prompt === pair.prompt)?.selected || '';
                        return (
                          <div key={pairIndex} className="space-y-1">
                            <div className="text-sm font-medium text-slate-700">{pair.prompt}</div>
                            <input
                              value={current}
                              onChange={(event) => {
                                const updatedPairs = (question.matchingPairs || []).map((candidate) => {
                                  const prevSelected =
                                    answer.matchingAnswers?.find((ans) => ans.prompt === candidate.prompt)?.selected || '';
                                  if (candidate.prompt === pair.prompt) {
                                    return { prompt: candidate.prompt, selected: event.target.value };
                                  }
                                  return { prompt: candidate.prompt, selected: prevSelected };
                                });
                                onAnswerChange(globalIndex, {
                                  matchingAnswers: updatedPairs,
                                  selectedOptions: answer.selectedOptions,
                                  userAnswer: answer.userAnswer,
                                });
                                onFocusQuestion(globalIndex);
                              }}
                              // placeholder="Nhập câu trả lời ghép cặp"
                              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-400/60"
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 bg-slate-50/80 px-6 py-4">
        {/* <div className="text-xs text-slate-500">Đã trả lời {answeredCount}/{totalQuestions} câu</div> */}
        <Button variant="outline" size="sm" onClick={onPrevQuestion} disabled={currentQuestionIndex === 0}>
          Câu trước
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={onNextQuestion}
          disabled={currentQuestionIndex >= totalQuestions - 1}
        >
          Câu sau
        </Button>
      </div>
    </div>
  );
};

const TakeTestPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [test, setTest] = useState<PlacementTest | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [panelHeight, setPanelHeight] = useState<number>(0);

  const gridRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const lenis = window.__lenis;
    if (!lenis) {
      return;
    }

    const syncLenisState = () => {
      if (window.innerWidth >= 1024) {
        lenis.stop?.();
      } else {
        lenis.start?.();
      }
    };

    syncLenisState();
    window.addEventListener('resize', syncLenisState);

    return () => {
      window.removeEventListener('resize', syncLenisState);
      lenis.start?.();
    };
  }, []);

  const updatePanelHeight = useCallback(() => {
    // Tính chiều cao khả dụng cho hai panel khi màn hình đủ rộng
    if (typeof window === 'undefined') {
      return;
    }

    if (!gridRef.current || window.innerWidth < 1024) {
      setPanelHeight(0);
      return;
    }

    const { top } = gridRef.current.getBoundingClientRect();
    const safeTop = Math.max(top, 0); // tránh lấy giá trị âm khiến panel cao bất thường
    const available = Math.max(420, Math.floor(window.innerHeight - safeTop - 32));
    setPanelHeight(available);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', updatePanelHeight);
    return () => window.removeEventListener('resize', updatePanelHeight);
  }, [updatePanelHeight]);

  useEffect(() => {
    const fetchTest = async () => {
      // Lấy dữ liệu bài thi và chuẩn hóa cấu trúc trước khi hiển thị
      if (!testId) {
        setIsLoading(false);
        toast.error('Không tìm thấy mã bài thi.');
        return;
      }

      setIsLoading(true);
      try {
        const response = await getTestForTaking(testId);
        const fetchedTest: PlacementTest | undefined = response?.test;
        if (fetchedTest) {
          setTest({
            ...fetchedTest,
            sections: sanitizeSections(fetchedTest.sections),
          });
          setTimeRemaining(Math.max(fetchedTest.timeLimit ?? 0, 0) * 60);
          setAnswers(fetchedTest.questions.map(() => ({
            selectedOptions: [],
            userAnswer: '',
            matchingAnswers: [],
          })));
          setCurrentQuestionIndex(0);
          setTimeout(updatePanelHeight, 100);
        } else {
          toast.error('Bài thi không tồn tại hoặc đã bị gỡ.');
          setTest(null);
        }
      } catch (error) {
        console.error('Không thể tải bài thi:', error);
        toast.error('Không thể tải bài thi. Vui lòng thử lại sau.');
        setTest(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTest();
  }, [testId, updatePanelHeight]);

  useEffect(() => {
    if (!test) {
      return;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (timeRemaining <= 0) {
      return;
    }

    timerRef.current = setInterval(() => {
      // Đồng hồ đếm ngược, tự dừng khi hết giờ
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [test, timeRemaining]);

  const handleSubmit = useCallback(
    async (isAutoSubmit = false) => {
      if (!test || isSubmitting) {
        return;
      }

      // Chuẩn bị dữ liệu trả lời trước khi gửi về server
      setIsSubmitting(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      try {
        const payload = test.questions
          .map((question, index) => {
            const answer = answers[index] ?? { selectedOptions: [], userAnswer: '', matchingAnswers: [] };
            const sanitizedMatching = (answer.matchingAnswers ?? [])
              .filter((pair) => pair.prompt && pair.selected && pair.selected.trim().length > 0)
              .map((pair) => ({ prompt: pair.prompt, selected: pair.selected.trim() }));

            const trimmedAnswer = answer.userAnswer?.trim() ?? '';

            return {
              questionId: question._id ?? '',
              selectedOptions: answer.selectedOptions ?? [],
              userAnswer: trimmedAnswer,
              matchingAnswers: sanitizedMatching.length ? sanitizedMatching : undefined,
            };
          })
          .filter((item) => item.questionId);

        const response = await submitTest({
          testId: test._id,
          answers: payload,
        });

        if (isAutoSubmit) {
          toast.info('Hết thời gian. Hệ thống đã nộp bài tự động.');
        } else {
          toast.success('Đã nộp bài thành công!');
        }

        navigate(`/test/${test._id}/result`, { state: { result: response?.result } });
      } catch (error) {
        console.error('Không thể nộp bài:', error);
        toast.error('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.');
        setIsSubmitting(false);
      }
    },
    [answers, isSubmitting, navigate, test]
  );

  useEffect(() => {
    if (!test || isLoading || isSubmitting) {
      return;
    }

    if (timeRemaining === 0) {
      handleSubmit(true);
    }
  }, [handleSubmit, isLoading, isSubmitting, test, timeRemaining]);

  useEffect(() => {
    if (!isLoading) {
      setTimeout(updatePanelHeight, 50);
    }
  }, [currentQuestionIndex, isLoading, updatePanelHeight]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleAnswerChange = useCallback((index: number, partial: Partial<UserAnswer>) => {
    setAnswers((previous) => {
      const next = [...previous];
      const existing = next[index] ?? { selectedOptions: [], userAnswer: '', matchingAnswers: [] };
      next[index] = {
        selectedOptions: partial.selectedOptions ?? existing.selectedOptions ?? [],
        userAnswer: partial.userAnswer ?? existing.userAnswer ?? '',
        matchingAnswers: partial.matchingAnswers ?? existing.matchingAnswers ?? [],
      };
      return next;
    });
  }, []);

  const goToQuestion = useCallback(
    (index: number) => {
      if (!test) {
        return;
      }

      const total = test.questions.length;
      const safeIndex = Math.min(Math.max(index, 0), total - 1);
      setCurrentQuestionIndex(safeIndex);

      if (typeof window !== 'undefined') {
        setTimeout(() => {
          const element = document.getElementById(`question-${safeIndex}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 80);
      }
    },
    [test]
  );

  const nextQuestion = useCallback(() => {
    // Chuyển tới câu kế sau trong giới hạn tổng số câu
    if (!test) {
      return;
    }
    setCurrentQuestionIndex((index) => Math.min(index + 1, test.questions.length - 1));
  }, [test]);

  const prevQuestion = useCallback(() => {
    // Lùi về câu trước nếu có
    setCurrentQuestionIndex((index) => Math.max(index - 1, 0));
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const safe = Math.max(seconds, 0);
    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    const secs = safe % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    if (!isLoading && test) {
      const element = document.getElementById(`question-${currentQuestionIndex}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [currentQuestionIndex, isLoading, test]);

  const sections = test?.sections ?? EMPTY_SECTIONS;
  const questions = test?.questions ?? EMPTY_QUESTIONS;

  const totalQuestions = questions.length;
  const totalSections = sections.length;

  const currentQuestion = questions[currentQuestionIndex] ?? null;
  const currentSectionId = normalizeId(currentQuestion?.sectionId);

  const currentSection = useMemo(() => {
    if (!currentSectionId) {
      return null;
    }
    return sections.find((section) => normalizeId(section?._id) === currentSectionId) ?? null;
  }, [currentSectionId, sections]);

  const sectionQuestions = useMemo<SectionQuestion[]>(() => {
    return questions
      .map((question, index) => ({ question, globalIndex: index }))
      .filter(({ question: candidate }) => normalizeId(candidate.sectionId) === currentSectionId);
  }, [currentSectionId, questions]);

  const currentSectionIndex = useMemo(() => {
    if (!currentSectionId) {
      return -1;
    }
    return sections.findIndex((section) => normalizeId(section?._id) === currentSectionId);
  }, [currentSectionId, sections]);

  const hasPrevSection = currentSectionIndex > 0;
  const hasNextSection = currentSectionIndex >= 0 && currentSectionIndex < totalSections - 1;

  const answeredCount = useMemo(() => {
    return answers.reduce((count, answer) => count + (isQuestionAnswered(answer) ? 1 : 0), 0);
  }, [answers]);

  const goToNextSection = useCallback(() => {
    if (currentSectionIndex < 0) {
      return;
    }
    const nextSection = sections[currentSectionIndex + 1];
    if (nextSection) {
      const nextId = normalizeId(nextSection._id);
      const firstQuestionIndex = questions.findIndex((q) => normalizeId(q.sectionId) === nextId);
      if (firstQuestionIndex >= 0) {
        goToQuestion(firstQuestionIndex);
      }
    }
  }, [currentSectionIndex, goToQuestion, questions, sections]);

  const goToPreviousSection = useCallback(() => {
    if (currentSectionIndex <= 0) {
      return;
    }
    const prevSection = sections[currentSectionIndex - 1];
    if (prevSection) {
      const prevId = normalizeId(prevSection._id);
      const firstQuestionIndex = questions.findIndex((q) => normalizeId(q.sectionId) === prevId);
      if (firstQuestionIndex >= 0) {
        goToQuestion(firstQuestionIndex);
      }
    }
  }, [currentSectionIndex, goToQuestion, questions, sections]);

  const handleManualSubmit = useCallback(async () => {
    if (!test || isSubmitting) {
      return;
    }

    const result = await Swal.fire({
      title: 'Bạn chắc chắn muốn nộp bài?',
      text: 'Sau khi nộp sẽ không thể chỉnh sửa câu trả lời.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Nộp bài',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#d33',
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    handleSubmit(false);
  }, [handleSubmit, isSubmitting, test]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto" />
          <p className="text-sm text-gray-600">Đang tải bài kiểm tra...</p>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-2xl border border-red-100" data-aos="zoom-in">
          <div className="text-8xl mb-6">❌</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">
            Không tìm thấy bài thi
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Bài thi này có thể đã bị xóa hoặc không khả dụng
          </p>
          <button
            onClick={() => navigate('/tests')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <span className="mr-2">🔙</span>
            Quay lại danh sách bài thi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50/80 flex flex-col">
      <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="flex w-full flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 lg:px-12">
          <div className="space-y-1 pt-2">
            <h1 className="text-lg font-semibold text-slate-900 leading-tight">{test.title}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/80 px-3 py-1.5 font-mono text-sm font-semibold text-blue-600 shadow-inner">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" aria-hidden />
              {formatTime(timeRemaining)}
            </div>
            <Button
              onClick={handleManualSubmit}
              disabled={isSubmitting}
              variant="danger"
              size="sm"
              loading={isSubmitting}
            >
              {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
            </Button>
          </div>
        </div>
        <div className="w-full px-4 sm:px-6 lg:px-12">
          <div className="relative h-1 w-full overflow-hidden rounded-full bg-slate-200/70">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-100 opacity-50" />
            <div
              className="relative h-full rounded-r-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 shadow-sm transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / Math.max(totalQuestions, 1)) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        <div className="mx-auto flex h-full w-full max-w-none px-4 pt-6 sm:px-6 lg:px-12">
          <div
            ref={gridRef}
            className="grid h-full w-full grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1.08fr)_minmax(220px,0.44fr)] lg:gap-8"
          >
            <SectionPanel
              section={currentSection}
              panelHeight={panelHeight}
              hasPrevSection={hasPrevSection}
              hasNextSection={hasNextSection}
              onPrevSection={goToPreviousSection}
              onNextSection={goToNextSection}
            />

            <QuestionPanel
              sectionQuestions={sectionQuestions}
              questions={questions}
              answers={answers}
              panelHeight={panelHeight}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={totalQuestions}
              currentSectionIndex={currentSectionIndex}
              totalSections={totalSections}
              answeredCount={answeredCount}
              onGoToQuestion={goToQuestion}
              onFocusQuestion={setCurrentQuestionIndex}
              onPrevQuestion={prevQuestion}
              onNextQuestion={nextQuestion}
              onAnswerChange={handleAnswerChange}
            />

            <OverviewPanel
              questions={questions}
              answers={answers}
              sectionQuestionCount={sectionQuestions.length}
              currentSectionIndex={currentSectionIndex}
              totalSections={totalSections}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={totalQuestions}
              answeredCount={answeredCount}
              panelHeight={panelHeight}
              onSelectQuestion={goToQuestion}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default TakeTestPage;

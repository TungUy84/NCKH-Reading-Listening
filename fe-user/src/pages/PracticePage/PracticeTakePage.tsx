import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { Clock, Check, XCircle, ArrowLeft } from 'lucide-react';
import { getPracticeForLearner, submitPracticeAttempt } from '../../services/api';
import { Button } from '../../components/ui/Button';
import {
  PracticeAnswerInput,
  PracticeDetail,
  PracticeQuestion,
  PracticeSection,
  PracticeSubmissionPayload,
  SectionMedia
} from '../../types';

const mediaPlaceholderRegex = /\[\[media:([^\]]+)\]\]/g;

const EMPTY_SECTIONS: PracticeSection[] = [];
const EMPTY_QUESTIONS: PracticeQuestion[] = [];

interface PracticeAnswerState {
  selectedOptions: string[];
  userAnswer: string;
  matchingAnswers: { prompt: string; selected: string }[];
}

interface PracticeDetailResponse {
  message: string;
  practice: PracticeDetail;
}

interface PracticeSubmissionResponse {
  message: string;
  data?: {
    attempt?: {
      _id?: string;
    };
  };
}

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

const isQuestionAnswered = (answer?: PracticeAnswerState | null): boolean => {
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
    .map((block) => {
      const candidate = block as Partial<SectionMedia> & { _id?: string; path?: string; name?: string };
      const normalizedType: SectionMedia['type'] = candidate.type === 'audio' ? 'audio' : 'image';

      const normalized: SectionMedia = {
        id: candidate.id || candidate._id || generateMediaId(),
        type: normalizedType,
        url: candidate.url || (candidate as unknown as { path?: string }).path || '',
        originalName: candidate.originalName || candidate.name || '',
        transcript: typeof candidate.transcript === 'string' ? candidate.transcript : undefined
      };

      return normalized;
    })
    .filter((block) => !!block.id && !!block.url);
};

const sanitizeSections = (sections: PracticeSection[] = []): PracticeSection[] => {
  return sections.map((section) => ({
    ...section,
    mediaBlocks: normalizeMediaBlocks(section?.mediaBlocks)
  }));
};

const renderMediaBlock = (block: SectionMedia, key: string | number): ReactNode => {
  if (!block?.url) {
    return (
      <div
        key={`media-missing-${key}`}
        className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700"
      >
        Media content not found.
      </div>
    );
  }

  if (block.type === 'audio') {
    return (
      <div key={`media-audio-${key}`} className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 shadow-sm">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700">Audio</div>
        <audio
          controls
          controlsList="nodownload"
          preload="auto"
          className="w-full"
          onContextMenu={(event) => event.preventDefault()}
        >
          <source src={block.url} />
          Your browser does not support audio playback.
        </audio>
      </div>
    );
  }

  return (
    <figure
      key={`media-image-${key}`}
      className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
    >
      <img
        src={block.url}
        alt={block.originalName || `Media ${block.id}`}
        className="h-auto w-full object-contain"
      />
      {block.originalName ? (
        <figcaption className="border-t border-gray-100 px-4 py-2 text-xs text-gray-500">
          {block.originalName}
        </figcaption>
      ) : null}
    </figure>
  );
};

const renderPartContent = (passage: string, mediaBlocks: SectionMedia[] = []): ReactNode => {
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
            Media with code {mediaId} is not available.
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
  section: PracticeSection | null;
  panelHeight: number;
  hasPrevSection: boolean;
  hasNextSection: boolean;
  onPrevSection: () => void;
  onNextSection: () => void;
}

const formatSectionTitle = (title?: string | null): string => {
  if (!title) return 'Current part';
  return title.replace(/^passage\b/i, 'Part');
};

const SectionPanel: React.FC<SectionPanelProps> = ({
  section,
  panelHeight,
  hasPrevSection,
  hasNextSection,
  onPrevSection,
  onNextSection
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
          {formatSectionTitle(section?.title)}
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5" style={{ scrollbarWidth: 'thin' }}>
        {section?.passage ? (
          <div className="prose prose-sm max-w-none text-slate-800">
            {renderPartContent(section.passage, section.mediaBlocks || [])}
          </div>
        ) : section?.mediaBlocks && section.mediaBlocks.length ? (
          <div className="space-y-4">
            {section.mediaBlocks.map((block, index) => renderMediaBlock(block, block.id || index))}
          </div>
        ) : (
          <p className="text-sm italic text-slate-500">No content for this part.</p>
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
              Your browser does not support audio playback.
            </audio>
          </div>
        ) : null}

        {section?.image ? (
          <div>
            <img
              src={section.image}
              alt={formatSectionTitle(section?.title) || 'Section illustration'}
              className="w-full max-h-64 rounded-lg border border-gray-200 object-cover"
            />
          </div>
        ) : null}
      </div>
      <div className="border-t border-slate-200/80 bg-slate-50/80 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={onPrevSection} disabled={!hasPrevSection}>
            Previous part
          </Button>
          <Button variant="primary" size="sm" onClick={onNextSection} disabled={!hasNextSection}>
            Next part
          </Button>
        </div>
      </div>
    </div>
  );
};

interface SectionQuestion {
  question: PracticeQuestion;
  globalIndex: number;
}

interface QuestionNavigatorProps {
  questions: PracticeQuestion[];
  answers: PracticeAnswerState[];
  currentQuestionIndex: number;
  onSelect: (index: number) => void;
  className?: string;
  gridClassName?: string;
  showLegend?: boolean;
  inline?: boolean;
  questionIndices?: number[];
  totalQuestions: number;
}

const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  questions,
  answers,
  currentQuestionIndex,
  onSelect,
  className,
  gridClassName,
  showLegend = true,
  inline = false,
  questionIndices,
  totalQuestions
}) => {
  const containerClass = [inline ? 'flex flex-wrap items-center gap-2' : 'space-y-3', className]
    .filter(Boolean)
    .join(' ');
  const baseGridClass = inline ? 'flex flex-wrap gap-2' : 'grid gap-2';
  const columnClass = inline ? '' : gridClassName || 'grid-cols-5';
  const composedGridClass = [baseGridClass, columnClass].filter(Boolean).join(' ');

  const sourceQuestions = questions.length ? questions : new Array(totalQuestions).fill(null);

  return (
    <div className={containerClass}>
      <div className={composedGridClass}>
        {sourceQuestions.map((_, index) => {
          const targetIndex = questionIndices ? questionIndices[index] : index;
          const answer = answers[targetIndex] ?? answers[index];
          const answered = isQuestionAnswered(answer);
          const isCurrent = targetIndex === currentQuestionIndex;
          const displayNumber = targetIndex + 1;

          return (
            <button
              key={index}
              onClick={() => onSelect(targetIndex)}
              className={`flex h-8 w-8 items-center justify-center rounded-md border text-[11px] font-semibold shadow-sm transition ${
                isCurrent
                  ? 'border-blue-600 bg-blue-600 text-white shadow'
                  : answered
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
              }`}
              aria-label={`Question ${displayNumber}${answered ? ' answered' : ''}`}
            >
              {displayNumber}
            </button>
          );
        })}
      </div>

      {showLegend && !inline ? (
        <div className="flex flex-wrap gap-4 text-[11px] text-slate-500">
          <div className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm bg-blue-600" />
            Current
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm border border-emerald-500 bg-emerald-300" />
            Answered
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm border border-slate-300 bg-slate-200" />
            Not answered
          </div>
        </div>
      ) : null}
    </div>
  );
};

interface QuestionPanelProps {
  sectionQuestions: SectionQuestion[];
  answers: PracticeAnswerState[];
  panelHeight: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  onFocusQuestion: (index: number) => void;
  onPrevQuestion: () => void;
  onNextQuestion: () => void;
  onAnswerChange: (index: number, partial: Partial<PracticeAnswerState>) => void;
}

const QuestionPanel: React.FC<QuestionPanelProps> = ({
  sectionQuestions,
  answers,
  panelHeight,
  currentQuestionIndex,
  totalQuestions,
  onFocusQuestion,
  onPrevQuestion,
  onNextQuestion,
  onAnswerChange
}) => {
  const panelStyle = { minHeight: 420, height: panelHeight > 0 ? panelHeight : 'auto' };
  const sectionQuestionTotal = sectionQuestions.length;
  const sectionAnsweredCount = sectionQuestions.reduce((count, { globalIndex }) => {
    return count + (isQuestionAnswered(answers[globalIndex]) ? 1 : 0);
  }, 0);

  return (
    <div
      className="flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white/98 shadow-xl shadow-slate-200/60"
      style={panelStyle}
      data-lenis-prevent
    >
      <div className="border-b border-slate-200/80 bg-slate-50/80 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-900">Questions in this part</div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span>
              Answered {sectionAnsweredCount}/{sectionQuestionTotal || 0}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5" style={{ scrollbarWidth: 'thin' }}>
        {sectionQuestions.length === 0 ? (
          <div className="text-sm text-slate-500">No questions for this section.</div>
        ) : (
          sectionQuestions.map(({ question, globalIndex }) => {
            const answer =
              answers[globalIndex] ?? {
                selectedOptions: [],
                userAnswer: '',
                matchingAnswers: []
              };
            const allowMultiple = question.allowMultiple ?? false;
            const isCurrent = globalIndex === currentQuestionIndex;

            return (
              <div
                key={question._id || globalIndex}
                id={`question-${globalIndex}`}
                className={`rounded-2xl border bg-white shadow-sm transition ${
                  isCurrent
                    ? 'border-blue-400 ring-2 ring-blue-100 shadow-md'
                    : 'border-slate-200 hover:border-blue-200/70'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-blue-100/70 bg-blue-50/60 px-5 py-4">
                  <div className="text-base font-semibold leading-relaxed text-gray-900">
                    <span>{`Question ${question.questionNumber ?? globalIndex + 1}: `}</span>
                    <span className="font-normal whitespace-pre-wrap text-slate-700">{question.content}</span>
                  </div>
                </div>

                <div className="space-y-4 px-5 py-5">
                  {question.type === 'multi_choice' ? (
                    <div className="flex flex-col gap-2">
                      {question.options?.map((option, optionIndex) => {
                        const selected = answer.selectedOptions.includes(option.text);
                        const selectedClass = allowMultiple
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-blue-600 bg-blue-600 text-white shadow-md';
                        const unselectedClass = allowMultiple
                          ? 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200/70 hover:bg-blue-50/40';

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
                                matchingAnswers: answer.matchingAnswers ?? []
                              });
                              onFocusQuestion(globalIndex);
                            }}
                            className={`relative flex w-full items-start gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium shadow-sm transition ${
                              selected ? selectedClass : unselectedClass
                            }`}
                          >
                            {allowMultiple ? (
                              <span
                                className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border text-[11px] font-semibold ${
                                  selected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-transparent'
                                }`}
                                aria-hidden
                              >
                                <Check className="h-3 w-3" aria-hidden="true" />
                              </span>
                            ) : (
                              <span
                                className={`mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                                  selected
                                    ? 'border-blue-600 bg-white text-blue-600'
                                    : 'border-slate-300 bg-slate-100 text-slate-500'
                                }`}
                              >
                                {String.fromCharCode(65 + optionIndex)}
                              </span>
                            )}
                            <span className="flex-1 leading-relaxed">{option.text}</span>
                          </button>
                        );
                      })}
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
                            matchingAnswers: answer.matchingAnswers ?? []
                          });
                          onFocusQuestion(globalIndex);
                        }}
                        className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-400/60"
                      >
                        <option value="">Select an answer...</option>
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
                            matchingAnswers: answer.matchingAnswers ?? []
                          });
                          onFocusQuestion(globalIndex);
                        }}
                        placeholder="Enter your answer..."
                        className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-400/60"
                        type="text"
                      />
                    </div>
                  ) : null}

                  {question.type === 'matching' ? (
                    <div className="space-y-3">
                      {(question.matchingPairs || []).map((pair, pairIndex) => {
                        const current =
                          answer.matchingAnswers?.find((candidate) => candidate.prompt === pair.prompt)?.selected || '';
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
                                  userAnswer: answer.userAnswer
                                });
                                onFocusQuestion(globalIndex);
                              }}
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
        <Button variant="outline" size="sm" onClick={onPrevQuestion} disabled={currentQuestionIndex === 0}>
          Previous question
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={onNextQuestion}
          disabled={currentQuestionIndex >= totalQuestions - 1}
        >
          Next question
        </Button>
      </div>
    </div>
  );
};

const buildDefaultAnswer = (question: PracticeQuestion): PracticeAnswerState => ({
  selectedOptions: [],
  userAnswer: '',
  matchingAnswers: Array.isArray(question.matchingPairs)
    ? question.matchingPairs.map((pair) => ({ prompt: pair.prompt, selected: '' }))
    : []
});

const PracticeTakePage: React.FC = () => {
  const { practiceId } = useParams<{ practiceId: string }>();
  const navigate = useNavigate();

  const [practice, setPractice] = useState<PracticeDetail | null>(null);
  const [answers, setAnswers] = useState<PracticeAnswerState[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [panelHeight, setPanelHeight] = useState<number>(0);

  const gridRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startedAtRef = useRef<Date | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const lenis = (window as typeof window & { __lenis?: { stop?: () => void; start?: () => void } }).__lenis;
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
    if (typeof window === 'undefined') {
      return;
    }

    if (!gridRef.current || window.innerWidth < 1024) {
      setPanelHeight(0);
      return;
    }

    const { top } = gridRef.current.getBoundingClientRect();
    const safeTop = Math.max(top, 0);
    const available = Math.max(420, Math.floor(window.innerHeight - safeTop - 32));
    setPanelHeight(available);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', updatePanelHeight);
    return () => window.removeEventListener('resize', updatePanelHeight);
  }, [updatePanelHeight]);

  const fetchPracticeDetail = useCallback(async () => {
    if (!practiceId) {
      toast.error('Practice ID not found.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = (await getPracticeForLearner(practiceId)) as PracticeDetailResponse;
      const fetchedPractice = response?.practice;

      if (!fetchedPractice) {
        toast.error('The practice set does not exist or has been removed.');
        setPractice(null);
        return;
      }

      const sanitizedSections = sanitizeSections(fetchedPractice.sections || []);
      const normalizedQuestions = fetchedPractice.questions || [];

      setPractice({ ...fetchedPractice, sections: sanitizedSections, questions: normalizedQuestions });
      setAnswers(normalizedQuestions.map((question) => buildDefaultAnswer(question)));
      setCurrentQuestionIndex(0);

      const limitSeconds = Math.max(Number(fetchedPractice.estimatedTime ?? 0), 0) * 60;
      setTimeRemaining(limitSeconds);
      startedAtRef.current = new Date();

      setTimeout(updatePanelHeight, 100);
    } catch (error) {
      console.error('Unable to load practice detail:', error);
      toast.error('Unable to load the practice. Please try again later.');
      setPractice(null);
    } finally {
      setIsLoading(false);
    }
  }, [practiceId, updatePanelHeight]);

  useEffect(() => {
    fetchPracticeDetail();
  }, [fetchPracticeDetail]);

  useEffect(() => {
    if (!practice) {
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
  }, [practice, timeRemaining]);

  const handleAnswerChange = useCallback((index: number, partial: Partial<PracticeAnswerState>) => {
    setAnswers((previous) => {
      const next = [...previous];
      const existing = next[index] ?? { selectedOptions: [], userAnswer: '', matchingAnswers: [] };
      next[index] = {
        selectedOptions: partial.selectedOptions ?? existing.selectedOptions ?? [],
        userAnswer: partial.userAnswer ?? existing.userAnswer ?? '',
        matchingAnswers: partial.matchingAnswers ?? existing.matchingAnswers ?? []
      };
      return next;
    });
  }, []);

  const goToQuestion = useCallback(
    (index: number) => {
      if (!practice) {
        return;
      }

      const total = practice.questions.length;
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
    [practice]
  );

  const nextQuestion = useCallback(() => {
    if (!practice) {
      return;
    }
    setCurrentQuestionIndex((index) => Math.min(index + 1, practice.questions.length - 1));
  }, [practice]);

  const prevQuestion = useCallback(() => {
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
    if (!isLoading && practice) {
      const element = document.getElementById(`question-${currentQuestionIndex}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [currentQuestionIndex, isLoading, practice]);

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

  const totalQuestions = practice?.questions.length ?? 0;
  const sections = practice?.sections ?? EMPTY_SECTIONS;
  const questions = practice?.questions ?? EMPTY_QUESTIONS;

  const currentQuestion = questions[currentQuestionIndex] ?? null;
  const currentSectionId = normalizeId(currentQuestion?.sectionId);

  const hasSections = sections.length > 0;

  const effectiveSectionId = hasSections ? currentSectionId || normalizeId(sections[0]?._id) : '';

  const currentSection = useMemo(() => {
    if (!hasSections) {
      return null;
    }
    return sections.find((section) => normalizeId(section?._id) === effectiveSectionId) ?? sections[0] ?? null;
  }, [effectiveSectionId, hasSections, sections]);

  const sectionQuestions = useMemo<SectionQuestion[]>(() => {
    if (!hasSections) {
      return questions.map((question, index) => ({ question, globalIndex: index }));
    }
    return questions
      .map((question, index) => ({ question, globalIndex: index }))
      .filter(({ question: candidate }) => normalizeId(candidate.sectionId) === effectiveSectionId);
  }, [effectiveSectionId, hasSections, questions]);

  const sectionNavigatorQuestions = useMemo(
    () => (sectionQuestions.length ? sectionQuestions.map(({ question }) => question) : questions),
    [questions, sectionQuestions]
  );

  const sectionNavigatorAnswers = useMemo(() => {
    if (!sectionQuestions.length) {
      return answers;
    }
    return sectionQuestions.map(({ globalIndex }) => answers[globalIndex] ?? buildDefaultAnswer(questions[globalIndex]));
  }, [answers, questions, sectionQuestions]);

  const sectionNavigatorIndices = useMemo(() => {
    if (!sectionQuestions.length) {
      return questions.map((_, index) => index);
    }
    return sectionQuestions.map(({ globalIndex }) => globalIndex);
  }, [questions, sectionQuestions]);

  const currentSectionIndex = useMemo(() => {
    if (!hasSections) {
      return -1;
    }
    return sections.findIndex((section) => normalizeId(section?._id) === effectiveSectionId);
  }, [effectiveSectionId, hasSections, sections]);

  const hasPrevSection = hasSections && currentSectionIndex > 0;
  const hasNextSection = hasSections && currentSectionIndex >= 0 && currentSectionIndex < sections.length - 1;

  const goToNextSection = useCallback(() => {
    if (!hasSections || currentSectionIndex < 0) {
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
  }, [currentSectionIndex, goToQuestion, hasSections, questions, sections]);

  const goToPreviousSection = useCallback(() => {
    if (!hasSections || currentSectionIndex <= 0) {
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
  }, [currentSectionIndex, goToQuestion, hasSections, questions, sections]);

  const buildSubmissionPayload = useCallback((): PracticeSubmissionPayload => {
    if (!practice) {
      return { answers: [] };
    }

    const answerPayload: PracticeAnswerInput[] = practice.questions.map((question, index) => {
      const answer = answers[index] ?? buildDefaultAnswer(question);
      return {
        questionId: question._id,
        questionNumber: question.questionNumber,
        selectedOptions: answer.selectedOptions,
        userAnswer: answer.userAnswer,
        matchingAnswers: answer.matchingAnswers
          .filter((item) => item.selected && item.selected.trim().length)
          .map((item) => ({ prompt: item.prompt, selected: item.selected.trim() }))
      };
    });

    const now = new Date();
    const durationSeconds = startedAtRef.current ? Math.max(0, Math.round((now.getTime() - startedAtRef.current.getTime()) / 1000)) : undefined;

    return {
      answers: answerPayload,
      durationSeconds,
      startedAt: startedAtRef.current?.toISOString(),
      completedAt: now.toISOString()
    };
  }, [answers, practice]);

  const handleSubmit = useCallback(
    async (isAutoSubmit = false) => {
      if (!practiceId || !practice || isSubmitting) {
        return;
      }

      setIsSubmitting(true);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      try {
        const payload = buildSubmissionPayload();
        if (!payload.answers.length) {
          toast.error('There are no questions to submit.');
          setIsSubmitting(false);
          return;
        }

        const response = (await submitPracticeAttempt(practiceId, payload)) as PracticeSubmissionResponse;
        const attemptId = response?.data?.attempt?._id;

        if (!attemptId) {
          throw new Error('The server did not return a valid attempt identifier.');
        }

        if (isAutoSubmit) {
          toast.info('Time is up. The system submitted your practice automatically.');
        } else {
          toast.success('Practice submitted successfully!');
        }

        navigate(`/practice/attempts/${attemptId}`, { state: { practiceId } });
      } catch (error) {
        console.error('Unable to submit practice attempt:', error);
        toast.error('An error occurred while submitting. Please try again.');
        setIsSubmitting(false);
      }
    },
    [buildSubmissionPayload, isSubmitting, navigate, practice, practiceId]
  );

  useEffect(() => {
    if (!practice || isLoading || isSubmitting) {
      return;
    }

    if (timeRemaining === 0 && (practice.estimatedTime ?? 0) > 0) {
      handleSubmit(true).catch((error) => {
        console.error('Auto submit failed:', error);
      });
    }
  }, [handleSubmit, isLoading, isSubmitting, practice, timeRemaining]);

  const handleManualSubmit = useCallback(async () => {
    if (!practice || isSubmitting) {
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure you want to submit?',
      text: 'After submitting you will not be able to modify your answers.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Submit',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#d33',
      reverseButtons: true
    });

    if (!result.isConfirmed) {
      return;
    }

    await handleSubmit(false);
  }, [handleSubmit, isSubmitting, practice]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="text-sm text-gray-600">Loading practice...</p>
        </div>
      </div>
    );
  }

  if (!practice) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50">
        <div className="max-w-lg rounded-2xl border border-red-100 bg-white p-8 text-center shadow-2xl" data-aos="zoom-in">
          <XCircle className="mx-auto mb-6 h-20 w-20 text-red-500" aria-hidden="true" />
          <h1 className="mb-4 text-3xl font-bold text-transparent bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text">
            Practice not found
          </h1>
          <p className="mb-8 leading-relaxed text-gray-600">
            This practice set may have been deleted or is unavailable.
          </p>
          <button
            onClick={() => navigate('/practice')}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-purple-700"
          >
            <span className="mr-2 inline-flex items-center justify-center">
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </span>
            Back to practice list
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-100 via-white to-blue-50/80">
      <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="flex w-full flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-12">
          <div className="space-y-1">
            <h1 className="text-lg font-semibold leading-tight text-slate-900">{practice.title}</h1>
          </div>
          {totalQuestions > 0 ? (
            <div className="flex-1 min-w-[260px] max-w-full">
              <div className="flex flex-col items-center gap-2">
                <QuestionNavigator
                  className="w-full justify-center"
                  questions={sectionNavigatorQuestions}
                  answers={sectionNavigatorAnswers}
                  currentQuestionIndex={currentQuestionIndex}
                  onSelect={goToQuestion}
                  showLegend={false}
                  inline
                  questionIndices={sectionNavigatorIndices}
                  totalQuestions={totalQuestions}
                />
                <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-600" />
                    Current
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm border border-emerald-500 bg-emerald-300" />
                    Answered
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm border border-slate-300 bg-slate-200" />
                    Not answered
                  </span>
                </div>
              </div>
            </div>
          ) : null}
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 sm:gap-4">
            <div className="flex items-center gap-2 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-blue-100 px-4 py-2 font-mono text-base font-semibold text-blue-600 shadow-inner">
              <Clock className="h-4 w-4 text-blue-500" aria-hidden />
              <span>{formatTime(timeRemaining)}</span>
            </div>
            <Button
              onClick={handleManualSubmit}
              disabled={isSubmitting}
              variant="danger"
              size="md"
              loading={isSubmitting}
              className="text-sm font-semibold"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
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
            className="grid h-full w-full grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-8"
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
              answers={answers}
              panelHeight={panelHeight}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={totalQuestions}
              onFocusQuestion={setCurrentQuestionIndex}
              onPrevQuestion={prevQuestion}
              onNextQuestion={nextQuestion}
              onAnswerChange={handleAnswerChange}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default PracticeTakePage;

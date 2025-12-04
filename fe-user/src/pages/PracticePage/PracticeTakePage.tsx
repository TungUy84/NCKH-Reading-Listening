import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  ArrowLeftIcon,
  SpeakerWaveIcon,
  DocumentTextIcon,
  ListBulletIcon,
  CheckIcon,
  XCircleIcon,
  PlayIcon,
  PauseIcon,
  ChevronRightIcon,
  ClockIcon,
  PencilIcon,
  ChatBubbleBottomCenterTextIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { getPracticeForLearner, submitPracticeAttempt, updateRoadmapProgress } from '../../services/api';
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

interface TextHighlight {
  id: string;
  paragraphIndex: number;
  startOffset: number;
  endOffset: number;
  text: string;
  color: string;
  note?: string;
}

// --- THEME HELPER ---
const getTheme = (skill?: string) => {
  const isListening = skill === 'listening';
  return {
    isListening,
    primary: isListening ? 'purple' : 'blue',
    gradient: isListening ? 'from-purple-500 to-pink-500' : 'from-blue-500 to-cyan-500',
    text: isListening ? 'text-purple-600' : 'text-blue-600',
    textDark: isListening ? 'text-purple-900' : 'text-blue-900',
    bg: isListening ? 'bg-purple-50' : 'bg-blue-50',
    bgLight: isListening ? 'bg-purple-50/50' : 'bg-blue-50/50',
    border: isListening ? 'border-purple-200' : 'border-blue-200',
    borderActive: isListening ? 'border-purple-500' : 'border-blue-500',
    shadow: isListening ? 'shadow-purple-200' : 'shadow-blue-200',
    ring: isListening ? 'ring-purple-200' : 'ring-blue-200',
    icon: isListening ? 'text-purple-500' : 'text-blue-500',
    button: isListening ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700',
    buttonLight: isListening ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  };
};

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

const getMediaUrl = (path?: string) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('blob:')) return path;
  const baseUrl = (process.env.REACT_APP_API_URL || '').replace(/\/api\/?$/, '');
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
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
        url: getMediaUrl(candidate.url || (candidate as unknown as { path?: string }).path),
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
    audio: getMediaUrl(section.audio),
    image: getMediaUrl(section.image),
    mediaBlocks: normalizeMediaBlocks(section?.mediaBlocks)
  }));
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

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return "0:00";
  const safe = Math.max(seconds, 0);
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = Math.floor(safe % 60);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
};

const AudioPlayer: React.FC<{ src: string; theme?: any }> = React.memo(({ src, theme }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = Number(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  // Default theme fallback if not provided
  const activeTheme = theme || {
    isListening: false,
    button: 'bg-blue-600 hover:bg-blue-700',
    text: 'text-blue-600',
    bgLight: 'bg-blue-50',
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="group relative flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-all hover:shadow-md hover:border-slate-300">
      <audio ref={audioRef} src={src} preload="metadata" />
      
      <button 
        onClick={togglePlay}
        className={clsx(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white shadow-md transition-all hover:scale-105 active:scale-95",
          activeTheme.button
        )}
      >
        {isPlaying ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6 ml-0.5" />}
      </button>

      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex justify-between text-xs font-bold text-slate-500">
          <span className={activeTheme.text}>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="relative h-2 w-full rounded-full bg-slate-100">
          <div 
            className={clsx("absolute h-full rounded-full transition-all", activeTheme.button)} 
            style={{ width: `${progressPercent}%` }} 
          />
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>
      </div>
    </div>
  );
});

const renderMediaBlock = (block: SectionMedia, key: string | number, theme?: any): ReactNode => {
  if (!block?.url) return <div key={`missing-${key}`} className="text-xs text-amber-600 p-2 border border-amber-200 bg-amber-50 rounded">Media missing</div>;
  if (block.type === 'audio') return <div key={`audio-${key}`} className="my-2"><AudioPlayer src={block.url} theme={theme} /></div>;

  return (
    <figure key={`img-${key}`} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden my-2">
      <img src={block.url} alt={block.originalName || 'Media'} className="w-full h-auto object-contain" />
    </figure>
  );
};

const SelectableParagraph: React.FC<{
  text: string;
  index: number;
  highlights: TextHighlight[];
  onSelection: (index: number, range: Range, rect: DOMRect, text: string) => void;
  onHighlightClick: (h: TextHighlight, rect: DOMRect) => void;
  theme: any;
}> = React.memo(({ text, index, highlights, onSelection, onHighlightClick, theme }) => {
  const pRef = useRef<HTMLParagraphElement>(null);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !pRef.current) return;
    
    if (!pRef.current.contains(selection.anchorNode)) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    onSelection(index, range, rect, selection.toString());
  };

  const renderContent = () => {
    if (highlights.length === 0) return text;

    const sorted = [...highlights].sort((a, b) => a.startOffset - b.startOffset);
    const nodes: ReactNode[] = [];
    let lastIndex = 0;

    sorted.forEach((h) => {
      const start = Math.max(h.startOffset, lastIndex);
      const end = Math.min(h.endOffset, text.length);

      if (start > lastIndex) {
        nodes.push(text.slice(lastIndex, start));
      }
      
      if (end > start) {
        nodes.push(
          <span 
            key={h.id}
            onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              onHighlightClick(h, rect);
            }}
            className={clsx(
              "cursor-pointer transition-colors rounded px-0.5 mx-0.5 border-b-2",
              theme.isListening ? "bg-purple-100 border-purple-300 hover:bg-purple-200" : "bg-yellow-100 border-yellow-300 hover:bg-yellow-200"
            )}
            title={h.note}
          >
            {text.slice(start, end)}
          </span>
        );
      }
      lastIndex = Math.max(lastIndex, end);
    });

    if (lastIndex < text.length) {
      nodes.push(text.slice(lastIndex));
    }
    return nodes;
  };

  return (
    <p ref={pRef} onMouseUp={handleMouseUp} className="whitespace-pre-wrap leading-relaxed text-slate-700 relative">
      {renderContent()}
    </p>
  );
});

const PassageRenderer: React.FC<{
  passage: string;
  mediaBlocks: SectionMedia[];
  highlights: TextHighlight[];
  onSelection: (index: number, range: Range, rect: DOMRect, text: string) => void;
  onHighlightClick: (h: TextHighlight, rect: DOMRect) => void;
  theme: any;
}> = ({ passage, mediaBlocks, highlights, onSelection, onHighlightClick, theme }) => {
  const mediaMap = useMemo(() => new Map(mediaBlocks.map(b => [String(b.id), b])), [mediaBlocks]);
  if (!passage) return null;
  
  return (
    <>
      {passage.split(mediaPlaceholderRegex).map((part, i) => {
        if (i % 2 === 0) {
          // Text part
          const paragraphIndex = Math.floor(i / 2);
          const relevantHighlights = highlights.filter(h => h.paragraphIndex === paragraphIndex);
          return (
            <SelectableParagraph 
              key={i} 
              text={part} 
              index={paragraphIndex}
              highlights={relevantHighlights}
              onSelection={onSelection}
              onHighlightClick={onHighlightClick}
              theme={theme}
            />
          );
        }
        const block = mediaMap.get(part.trim());
        return block ? renderMediaBlock(block, i, theme) : null;
      })}
    </>
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
  
  // --- Highlight & Note State ---
  const [highlights, setHighlights] = useState<TextHighlight[]>([]);
  const [selectionToolbar, setSelectionToolbar] = useState<{
    visible: boolean;
    x: number;
    y: number;
    range: Range | null;
    paragraphIndex: number;
    text: string;
  } | null>(null);
  const [noteModal, setNoteModal] = useState<{
    visible: boolean;
    highlight: TextHighlight | null;
    x: number;
    y: number;
  } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startedAtRef = useRef<Date | null>(null);
  const deadlineRef = useRef<number | null>(null);

  const theme = useMemo(() => getTheme(practice?.skill), [practice?.skill]);

  // Load highlights
  useEffect(() => {
    if (!practiceId) return;
    const saved = localStorage.getItem(`practice_notes_${practiceId}`);
    if (saved) {
      try {
        setHighlights(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load notes", e);
      }
    }
  }, [practiceId]);

  // Save highlights
  useEffect(() => {
    if (!practiceId) return;
    localStorage.setItem(`practice_notes_${practiceId}`, JSON.stringify(highlights));
  }, [highlights, practiceId]);

  // Clear selection when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selectionToolbar?.visible) {
        const target = e.target as HTMLElement;
        if (!target.closest('.selection-toolbar')) {
          setSelectionToolbar(null);
          window.getSelection()?.removeAllRanges();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectionToolbar]);

  const handleSelection = useCallback((index: number, range: Range, rect: DOMRect, text: string) => {
    setSelectionToolbar({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8,
      range,
      paragraphIndex: index,
      text
    });
  }, []);

  const handleHighlightClick = useCallback((h: TextHighlight, rect: DOMRect) => {
    setNoteModal({
      visible: true,
      highlight: h,
      x: rect.left + rect.width / 2,
      y: rect.bottom + 4
    });
    setSelectionToolbar(null);
  }, []);

  const addHighlight = useCallback((withNote: boolean = false) => {
    if (!selectionToolbar || !selectionToolbar.range) return;
    const { paragraphIndex, range, text } = selectionToolbar;
    
    let startOffset = 0;
    let endOffset = 0;
    
    let node: Node | null = range.startContainer;
    while (node && node.nodeName !== 'P') {
      node = node.parentNode;
    }
    
    if (node) {
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(node);
      preCaretRange.setEnd(range.startContainer, range.startOffset);
      startOffset = preCaretRange.toString().length;
      endOffset = startOffset + text.length;
    }

    const newHighlight: TextHighlight = {
      id: Math.random().toString(36).slice(2),
      paragraphIndex,
      startOffset,
      endOffset,
      text,
      color: 'theme',
      note: ''
    };

    setHighlights(prev => [...prev, newHighlight]);
    setSelectionToolbar(null);
    window.getSelection()?.removeAllRanges();

    if (withNote) {
      setNoteModal({
        visible: true,
        highlight: newHighlight,
        x: selectionToolbar.x,
        y: selectionToolbar.y + 10
      });
    }
  }, [selectionToolbar]);

  const updateHighlightNote = useCallback((id: string, note: string) => {
    setHighlights(prev => prev.map(h => h.id === id ? { ...h, note } : h));
  }, []);

  const deleteHighlight = useCallback((id: string) => {
    setHighlights(prev => prev.filter(h => h.id !== id));
    setNoteModal(null);
  }, []);

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

  const fetchPracticeDetail = useCallback(async () => {
    if (!practiceId) {
      toast.error('Practice ID not found.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // Request randomization from backend (randomize=true)
      const response = (await getPracticeForLearner(practiceId, true)) as PracticeDetailResponse;
      const fetchedPractice = response?.practice;

      if (!fetchedPractice) {
        toast.error('The practice set does not exist or has been removed.');
        setPractice(null);
        return;
      }

      const sanitizedSections = sanitizeSections(fetchedPractice.sections || []);
      let normalizedQuestions = fetchedPractice.questions || [];

      // --- Randomization & Persistence Logic ---
      const orderKey = `practice_order_${practiceId}`;
      const progressKey = `practice_progress_${practiceId}`;
      
      const savedOrder = localStorage.getItem(orderKey);
      const savedProgress = localStorage.getItem(progressKey);

      // 1. Handle Question Order
      if (savedOrder) {
        try {
          const orderIds = JSON.parse(savedOrder);
          const qMap = new Map(normalizedQuestions.map((q) => [q._id, q]));
          const orderedQuestions = orderIds
            .map((id: string) => qMap.get(id))
            .filter((q: any) => q !== undefined);
          
          if (orderedQuestions.length === normalizedQuestions.length) {
            // Restore the saved order (overriding the new random order from backend)
            normalizedQuestions = orderedQuestions;
          } else {
            // Mismatch (maybe content changed), use the new backend order and save it
            localStorage.setItem(orderKey, JSON.stringify(normalizedQuestions.map((q) => q._id)));
          }
        } catch (e) {
          console.error('Failed to restore question order', e);
          // Fallback: use backend order and save it
          localStorage.setItem(orderKey, JSON.stringify(normalizedQuestions.map((q) => q._id)));
        }
      } else {
        // First time load: Use the backend's randomized order and save it
        localStorage.setItem(orderKey, JSON.stringify(normalizedQuestions.map((q) => q._id)));
      }

      setPractice({ ...fetchedPractice, sections: sanitizedSections, questions: normalizedQuestions });
      
      // 2. Handle Progress & Timer
      let initialAnswers = normalizedQuestions.map((question) => buildDefaultAnswer(question));
      const limitSeconds = Math.max(Number(fetchedPractice.estimatedTime ?? 0), 0) * 60;
      let deadline = Date.now() + limitSeconds * 1000;
      let initialTimeRemaining = limitSeconds;

      if (savedProgress) {
        try {
          const parsed = JSON.parse(savedProgress);
          if (parsed.answers && Array.isArray(parsed.answers) && parsed.answers.length === normalizedQuestions.length) {
            initialAnswers = parsed.answers;
          }
          if (typeof parsed.deadline === 'number') {
            deadline = parsed.deadline;
            initialTimeRemaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
          }
        } catch (e) {
          console.error('Failed to parse saved progress', e);
        }
      } else {
        // Save initial state
        localStorage.setItem(progressKey, JSON.stringify({ answers: initialAnswers, deadline }));
      }

      setAnswers(initialAnswers);
      setCurrentQuestionIndex(0);
      setTimeRemaining(initialTimeRemaining);
      
      startedAtRef.current = new Date(); 
      deadlineRef.current = deadline;

    } catch (error) {
      console.error('Unable to load practice detail:', error);
      toast.error('Unable to load the practice. Please try again later.');
      setPractice(null);
    } finally {
      setIsLoading(false);
    }
  }, [practiceId]);

  useEffect(() => {
    fetchPracticeDetail();
  }, [fetchPracticeDetail]);

  // --- Persist Progress on Answer Change ---
  useEffect(() => {
    if (!practice || isLoading || !practiceId) return;
    
    const progressKey = `practice_progress_${practiceId}`;
    const payload = {
      answers,
      deadline: deadlineRef.current
    };
    localStorage.setItem(progressKey, JSON.stringify(payload));
  }, [answers, practice, practiceId, isLoading]);

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

  useEffect(() => {
    if (!isLoading && practice) {
      const element = document.getElementById(`question-${currentQuestionIndex}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [currentQuestionIndex, isLoading, practice]);

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

        try {
          await updateRoadmapProgress({
            type: 'practice',
            itemId: practiceId
          });
        } catch (err) {
          // Silent roadmap progress update failure
        }

        if (isAutoSubmit) {
          toast.info('Time is up. The system submitted your practice automatically.');
        } else {
          toast.success('Practice submitted successfully!');
        }

        // Clear persistence
        localStorage.removeItem(`practice_order_${practiceId}`);
        localStorage.removeItem(`practice_progress_${practiceId}`);
        localStorage.removeItem(`practice_notes_${practiceId}`);

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

  const handleExit = useCallback(async () => {
    if (!practice) {
      if (practiceId) {
        navigate(`/practice/${practiceId}`);
      } else {
        navigate('/practice');
      }
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure you want to exit?',
      text: 'Your progress and answers will be lost if you exit now.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Exit',
      cancelButtonText: 'Stay',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#2563eb',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      // Clear persistence on exit
      if (practiceId) {
        localStorage.removeItem(`practice_order_${practiceId}`);
        localStorage.removeItem(`practice_progress_${practiceId}`);
        localStorage.removeItem(`practice_notes_${practiceId}`);
      }
      navigate(`/practice/${practiceId}`);
    }
  }, [navigate, practice, practiceId]);

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
          <XCircleIcon className="mx-auto mb-6 h-20 w-20 text-red-500" aria-hidden="true" />
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
              <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
            </span>
            Back to practice list
          </button>
        </div>
      </div>
    );
  }

  const sectionQuestionTotal = sectionQuestions.length;

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-hidden">
      {/* --- HEADER --- */}
      <header className="shrink-0 z-40 border-b border-white/50 bg-white/80 backdrop-blur-md shadow-sm transition-all duration-300">
        <div className="flex w-full flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleExit} className="text-slate-500 hover:text-slate-900">
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
              <div className={clsx("flex items-center gap-2 text-xs font-bold uppercase tracking-wider", theme.text)}>
                {theme.isListening ? <SpeakerWaveIcon className="h-3.5 w-3.5" /> : <DocumentTextIcon className="h-3.5 w-3.5" />}
                {practice.skill}
              </div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight truncate max-w-xs sm:max-w-md">
                {practice.title}
              </h1>
            </div>
          </div>

          {sectionQuestionTotal > 0 ? (
            <div className="hidden md:flex flex-1 justify-center">
              <div className="flex flex-col items-center gap-1">
                <QuestionNavigator
                  className="justify-center"
                  questions={sectionNavigatorQuestions}
                  answers={sectionNavigatorAnswers}
                  currentQuestionIndex={currentQuestionIndex}
                  onSelect={goToQuestion}
                  showLegend={false}
                  inline
                  questionIndices={sectionNavigatorIndices}
                  theme={theme}
                />
              </div>
            </div>
          ) : null}

          <div className="flex shrink-0 items-center gap-3">
            <div className={clsx("flex items-center gap-2 rounded-full border bg-white px-4 py-2 shadow-sm", theme.border)}>
              <ClockIcon className={clsx("h-4 w-4", theme.text)} aria-hidden="true" />
              <span className={clsx("font-mono text-base font-bold", theme.textDark)}>{formatTime(timeRemaining)}</span>
            </div>
            <Button
              onClick={handleManualSubmit}
              disabled={isSubmitting}
              className={clsx("rounded-full text-white shadow-lg border-none px-6 bg-gradient-to-r", theme.gradient, theme.shadow)}
              size="md"
              loading={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Now'}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-slate-100">
          <div
            className={clsx("h-full bg-gradient-to-r transition-all duration-500 ease-out", theme.gradient)}
            style={{ width: `${((currentQuestionIndex + 1) / Math.max(totalQuestions, 1)) * 100}%` }}
          />
        </div>
      </header>

      <main className="flex-1 min-h-0 w-full max-w-none mx-auto p-0 relative">
        <div
          className="grid h-full w-full grid-cols-1 lg:grid-cols-2 gap-0 pb-14"
        >
          {/* Left Panel: Passage / Media */}
          <SectionPanel 
            section={currentSection}
            sectionIndex={currentSectionIndex}
            hasPrevSection={hasPrevSection}
            hasNextSection={hasNextSection}
            onPrevSection={goToPreviousSection}
            onNextSection={goToNextSection}
            theme={theme}
            highlights={highlights}
            onSelection={handleSelection}
            onHighlightClick={handleHighlightClick}
          />

          {/* Right Panel: Questions */}
          <QuestionPanel 
            sectionQuestions={sectionQuestions}
            answers={answers}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
            onFocusQuestion={setCurrentQuestionIndex}
            onAnswerChange={handleAnswerChange}
            theme={theme}
          />
        </div>
      </main>

      {/* Selection Toolbar */}
      {selectionToolbar?.visible && (
        <div 
          className="selection-toolbar fixed z-50 flex items-center gap-1 rounded-full shadow-xl px-3 py-2 -translate-x-1/2 animate-in fade-in zoom-in duration-200 border bg-white"
          style={{ left: selectionToolbar.x, top: selectionToolbar.y }}
        >
          <button onClick={() => addHighlight()} className={clsx("p-2 rounded-full transition-colors hover:bg-slate-100", theme.text)} title="Highlight">
            <PencilIcon className="w-5 h-5" />
          </button>
          <div className="w-px h-5 bg-slate-200 mx-1" />
          <button onClick={() => addHighlight(true)} className={clsx("p-2 rounded-full transition-colors hover:bg-slate-100", theme.text)} title="Add Note">
            <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Note Modal */}
      {noteModal?.visible && noteModal.highlight && (
        <div 
          className={clsx("fixed z-50 w-64 rounded-xl shadow-xl border -translate-x-1/2 animate-in fade-in zoom-in duration-200 bg-white", theme.border)}
          style={{ left: noteModal.x, top: noteModal.y }}
        >
          <div className={clsx("flex items-center justify-between px-3 py-2 border-b rounded-t-xl", theme.bgLight, theme.border)}>
            <span className={clsx("text-xs font-bold flex items-center gap-1", theme.textDark)}>
              <DocumentTextIcon className="w-3 h-3" /> Note
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => deleteHighlight(noteModal.highlight!.id)} className={clsx("p-1 rounded transition-colors", theme.buttonLight)}>
                <TrashIcon className="w-3 h-3" />
              </button>
              <button onClick={() => setNoteModal(null)} className={clsx("p-1 rounded transition-colors", theme.buttonLight)}>
                <XMarkIcon className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className="p-3">
            <textarea 
              autoFocus
              className="w-full bg-transparent text-sm text-slate-700 placeholder-slate-400 resize-none outline-none min-h-[80px]"
              placeholder="Add your note here..."
              value={noteModal.highlight.note}
              onChange={(e) => updateHighlightNote(noteModal.highlight!.id, e.target.value)}
            />
          </div>
        </div>
      )}

      {/* --- BOTTOM PART NAVIGATION (Docked) --- */}
      <div className="absolute bottom-0 left-0 w-full z-50 bg-white/90 backdrop-blur-xl border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-center gap-2 p-2 overflow-x-auto no-scrollbar">
          {sections.map((section, idx) => {
            const isActive = currentSectionIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => {
                  const sectionId = normalizeId(section._id);
                  const firstQuestionIndex = questions.findIndex((q) => normalizeId(q.sectionId) === sectionId);
                  if (firstQuestionIndex >= 0) {
                    goToQuestion(firstQuestionIndex);
                  }
                }}
                className={clsx(
                  "px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-2",
                  isActive
                    ? clsx("text-white shadow-md bg-gradient-to-r", theme.gradient)
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <span>Part {idx + 1}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PracticeTakePage;

interface SectionPanelProps {
  section: PracticeSection | null;
  sectionIndex: number;
  hasPrevSection: boolean;
  hasNextSection: boolean;
  onPrevSection: () => void;
  onNextSection: () => void;
  theme: any;
  highlights: TextHighlight[];
  onSelection: (index: number, range: Range, rect: DOMRect, text: string) => void;
  onHighlightClick: (h: TextHighlight, rect: DOMRect) => void;
}

function SectionPanel({
  section, sectionIndex, theme, highlights, onSelection, onHighlightClick
}: SectionPanelProps) {
  return (
    <div
      className={clsx("flex flex-col overflow-hidden bg-white h-full transition-all duration-300 border-r", theme.border)}
      data-lenis-prevent
    >
      <div className="border-b border-slate-100 px-5 py-3 bg-white/50 backdrop-blur-sm">
        <div className="text-sm font-bold text-slate-900 truncate flex items-center gap-2">
          <span className={clsx("px-2 py-0.5 rounded text-[12px] font-black uppercase tracking-wider border", theme.bgLight, theme.text, theme.border)}>
            PART {sectionIndex + 1}
          </span>
          {section?.title}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        {section?.passage ? (
          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-[15px]">
            <PassageRenderer 
              passage={section.passage} 
              mediaBlocks={section.mediaBlocks || []} 
              highlights={highlights}
              onSelection={onSelection}
              onHighlightClick={onHighlightClick}
              theme={theme}
            />
          </div>
        ) : section?.mediaBlocks && section.mediaBlocks.length ? (
          <div className="space-y-6">
            {section.mediaBlocks.map((block, index) => renderMediaBlock(block, block.id || index, theme))}
          </div>
        ) : (
          <p className="text-xs italic text-slate-400">No content for this part.</p>
        )}

        {section?.audio && <div className="mt-4"><AudioPlayer src={section.audio} theme={theme} /></div>}

        {section?.image ? (
          <div>
            <img
              src={section.image}
              alt={section?.title || 'Section illustration'}
              className="rounded-2xl border border-slate-100 w-full max-h-80 object-cover shadow-sm"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

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
  theme: any;
}

function QuestionNavigator({
  questions, answers, onSelect, className, gridClassName, showLegend = true, inline = false, questionIndices, currentQuestionIndex, theme
}: QuestionNavigatorProps) {
  return (
    <div className={clsx(inline ? 'flex flex-wrap items-center gap-2' : 'space-y-3', className)}>
      <div className={clsx(inline ? 'flex flex-wrap gap-2' : ['grid gap-2', gridClassName || 'grid-cols-5'])}>
        {questions.map((_, index) => {
          const targetIndex = questionIndices ? questionIndices[index] : index;
          const answered = isQuestionAnswered(answers[targetIndex]);
          const isCurrent = targetIndex === currentQuestionIndex;
          
          return (
            <button
              key={index}
              onClick={() => onSelect(targetIndex)}
              className={clsx(
                "flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-bold transition-all duration-200 shadow-sm",
                isCurrent 
                  ? clsx("ring-2 ring-offset-1", theme.ring, theme.borderActive, theme.text, "bg-white")
                  : answered 
                    ? clsx("text-white border-transparent", theme.button) 
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
              )}
            >
              {targetIndex + 1}
            </button>
          );
        })}
      </div>
      {showLegend && !inline && (
        <div className="flex flex-wrap gap-4 text-[11px] font-medium text-slate-500">
          <div className="flex items-center gap-1.5"><span className={clsx("h-3 w-3 rounded-full shadow-sm", theme.button)} /> Answered</div>
          <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full border border-slate-300 bg-white" /> Not answered</div>
          <div className="flex items-center gap-1.5"><span className={clsx("h-3 w-3 rounded-full border-2 bg-white", theme.borderActive)} /> Current</div>
        </div>
      )}
    </div>
  );
}

interface QuestionPanelProps {
  sectionQuestions: SectionQuestion[];
  answers: PracticeAnswerState[];
  currentQuestionIndex: number;
  totalQuestions: number;
  onFocusQuestion: (index: number) => void;
  onAnswerChange: (index: number, partial: Partial<PracticeAnswerState>) => void;
  theme: any;
}

interface QuestionInputProps {
  question: PracticeQuestion;
  answer: PracticeAnswerState;
  onChange: (partial: Partial<PracticeAnswerState>) => void;
  theme: any;
}

function QuestionInput({ question, answer, onChange, theme }: QuestionInputProps) {
  const { type, options, allowMultiple, matchingPairs } = question;
  
  if (type === 'multi_choice') {
    return (
      <div className="flex flex-col gap-2">
        {options?.map((opt: any, idx: number) => {
          const isSel = answer.selectedOptions.includes(opt.text);
          const toggle = () => {
            const newSel = allowMultiple 
              ? (isSel ? answer.selectedOptions.filter((s: string) => s !== opt.text) : [...answer.selectedOptions, opt.text])
              : (isSel ? [] : [opt.text]);
            onChange({ selectedOptions: newSel, userAnswer: allowMultiple ? newSel.join(', ') : '' });
          };
          return (
            <button key={idx} onClick={toggle} className={clsx("relative flex items-start gap-3 w-full text-left px-4 py-3 rounded-xl border transition-all text-sm  group", isSel ? (allowMultiple ? clsx(theme.borderActive, theme.bgLight, theme.textDark) : clsx(theme.button, "text-white border-transparent")) : 'bg-white border-slate-200 hover:border-blue-300')}>
              <span className={clsx("mt-0.5 flex h-5 w-5 items-center justify-center border text-[10px] font-bold transition-colors", allowMultiple ? "rounded-md" : "rounded-full", isSel ? (allowMultiple ? clsx(theme.button, "text-white border-transparent") : clsx("bg-white border-white", theme.text)) : 'bg-slate-100 border-slate-300 text-slate-500')}>{allowMultiple ? <CheckIcon className="h-3.5 w-3.5" /> : String.fromCharCode(65 + idx)}</span>
              <span className="flex-1">{opt.text}</span>
            </button>
          );
        })}
      </div>
    );
  }
  
  if (type === 'dropdown') {
    return (
      <div className="relative">
        <select value={answer.selectedOptions[0] || ''} onChange={(e) => onChange({ selectedOptions: e.target.value ? [e.target.value] : [] })} className="w-full p-4 pr-10 border border-slate-200 rounded-xl bg-white outline-none focus:border-blue-500 appearance-none cursor-pointer hover:border-blue-400 transition-colors">
          <option value="">Select an option...</option>
          {options?.map((o: any, i: number) => <option key={i} value={o.text}>{o.text}</option>)}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <ChevronRightIcon className="h-4 w-4 rotate-90" />
        </div>
      </div>
    );
  }

  if (type === 'short_answer') {
    return <input value={answer.userAnswer || ''} onChange={(e) => onChange({ userAnswer: e.target.value })} placeholder="Type your answer here..." className="w-full rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" />;
  }

  if (type === 'matching') {
    return (
      <div className="space-y-4">
        {matchingPairs?.map((pair: any, i: number) => (
          <div key={i} className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs text-slate-500">{i + 1}</span>
              {pair.prompt}
            </div>
            <input 
              value={(() => {
                if (answer.matchingAnswers && answer.matchingAnswers[i]?.prompt === pair.prompt) {
                  return answer.matchingAnswers[i].selected;
                }
                return answer.matchingAnswers?.find((a: any) => a.prompt === pair.prompt)?.selected || '';
              })()}
              onChange={(e) => {
                const newPairs = matchingPairs.map((p: any, idx: number) => {
                  let currentVal = '';
                  if (answer.matchingAnswers && answer.matchingAnswers[idx]?.prompt === p.prompt) {
                    currentVal = answer.matchingAnswers[idx].selected;
                  } else {
                    currentVal = answer.matchingAnswers?.find((a: any) => a.prompt === p.prompt)?.selected || '';
                  }
                  return {
                    prompt: p.prompt,
                    selected: idx === i ? e.target.value : currentVal
                  };
                });
                onChange({ matchingAnswers: newPairs });
              }}
              className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 bg-white" placeholder="Type matching answer..." 
            />
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function QuestionPanel({ sectionQuestions, answers, currentQuestionIndex, onFocusQuestion, onAnswerChange, theme }: QuestionPanelProps) {
  return (
    <div className={clsx("flex flex-col overflow-hidden bg-white h-full transition-all duration-300", theme.border)} data-lenis-prevent>
      <div className="border-b border-slate-100 px-5 py-3 flex justify-between items-center bg-white/50 backdrop-blur-sm">
        <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ListBulletIcon className={clsx("h-5 w-5", theme.text)} />
          Questions
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        {sectionQuestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400">
            <ListBulletIcon className="h-10 w-10 mb-2 opacity-20" />
            <p className="text-xs">No questions in this section.</p>
          </div>
        ) : sectionQuestions.map(({ question, globalIndex }) => {
          const isCurrent = globalIndex === currentQuestionIndex;
          return (
            <div key={globalIndex} id={`question-${globalIndex}`} className={clsx("rounded-2xl border transition-all duration-300", isCurrent ? clsx(theme.borderActive, "ring-4 shadow-lg bg-white", theme.ring.replace('ring-', 'ring-opacity-20 ring-')) : 'border-slate-200 hover:border-slate-300 bg-white')}>
              <div className={clsx("flex justify-between gap-3 border-b px-4 py-3 rounded-t-2xl", isCurrent ? theme.bgLight : 'bg-slate-50/50 border-slate-100')}>
                <div className="text-sm font-medium text-slate-900 leading-relaxed whitespace-pre-wrap">
                  <span className={clsx("font-black mr-2 inline-block", theme.text)}>Q{globalIndex + 1}.</span>
                  {question.content}
                </div>
              </div>
              <div className="px-4 py-4 space-y-4">
                <QuestionInput 
                  question={question} 
                  answer={answers[globalIndex] ?? { selectedOptions: [], userAnswer: '', matchingAnswers: [] }} 
                  onChange={(val: any) => { onAnswerChange(globalIndex, val); onFocusQuestion(globalIndex); }} 
                  theme={theme}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PlacementTest, SectionMedia, TestQuestion, TestSection, TestAttempt, DetailedResult } from '../../types';
import { getTestAttemptDetail } from '../../services/api';
import { Button } from '../../components/ui/Button';
import {
  ArrowLeftIcon,
  ListBulletIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  PauseIcon,
  LightBulbIcon,
  ChevronDownIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const mediaPlaceholderRegex = /\[\[media:([^\]]+)\]\]/g;

const EMPTY_SECTIONS: TestSection[] = [];
const EMPTY_QUESTIONS: TestQuestion[] = [];

// --- THEME HELPER ---
const getTheme = (category?: string) => {
  const isListening = category === 'listening';
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

const normalizeId = (v: unknown) => (v == null ? '' : String(v));
const generateMediaId = () => Math.random().toString(36).slice(2, 10);

const getMediaUrl = (path?: string) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('blob:')) return path;
  const baseUrl = (process.env.REACT_APP_API_URL || '').replace(/\/api\/?$/, '');
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
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
        {isPlaying ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6 ml-1" />}
      </button>

      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="relative h-2 w-full rounded-full bg-slate-100">
          <div
            className={clsx("absolute top-0 left-0 h-full rounded-full transition-all", activeTheme.isListening ? 'bg-purple-500' : 'bg-blue-500')}
            style={{ width: `${progressPercent}%` }}
          />
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-6 opacity-0 cursor-pointer z-10"
          />
        </div>
      </div>
    </div>
  );
});

const normalizeMediaBlocks = (blocks: unknown): SectionMedia[] => {
  if (!Array.isArray(blocks)) return [];
  return blocks.filter(Boolean).map((b: any) => ({
    id: b.id || b._id || generateMediaId(),
    type: (b.type === 'audio' ? 'audio' : 'image') as 'audio' | 'image',
    url: getMediaUrl(b.url || b.path),
    originalName: b.originalName || b.name || '',
    transcript: b.transcript,
  })).filter(b => b.id && b.url);
};

const sanitizeSections = (sections: TestSection[] = []): TestSection[] => sections.map(s => ({
  ...s,
  audio: getMediaUrl(s.audio),
  image: getMediaUrl(s.image),
  mediaBlocks: normalizeMediaBlocks(s?.mediaBlocks),
}));

const MediaBlock: React.FC<{ block: SectionMedia; theme?: any }> = ({ block, theme }) => {
  const [showTranscript, setShowTranscript] = useState(false);

  if (!block?.url) return <div className="text-xs text-amber-600 p-2 border border-amber-200 bg-amber-50 rounded">Media missing</div>;

  if (block.type === 'audio') {
    return (
      <div className="my-4 space-y-2">
        <AudioPlayer src={block.url} theme={theme} />
        {block.transcript && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <span className="uppercase tracking-wider">Transcript</span>
              <ChevronDownIcon className={clsx("w-4 h-4 transition-transform", showTranscript ? "rotate-180" : "")} />
            </button>
            {showTranscript && (
              <div className="px-4 py-3 text-sm text-slate-600 leading-relaxed border-t border-slate-200 bg-white">
                {block.transcript}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <figure className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden my-2">
      <img src={block.url} alt={block.originalName || 'Media'} className="w-full h-auto object-contain" />
    </figure>
  );
};

const SelectableParagraph: React.FC<{
  text: string;
  index: number;
  theme: any;
}> = React.memo(({ text, index, theme }) => {
  return (
    <p className="whitespace-pre-wrap leading-relaxed text-slate-700 relative">
      {text}
    </p>
  );
});

const PassageRenderer: React.FC<{
  passage: string;
  mediaBlocks: SectionMedia[];
  theme: any;
}> = ({ passage, mediaBlocks, theme }) => {
  const mediaMap = useMemo(() => new Map(mediaBlocks.map(b => [String(b.id), b])), [mediaBlocks]);
  if (!passage) return null;

  return (
    <>
      {passage.split(mediaPlaceholderRegex).map((part, i) => {
        if (i % 2 === 0) {
          if (!part) return null;
          return (
            <SelectableParagraph
              key={i}
              index={i}
              text={part}
              theme={theme}
            />
          );
        }
        const block = mediaMap.get(part.trim());
        return block ? <MediaBlock key={i} block={block} theme={theme} /> : <p key={i} className="text-xs text-amber-600">Media {part} missing</p>;
      })}
    </>
  );
};

const MockTestDetailedResultPage: React.FC = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [attempt, setAttempt] = useState<TestAttempt | null>(location.state?.result || null);
  const [test, setTest] = useState<PlacementTest | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const theme = useMemo(() => getTheme(test?.category), [test?.category]);

  useEffect(() => {
    const fetchTest = async () => {
      if (!resultId) { setIsLoading(false); return; }
      setIsLoading(true);
      try {
        const res = await getTestAttemptDetail(resultId);
        setAttempt(res.data?.attempt || res.attempt);
        const t = res.data?.test || res.test;
        if (t) {
          setTest({ ...t, sections: sanitizeSections(t.sections) });
        }
      } catch (e) { console.error(e); toast.error('Error loading test details.'); }
      finally { setIsLoading(false); }
    };
    fetchTest();
  }, [resultId]);

  const goToQuestion = useCallback(
    (index: number) => {
      if (!test) return;
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

  const currentQuestion = questions[currentQuestionIndex] ?? null;
  const currentSectionId = normalizeId(currentQuestion?.sectionId);

  const currentSection = useMemo(() => {
    if (!currentSectionId) return null;
    return sections.find((section) => normalizeId(section?._id) === currentSectionId) ?? null;
  }, [currentSectionId, sections]);

  const sectionQuestions = useMemo<SectionQuestion[]>(() => {
    return questions
      .map((question, index) => ({ question, globalIndex: index }))
      .filter(({ question: candidate }) => normalizeId(candidate.sectionId) === currentSectionId);
  }, [currentSectionId, questions]);

  const sectionNavigatorQuestions = useMemo(() => sectionQuestions.map(({ question }) => question), [sectionQuestions]);
  const sectionNavigatorIndices = useMemo(() => sectionQuestions.map(({ globalIndex }) => globalIndex), [sectionQuestions]);

  const currentSectionIndex = useMemo(() => {
    if (!currentSectionId) return -1;
    return sections.findIndex((section) => normalizeId(section?._id) === currentSectionId);
  }, [currentSectionId, sections]);

  // Construct detailed results for rendering
  const detailedResults = useMemo<DetailedResult[]>(() => {
    if (!test || !attempt) return [];
    return test.questions.map(q => {
      const ans = attempt.answers.find(a => a.questionId === q._id);
      return {
        questionNumber: q.questionNumber,
        question: q,
        userAnswer: {
          selectedOptions: ans?.selectedOptions || [],
          userAnswer: ans?.userAnswer || '',
          matchingAnswers: ans?.matchingAnswers || []
        },
        correctAnswers: ans?.correctAnswers || q.correctAnswers || [],
        isCorrect: ans?.isCorrect || false,
        pointsEarned: ans?.earnedPoints || 0,
        explanation: q.explanation || ''
      };
    });
  }, [test, attempt]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto" />
          <p className="text-sm text-gray-600">Loading test details...</p>
        </div>
      </div>
    );
  }

  if (!test || !attempt) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Result Not Found</h2>
          <Button onClick={() => navigate('/mock-test')}>Back to Mock Tests</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-hidden">
      {/* --- HEADER --- */}
      <header className="shrink-0 z-40 border-b border-white/50 bg-white/80 backdrop-blur-md shadow-sm transition-all duration-300">
        <div className="flex w-full flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/mock-test/result/${resultId}`)} className="text-slate-500 hover:text-slate-900">
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-slate-900 leading-tight truncate max-w-xs sm:max-w-md">
                {test.title}
              </h1>
            </div>
          </div>

          <div className="hidden md:flex flex-1 justify-center">
            <QuestionNavigator
              questions={sectionNavigatorQuestions}
              detailedResults={detailedResults}
              currentQuestionIndex={currentQuestionIndex}
              onSelect={goToQuestion}
              questionIndices={sectionNavigatorIndices}
              theme={theme}
              inline
            />
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className={clsx("flex items-center gap-2 rounded-full border bg-white px-4 py-2 shadow-sm", theme.border)}>
              <span className={clsx("font-mono text-base font-bold", theme.textDark)}>
                Score: {attempt.percentage.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 w-full max-w-none mx-auto p-0 relative">
        <div className="grid h-full w-full grid-cols-1 lg:grid-cols-2 gap-0 pb-14">
          <SectionPanel
            section={currentSection}
            sectionIndex={currentSectionIndex}
            theme={theme}
          />

          <QuestionPanel
            sectionQuestions={sectionQuestions}
            detailedResults={detailedResults}
            currentQuestionIndex={currentQuestionIndex}
            onFocusQuestion={setCurrentQuestionIndex}
            theme={theme}
          />
        </div>
      </main>

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
                  if (firstQuestionIndex >= 0) goToQuestion(firstQuestionIndex);
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

export default MockTestDetailedResultPage;

interface SectionPanelProps {
  section: TestSection | null;
  sectionIndex: number;
  theme: any;
}

function SectionPanel({ section, sectionIndex, theme }: SectionPanelProps) {
  return (
    <div className={clsx("flex flex-col overflow-hidden bg-white h-full transition-all duration-300 border-r", theme.border)} data-lenis-prevent>
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
              theme={theme}
            />
          </div>
        ) : section?.mediaBlocks && section.mediaBlocks.length ? (
          <div className="space-y-6">
            {section.mediaBlocks.map((block, index) => <MediaBlock key={block.id || index} block={block} theme={theme} />)}
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
  question: TestQuestion;
  globalIndex: number;
}

interface QuestionNavigatorProps {
  questions: TestQuestion[];
  detailedResults: DetailedResult[];
  currentQuestionIndex: number;
  onSelect: (index: number) => void;
  inline?: boolean;
  questionIndices?: number[];
  theme: any;
}

function QuestionNavigator({
  questions, detailedResults, onSelect, inline = false, questionIndices, currentQuestionIndex, theme
}: QuestionNavigatorProps) {
  return (
    <div className={clsx(inline ? 'flex flex-wrap items-center gap-2' : 'space-y-3')}>
      <div className={clsx(inline ? 'flex flex-wrap gap-2' : 'grid grid-cols-5 gap-2')}>
        {questions.map((_, index) => {
          const targetIndex = questionIndices ? questionIndices[index] : index;
          const isCurrent = targetIndex === currentQuestionIndex;

          // Find result for this question
          const detail = detailedResults.find(d => d.questionNumber === targetIndex + 1);
          const isCorrect = detail?.isCorrect;
          const isSkipped = !detail?.userAnswer?.userAnswer && (!detail?.userAnswer?.selectedOptions || detail.userAnswer.selectedOptions.length === 0);

          return (
            <button
              key={index}
              onClick={() => onSelect(targetIndex)}
              className={clsx(
                "flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-bold transition-all duration-200 shadow-sm",
                isCurrent
                  ? clsx("ring-2 ring-offset-1", theme.ring, theme.borderActive, theme.text, "bg-white")
                  : isCorrect
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                    : isSkipped
                      ? "bg-slate-100 text-slate-500 border-slate-200"
                      : "bg-rose-100 text-rose-700 border-rose-200"
              )}
            >
              {targetIndex + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface QuestionPanelProps {
  sectionQuestions: SectionQuestion[];
  detailedResults: DetailedResult[];
  currentQuestionIndex: number;
  onFocusQuestion: (index: number) => void;
  theme: any;
}

function QuestionResult({ question, detail, theme }: { question: TestQuestion, detail?: DetailedResult, theme: any }) {
  const { type, options } = question;
  const userAnswer = detail?.userAnswer;
  const isCorrect = detail?.isCorrect;
  const explanation = detail?.explanation;

  return (
    <div className="space-y-4">
      {/* Question Type Badge */}
      <div className="flex items-center gap-2 mb-2">
        <span className="px-2 py-1 rounded text-xs font-bold bg-slate-100 text-slate-500 uppercase">
          {type.replace('_', ' ')}
        </span>
      </div>

      {/* Options / Input Display */}
      {(type === 'multi_choice' || type === 'dropdown') && (
        <div className="flex flex-col gap-2">
          {options?.map((opt: any, idx: number) => {
            const isSelected = userAnswer?.selectedOptions?.includes(opt.text);
            const isCorrectOption = detail?.correctAnswers?.includes(opt.text);

            // Determine style
            let containerClass = "border-slate-200 bg-white hover:bg-slate-50";
            let textClass = "text-slate-700";
            let iconClass = "bg-slate-100 text-slate-500 border-slate-300";
            let iconContent: React.ReactNode = String.fromCharCode(65 + idx);

            if (isSelected && isCorrectOption) {
              // User selected CORRECT
              containerClass = "border-emerald-500 bg-emerald-50";
              textClass = "text-emerald-900 font-medium";
              iconClass = "bg-emerald-500 text-white border-emerald-500";
              iconContent = <CheckIcon className="w-3 h-3" />;
            } else if (isSelected && !isCorrectOption) {
              // User selected WRONG
              containerClass = "border-rose-500 bg-rose-50";
              textClass = "text-rose-900 font-medium";
              iconClass = "bg-rose-500 text-white border-rose-500";
              iconContent = <XMarkIcon className="w-3 h-3" />;
            } else if (!isSelected && isCorrectOption) {
              // Correct option (not selected)
              containerClass = "border-emerald-500 bg-white border-dashed";
              textClass = "text-emerald-700 font-medium";
              iconClass = "bg-emerald-100 text-emerald-600 border-emerald-500";
              iconContent = <CheckIcon className="w-3 h-3" />;
            }

            return (
              <div key={idx} className={clsx("relative flex items-start gap-3 w-full text-left px-4 py-3 rounded-xl border transition-all text-sm", containerClass)}>
                <div className={clsx("flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold mt-0.5", iconClass)}>
                  {iconContent}
                </div>
                <span className={clsx("flex-1 leading-relaxed", textClass)}>{opt.text}</span>
              </div>
            );
          })}
        </div>
      )}

      {type === 'short_answer' && (
        <div className="space-y-3">
          {/* User Input */}
          <div>
            <label className="text-xs font-bold text-slate-400 mb-1 block uppercase">Your Answer</label>
            <div className={clsx(
              "w-full p-3 rounded-xl border text-sm font-medium",
              isCorrect
                ? "bg-emerald-50 border-emerald-500 text-emerald-900"
                : "bg-rose-50 border-rose-500 text-rose-900"
            )}>
              {userAnswer?.userAnswer || <span className="italic text-slate-400 font-normal">No answer</span>}
            </div>
          </div>

          {/* Correct Answer (if wrong) */}
          {!isCorrect && (
            <div>
              <label className="text-xs font-bold text-emerald-600 mb-1 block uppercase">Correct Answer</label>
              <div className="w-full p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 text-sm font-medium">
                {detail?.correctAnswers?.join(', ')}
              </div>
            </div>
          )}
        </div>
      )}

      {type === 'matching' && (
        <div className="space-y-3">
          {question.matchingPairs?.map((pair, idx) => {
            const userMatch = userAnswer?.matchingAnswers?.find(
              (ans: any) => ans.prompt === pair.prompt
            );
            const isPairCorrect = userMatch?.selected === pair.correctOption;

            return (
              <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="font-medium text-slate-900 mb-2">{pair.prompt}</div>
                <div className="flex flex-col sm:flex-row gap-2 text-sm">
                  {/* User Selection */}
                  <div className={clsx(
                    "flex-1 p-2 rounded-lg border",
                    isPairCorrect
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-rose-50 border-rose-200 text-rose-800"
                  )}>
                    <span className="text-xs font-bold opacity-70 block uppercase mb-0.5">Your Match</span>
                    {userMatch?.selected || <span className="italic opacity-50">No selection</span>}
                  </div>

                  {/* Correct Match (if wrong) */}
                  {!isPairCorrect && (
                    <div className="flex-1 p-2 rounded-lg border bg-emerald-50 border-emerald-200 text-emerald-800">
                      <span className="text-xs font-bold opacity-70 block uppercase mb-0.5">Correct Match</span>
                      {pair.correctOption}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Explanation */}
      <div className={clsx("mt-4 p-4 rounded-xl border text-sm", theme.bgLight, theme.border, theme.textDark)}>
        <div className={clsx("flex items-center gap-2 font-bold mb-2", theme.text)}>
          <LightBulbIcon className="w-4 h-4" />
          Explanation
        </div>
        <div className="leading-relaxed opacity-90 whitespace-pre-wrap">
          {explanation ? explanation : "No detailed explanation available for this question."}
        </div>
      </div>
    </div>
  );
}

function QuestionPanel({ sectionQuestions, detailedResults, currentQuestionIndex, onFocusQuestion, theme }: QuestionPanelProps) {
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
          const detail = detailedResults.find(d => d.questionNumber === globalIndex + 1);

          return (
            <div key={globalIndex} id={`question-${globalIndex}`} className={clsx("rounded-2xl border transition-all duration-300", isCurrent ? clsx(theme.borderActive, "ring-4 shadow-lg bg-white", theme.ring.replace('ring-', 'ring-opacity-20 ring-')) : 'border-slate-200 hover:border-slate-300 bg-white')}>
              <div className={clsx("flex justify-between gap-3 border-b px-4 py-3 rounded-t-2xl", isCurrent ? theme.bgLight : 'bg-slate-50/50 border-slate-100')}>
                <div className="text-sm font-medium text-slate-900 leading-relaxed whitespace-pre-wrap">
                  <span className={clsx("font-black mr-2 inline-block", theme.text)}>Q{globalIndex + 1}.</span>
                  {question.content}
                </div>
                {detail?.isCorrect ? (
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                  <XCircleIcon className="w-5 h-5 text-rose-500 shrink-0" />
                )}
              </div>
              <div className="px-4 py-4 space-y-4">
                {question.media?.audioUrl && <AudioPlayer src={question.media.audioUrl} theme={theme} />}
                <QuestionResult
                  question={question}
                  detail={detail}
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

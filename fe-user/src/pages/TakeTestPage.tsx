import React, { ReactNode, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PlacementTest, SectionMedia, TestSection, UserAnswer } from '../types';
import { getTestForTaking, submitTest } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const mediaPlaceholderRegex = /\[\[media:([^\]]+)\]\]/g;

const normalizeId = (value: any): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (value.toString) return value.toString();
  try {
    return JSON.stringify(value);
  } catch (err) {
    return String(value);
  }
};

const generateMediaId = (): string => {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch (err) {
    // ignore and fallback
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
    .filter((block: SectionMedia) => !!block.id);
};

const sanitizeSections = (sections: TestSection[] = []): TestSection[] => {
  return sections.map((section) => ({
    ...section,
    mediaBlocks: normalizeMediaBlocks(section?.mediaBlocks),
  }));
};

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
          <source src={block.url} type={block.mimeType || 'audio/mpeg'} />
          Trình duyệt của bạn không hỗ trợ audio.
        </audio>
      </div>
    );
  }

  return (
    <figure key={`media-image-${key}`} className="my-4">
      <img
        src={block.url}
        alt={block.originalName || `Media ${block.id}`}
        className="rounded-lg border border-gray-200 max-w-full"
      />
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
    const text = passage.slice(lastIndex, match.index);
    if (text) {
      nodes.push(
        <p key={`text-${key++}`} className="whitespace-pre-wrap text-gray-700 leading-relaxed">
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
          <p key={`missing-${key++}`} className="text-xs text-amber-600">
            [Media không tìm thấy: {mediaId}]
          </p>
        );
      }
    }

    lastIndex = match.index + match[0].length;
  }

  const tail = passage.slice(lastIndex);
  if (tail) {
    nodes.push(
      <p key={`text-${key++}`} className="whitespace-pre-wrap text-gray-700 leading-relaxed">
        {tail}
      </p>
    );
  }

  return nodes;
};

const TakeTestPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  
  const [test, setTest] = useState<PlacementTest | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTest = async () => {
      if (!testId) return;
      
      try {
        const response = await getTestForTaking(testId);
        if (response.test) {
          const sanitizedSections = sanitizeSections(response.test.sections);
          setTest({
            ...response.test,
            sections: sanitizedSections,
          });
          setTimeRemaining(response.test.timeLimit * 60); // Convert to seconds
          setAnswers(Array.from({ length: response.test.questions.length }, () => ({
            selectedOptions: [],
            userAnswer: '',
            matchingAnswers: []
          })));
        } else {
          throw new Error('Không tìm thấy bài test');
        }
      } catch (error) {
        console.error('Error fetching test:', error);
        toast.error('❌ Không thể tải bài thi. Vui lòng thử lại.');
        navigate('/tests');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTest();
  }, [testId, navigate]);

  const handleSubmit = useCallback(async () => {
    if (!test || !testId) return;

    setIsSubmitting(true);
    try {
      const submission = {
        testId,
        answers: answers.map((answer, index) => ({
          questionId: test.questions[index]._id || `question_${index}`,
          selectedOptions: answer.selectedOptions,
          userAnswer: answer.userAnswer,
          matchingAnswers: answer.matchingAnswers || []
        }))
      };
      
      const response = await submitTest(submission);
      if (response.result) {
        toast.success('🎉 Nộp bài thành công!');
        navigate(`/test/${testId}/result`, { state: { result: response.result } });
      } else {
        throw new Error('Không nhận được kết quả');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('❌ Không thể nộp bài. Vui lòng thử lại.');
      setIsSubmitting(false);
    }
  }, [test, testId, answers, navigate]);

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0 && test && !isSubmitting) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && test && !isSubmitting) {
      handleSubmit();
    }
  }, [timeRemaining, test, isSubmitting, handleSubmit]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionIndex: number, answer: UserAnswer) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answer;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (test && currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const typeLabel = (t: string) => {
    switch (t) {
      case 'multi_choice': return 'Nhiều lựa chọn';
      case 'short_answer': return 'Trả lời ngắn';
      case 'dropdown': return 'Dropdown';
      case 'matching': return 'Ghép cặp';
      default: return t;
    }
  };

  // Scroll active question into view (must be before any early return)
  useEffect(() => {
    if (!isLoading && test) {
      const el = document.getElementById(`question-${currentQuestionIndex}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentQuestionIndex, isLoading, test]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
            Bài thi này có thể đã bị xóa hoặc không khả dụng 😕
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

  const currentQuestion = test.questions[currentQuestionIndex];
  const currentSectionId = normalizeId(currentQuestion?.sectionId);

  // Compute current section & its questions
  const currentSection = test.sections.find((section) => normalizeId(section?._id) === currentSectionId);
  const sectionQuestions = test.questions
    .map((q, idx) => ({ q, globalIndex: idx }))
    .filter((item) => normalizeId(item.q.sectionId) === currentSectionId);

  const goToNextSection = () => {
    const currentSectionIndex = test.sections.findIndex(
      (section) => normalizeId(section?._id) === currentSectionId
    );
    const nextSection = currentSectionIndex >= 0 ? test.sections[currentSectionIndex + 1] : undefined;
    if (nextSection) {
      const nextId = normalizeId(nextSection._id);
      const firstQuestionIndex = test.questions.findIndex((q) => normalizeId(q.sectionId) === nextId);
      if (firstQuestionIndex >= 0) setCurrentQuestionIndex(firstQuestionIndex);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 backdrop-blur border-b border-gray-200 bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-gray-900 leading-tight">{test.title}</h1>
            <p className="text-xs text-gray-500">Câu {currentQuestionIndex + 1} / {test.questions.length}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 rounded-md bg-blue-50 text-blue-600 font-mono text-sm tracking-wide">
              {formatTime(timeRemaining)}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              variant="danger"
              size="sm"
              loading={isSubmitting}
            >
              {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
            </Button>
          </div>
        </div>
        <div className="h-1 w-full bg-gray-200/70 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 opacity-40" />
          <div
            className="h-full relative bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 transition-all duration-300 shadow-sm"
            style={{ width: `${((currentQuestionIndex + 1) / test.questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Left column: Passage + navigation */}
          <div className="lg:col-span-5 space-y-6">
            {(() => {
              const section = currentSection;
              return (
                <Card className="sticky top-[88px] max-h-[calc(100vh-120px)] overflow-y-auto hide-scrollbar" padding="lg">
                  <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h2 className="text-sm font-semibold text-gray-800">{section?.title || 'Phần hiện tại'}</h2>
                      <p className="text-xs text-gray-500">Đoạn văn / Tư liệu dùng cho các câu thuộc phần này</p>
                    </div>
                    <div className="text-[10px] uppercase tracking-wide bg-gray-100 text-gray-600 px-2 py-1 rounded-md">Section</div>
                  </div>
                  {section?.passage ? (
                    <div className="prose prose-sm max-w-none">
                      {renderPassageContent(section.passage || '', section.mediaBlocks || [])}
                    </div>
                  ) : section?.mediaBlocks && section.mediaBlocks.length ? (
                    <div className="space-y-4">
                      {section.mediaBlocks.map((block, index) => renderMediaBlock(block, index))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Không có đoạn văn cho phần này.</p>
                  )}
                  {section?.audio ? (
                    <div className="mt-4">
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
                    <div className="mt-4">
                      <img
                        src={section.image}
                        alt={section.title || 'Section illustration'}
                        className="rounded-lg border border-gray-200 max-h-60 object-cover w-full"
                      />
                    </div>
                  ) : null}
                  {test.sections.length > 1 ? (
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="text-xs font-medium text-gray-600 mb-2">Các phần khác</div>
                      <div className="flex flex-wrap gap-2">
                        {test.sections.map((sec, sectionIndex) => {
                          const secId = normalizeId(sec?._id);
                          const firstQuestionIndex = test.questions.findIndex((q) => normalizeId(q.sectionId) === secId);
                          const isActive = secId === currentSectionId;
                          return (
                            <button
                              key={secId || sec._id || `${sec.title || 'section'}-${sectionIndex}`}
                              onClick={() => firstQuestionIndex >= 0 && goToQuestion(firstQuestionIndex)}
                              className={`px-3 py-1 rounded-md text-xs border transition ${isActive ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                            >
                              {sec.title}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </Card>
              );
            })()}

            {/* Question navigation moved under passage on large screens */}
            <Card padding="md">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900 text-sm">Câu hỏi</h3>
                <span className="text-xs text-gray-500">Chọn để chuyển nhanh</span>
              </div>
              <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2 mb-4">
                {test.questions.map((_, index) => {
                  const answered = !!(
                    answers[index]?.selectedOptions.length ||
                    answers[index]?.userAnswer ||
                    answers[index]?.matchingAnswers?.some(m => m.selected && m.selected.trim().length > 0)
                  );
                  const isCurrent = index === currentQuestionIndex;
                  return (
                    <button
                      key={index}
                      onClick={() => goToQuestion(index)}
                      className={`h-8 w-8 rounded-md text-xs font-medium flex items-center justify-center border transition ${
                        isCurrent
                          ? 'bg-blue-600 text-white border-blue-600 shadow'
                          : answered
                          ? 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
                          : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'
                      }`}
                      aria-label={`Câu ${index + 1}${answered ? ' đã trả lời' : ''}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-3 mt-1">
                <div className="flex items-center gap-1 text-[10px] text-gray-500"><span className="h-3 w-3 rounded-sm bg-blue-600 inline-block"></span>Hiện tại</div>
                <div className="flex items-center gap-1 text-[10px] text-gray-500"><span className="h-3 w-3 rounded-sm bg-green-400 inline-block border border-green-600"></span>Đã trả lời</div>
                <div className="flex items-center gap-1 text-[10px] text-gray-500"><span className="h-3 w-3 rounded-sm bg-gray-200 inline-block border border-gray-400"></span>Chưa trả lời</div>
              </div>
            </Card>
          </div>

          {/* Right column: All questions for current section */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">Phần hiện tại: {currentSection?.title}</h2>
              <span className="text-xs text-gray-500">Hiển thị {sectionQuestions.length} câu hỏi</span>
            </div>
            {sectionQuestions.map(({ q, globalIndex }) => {
              const answer = answers[globalIndex] || { selectedOptions: [], userAnswer: '', matchingAnswers: [] };
              const allowMultiple = q.allowMultiple ?? false;
              const matchingCount = answer.matchingAnswers?.filter((pair) => pair.selected && pair.selected.trim().length > 0).length || 0;
              const selectedCount = answer.selectedOptions.length || matchingCount || (answer.userAnswer ? 1 : 0);
              return (
                <Card key={q._id || globalIndex} padding="lg" id={`question-${globalIndex}`} className={globalIndex === currentQuestionIndex ? 'ring-1 ring-blue-300' : ''}>
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-blue-600 font-semibold mb-1">{typeLabel(q.type)}</div>
                      <div className="text-base font-medium text-gray-900">Câu {globalIndex + 1}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{q.points} điểm</div>
                      {selectedCount > 0 && (
                        <div className="text-[10px] text-green-600 font-medium">Đã chọn {selectedCount}</div>
                      )}
                    </div>
                  </div>
                  {q.media?.audioUrl ? (
                    <div className="mb-4">
                      <audio
                        controls
                        controlsList="nodownload"
                        preload="auto"
                        className="w-full"
                        onContextMenu={(event) => event.preventDefault()}
                      >
                        <source src={q.media.audioUrl} type="audio/mpeg" />
                        Trình duyệt của bạn không hỗ trợ phát audio.
                      </audio>
                    </div>
                  ) : null}
                  <div className="text-gray-800 leading-relaxed mb-5">
                    {q.content}
                  </div>
                  <div className="space-y-4">
                    {q.type === 'multi_choice' && (
                      <div className="flex flex-col gap-2">
                        {q.options?.map((option, optionIndex) => {
                          const selected = answer.selectedOptions.includes(option.text);
                          return (
                            <button
                              key={optionIndex}
                              type="button"
                              onClick={() => {
                                let newSelected: string[];
                                if (allowMultiple) {
                                  newSelected = selected
                                    ? answer.selectedOptions.filter(item => item !== option.text)
                                    : Array.from(new Set([...answer.selectedOptions, option.text]));
                                } else {
                                  newSelected = selected ? [] : [option.text];
                                }
                                handleAnswerChange(globalIndex, {
                                  selectedOptions: newSelected,
                                  userAnswer: allowMultiple ? newSelected.join(', ') : '',
                                  matchingAnswers: answer.matchingAnswers || []
                                });
                                setCurrentQuestionIndex(globalIndex);
                              }}
                              className={`relative w-full text-left px-4 py-3 rounded-lg border transition shadow-sm text-sm font-medium flex items-start gap-3 ${
                                selected
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                                  : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              <span className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold flex-shrink-0 ${
                                selected ? 'bg-white text-blue-600 border-blue-600' : 'bg-gray-100 text-gray-500 border-gray-300'
                              }`}>{String.fromCharCode(65 + optionIndex)}</span>
                              <span className="flex-1 leading-relaxed">{option.text}</span>
                              {selected && (
                                <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-white shadow-inner" />
                              )}
                            </button>
                          );
                        })}
                        {!allowMultiple && (
                          <p className="text-xs text-gray-500">Chỉ chọn một đáp án.</p>
                        )}
                      </div>
                    )}
                    {q.type === 'dropdown' && (
                      <div className="space-y-2">
                        <select
                          value={answer.selectedOptions[0] || ''}
                          onChange={(e) => {
                            handleAnswerChange(globalIndex, {
                              selectedOptions: e.target.value ? [e.target.value] : [],
                              userAnswer: '',
                              matchingAnswers: answer.matchingAnswers || []
                            });
                            setCurrentQuestionIndex(globalIndex);
                          }}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white shadow-sm"
                        >
                          <option value="">Chọn đáp án...</option>
                          {q.options?.map((option, optionIndex) => (
                            <option key={optionIndex} value={option.text}>{option.text}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    {q.type === 'short_answer' && (
                      <div>
                        <textarea
                          value={answer.userAnswer || ''}
                          onChange={(e) => {
                            handleAnswerChange(globalIndex, {
                              selectedOptions: [],
                              userAnswer: e.target.value,
                              matchingAnswers: answer.matchingAnswers || []
                            });
                            setCurrentQuestionIndex(globalIndex);
                          }}
                          placeholder="Nhập câu trả lời của bạn..."
                          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white shadow-sm"
                          rows={4}
                        />
                        <p className="mt-2 text-xs text-gray-500">Trả lời bằng tiếng Anh, kiểm tra lỗi chính tả trước khi nộp.</p>
                      </div>
                    )}
                    {q.type === 'matching' && (
                      <div className="space-y-3">
                        {(q.matchingPairs || []).map((pair, pairIndex) => {
                          const current = answer.matchingAnswers?.find((ans) => ans.prompt === pair.prompt)?.selected || '';
                          return (
                            <div key={pairIndex} className="space-y-1">
                              <div className="text-sm font-medium text-gray-700">{pair.prompt}</div>
                              <input
                                value={current}
                                onChange={(e) => {
                                  const updatedPairs = (q.matchingPairs || []).map((p) => {
                                    const prevSelected = answer.matchingAnswers?.find((ans) => ans.prompt === p.prompt)?.selected || '';
                                    if (p.prompt === pair.prompt) {
                                      return { prompt: p.prompt, selected: e.target.value };
                                    }
                                    return { prompt: p.prompt, selected: prevSelected };
                                  });
                                  handleAnswerChange(globalIndex, {
                                    matchingAnswers: updatedPairs,
                                    selectedOptions: answer.selectedOptions,
                                    userAnswer: answer.userAnswer
                                  });
                                  setCurrentQuestionIndex(globalIndex);
                                }}
                                placeholder="Nhập câu trả lời ghép cặp"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white shadow-sm"
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-gray-500">Phần này có {sectionQuestions.length} câu.</div>
              {(() => {
                const currentSectionIndex = currentSectionId
                  ? test.sections.findIndex((section) => normalizeId(section?._id) === currentSectionId)
                  : -1;
                const hasNextSection = currentSectionIndex >= 0 && currentSectionIndex < test.sections.length - 1;
                if (hasNextSection) {
                  return (
                    <Button variant="secondary" size="sm" onClick={goToNextSection}>Sang phần tiếp →</Button>
                  );
                }
                return (
                  <Button variant="danger" size="sm" onClick={handleSubmit} disabled={isSubmitting} loading={isSubmitting}>
                    {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
                  </Button>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeTestPage;

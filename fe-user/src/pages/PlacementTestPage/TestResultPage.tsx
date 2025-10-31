import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getTestForTaking } from '../../services/api';
import { DetailedResult, SectionMedia, TestResult, TestSection } from '../../types';

const mediaPlaceholderRegex = /\[\[media:([^\]]+)\]\]/g;

interface PassageGroup {
  sectionId?: string;
  passage?: string;
  sectionTitle?: string;
  mediaBlocks: SectionMedia[];
  questions: DetailedResult[];
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
      transcript: typeof block?.transcript === 'string' ? block.transcript : undefined,
    }))
    .filter((block: SectionMedia) => !!block.id && !!block.url);
};

const sanitizeSections = (sections: TestSection[] = []): TestSection[] => {
  return sections.map((section) => {
    const normalizedBlocks = normalizeMediaBlocks(section?.mediaBlocks);
    const extras: SectionMedia[] = [];

    if (section?.audio && typeof section.audio === 'string') {
      extras.push({
        id: `audio-${section?._id || generateMediaId()}`,
        type: 'audio',
        url: section.audio,
        originalName: section?.title ? `${section.title} audio` : 'Section audio',
        mimeType: 'audio/mpeg',
      });
    }

    if (section?.image && typeof section.image === 'string') {
      extras.push({
        id: `image-${section?._id || generateMediaId()}`,
        type: 'image',
        url: section.image,
        originalName: section?.title ? `${section.title} illustration` : 'Section illustration',
      });
    }

    const merged = [...extras, ...normalizedBlocks];
    const unique = new Map<string, SectionMedia>();
    merged.forEach((block) => {
      if (!block?.id) {
        return;
      }
      if (!unique.has(block.id)) {
        unique.set(block.id, block);
      }
    });

    return {
      ...section,
      mediaBlocks: Array.from(unique.values()),
    };
  });
};

const renderMediaBlock = (block: SectionMedia, key: React.Key): React.ReactNode => {
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
      <div
        key={`media-audio-${key}`}
        className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5 shadow-sm"
      >
        <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">
          {block.originalName || 'Audio'}
        </div>
        <audio
          controls
          controlsList="nodownload"
          preload="auto"
          className="mt-3 w-full"
          onContextMenu={(event) => event.preventDefault()}
        >
          <source src={block.url} type={block.mimeType ?? 'audio/mpeg'} />
          Your browser does not support audio playback.
        </audio>
        {block.transcript ? (
          <details className="mt-4 rounded-xl border border-blue-100 bg-white/90 p-3 text-xs leading-relaxed text-slate-600">
            <summary className="cursor-pointer font-semibold text-blue-600">Transcript</summary>
            <p className="mt-2 whitespace-pre-wrap">{block.transcript}</p>
          </details>
        ) : null}
      </div>
    );
  }

  return (
    <figure
      key={`media-image-${key}`}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <img
        src={block.url}
        alt={block.originalName || `Media ${block.id}`}
        className="h-auto w-full object-contain"
      />
      {block.originalName ? (
        <figcaption className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
          {block.originalName}
        </figcaption>
      ) : null}
    </figure>
  );
};

const renderPartContent = (passage: string, mediaBlocks: SectionMedia[] = []): React.ReactNode => {
  if (!passage && mediaBlocks.length) {
    return mediaBlocks.map((block, index) => renderMediaBlock(block, `media-only-${index}`));
  }

  mediaPlaceholderRegex.lastIndex = 0;

  const mediaMap = new Map<string, SectionMedia>();
  mediaBlocks.forEach((block) => {
    if (block?.id) {
      mediaMap.set(String(block.id), block);
    }
  });

  const usedMediaIds = new Set<string>();
  const nodes: React.ReactNode[] = [];

  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  while ((match = mediaPlaceholderRegex.exec(passage)) !== null) {
    const textSegment = passage.slice(lastIndex, match.index);
    if (textSegment) {
      nodes.push(
        <p key={`text-${key++}`} className="whitespace-pre-wrap leading-relaxed text-slate-800">
          {textSegment}
        </p>
      );
    }

    const mediaId = match[1]?.trim();
    if (mediaId) {
      const block = mediaMap.get(mediaId);
      if (block) {
        nodes.push(renderMediaBlock(block, `inline-${key++}`));
        usedMediaIds.add(mediaId);
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
      <p key={`text-${key++}`} className="whitespace-pre-wrap leading-relaxed text-slate-800">
        {tail}
      </p>
    );
  }

  mediaBlocks.forEach((block) => {
    const blockId = String(block.id);
    if (!usedMediaIds.has(blockId)) {
      nodes.push(renderMediaBlock(block, `remaining-${key++}`));
    }
  });

  return nodes;
};

const renderQuestionMedia = (detail: DetailedResult): React.ReactNode => {
  const media = detail.question?.media;
  if (!media) {
    return null;
  }

  const blocks: SectionMedia[] = [];

  if (typeof media.audioUrl === 'string' && media.audioUrl.trim().length) {
    blocks.push({
      id: `question-audio-${detail.questionNumber}`,
      type: 'audio',
      url: media.audioUrl,
      originalName: media.audioName || `Question ${detail.questionNumber} audio`,
      transcript: typeof media.transcript === 'string' ? media.transcript : undefined,
      mimeType: media.audioMimeType || 'audio/mpeg',
    });
  }

  if (typeof media.imageUrl === 'string' && media.imageUrl.trim().length) {
    blocks.push({
      id: `question-image-${detail.questionNumber}`,
      type: 'image',
      url: media.imageUrl,
      originalName: media.imageName || `Question ${detail.questionNumber} illustration`,
    });
  }

  if (!blocks.length) {
    return null;
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => renderMediaBlock(block, `${detail.questionNumber}-${index}`))}
    </div>
  );
};

const formatSectionTitle = (title?: string | null): string => {
  if (!title) return '';
  return title.replace(/^passage\b/i, (match) => {
    if (match === match.toUpperCase()) return 'PART';
    if (match === match.toLowerCase()) return 'part';
    return 'Part';
  });
};

const buildPassageGroups = (
  details: DetailedResult[] = [],
  sectionLookup?: Map<string, TestSection>
): PassageGroup[] => {
  const groups: PassageGroup[] = [];

  details.forEach((detail) => {
    const sectionIdRaw = detail.question?.sectionId;
    const sectionId = sectionIdRaw ? normalizeId(sectionIdRaw) : '';
    const section = sectionId && sectionLookup ? sectionLookup.get(sectionId) : undefined;
    const passage = (detail.question?.passage || '').trim() || section?.passage || '';
    const sectionTitle = section?.title || detail.question?.sectionTitle || '';
    const mediaBlocks = section?.mediaBlocks ?? [];
    const lastGroup = groups[groups.length - 1];

    if (
      lastGroup &&
      lastGroup.sectionId === (sectionId || undefined) &&
      lastGroup.passage === passage &&
      lastGroup.sectionTitle === sectionTitle
    ) {
      lastGroup.questions.push(detail);
    } else {
      groups.push({
        sectionId: sectionId || undefined,
        passage,
        sectionTitle,
        mediaBlocks,
        questions: [detail],
      });
    }
  });

  return groups;
};

const getOptionLabel = (index: number) => String.fromCharCode(65 + index);

const isSameText = (a?: string, b?: string) => (a || '').trim().toLowerCase() === (b || '').trim().toLowerCase();

const renderOptionAnswers = (detail: DetailedResult) => {
  const options = Array.isArray(detail.question.options) ? detail.question.options : [];
  const selected = Array.isArray(detail.userAnswer.selectedOptions)
    ? detail.userAnswer.selectedOptions.map((opt) => (opt || '').trim())
    : [];
  const allowMultiple = Boolean((detail.question as any)?.allowMultiple);

  if (!options.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        No answers to display.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {options.map((option: any, optionIndex: number) => {
        const optionText = typeof option?.text === 'string' ? option.text : '';
        const isCorrect =
          Boolean(option?.isCorrect) || (detail.correctAnswers || []).some((answer) => isSameText(answer, optionText));
        const isSelected = selected.some((answer) => isSameText(answer, optionText));
        const isWrongSelection = isSelected && !isCorrect;
        const baseClasses =
          'flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm transition-colors shadow-sm';
        const stateClasses = isCorrect
          ? 'border-emerald-500/80 bg-emerald-50 text-emerald-900'
          : isWrongSelection
            ? 'border-rose-500/80 bg-rose-50 text-rose-900'
            : 'border-slate-200 bg-white text-slate-700';

        return (
          <div key={`${detail.questionNumber}-option-${optionIndex}`} className={`${baseClasses} ${stateClasses}`}>
            <span
              className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
                isCorrect
                  ? 'border-emerald-500/80 bg-white text-emerald-600'
                  : isWrongSelection
                    ? 'border-rose-400 bg-white text-rose-500'
                    : 'border-slate-300 text-slate-500'
              }`}
            >
              {getOptionLabel(optionIndex)}
            </span>
            <div className="flex-1">
              <p className="font-medium leading-relaxed">{optionText || '—'}</p>
              {isWrongSelection ? (
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-rose-500">Your selection</p>
              ) : null}
              {isCorrect ? (
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-emerald-600">Correct answer</p>
              ) : null}
            </div>
          </div>
        );
      })}
      {allowMultiple ? (
        <p className="text-xs text-slate-500">Multiple answers may be correct.</p>
      ) : null}
    </div>
  );
};

const renderShortAnswer = (detail: DetailedResult) => {
  const userAnswer = (detail.userAnswer.userAnswer || '').trim();
  const answered = Boolean(userAnswer);
  const isCorrect = detail.isCorrect;
  const baseClasses = 'rounded-xl border px-4 py-3 text-sm font-medium';
  const stateClasses = isCorrect
    ? 'border-emerald-500/80 bg-emerald-50 text-emerald-700'
    : answered
      ? 'border-rose-500/80 bg-rose-50 text-rose-700'
      : 'border-rose-300/80 bg-rose-50 text-rose-600';

  return (
    <div className="space-y-3">
      <div className={`${baseClasses} ${stateClasses}`}>{answered ? userAnswer : 'Not answered'}</div>
      <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm">
        <span className="font-semibold text-emerald-700">Correct answer: </span>
        <span className="font-medium text-emerald-600">{(detail.correctAnswers || []).join(', ') || '—'}</span>
      </div>
    </div>
  );
};

const renderMatchingAnswer = (detail: DetailedResult) => {
  const expectedPairs = Array.isArray((detail.question as any)?.matchingPairs)
    ? (detail.question as any).matchingPairs
    : [];
  const submittedPairs = Array.isArray(detail.userAnswer.matchingAnswers)
    ? detail.userAnswer.matchingAnswers
    : [];

  if (!expectedPairs.length) {
    return renderOptionAnswers(detail);
  }

  return (
    <div className="space-y-3">
      {expectedPairs.map((pair: any, pairIndex: number) => {
        const prompt = pair?.prompt || '';
        const correctOption = pair?.correctOption || '';
        const userSelection = submittedPairs.find((answer) => isSameText(answer?.prompt, prompt));
        const selectedValue = userSelection?.selected || '';
        const hasSelection = Boolean(selectedValue);
        const isCorrect = hasSelection && isSameText(selectedValue, correctOption);
        const baseClasses = 'rounded-2xl border px-4 py-3 text-sm transition-colors';
        const stateClasses = isCorrect
          ? 'border-emerald-500/80 bg-emerald-50 text-emerald-800'
          : hasSelection
            ? 'border-rose-500/80 bg-rose-50 text-rose-800'
            : 'border-slate-200 bg-white text-slate-700';

        return (
          <div key={`${detail.questionNumber}-pair-${pairIndex}`} className={`${baseClasses} ${stateClasses}`}>
            <div className="font-semibold text-slate-800">{prompt}</div>
            <div className="mt-2 flex flex-col gap-1 text-sm">
              <span className="text-slate-600">
                <span className="font-semibold">Your answer: </span>
                <span className={hasSelection && !isCorrect ? 'text-rose-600 font-medium' : 'text-slate-700'}>
                  {hasSelection ? selectedValue : 'Not answered'}
                </span>
              </span>
              <span className="text-emerald-600">
                <span className="font-semibold">Correct answer: </span>
                <span className="font-medium">{correctOption}</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const renderAnswerBlock = (detail: DetailedResult) => {
  switch (detail.question.type) {
    case 'multi_choice':
    case 'dropdown':
      return renderOptionAnswers(detail);
    case 'matching':
      return renderMatchingAnswer(detail);
    case 'short_answer':
    default:
      return renderShortAnswer(detail);
  }
};

const getLevelColor = (avLevel: string) => {
  const level = avLevel.toLowerCase();
  if (level.includes('av1') || level.includes('av2')) return 'text-rose-600 bg-rose-100';
  if (level.includes('av3') || level.includes('av4')) return 'text-amber-600 bg-amber-100';
  if (level.includes('av5') || level.includes('av6')) return 'text-emerald-600 bg-emerald-100';
  if (level.includes('av7')) return 'text-blue-600 bg-blue-100';
  return 'text-slate-600 bg-slate-100';
};

const getScoreColor = (percentage: number) => {
  if (percentage >= 80) return 'text-emerald-600';
  if (percentage >= 60) return 'text-amber-600';
  if (percentage >= 40) return 'text-orange-600';
  return 'text-rose-600';
};

const TestResultPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const result = location.state?.result as TestResult | undefined;

  const [sections, setSections] = useState<TestSection[]>([]);
  const [isFetchingSections, setIsFetchingSections] = useState<boolean>(false);

  useEffect(() => {
    if (!testId) {
      return;
    }

    let isMounted = true;

    const fetchSections = async () => {
      try {
        setIsFetchingSections(true);
        const response = await getTestForTaking(testId);
        const fetchedSections: TestSection[] = Array.isArray(response?.test?.sections)
          ? response.test.sections
          : [];
        if (!isMounted) {
          return;
        }
        setSections(sanitizeSections(fetchedSections));
      } catch (error) {
        console.error('Unable to load section content for results:', error);
        if (isMounted) {
          setSections([]);
        }
      } finally {
        if (isMounted) {
          setIsFetchingSections(false);
        }
      }
    };

    fetchSections();

    return () => {
      isMounted = false;
    };
  }, [testId]);

  const sectionLookup = useMemo(() => {
    const map = new Map<string, TestSection>();
    sections.forEach((section) => {
      const id = normalizeId(section?._id);
      if (id) {
        map.set(id, section);
      }
    });
    return map;
  }, [sections]);

  const groupedDetails = useMemo(() => {
    if (!result) return [];
    return buildPassageGroups(Array.isArray(result.detailedResults) ? result.detailedResults : [], sectionLookup);
  }, [result, sectionLookup]);

  const detailCount = result?.detailedResults?.length || 0;

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="rounded-2xl border border-slate-200 bg-white px-10 py-12 text-center shadow-xl">
          <h1 className="mb-3 text-3xl font-semibold text-slate-900">Result not found</h1>
          <p className="mb-6 text-sm text-slate-600">
            The test result you are looking for is unavailable or has expired.
          </p>
          <button
            onClick={() => navigate('/tests')}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Back to test list
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50/80 py-10">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-12">
        <div className="mb-10 text-center">
          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
            Placement test
          </span>
          <h1 className="mt-4 text-4xl font-bold text-slate-900">Full results</h1>
          <p className="mt-2 text-sm text-slate-500">
            Review your performance by part, including audio and transcripts where available.
          </p>
          <p className="mt-4 text-lg font-semibold text-blue-600">{result.testTitle}</p>
        </div>

        <div className="rounded-3xl border border-blue-100 bg-white/95 p-8 shadow-xl shadow-blue-100/60 md:p-10">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-gradient-to-br from-white via-emerald-50/70 to-white px-6 py-6 text-center shadow-sm">
              <div className={`text-5xl font-bold ${getScoreColor(result.score.percentage)}`}>
                {result.score.percentage}%
              </div>
              <p className="mt-2 text-sm font-medium text-slate-600">Overall score</p>
              <p className="text-xs text-slate-500">
                {result.score.earnedPoints}/{result.score.totalPoints} points
              </p>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-white via-blue-50/70 to-white px-6 py-6 text-center shadow-sm">
              <div className="text-5xl font-bold text-blue-600">{result.ieltsScore}</div>
              <p className="mt-2 text-sm font-medium text-slate-600">Estimated IELTS band</p>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-white via-indigo-50/70 to-white px-6 py-6 text-center shadow-sm">
              <span className={`inline-flex items-center justify-center rounded-full px-5 py-2 text-lg font-semibold ${getLevelColor(result.avLevel)}`}>
                {result.avLevel}
              </span>
              <p className="mt-2 text-sm font-medium text-slate-600">Current level</p>
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 via-indigo-50/70 to-blue-50 p-7 shadow-inner">
          <h2 className="text-lg font-semibold text-blue-800">Recommendation</h2>
          <p className="mt-2 text-sm text-blue-700">{result.recommendation}</p>
        </div>

        <div className="mt-10 rounded-3xl border border-slate-200/70 bg-white/95 p-8 shadow-lg shadow-slate-200/60 md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Detailed breakdown</h2>
              <p className="text-sm text-slate-500">Review each question with answers and explanations.</p>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {detailCount} questions
            </span>
          </div>

          <div className="mt-6 space-y-6">
            {isFetchingSections && !groupedDetails.length ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                Loading section content...
              </div>
            ) : null}

            {groupedDetails.length > 0 ? (
              groupedDetails.map((group, groupIndex) => {
                const hasPassageContent = Boolean(group.passage && group.passage.trim().length);
                const hasMedia = group.mediaBlocks.length > 0;
                const partContent = renderPartContent(group.passage || '', group.mediaBlocks);

                return (
                  <div key={group.sectionId || groupIndex} className="space-y-4">
                    {(hasPassageContent || hasMedia) ? (
                      <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6 shadow-inner">
                        {group.sectionTitle ? (
                          <div className="flex flex-col gap-2">
                            <h3 className="text-lg font-semibold text-blue-800">{formatSectionTitle(group.sectionTitle)}</h3>
                          </div>
                        ) : null}
                        <div className="mt-3 space-y-4">
                          {Array.isArray(partContent)
                            ? partContent.map((node, nodeIndex) => (
                                <React.Fragment key={nodeIndex}>{node}</React.Fragment>
                              ))
                            : partContent}
                        </div>
                      </div>
                    ) : null}

                    {group.questions.map((detail) => {
                      const questionMedia = renderQuestionMedia(detail);
                      return (
                        <div
                          key={`${detail.questionNumber}-${group.sectionId || 'section'}-${groupIndex}`}
                          className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-4">
                            <div>
                              <h3 className="text-base font-semibold text-slate-900">Question {detail.questionNumber}</h3>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span
                                className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${
                                  detail.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                }`}
                              >
                                {detail.isCorrect ? 'Correct' : 'Incorrect'}
                              </span>
                              <span className="text-xs font-medium text-slate-500">+{detail.pointsEarned ?? 0} points</span>
                            </div>
                          </div>

                          <div className="space-y-4 px-5 py-5">
                            <div className="space-y-3">
                              <p className="text-sm leading-relaxed text-slate-800">{detail.question.content}</p>
                              {questionMedia}
                            </div>

                            {renderAnswerBlock(detail)}

                            {detail.explanation ? (
                              <div className="rounded-xl border border-amber-100 bg-amber-50/80 px-4 py-3">
                                <h4 className="text-xs font-semibold uppercase tracking-wide text-amber-600">Explanation</h4>
                                <p className="mt-1 text-sm leading-relaxed text-amber-700">{detail.explanation}</p>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })
            ) : (
              <p className="text-center text-sm text-slate-500">No detailed data available.</p>
            )}
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <button
            onClick={() => navigate('/tests')}
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-blue-600 hover:to-indigo-600"
          >
            Take another test
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestResultPage;
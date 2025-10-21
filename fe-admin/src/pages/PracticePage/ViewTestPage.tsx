import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PlacementTestAPI } from '../../services/api';
import { PlacementTest, SectionMedia } from '../../types';

const mediaPlaceholderRegex = /\[\[media:([^\]]+)\]\]/g;

const generateMediaId = (): string => {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch (err) {
    // ignore and fall back
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
    }))
    .filter((block: SectionMedia) => !!block.id);
};

const sanitizeSections = (sections: any[] | undefined) => {
  return (sections || []).map((section: any) => ({
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
          Trình duyệt không hỗ trợ audio.
        </audio>
      </div>
    );
  }

  return (
    <figure key={`media-image-${key}`} className="my-4">
      <img
        src={block.url}
        alt={block.originalName || `Media ${block.id}`}
        className="rounded-lg border max-w-full"
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
          <p key={`missing-${key++}`} className="text-sm text-amber-600">
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
      <p key={`text-${key++}`} className="whitespace-pre-wrap text-slate-800 leading-relaxed">
        {tail}
      </p>
    );
  }

  return nodes;
};

const ViewTestPage: React.FC = () => {
  const { testId } = useParams();
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<PlacementTest | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const [panelHeight, setPanelHeight] = useState<number>(0);

  // Compute dynamic height so panels fill the available viewport height
  useEffect(() => {
    const updateHeight = () => {
      const top = gridRef.current?.getBoundingClientRect().top ?? 0;
      const h = Math.max(320, Math.floor(window.innerHeight - top));
      setPanelHeight(h);
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

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
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || 'Không thể tải bài test');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [testId]);

  const currentSection = useMemo(() => {
    return test?.sections && test.sections.length > 0
      ? test.sections[currentSectionIndex]
      : undefined;
  }, [test, currentSectionIndex]);

  const sectionQuestions = useMemo(() => {
    if (!test || !test.questions || !currentSection?._id) return [];
    const currId = (currentSection as any)?._id?.toString
      ? (currentSection as any)._id.toString()
      : String(currentSection._id);
    return test.questions
      .filter((q) => {
        const sid = (q as any)?.sectionId && (q as any).sectionId.toString
          ? (q as any).sectionId.toString()
          : String(q.sectionId || '');
        return sid === currId;
      })
      .sort((a, b) => (a.questionNumber || 0) - (b.questionNumber || 0));
  }, [test, currentSection]);

  const nextSection = () => {
    if (!test?.sections) return;
    setCurrentSectionIndex((idx) => Math.min(test.sections!.length - 1, idx + 1));
  };

  const prevSection = () => {
    setCurrentSectionIndex((idx) => Math.max(0, idx - 1));
  };

  if (loading) {
    return <div className="p-6">Đang tải...</div>;
  }

  if (!test) {
    return <div className="p-6">Không tìm thấy bài test</div>;
  }

  return (
    <div className="space-y-6" style={{ marginBottom: '-1.5rem' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">{test.title}</h1>
          <div className="text-slate-500">{test.category.toUpperCase()} • {test.timeLimit} phút • {test.totalQuestions} câu hỏi</div>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/admin/placement-tests/${test._id}/edit`}
            className="px-4 py-2 rounded-lg border hover:bg-slate-50"
          >Sửa</Link>
          <Link
            to="/admin/placement-tests"
            className="px-4 py-2 rounded-lg bg-slate-800 text-white"
          >Quay lại</Link>
        </div>
      </div>

      {/* Split View: dynamic-height panels matching Edit page */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0" ref={gridRef}>
        {/* Left Panel */}
        <div className="bg-white lg:rounded-l-xl rounded-t-xl lg:rounded-tr-none border overflow-hidden lg:border-r-0 flex flex-col" style={{ height: panelHeight }}>
          <div className="h-12 px-4 border-b flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <span className="text-base font-semibold text-slate-800 truncate">{currentSection?.title || '—'}</span>
            </div>
            {test.sections && (
              <div className="text-sm text-slate-500 whitespace-nowrap">{currentSectionIndex + 1} / {test.sections.length}</div>
            )}
          </div>
          <div className="p-3 space-y-4 flex-1 overflow-auto">
            {currentSection?.passage ? (
              <div className="prose max-w-none">
                {renderPassageContent(currentSection.passage || '', (currentSection.mediaBlocks || []) as SectionMedia[])}
              </div>
            ) : null}
            {currentSection?.audio ? (
              <audio
                controls
                controlsList="nodownload"
                preload="auto"
                className="w-full mt-2"
                onContextMenu={(event) => event.preventDefault()}
              >
                <source src={currentSection.audio} />
                Trình duyệt không hỗ trợ audio.
              </audio>
            ) : null}
            {currentSection?.image && (
              <img src={currentSection.image} alt="Section" className="max-w-full rounded-lg mt-2" />
            )}
          </div>
          <div className="h-12 border-t bg-slate-50 flex items-center p-3">
            <button onClick={prevSection} disabled={currentSectionIndex === 0} className="px-3 py-2 rounded-lg border disabled:opacity-50">◀ Trước</button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="bg-white lg:rounded-r-xl rounded-b-xl lg:rounded-bl-none border overflow-hidden lg:border-l-0 flex flex-col" style={{ height: panelHeight }}>
          <div className="h-12 px-4 border-b flex items-center">
            <h2 className="font-semibold">Câu hỏi trong phần này</h2>
          </div>
          <div className="p-4 flex-1 overflow-auto space-y-4">
            {sectionQuestions.length === 0 ? (
              <div className="text-slate-500 text-sm">Chưa có câu hỏi cho phần này.</div>
            ) : (
              sectionQuestions.map((q, i) => (
                <div key={q._id || i} className="border rounded-lg p-3">
                  <div className="text-sm text-slate-500 mb-1">Câu {q.questionNumber ?? i + 1}</div>
                  <div className="font-medium text-slate-800 whitespace-pre-wrap">{q.content || q.text}</div>
                  {q.options && q.options.length > 0 && (
                    <ul className="mt-2 space-y-1 list-disc pl-5 text-slate-700 text-sm">
                      {q.options.map((op, idx) => (
                        <li key={idx}>{op.text}</li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-2 text-sm text-emerald-700">
                    <span className="font-medium">Đáp án:</span> {(q.options && q.options.length)
                      ? (q.options.filter((op: any) => op.isCorrect).map((op: any) => op.text).join(', ') || '—')
                      : ((q.correctAnswers || []).join(', ') || '—')}
                  </div>
                  {q.explanation ? (
                    <div className="mt-2 text-sm text-slate-600">
                      <span className="font-medium">Giải thích:</span> {q.explanation}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
          {/* Spacer footer to align with left panel and provide Next */}
          <div className="h-12 border-t bg-slate-50 flex items-center justify-end p-3">
            <button onClick={nextSection} disabled={!!test?.sections && currentSectionIndex >= test.sections.length - 1} className="px-3 py-2 rounded-lg border disabled:opacity-50">Sau ▶</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTestPage;

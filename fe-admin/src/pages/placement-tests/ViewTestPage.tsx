import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PlacementTestAPI } from '../../services/api';
import { PlacementTest } from '../../types';

const ViewTestPage: React.FC = () => {
  const { testId } = useParams();
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<PlacementTest | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      if (!testId) return;
      try {
        setLoading(true);
        const data = await PlacementTestAPI.getTestById(testId);
        setTest(data);
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
    <div className="space-y-6">
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

      {/* Split View: Left passage/media, Right questions with nav */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Left Panel */}
        <div className="bg-white lg:rounded-l-xl rounded-t-xl lg:rounded-tr-none border overflow-hidden lg:border-r-0 h-[72vh] flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Phần {currentSectionIndex + 1}{currentSection?.title ? `: ${currentSection.title}` : ''}</h2>
            {test.sections && (
              <div className="text-sm text-slate-500 whitespace-nowrap">{currentSectionIndex + 1} / {test.sections.length}</div>
            )}
          </div>
          <div className="p-4 space-y-4 flex-1 overflow-auto">
            {currentSection?.passage && (
              <div>
                <div className="prose max-w-none">
                  <div className="text-slate-800 whitespace-pre-wrap">{currentSection.passage}</div>
                </div>
              </div>
            )}
            {currentSection?.audio && (
              <audio controls className="w-full">
                <source src={currentSection.audio} />
              </audio>
            )}
            {currentSection?.image && (
              <img src={currentSection.image} alt="Section" className="max-w-full rounded-lg" />
            )}
          </div>
          <div className="p-3 border-t flex items-center justify-between bg-slate-50">
            <button onClick={prevSection} disabled={currentSectionIndex === 0} className="px-3 py-2 rounded-lg border disabled:opacity-50">◀ Trước</button>
            <button onClick={nextSection} disabled={!!test?.sections && currentSectionIndex >= test.sections.length - 1} className="px-3 py-2 rounded-lg border disabled:opacity-50">Sau ▶</button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="bg-white lg:rounded-r-xl rounded-b-xl lg:rounded-bl-none border overflow-hidden lg:border-l-0 h-[72vh] flex flex-col">
          <div className="p-4 border-b">
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
        </div>
      </div>
    </div>
  );
};

export default ViewTestPage;

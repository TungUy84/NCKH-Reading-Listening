import React, { useEffect, useMemo, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PlacementTestAPI } from '../../services/api';
import { PlacementTest } from '../../types';

const EditTestPage: React.FC = () => {
  const { testId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // Auto-save states
  const [infoSaving, setInfoSaving] = useState(false);
  const [contentSaving, setContentSaving] = useState(false);
  const [invalidQuestionIdxs, setInvalidQuestionIdxs] = useState<Set<number>>(new Set());
  const [infoSavedAt, setInfoSavedAt] = useState<number | null>(null);
  const [contentSavedAt, setContentSavedAt] = useState<number | null>(null);
  const hasLoadedRef = useRef(false);
  const infoDebounceRef = useRef<number | null>(null);
  const contentDebounceRef = useRef<number | null>(null);
  const lastInfoSigRef = useRef<string | null>(null);
  const lastContentSigRef = useRef<string | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [test, setTest] = useState<PlacementTest | null>(null);
  const [openQuestionIdx, setOpenQuestionIdx] = useState<number | null>(null);
  const [showBasicInfo, setShowBasicInfo] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const [panelHeight, setPanelHeight] = useState<number>(0);
  const [isEditingSectionTitle, setIsEditingSectionTitle] = useState(false);
  const [tempSectionTitle, setTempSectionTitle] = useState('');

  // Friendly labels for question types
  const TYPE_LABELS: Record<string, string> = {
    single_choice: 'Single choice',
    multiple_choice: 'Multiple choice',
    fill_blank: 'Fill in the blank',
    true_false_not_given: 'True / False / Not Given',
    yes_no_not_given: 'Yes / No / Not Given',
    summary_completion: 'Summary completion',
    essay: 'Essay',
  };
  const typeLabel = (t: string) => TYPE_LABELS[t] ?? t;

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

  // Recalculate when the collapsible basic info opens/closes (layout shift)
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const top = gridRef.current?.getBoundingClientRect().top ?? 0;
      const h = Math.max(320, Math.floor(window.innerHeight - top));
      setPanelHeight(h);
    });
    return () => cancelAnimationFrame(id);
  }, [showBasicInfo]);

  // form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'reading' | 'listening' | 'general'>('reading');
  const [timeLimit, setTimeLimit] = useState<number>(60);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [isActive, setIsActive] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      if (!testId) return;
      try {
        setLoading(true);
        const data: PlacementTest = await PlacementTestAPI.getTestById(testId);
        setTitle(data.title);
        setDescription(data.description || '');
        setCategory(data.category);
  setTimeLimit(data.timeLimit || 60);
  setInstructions(data.instructions && data.instructions.length ? data.instructions : ['']);
  setIsActive(typeof (data as any).isActive === 'boolean' ? !!(data as any).isActive : true);
        setTest(data);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || 'Không thể tải bài test');
      } finally {
        setLoading(false);
        // Mark initial load complete so autosave won't trigger from initial setState
        hasLoadedRef.current = true;
      }
    };
    load();
  }, [testId]);

  const addInstruction = () => setInstructions((prev) => [...prev, '']);
  const removeInstruction = (idx: number) => setInstructions((prev) => prev.filter((_, i) => i !== idx));
  const updateInstruction = (idx: number, value: string) => setInstructions((prev) => prev.map((v, i) => i === idx ? value : v));

  const currentSection = useMemo(() => {
    return test?.sections && test.sections.length > 0
      ? test.sections[currentSectionIndex]
      : undefined;
  }, [test, currentSectionIndex]);

  // Build pairs {q, idx} for the current section to support updates by absolute index
  const sectionQuestionPairs = useMemo(() => {
    if (!test || !test.questions) return [] as { q: any; idx: number }[];
    const hasId = !!currentSection?._id;
    const currId = hasId ? ((currentSection as any)?._id?.toString ? (currentSection as any)._id.toString() : String((currentSection as any)._id)) : '';
    return test.questions
      .map((q, idx) => ({ q, idx }))
      .filter(({ q }) => {
        const qsid = (q as any)?.sectionId && (q as any).sectionId.toString ? (q as any).sectionId.toString() : String((q as any).sectionId || '');
        if (hasId) return qsid === currId;
        // fallback matching by sectionIndex when section has no _id yet
        const qIndex = (q as any)?.sectionIndex;
        return typeof qIndex === 'number' && qIndex === currentSectionIndex;
      })
      .sort((a, b) => ((a.q.questionNumber || 0) - (b.q.questionNumber || 0)));
  }, [test, currentSection, currentSectionIndex]);

  const nextSection = () => {
    if (!test?.sections) return;
    setCurrentSectionIndex((idx) => Math.min(test.sections!.length - 1, idx + 1));
    setOpenQuestionIdx(null);
  };

  const prevSection = () => {
    setCurrentSectionIndex((idx) => Math.max(0, idx - 1));
    setOpenQuestionIdx(null);
  };

  // Cancel inline editing when switching sections
  useEffect(() => {
    setIsEditingSectionTitle(false);
  }, [currentSectionIndex]);

  // ---- Editing helpers ----
  const updateSectionField = (field: 'title' | 'passage' | 'audio' | 'image' | 'timeLimit', value: any) => {
    setTest((prev) => {
      if (!prev || !prev.sections) return prev;
      const next = { ...prev, sections: [...prev.sections] } as PlacementTest;
      next.sections![currentSectionIndex] = { ...(next.sections![currentSectionIndex] || {}), [field]: value } as any;
      return next;
    });
  };

  const updateQuestion = (qIdx: number, updater: (q: any) => any) => {
    setTest((prev) => {
      if (!prev) return prev;
      const next = { ...prev, questions: [...(prev.questions || [])] } as PlacementTest;
      const oldQ = next.questions[qIdx] || {} as any;
      const newQ = updater({ ...oldQ });
      newQ.sectionId = oldQ.sectionId; // keep link
      if (Array.isArray(newQ.options)) {
        newQ.correctAnswers = newQ.options.filter((op: any) => op.isCorrect).map((op: any) => String(op.text || ''));
      }
      next.questions[qIdx] = newQ;
      return next;
    });
  };

  const addOption = (qIdx: number) => {
    updateQuestion(qIdx, (q) => ({ ...q, options: [...(q.options || []), { text: '', isCorrect: false }] }));
  };

  const updateOption = (qIdx: number, optIdx: number, patch: Partial<{ text: string; isCorrect: boolean }>) => {
    setTest((prev) => {
      if (!prev) return prev;
      const next = { ...prev, questions: [...(prev.questions || [])] } as PlacementTest;
      const q: any = { ...(next.questions[qIdx] || {}) };
      const opts = [...(q.options || [])];
      const singleAnswerTypes = new Set(['single_choice', 'true_false_not_given', 'yes_no_not_given']);
      if (patch.isCorrect && singleAnswerTypes.has(q.type)) {
        for (let i = 0; i < opts.length; i++) {
          if (i !== optIdx) opts[i] = { ...(opts[i] || {}), isCorrect: false };
        }
      }
      opts[optIdx] = { ...(opts[optIdx] || { text: '', isCorrect: false }), ...patch };
      q.options = opts;
      q.correctAnswers = opts.filter((op: any) => op.isCorrect).map((op: any) => String(op.text || ''));
      next.questions[qIdx] = q;
      return next;
    });
  };

  const removeOption = (qIdx: number, optIdx: number) => {
    updateQuestion(qIdx, (q) => {
      const opts = [...(q.options || [])];
      opts.splice(optIdx, 1);
      return { ...q, options: opts };
    });
  };

  const addCorrectAnswer = (qIdx: number) => {
    updateQuestion(qIdx, (q) => ({ ...q, correctAnswers: [...(q.correctAnswers || []), ''] }));
  };

  const updateCorrectAnswer = (qIdx: number, ansIdx: number, value: string) => {
    updateQuestion(qIdx, (q) => {
      const arr = [...(q.correctAnswers || [])];
      arr[ansIdx] = value;
      return { ...q, correctAnswers: arr };
    });
  };

  const removeCorrectAnswer = (qIdx: number, ansIdx: number) => {
    updateQuestion(qIdx, (q) => {
      const arr = [...(q.correctAnswers || [])];
      arr.splice(ansIdx, 1);
      return { ...q, correctAnswers: arr };
    });
  };

  // --- Auto-save: Basic Info ---
  useEffect(() => {
    if (!testId) return;
    const infoPayload = {
      title: title.trim(),
      description: description.trim(),
      category,
      timeLimit,
      instructions: instructions.map((i) => i.trim()).filter((i) => i),
      isActive,
    };
    const sig = JSON.stringify(infoPayload);
    if (!hasLoadedRef.current) {
      lastInfoSigRef.current = sig;
      return;
    }
    if (lastInfoSigRef.current === sig) return;
    if (infoDebounceRef.current) window.clearTimeout(infoDebounceRef.current);
    infoDebounceRef.current = window.setTimeout(async () => {
      try {
        setInfoSaving(true);
        await PlacementTestAPI.updateTestInfo(testId, infoPayload);
        lastInfoSigRef.current = sig;
        setInfoSavedAt(Date.now());
      } catch (err: any) {
        // Silent fail for auto-save info
        console.warn('Auto-save info failed (silent):', err);
      } finally {
        setInfoSaving(false);
      }
    }, 800);
    return () => {
      if (infoDebounceRef.current) window.clearTimeout(infoDebounceRef.current);
    };
  }, [testId, title, description, category, timeLimit, instructions, isActive]);

  // --- Auto-save: Content (sections & questions) ---
  useEffect(() => {
    if (!testId) return;
    // Build a minimal signature to detect changes without saving excessively
    const sectionsSig = (test?.sections || []).map((s: any) => ({
      _id: s?._id?.toString ? s._id.toString() : s?._id || null,
      title: s?.title || '',
      passage: s?.passage || '',
      audio: s?.audio || '',
      image: s?.image || '',
      timeLimit: s?.timeLimit || 0,
    }));
    const questionsSig = (test?.questions || []).map((q: any) => ({
      _id: q?._id?.toString ? q._id.toString() : q?._id || null,
      sectionId: q?.sectionId?.toString ? q.sectionId.toString() : q?.sectionId || null,
      sectionIndex: typeof q?.sectionIndex === 'number' ? q.sectionIndex : null,
      type: q?.type || '',
      content: q?.content || '',
      options: Array.isArray(q?.options) ? q.options.map((op: any) => ({ text: op?.text || '', isCorrect: !!op?.isCorrect })) : [],
      correctAnswers: Array.isArray(q?.correctAnswers) ? q.correctAnswers.map((x: any) => String(x || '')) : [],
      explanation: q?.explanation || '',
      points: typeof q?.points === 'number' ? q.points : 1,
      questionNumber: typeof q?.questionNumber === 'number' ? q.questionNumber : null,
    }));
    const sig = JSON.stringify({ sectionsSig, questionsSig });
    if (!hasLoadedRef.current) {
      lastContentSigRef.current = sig;
      return;
    }
    if (lastContentSigRef.current === sig) return;
    if (contentDebounceRef.current) window.clearTimeout(contentDebounceRef.current);
    contentDebounceRef.current = window.setTimeout(async () => {
      try {
        setContentSaving(true);
        await PlacementTestAPI.updateTestContent(testId, { sections: test?.sections || [], questions: test?.questions || [] });
        lastContentSigRef.current = sig;
        setContentSavedAt(Date.now());
      } catch (err: any) {
        // Silent fail for auto-save content
        console.warn('Auto-save content failed (silent):', err);
      } finally {
        setContentSaving(false);
      }
    }, 1200);
    return () => {
      if (contentDebounceRef.current) window.clearTimeout(contentDebounceRef.current);
    };
  }, [testId, test?.sections, test?.questions]);

  // Option-based types and defaults
  const optionTypeSet = new Set(['single_choice', 'multiple_choice', 'true_false_not_given', 'yes_no_not_given', 'summary_completion']);
  const defaultOptionsByType = (type: string): { text: string; isCorrect: boolean }[] => {
    if (type === 'true_false_not_given') return [{ text: 'True', isCorrect: false }, { text: 'False', isCorrect: false }, { text: 'Not Given', isCorrect: false }];
    if (type === 'yes_no_not_given') return [{ text: 'Yes', isCorrect: false }, { text: 'No', isCorrect: false }, { text: 'Not Given', isCorrect: false }];
    return [{ text: 'A', isCorrect: false }, { text: 'B', isCorrect: false }, { text: 'C', isCorrect: false }, { text: 'D', isCorrect: false }];
  };

  const onTypeChange = (qIdx: number, newType: string) => {
    updateQuestion(qIdx, (q) => {
      const next: any = { ...q, type: newType };
      if (optionTypeSet.has(newType)) {
        if (!Array.isArray(next.options) || next.options.length === 0) next.options = defaultOptionsByType(newType);
        next.correctAnswers = (next.options || []).filter((op: any) => op.isCorrect).map((op: any) => String(op.text || ''));
      } else {
        next.options = [];
        if (!Array.isArray(next.correctAnswers) || next.correctAnswers.length === 0) next.correctAnswers = [''];
      }
      return next;
    });
  };

  const resequenceQuestionNumbers = (sectionObjectId?: any, sectionIdx?: number) => {
    setTest((prev) => {
      if (!prev) return prev;
      const next = { ...prev, questions: [...(prev.questions || [])] } as PlacementTest;
      const sid = sectionObjectId?.toString ? sectionObjectId.toString() : String(sectionObjectId || '');
      const pairs = next.questions.map((q: any, idx) => ({ q, idx }))
        .filter(({ q }) => {
          const qsid = q?.sectionId?.toString ? q.sectionId.toString() : String(q.sectionId || '');
          if (sid) return qsid === sid;
          return typeof q.sectionIndex === 'number' && q.sectionIndex === sectionIdx;
        })
        .sort((a, b) => ((a.q.questionNumber || 0) - (b.q.questionNumber || 0)));
      pairs.forEach(({ idx }, i) => { (next.questions[idx] as any).questionNumber = i + 1; });
      return next;
    });
  };

  // ---- Section add/delete ----
  const addSection = () => {
    setTest((prev) => {
      if (!prev) return prev;
      const sections = [...(prev.sections || [])];
      const newSection = {
        title: `PASSAGE ${sections.length + 1}`,
        passage: '',
        audio: '',
        image: '',
        timeLimit: 0,
      } as any;
      const next = { ...prev, sections } as PlacementTest;
      next.sections!.push(newSection);
      return next;
    });
    setOpenQuestionIdx(null);
    // Move focus to the newly added section
    setCurrentSectionIndex((idx) => {
      const count = (test?.sections?.length || 0) + 1; // optimistic count after push
      return Math.max(0, count - 1);
    });
  };

  const deleteCurrentSection = async () => {
    if (!test || !test.sections || !test.sections.length) return;
    const result = await Swal.fire({
      title: 'Xóa phần này?',
      text: 'Hành động này sẽ xóa cả các câu hỏi thuộc phần. Bạn có chắc muốn xóa? ',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Có, xóa',
      cancelButtonText: 'Hủy',
      reverseButtons: false,
      focusCancel: true,
    });
    if (!result.isConfirmed) return;

    const sectionToDelete = test.sections[currentSectionIndex] as any;
    const sectionIdStr = sectionToDelete?._id?.toString ? sectionToDelete._id.toString() : String(sectionToDelete?._id || '');

    setTest((prev) => {
      if (!prev) return prev;
      const next = { ...prev } as PlacementTest;
      // Remove section
      next.sections = (next.sections || []).filter((_, i) => i !== currentSectionIndex);
      // Remove questions under this section
      next.questions = (next.questions || []).filter((q: any) => {
        const sid = q?.sectionId?.toString ? q.sectionId.toString() : String(q?.sectionId || '');
        return !sectionIdStr || sid !== sectionIdStr;
      });
      return next;
    });

    // Adjust current index
    setCurrentSectionIndex((idx) => {
      const newLen = (test?.sections?.length || 1) - 1;
      if (newLen <= 0) return 0;
      return Math.min(idx, newLen - 1);
    });
    setOpenQuestionIdx(null);
    toast.success('Đã xóa phần. Nhấn "Lưu nội dung" để cập nhật lên server.');
  };

  const addQuestionToCurrentSection = () => {
    if (!test) return;
    const hasId = !!currentSection?._id;
    const sectionId = hasId ? (currentSection as any)._id : undefined;
    const skill = test.category === 'listening' || test.category === 'reading' ? test.category : 'reading';
    setTest((prev) => {
      if (!prev) return prev;
      const next = { ...prev, questions: [...(prev.questions || [])] } as PlacementTest;
      const count = next.questions.filter((q: any) => {
        if (hasId) {
          const sid = q?.sectionId?.toString ? q.sectionId.toString() : String(q.sectionId || '');
          const csid = sectionId?.toString ? sectionId.toString() : String(sectionId || '');
          return sid === csid;
        }
        return typeof q.sectionIndex === 'number' && q.sectionIndex === currentSectionIndex;
      }).length;
      const base: any = { type: 'single_choice', content: '', skill, questionNumber: count + 1, options: defaultOptionsByType('single_choice'), correctAnswers: [], points: 1, explanation: '' };
      const newQ: any = hasId ? { ...base, sectionId } : { ...base, sectionIndex: currentSectionIndex };
      next.questions.push(newQ);
      return next;
    });
  };

  const deleteQuestion = (qIdx: number) => {
    if (!test) return;
    const sid = (test.questions[qIdx] as any)?.sectionId;
    const sIndex = (test.questions[qIdx] as any)?.sectionIndex;
    setTest((prev) => {
      if (!prev) return prev;
      const next = { ...prev, questions: [...(prev.questions || [])] } as PlacementTest;
      next.questions.splice(qIdx, 1);
      return next;
    });
    resequenceQuestionNumbers(sid, sIndex);
  };

  const saveContent = async () => {
    if (!testId || !test) return;
    // Validate: no empty question content
    const empties: number[] = [];
    (test.questions || []).forEach((q: any, idx: number) => {
      const contentText = (q.content || '').trim();
      if (!contentText) empties.push(idx);
    });
    if (empties.length) {
      setInvalidQuestionIdxs(new Set(empties));
      toast.error(`Có ${empties.length} câu hỏi trống. Vui lòng nhập nội dung trước khi lưu.`);
      // Auto-expand the first empty question for convenience
      setOpenQuestionIdx(empties[0]);
      return;
    } else if (invalidQuestionIdxs.size) {
      setInvalidQuestionIdxs(new Set());
    }
    try {
      setSaving(true);
      const payload = { sections: test.sections || [], questions: test.questions || [] } as any;
      await PlacementTestAPI.updateTestContent(testId, payload);
      toast.success('Đã lưu nội dung bài test');
      // Update signature to prevent immediate autosave
      const sectionsSig = (payload.sections || []).map((s: any) => ({
        _id: s?._id?.toString ? s._id.toString() : s?._id || null,
        title: s?.title || '',
        passage: s?.passage || '',
        audio: s?.audio || '',
        image: s?.image || '',
        timeLimit: s?.timeLimit || 0,
      }));
      const questionsSig = (payload.questions || []).map((q: any) => ({
        _id: q?._id?.toString ? q._id.toString() : q?._id || null,
        sectionId: q?.sectionId?.toString ? q.sectionId.toString() : q?.sectionId || null,
        sectionIndex: typeof q?.sectionIndex === 'number' ? q.sectionIndex : null,
        type: q?.type || '',
        content: q?.content || '',
        options: Array.isArray(q?.options) ? q.options.map((op: any) => ({ text: op?.text || '', isCorrect: !!op?.isCorrect })) : [],
        correctAnswers: Array.isArray(q?.correctAnswers) ? q.correctAnswers.map((x: any) => String(x || '')) : [],
        explanation: q?.explanation || '',
        points: typeof q?.points === 'number' ? q.points : 1,
        questionNumber: typeof q?.questionNumber === 'number' ? q.questionNumber : null,
      }));
      lastContentSigRef.current = JSON.stringify({ sectionsSig, questionsSig });
      setContentSavedAt(Date.now());
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Không thể lưu nội dung');
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testId) return;
    if (!title.trim() || !description.trim()) { toast.error('Vui lòng nhập tiêu đề và mô tả'); return; }
    try {
      setSaving(true);
      const payload = { title: title.trim(), description: description.trim(), category, timeLimit, instructions: instructions.filter((i) => i.trim()), isActive };
      await PlacementTestAPI.updateTestInfo(testId, payload);
      toast.success('Đã lưu thông tin');
      // Update signature to prevent immediate autosave
      lastInfoSigRef.current = JSON.stringify(payload);
      setInfoSavedAt(Date.now());
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Không thể lưu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Đang tải...</div>;

  return (
    <div className="space-y-6" style={{ marginBottom: '-1.5rem' }}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Chỉnh sửa bài test</h1>
        <div className="flex items-center gap-3">
          {(infoSaving || contentSaving) ? (
            <span className="inline-flex items-center text-slate-500 text-sm" title="Đang tự động lưu">
              <svg className="animate-spin -ml-0.5 mr-1 h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            </span>
          ) : ((infoSavedAt || contentSavedAt) ? (
            <span className="inline-flex items-center text-green-600" title="Đã lưu gần đây">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3.5-3.5a1 1 0 111.414-1.414l2.793 2.793 6.543-6.543a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
          ) : null)}
          <Link to={`/admin/placement-tests/${testId}/view`} className="px-4 py-2 rounded-lg border">Xem</Link>
          <Link to="/admin/placement-tests" className="px-4 py-2 rounded-lg bg-slate-800 text-white">Danh sách</Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50"
          onClick={() => setShowBasicInfo((v) => !v)}
          aria-expanded={showBasicInfo}
        >
          <div className="flex items-center gap-3">
            {/* Hamburger icon */}
            <span className="inline-block w-5">
              <span className="block h-[2px] bg-slate-700 mb-1"></span>
              <span className="block h-[2px] bg-slate-700 mb-1"></span>
              <span className="block h-[2px] bg-slate-700"></span>
            </span>
            <span className="font-medium text-slate-800">Thông tin bài test</span>
          </div>
          <span className="text-slate-500 text-sm">{showBasicInfo ? 'Ẩn' : 'Hiện'}</span>
        </button>
        {showBasicInfo && (
          <form onSubmit={onSubmit} className="p-4 space-y-4 border-t">
            <div>
              <label className="block text-sm mb-1">Tiêu đề</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm mb-1">Mô tả</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-1">Loại bài test</label>
                <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="w-full px-3 py-2 border rounded-lg">
                  <option value="reading">Reading</option>
                  <option value="listening">Listening</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Thời gian (phút)</label>
                <input type="number" min={1} value={timeLimit} onChange={(e) => setTimeLimit(parseInt(e.target.value || '0', 10))} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm mb-1">Trạng thái</label>
                <div className="w-full h-[42px] px-3 border rounded-lg flex items-center gap-2">
                  <button type="button" onClick={() => setIsActive((v) => !v)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-green-500' : 'bg-slate-300'}`}>
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${isActive ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                  <span className={`text-sm ${isActive ? 'text-green-700' : 'text-slate-600'}`}>{isActive ? 'Hoạt động' : 'Tạm ẩn'}</span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm mb-2">Hướng dẫn</label>
              <div className="space-y-2">
                {instructions.map((inst, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input value={inst} onChange={(e) => updateInstruction(idx, e.target.value)} className="flex-1 px-3 py-2 border rounded-lg" />
                    <button type="button" onClick={() => removeInstruction(idx)} className="px-3 py-2 rounded-lg border">Xóa</button>
                  </div>
                ))}
                <button type="button" onClick={addInstruction} className="px-4 py-2 rounded-lg border">+ Thêm hướng dẫn</button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50">Lưu ngay</button>
              {infoSaving ? (
                <span className="text-sm text-slate-500">Đang lưu…</span>
              ) : (infoSavedAt ? <span className="text-sm text-green-600">Đã lưu</span> : null)}
              <Link to={`/admin/placement-tests/${testId}/view`} className="px-4 py-2 rounded-lg border">Hủy</Link>
            </div>
          </form>
        )}
      </div>

      {/* Split View: fixed height with editing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0" ref={gridRef}>
        {/* Left: Section content */}
        <div className="bg-white lg:rounded-l-xl rounded-t-xl lg:rounded-tr-none border overflow-hidden lg:border-r-0 flex flex-col" style={{ height: panelHeight }}>
          <div className="h-12 px-4 border-b flex items-center justify-between ">
            <div className="min-w-0 flex-1">
              {isEditingSectionTitle ? (
                <input
                  autoFocus
                  value={tempSectionTitle}
                  onChange={(e) => setTempSectionTitle(e.target.value)}
                  onBlur={() => { setIsEditingSectionTitle(false); updateSectionField('title', tempSectionTitle.trim()); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { (e.target as HTMLInputElement).blur(); }
                    if (e.key === 'Escape') { setIsEditingSectionTitle(false); }
                  }}
                  placeholder="Nhập tiêu đề phần..."
                  className="w-full bg-transparent border-b border-slate-300 focus:border-blue-500 outline-none text-base font-semibold text-slate-800"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => { setTempSectionTitle(currentSection?.title || ''); setIsEditingSectionTitle(true); }}
                  title="Nhấn để chỉnh sửa tiêu đề phần"
                  className="text-left w-full truncate"
                >
                  <span className="text-base font-semibold text-slate-800">{currentSection?.title || '—'}</span>
                </button>
              )}
            </div>
            {test?.sections && (
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-sm text-slate-500">{currentSectionIndex + 1} / {test.sections.length}</span>
                <span className="mx-1 text-slate-300">|</span>
                <button type="button" onClick={addSection} className="px-2 py-1 rounded-lg border hover:bg-slate-50">+ Thêm phần</button>
                <button type="button" onClick={deleteCurrentSection} className="px-2 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">Xóa phần</button>
              </div>
            )}
          </div>
          <div className="p-3 space-y-4 flex-1 overflow-auto">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Đoạn văn (passage)</label>
              <textarea value={currentSection?.passage || ''} onChange={(e) => updateSectionField('passage', e.target.value)} rows={14} className="w-full px-3 py-2 border rounded-lg whitespace-pre-wrap" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Audio URL</label>
                <input value={currentSection?.audio || ''} onChange={(e) => updateSectionField('audio', e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                {currentSection?.audio ? (<audio controls className="w-full mt-2"><source src={currentSection.audio} /></audio>) : null}
              </div>
              <div>
                <label className="block text-sm font-medium">Image URL</label>
                <input value={currentSection?.image || ''} onChange={(e) => updateSectionField('image', e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                {currentSection?.image ? (<img src={currentSection.image} alt="Section" className="max-w-full rounded-lg mt-2" />) : null}
              </div>
            </div>
          </div>
          <div className="h-12 border-t bg-slate-50 flex items-center p-3">
            <button
              onClick={prevSection}
              disabled={currentSectionIndex === 0}
              className="px-3 py-2 rounded-lg border disabled:opacity-50"
            >
              ◀ Trước
            </button>
          </div>
        </div>

        {/* Right: Questions of current section */}
  <div className="bg-white lg:rounded-r-xl rounded-b-xl lg:rounded-bl-none border overflow-hidden lg:border-l-0 flex flex-col" style={{ height: panelHeight }}>
          <div className="h-12 px-4 border-b flex items-center justify-between gap-2">
            <h2 className="font-semibold">Câu hỏi trong phần này</h2>
            <div className="flex items-center gap-3">
              <button onClick={addQuestionToCurrentSection} className="px-2 py-1 rounded-lg border">+ Thêm câu hỏi</button>
              <button onClick={saveContent} disabled={saving} className="px-2 py-1 rounded-lg bg-blue-600 text-white disabled:opacity-50">Lưu nội dung</button>
            </div>
          </div>
          <div className="p-4 flex-1 overflow-auto space-y-4">
            {sectionQuestionPairs.length === 0 ? (
              <div className="text-slate-500 text-sm">Chưa có câu hỏi cho phần này.</div>
            ) : (
              sectionQuestionPairs.map(({ q, idx }, i) => {
                const hasOptions = Array.isArray(q.options) && q.options.length > 0;
                const answersFromOptions = hasOptions ? (q.options || []).filter((op: any) => op.isCorrect).map((op: any) => op.text) : [];
                const finalAnswers = hasOptions ? answersFromOptions : (q.correctAnswers || []);
                return (
                  <div key={q._id || i} className={`border rounded-lg transition-colors ${openQuestionIdx === idx ? 'border-blue-500 ring-1 ring-blue-400/30 bg-blue-50' : ''} ${invalidQuestionIdxs.has(idx) ? 'border-red-400 bg-red-50/40' : ''}`}>
                    {/* Header row */}
                    <button type="button" onClick={() => setOpenQuestionIdx(openQuestionIdx === idx ? null : idx)} className={`${openQuestionIdx === idx ? 'bg-blue-50' : ''} w-full text-left p-3 flex items-start justify-between gap-3 rounded-t-lg`}>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-slate-500">Câu {q.questionNumber ?? i + 1}</div>
                        <div className={`font-medium whitespace-pre-wrap break-words ${invalidQuestionIdxs.has(idx) ? 'text-red-600' : 'text-slate-800'}`}>{q.content || '—'}</div>
                        <div className="mt-1 text-xs text-slate-600"><span className="font-medium">Đáp án:</span> {finalAnswers.length ? finalAnswers.join(', ') : '—'}</div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded h-min whitespace-nowrap flex-shrink-0 leading-none ${openQuestionIdx === idx ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{typeLabel(q.type)}</div>
                    </button>
                    {openQuestionIdx === idx && (
                      <div className="border-t p-3 space-y-3">
                        <div className="flex justify-end"><button type="button" onClick={() => deleteQuestion(idx)} className="px-2 py-1 text-red-600 border border-red-200 rounded">Xóa câu</button></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium">Loại câu hỏi</label>
                            <select value={q.type} onChange={(e) => onTypeChange(idx, e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                              <option value="single_choice">Single choice</option>
                              <option value="multiple_choice">Multiple choice</option>
                              <option value="fill_blank">Fill in the blank</option>
                              <option value="true_false_not_given">True / False / Not Given</option>
                              <option value="yes_no_not_given">Yes / No / Not Given</option>
                              <option value="summary_completion">Summary completion</option>
                              <option value="essay">Essay</option>
                            </select>
                          </div>
                          <div className="w-full md:w-40">
                            <label className="block text-sm font-medium">Điểm</label>
                            <input type="number" min={0} value={q.points ?? 1} onChange={(e) => updateQuestion(idx, (qq) => ({ ...qq, points: Number(e.target.value || 0) }))} className="w-full px-3 py-2 border rounded-lg" />
                          </div>
                        </div>
                        <label className="block text-sm font-medium">Nội dung</label>
                        <textarea value={q.content || ''} onChange={(e) => updateQuestion(idx, (qq) => ({ ...qq, content: e.target.value }))} rows={3} className="w-full px-3 py-2 border rounded-lg" />
                        {hasOptions ? (
                          <div className="space-y-2">
                            <div className="text-sm font-medium">Phương án</div>
                            {(q.options || []).map((op: any, opIdx: number) => (
                              <div key={opIdx} className="flex items-center gap-2">
                                <input type="checkbox" checked={!!op.isCorrect} onChange={(e) => updateOption(idx, opIdx, { isCorrect: e.target.checked })} />
                                <input value={op.text || ''} onChange={(e) => updateOption(idx, opIdx, { text: e.target.value })} className="flex-1 px-3 py-2 border rounded-lg" />
                                <button type="button" onClick={() => removeOption(idx, opIdx)} className="px-2 py-2 border rounded">Xóa</button>
                              </div>
                            ))}
                            <button type="button" onClick={() => addOption(idx)} className="px-3 py-2 border rounded">+ Thêm phương án</button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-sm font-medium">Đáp án đúng (Fill blank)</div>
                            {(q.correctAnswers || []).map((ans: string, ansIdx: number) => (
                              <div key={ansIdx} className="flex items-center gap-2">
                                <input value={ans} onChange={(e) => updateCorrectAnswer(idx, ansIdx, e.target.value)} className="flex-1 px-3 py-2 border rounded-lg" />
                                <button type="button" onClick={() => removeCorrectAnswer(idx, ansIdx)} className="px-2 py-2 border rounded">Xóa</button>
                              </div>
                            ))}
                            <button type="button" onClick={() => addCorrectAnswer(idx)} className="px-3 py-2 border rounded">+ Thêm đáp án</button>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium mb-1">Giải thích</label>
                          <textarea value={q.explanation || ''} onChange={(e) => updateQuestion(idx, (qq) => ({ ...qq, explanation: e.target.value }))} rows={2} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
          {/* Spacer footer to match left footer height for perfect alignment */}
          <div className="h-12 border-t bg-slate-50 flex items-center justify-end p-3">
            <button
              onClick={nextSection}
              disabled={!!test?.sections && currentSectionIndex >= (test.sections?.length || 0) - 1}
              className="px-3 py-2 rounded-lg border disabled:opacity-50"
            >
              Sau ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTestPage;

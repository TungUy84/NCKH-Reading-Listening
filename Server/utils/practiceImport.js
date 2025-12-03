const crypto = require('crypto');
const {
  parseDocxFile: parsePlacementDocx,
  parseExcelBuffer: parsePlacementExcel,
  parseTextContent: parsePlacementText
} = require('./placementTestImport');

const SKILL_VALUES = ['reading', 'listening'];
const LEVEL_GROUP_VALUES = ['AV1-AV3', 'AV4-AV5', 'AV6', 'AV7'];

// Tạo ID ngẫu nhiên cho media block
const generateMediaId = () => {
  if (crypto && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
};

// Chuẩn hóa kỹ năng
const normalizeSkill = (raw) => {
  const value = String(raw || '').trim().toLowerCase();
  return SKILL_VALUES.includes(value) ? value : 'reading';
};

// Chuẩn hóa nhóm trình độ
const normalizeLevelGroup = (raw) => {
  const value = String(raw || '').trim().toUpperCase();
  return LEVEL_GROUP_VALUES.includes(value) ? value : 'AV1-AV3';
};

// Chuẩn hóa media blocks
const normalizeMediaBlocks = (blocks) => {
  if (!Array.isArray(blocks)) return [];
  return blocks
    .filter(Boolean)
    .map((block) => ({
      id: block?.id || block?._id || generateMediaId(),
      type: block?.type === 'audio' ? 'audio' : 'image',
      url: block?.url || block?.path || '',
      originalName: block?.originalName || block?.name || '',
      transcript: typeof block?.transcript === 'string' ? block.transcript : ''
    }))
    .filter((block) => block.id && block.url);
};

// Chuẩn hóa sections
const normalizeSections = (sections = []) => {
  return (Array.isArray(sections) ? sections : []).map((section, index) => ({
    title: section?.title || `Section ${index + 1}`,
    passage: section?.passage || '',
    audio: section?.audio || '',
    image: section?.image || '',
    mediaBlocks: normalizeMediaBlocks(section?.mediaBlocks)
  }));
};

// Chuẩn hóa options cho câu hỏi
const normalizeOptions = (options = []) => {
  if (!Array.isArray(options)) return [];
  return options
    .filter(Boolean)
    .map((option) => ({
      text: String(option?.text || '').trim(),
      isCorrect: Boolean(option?.isCorrect)
    }));
};

// Chuẩn hóa cặp ghép cho câu hỏi matching
const normalizePairs = (pairs = []) => {
  if (!Array.isArray(pairs)) return [];
  return pairs
    .filter(Boolean)
    .map((pair) => ({
      prompt: String(pair?.prompt || '').trim(),
      correctOption: String(pair?.correctOption || '').trim()
    }))
    .filter((pair) => pair.prompt && pair.correctOption);
};

// Chuẩn hóa câu hỏi
const normalizeQuestions = (questions = []) => {
  return (Array.isArray(questions) ? questions : []).map((question, index) => ({
    questionNumber: question?.questionNumber || index + 1,
    type: question?.type || 'multi_choice',
    allowMultiple: Boolean(question?.allowMultiple),
    content: String(question?.content || question?.text || '').trim(),
    passage: String(question?.passage || '').trim() || undefined,
    options: normalizeOptions(question?.options),
    matchingPairs: normalizePairs(question?.matchingPairs),
    correctAnswers: Array.isArray(question?.correctAnswers)
      ? question.correctAnswers.map((answer) => String(answer || '').trim()).filter(Boolean)
      : [],
    explanation: String(question?.explanation || '').trim(),
    sectionIndex:
      typeof question?.sectionIndex === 'number' && question.sectionIndex >= 0
        ? question.sectionIndex
        : 0
  }));
};

// Chuyển đổi preview bài test sang định dạng bài ôn luyện
const transformTestPreviewToPractice = (preview = {}) => {
  const sections = normalizeSections(preview.sections);
  const questions = normalizeQuestions(preview.questions);

  return {
    title: String(preview.title || '').trim(),
    description: String(preview.description || '').trim(),
    skill: normalizeSkill(preview.category),
    levelGroup: normalizeLevelGroup(preview.levelGroup || ''),
    estimatedTime: Number.isFinite(preview.timeLimit) ? Number(preview.timeLimit) : 45,
    sections,
    questions,
    totalQuestions: questions.length,
    source: preview.source || undefined
  };
};

// Phân tích file DOCX và chuyển sang định dạng bài ôn luyện
const parsePracticeDocxFile = async (filePath) => {
  const preview = await parsePlacementDocx(filePath);
  return transformTestPreviewToPractice(preview);
};

const parsePracticeExcelBuffer = (buffer) => {
  const preview = parsePlacementExcel(buffer);
  return transformTestPreviewToPractice(preview);
};

const parsePracticeTextContent = async (content) => {
  const preview = await parsePlacementText(content);
  return transformTestPreviewToPractice(preview);
};

module.exports = {
  parsePracticeDocxFile,
  parsePracticeExcelBuffer,
  parsePracticeTextContent,
  transformTestPreviewToPractice
};

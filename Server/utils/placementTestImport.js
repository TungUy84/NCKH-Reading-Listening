const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const xlsx = require('xlsx');

const CATEGORY_VALUES = ['listening', 'reading'];
const TRUE_VALUES = ['true', 'yes', '1', 'y'];

const normalizeQuestionTypeValue = (value) => {
  const raw = String(value || '').trim().toLowerCase();
  switch (raw) {
    case 'multiple_choice':
    case 'multiple choice':
      return 'multi_choice';
    case 'true_false_not_given':
    case 'true-false-not-given':
    case 'true/false/not given':
    case 'true/false/notgiven':
      return 'true_false_not_given';
    case 'fill_blank':
    case 'fill in the blank':
    case 'fill-in-the-blank':
    case 'gap_fill':
    case 'gap-fill':
      return 'fill_blank';
    default:
      return raw;
  }
};

const stripBullet = (line) => line.replace(/^[-*\d\.\)\s]+/, '').trim();

const normaliseLine = (line) => {
  if (!line) return '';
  return line
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u00A0\u200B]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  return TRUE_VALUES.includes(String(value).trim().toLowerCase());
};

const coerceNumber = (value, defaultValue = 0) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  const num = Number(String(value).trim());
  return Number.isFinite(num) ? num : defaultValue;
};

const ensureCategory = (value) => {
  const lower = String(value || '').trim().toLowerCase();
  if (!CATEGORY_VALUES.includes(lower)) {
    throw new Error('Loại bài test phải là listening hoặc reading');
  }
  return lower;
};


const parseOptionsFromString = (raw) => {
  if (!raw) return [];
  return String(raw)
    .split(/\|/)
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => {
      const isMarked = /(^\*|\*$|\[x\]|\(x\))/i.test(segment);
      const cleaned = segment.replace(/(^\*|\*$|\[x\]|\(x\))/gi, '').trim();
      return { text: cleaned, isCorrect: isMarked };
    });
};

const parsePairsFromString = (raw) => {
  if (!raw) return [];
  return String(raw)
    .split(/\|/)
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => {
      const [prompt, answer] = segment.split(/=>|->|:/);
      if (!prompt || !answer) {
        throw new Error(`Định dạng ghép cặp không hợp lệ: ${segment}`);
      }
      return {
        prompt: prompt.trim(),
        correctOption: answer.trim()
      };
    });
};

const parseKeyValueQuestionBlock = (lines, fallbackNumber) => {
  const question = {
    questionNumber: fallbackNumber,
    type: 'multi_choice',
    content: '',
    points: 1,
    allowMultiple: false,
    options: [],
    correctAnswers: [],
    matchingPairs: [],
    explanation: '',
    passage: '',
    media: {},
    sectionIndex: undefined,
    sectionKey: '',
    sectionTitle: '',
    sectionPassage: '',
    sectionAudio: '',
    sectionImage: '',
  };

  let idx = 0;
  if (!lines.length) {
    throw new Error('Khối câu hỏi trống');
  }

  const firstLine = lines[0];
  const questionMatch = firstLine.match(/^Q(?:uestion)?\s*(\d+)(?:\s*[:.-]\s*(.*))?$/i);
  if (questionMatch) {
    question.questionNumber = Number(questionMatch[1]);
    if (questionMatch[2]) {
      question.content = questionMatch[2].trim();
    }
    idx = 1;
  }

  const localOptions = [];
  const localPairs = [];
  const localAnswers = [];

  for (; idx < lines.length; idx++) {
    const line = lines[idx];
    if (!line) continue;

    // Option shorthand A) text
    const optionLetterMatch = line.match(/^[A-Z]\)\s*(.+)$/);
    if (optionLetterMatch) {
      const rawText = optionLetterMatch[1].trim();
      const isCorrect = /\*$/.test(rawText);
      localOptions.push({
        text: rawText.replace(/\*$/, '').trim(),
        isCorrect
      });
      if (isCorrect) {
        localAnswers.push(rawText.replace(/\*$/, '').trim());
      }
      continue;
    }

    const keyValueMatch = line.match(/^([A-Za-z ]+):\s*(.*)$/);
    if (!keyValueMatch) {
      // If no explicit key and content not set, treat entire line as content continuation
      if (question.content) {
        question.content = `${question.content}\n${line}`.trim();
      } else {
        question.content = line;
      }
      continue;
    }

    const rawKey = keyValueMatch[1].trim().toLowerCase();
    const value = keyValueMatch[2].trim();

    switch (rawKey) {
      case 'type':
        question.type = normalizeQuestionTypeValue(value);
        break;
      case 'content':
        question.content = value;
        break;
      case 'points':
        question.points = coerceNumber(value, 1);
        break;
      case 'allowmultiple':
      case 'allow multiple':
        question.allowMultiple = parseBoolean(value, false);
        break;
      case 'section': {
        const [keyPart, titlePart] = value.split('|').map((segment) => segment.trim());
        question.sectionKey = (keyPart || '').toLowerCase();
        if (titlePart) {
          question.sectionTitle = titlePart;
        } else if (!question.sectionTitle && keyPart) {
          question.sectionTitle = keyPart;
        }
        break;
      }
      case 'sectionindex':
      case 'section index':
        question.sectionIndex = coerceNumber(value, 0);
        break;
      case 'sectiontitle':
      case 'section name':
        question.sectionTitle = value;
        if (!question.sectionKey) {
          question.sectionKey = value.toLowerCase();
        }
        break;
      case 'sectionpassage':
      case 'passagecontent':
      case 'passagedetail':
        question.sectionPassage = question.sectionPassage
          ? `${question.sectionPassage}
${value}`
          : value;
        break;
      case 'sectionaudio':
        question.sectionAudio = value;
        break;
      case 'sectionimage':
        question.sectionImage = value;
        break;
      case 'option':
      case 'options': {
        const options = parseOptionsFromString(value);
        if (options.length) {
          localOptions.push(...options);
          options.forEach((opt) => opt.isCorrect && localAnswers.push(opt.text));
        }
        break;
      }
      case 'answer':
      case 'answers':
      case 'correctanswers':
      case 'correct': {
        const answers = String(value)
          .split(/\||,|;|/)
          .map((ans) => ans.trim())
          .filter(Boolean);
        localAnswers.push(...answers);
        break;
      }
      case 'pair':
      case 'pairs':
      case 'matching':
      case 'match': {
        const pairs = parsePairsFromString(value);
        localPairs.push(...pairs);
        break;
      }
      case 'passage':
        question.passage = value;
        break;
      case 'explanation':
        question.explanation = value;
        break;
      case 'wordbank':
      case 'word bank':
        question.wordBank = String(value)
          .split(/\||,|;/)
          .map((entry) => entry.trim())
          .filter(Boolean);
        break;
      case 'mediaaudio':
      case 'audio':
        question.media = question.media || {};
        question.media.audioUrl = value;
        break;
      case 'mediaimage':
      case 'image':
        question.media = question.media || {};
        question.media.imageUrl = value;
        break;
      default:
        // treat unknown keys as additional content lines
        question.content = question.content ? `${question.content}\n${keyValueMatch[0]}` : keyValueMatch[0];
    }
  }

  if (!question.content) {
    throw new Error(`Thiếu nội dung câu hỏi cho câu số ${question.questionNumber}`);
  }

  if (localOptions.length) {
    question.options = localOptions;
  }

  if (localPairs.length) {
    question.matchingPairs = localPairs;
    question.type = 'matching';
  }

  if (localAnswers.length) {
    question.correctAnswers = Array.from(new Set(localAnswers.map((ans) => ans.trim()).filter(Boolean)));
  }

  if (question.type === 'multi_choice' || question.type === 'dropdown') {
    if (!question.options.length) {
      throw new Error(`Câu hỏi ${question.questionNumber} cần danh sách lựa chọn`);
    }
    if (!question.options.some((opt) => opt.isCorrect)) {
      if (question.correctAnswers.length) {
        question.options = question.options.map((opt) => ({
          ...opt,
          isCorrect: question.correctAnswers.includes(opt.text)
        }));
      } else if (question.type === 'multi_choice') {
        throw new Error(`Câu hỏi ${question.questionNumber} chưa đánh dấu đáp án đúng`);
      }
    }
    if (!question.allowMultiple) {
      question.allowMultiple = question.options.filter((opt) => opt.isCorrect).length > 1 ? true : false;
    }
  } else if (question.type === 'short_answer') {
    if (!question.correctAnswers.length) {
      throw new Error(`Câu hỏi ${question.questionNumber} cần ít nhất một đáp án đúng`);
    }
    question.allowMultiple = false;
  } else if (question.type === 'matching') {
    if (!question.matchingPairs.length) {
      throw new Error(`Câu hỏi ${question.questionNumber} yêu cầu danh sách ghép cặp`);
    }
    question.allowMultiple = false;
  } else if (question.type === 'dropdown') {
    question.allowMultiple = false;
  } else {
    // allow fallback types to behave like multi choice
    if (question.options.length) {
      question.type = 'multi_choice';
    }
  }

  const normalizedType = normalizeQuestionTypeValue(question.type);
  if (normalizedType === 'true_false_not_given') {
    const defaultOptions = ['TRUE', 'FALSE', 'NOT GIVEN'];
    if (!question.options.length) {
      question.options = defaultOptions.map((label) => ({ text: label, isCorrect: false }));
    } else {
      question.options = question.options.map((opt, idx) => ({
        text: opt.text ? String(opt.text).trim() : defaultOptions[idx] || `Option ${idx + 1}`,
        isCorrect: !!opt.isCorrect
      }));
    }
    if (question.correctAnswers.length) {
      const answers = new Set(question.correctAnswers.map((ans) => String(ans || '').trim().toUpperCase()));
      question.options = question.options.map((opt) => ({
        text: opt.text.toUpperCase(),
        isCorrect: answers.has(opt.text.toUpperCase())
      }));
      question.correctAnswers = question.options.filter((opt) => opt.isCorrect).map((opt) => opt.text);
    } else if (!question.options.some((opt) => opt.isCorrect)) {
      question.options = question.options.map((opt, idx) => ({ ...opt, isCorrect: idx === 0 }));
      question.correctAnswers = [question.options[0].text];
    }
    question.allowMultiple = false;
    question.type = 'multi_choice';
  } else if (normalizedType === 'fill_blank') {
    question.type = 'short_answer';
    question.allowMultiple = false;
  } else if (normalizedType === 'multi_choice') {
    question.type = 'multi_choice';
  }

  return question;
};

const parseLegacyFormat = (lines) => {
  if (lines.length < 6) {
    throw new Error('File không đúng định dạng. Vui lòng sử dụng mẫu import mới.');
  }

  let currentLine = 0;
  const title = lines[currentLine++];
  const description = lines[currentLine++];
  const category = ensureCategory(lines[currentLine++]);
  const timeLimit = coerceNumber(lines[currentLine++], 0);

  if (timeLimit <= 0) {
    throw new Error('Thời gian phải là số nguyên dương');
  }

  const instructions = [];
  while (currentLine < lines.length && lines[currentLine] !== '---') {
    instructions.push(stripBullet(lines[currentLine++]));
  }

  if (lines[currentLine] !== '---') {
    throw new Error('Không tìm thấy dấu phân cách --- giữa hướng dẫn và câu hỏi');
  }
  currentLine++;

  const questions = [];
  let currentQuestion = null;

  while (currentLine < lines.length) {
    const line = lines[currentLine++];
    const questionMatch = line.match(/^Q(\d+):\s*(.+?)\s*\(Level:\s*(AV[1-7]),\s*(?:Skill:\s*(?:listening|reading|grammar|vocabulary),\s*)?Points:\s*(\d+)\)$/i);

    if (questionMatch) {
      if (currentQuestion) {
        questions.push(currentQuestion);
      }
      currentQuestion = {
        questionNumber: Number(questionMatch[1]),
        type: 'multi_choice',
        content: questionMatch[2].trim(),
        level: questionMatch[3].toUpperCase(),
        points: Number(questionMatch[4]),
        options: [],
        correctAnswers: [],
        allowMultiple: false,
      };
      continue;
    }

    if (!currentQuestion) {
      continue;
    }

    const optionMatch = line.match(/^[A-D]\)\s*(.+)$/);
    if (optionMatch) {
      const rawOption = optionMatch[1].trim();
      const isCorrect = /\*$/.test(rawOption);
      const text = rawOption.replace(/\*$/, '').trim();
      currentQuestion.options.push({ text, isCorrect });
      if (isCorrect) {
        currentQuestion.correctAnswers.push(text);
      }
      continue;
    }

    if (line.toLowerCase().startsWith('passage:')) {
      currentQuestion.passage = line.substring(8).trim();
    }
  }

  if (currentQuestion) {
    questions.push(currentQuestion);
  }

  questions.forEach((question) => {
    if (!question.options.length) {
      question.type = 'short_answer';
      question.allowMultiple = false;
    } else if (question.correctAnswers.length > 1) {
      question.allowMultiple = true;
    }
  });

  return finalizePreview({
    title,
    description,
    category,
    timeLimit,
    instructions
  }, questions);
};

const parseKeyValueFormat = (lines) => {
  const metadata = {
    title: '',
    description: '',
    category: '',
    timeLimit: 0,
    instructions: []
  };

  let idx = 0;
  while (idx < lines.length) {
    const line = lines[idx];
    if (line === '---' || /^Q\d+/i.test(line) || /^Question\s*\d+/i.test(line)) {
      break;
    }

    const keyValueMatch = line.match(/^([A-Za-z ]+):\s*(.*)$/);
    if (!keyValueMatch) {
      idx++;
      continue;
    }

    const rawKey = keyValueMatch[1].trim().toLowerCase();
    const value = keyValueMatch[2].trim();

    switch (rawKey) {
      case 'title':
        metadata.title = value;
        break;
      case 'description':
        metadata.description = value;
        break;
      case 'category':
        metadata.category = ensureCategory(value);
        break;
      case 'time limit':
      case 'timelimit':
        metadata.timeLimit = coerceNumber(value, 0);
        break;
      case 'instructions':
        if (value) {
          metadata.instructions.push(stripBullet(value));
        }
        idx++;
        while (idx < lines.length) {
          const nextLine = lines[idx];
          if (!nextLine || nextLine === '---' || /^[A-Za-z ]+:/.test(nextLine) || /^Q\d+/i.test(nextLine)) {
            idx--;
            break;
          }
          metadata.instructions.push(stripBullet(nextLine));
          idx++;
        }
        break;
      default:
        // ignore unknown meta keys but keep pointer consistent
        break;
    }

    idx++;
  }

  if (!metadata.title) {
    throw new Error('Thiếu tiêu đề bài test (Title)');
  }
  if (!metadata.description) {
    throw new Error('Thiếu mô tả bài test (Description)');
  }
  if (!metadata.category) {
    throw new Error('Thiếu loại bài test (Category)');
  }
  if (!metadata.timeLimit || metadata.timeLimit <= 0) {
    throw new Error('Thời gian làm bài (TimeLimit) phải là số nguyên dương');
  }

  if (lines[idx] === '---') {
    idx++;
  }

  const questions = [];
  let questionNumber = 1;

  while (idx < lines.length) {
    const block = [];
    while (idx < lines.length && lines[idx] !== '---') {
      block.push(lines[idx]);
      idx++;
    }
    if (block.length) {
      questions.push(parseKeyValueQuestionBlock(block, questionNumber++));
    }
    if (lines[idx] === '---') {
      idx++;
    }
  }

  if (!questions.length) {
    throw new Error('Không tìm thấy câu hỏi nào trong file');
  }

  return finalizePreview(metadata, questions);
};

const finalizePreview = (metadata, questions) => {
  const normalizedQuestions = questions.map((question) => ({ ...question }));

  const sectionLookup = new Map();
  const sectionsFromQuestions = [];

  normalizedQuestions.forEach((question) => {
    // Ưu tiên sectionIndex nếu đã có
    if (typeof question.sectionIndex === 'number' && question.sectionIndex >= 0) {
      if (!sectionsFromQuestions[question.sectionIndex]) {
        sectionsFromQuestions[question.sectionIndex] = {
          title: question.sectionTitle || question.sectionKey || `Section ${question.sectionIndex + 1}`,
          passage: question.sectionPassage || '',
          audio: question.sectionAudio || '',
          image: question.sectionImage || ''
        };
      } else {
        const entry = sectionsFromQuestions[question.sectionIndex];
        if (!entry.passage && question.sectionPassage) entry.passage = question.sectionPassage;
        if (!entry.audio && question.sectionAudio) entry.audio = question.sectionAudio;
        if (!entry.image && question.sectionImage) entry.image = question.sectionImage;
        if (!entry.title && (question.sectionTitle || question.sectionKey)) {
          entry.title = question.sectionTitle || question.sectionKey;
        }
      }
    } else if (question.sectionKey || question.sectionTitle) {
      const key = (question.sectionKey || question.sectionTitle || '').toLowerCase();
      if (!sectionLookup.has(key)) {
        const sectionIndex = sectionsFromQuestions.length;
        sectionLookup.set(key, sectionIndex);
        sectionsFromQuestions.push({
          title: question.sectionTitle || question.sectionKey || `Section ${sectionIndex + 1}`,
          passage: question.sectionPassage || '',
          audio: question.sectionAudio || '',
          image: question.sectionImage || ''
        });
        question.sectionIndex = sectionIndex;
      } else {
        const sectionIndex = sectionLookup.get(key);
        question.sectionIndex = sectionIndex;
        const entry = sectionsFromQuestions[sectionIndex];
        if (!entry.passage && question.sectionPassage) entry.passage = question.sectionPassage;
        if (!entry.audio && question.sectionAudio) entry.audio = question.sectionAudio;
        if (!entry.image && question.sectionImage) entry.image = question.sectionImage;
        if (!entry.title && (question.sectionTitle || question.sectionKey)) {
          entry.title = question.sectionTitle || question.sectionKey;
        }
      }
    }

    delete question.sectionKey;
    delete question.sectionTitle;
    delete question.sectionPassage;
    delete question.sectionAudio;
    delete question.sectionImage;
  });

  const metadataSections = Array.isArray(metadata.sections) ? metadata.sections : [];
  const highestIndex = normalizedQuestions.reduce((max, question) => (
    typeof question.sectionIndex === 'number' && question.sectionIndex > max
      ? question.sectionIndex
      : max
  ), -1);

  let totalSections = Math.max(metadataSections.length, sectionsFromQuestions.length, highestIndex + 1);
  if (totalSections <= 0) {
    totalSections = 1;
  }

  const resolvedSections = [];
  for (let i = 0; i < totalSections; i++) {
    const base = metadataSections[i] || sectionsFromQuestions[i] || {};
    resolvedSections.push({
      title: base.title || `Section ${i + 1}`,
      passage: base.passage || '',
      audio: base.audio || '',
      image: base.image || ''
    });
  }

  normalizedQuestions.forEach((question) => {
    if (typeof question.sectionIndex !== 'number' || question.sectionIndex < 0 || question.sectionIndex >= resolvedSections.length) {
      question.sectionIndex = 0;
    }
  });

  const totalPoints = normalizedQuestions.reduce((sum, q) => sum + (q.points || 0), 0);

  return {
    title: metadata.title,
    description: metadata.description,
    category: metadata.category,
    timeLimit: metadata.timeLimit,
    instructions: Array.isArray(metadata.instructions) ? metadata.instructions : [],
    sections: resolvedSections,
    questions: normalizedQuestions,
    totalPoints,
    totalQuestions: normalizedQuestions.length
  };
};

const parseTextContent = (content) => {
  if (!content || !content.trim()) {
    throw new Error('File rỗng, không có nội dung để xử lý');
  }
  const lines = content
    .split(/\r?\n/)
    .map((line) => normaliseLine(line))
    .filter(Boolean);

  if (!lines.length) {
    throw new Error('Không tìm thấy nội dung hợp lệ trong file');
  }

  const hasKeyValueMeta = lines.slice(0, 8).some((line) => /^[A-Za-z ]+:/.test(line));
  if (hasKeyValueMeta) {
    return parseKeyValueFormat(lines);
  }
  return parseLegacyFormat(lines);
};

const parseDocxFile = async (filePath) => {
  const result = await mammoth.extractRawText({ path: filePath });
  return parseTextContent(result.value || '');
};

const parsePdfBuffer = async (buffer) => {
  const result = await pdfParse(buffer);
  return parseTextContent(result.text || '');
};

const parseExcelBuffer = (buffer) => {
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const sheetNames = workbook.SheetNames;
  if (!sheetNames.length) {
    throw new Error('File Excel không chứa sheet nào');
  }

  const metadataSheet = workbook.Sheets['Metadata'] || workbook.Sheets['Meta'] || workbook.Sheets[sheetNames[0]];
  const sectionsSheet = workbook.Sheets['Sections'] || workbook.Sheets[sheetNames.find((name) => name.toLowerCase().includes('section'))];
  const questionsSheet = workbook.Sheets['Questions'] || workbook.Sheets[sheetNames.find((name) => name.toLowerCase().includes('question'))];

  if (!metadataSheet) {
    throw new Error('Không tìm thấy sheet Metadata trong file Excel');
  }
  if (!questionsSheet) {
    throw new Error('Không tìm thấy sheet Questions trong file Excel');
  }

  const metadataRows = xlsx.utils.sheet_to_json(metadataSheet, { header: 1, defval: '' });
  const metadata = {
    title: '',
    description: '',
    category: '',
    timeLimit: 0,
    instructions: [],
    sections: []
  };

  metadataRows.forEach((row) => {
    const [key, value] = row.map((cell) => normaliseLine(String(cell || '')));
    if (!key) return;
    const lowerKey = key.toLowerCase();
    switch (lowerKey) {
      case 'title':
        metadata.title = value;
        break;
      case 'description':
        metadata.description = value;
        break;
      case 'category':
        metadata.category = ensureCategory(value);
        break;
      case 'time limit':
      case 'timelimit':
        metadata.timeLimit = coerceNumber(value, 0);
        break;
      case 'instructions':
        if (value) {
          metadata.instructions = value.split(/\||\n/).map(stripBullet).filter(Boolean);
        }
        break;
      default:
        break;
    }
  });

  if (!metadata.title || !metadata.description) {
    throw new Error('Metadata sheet phải có Title và Description');
  }
  if (!metadata.category) {
    throw new Error('Metadata sheet phải có Category');
  }
  if (!metadata.timeLimit || metadata.timeLimit <= 0) {
    throw new Error('Metadata sheet phải có TimeLimit > 0');
  }

  if (sectionsSheet) {
    const sectionRows = xlsx.utils.sheet_to_json(sectionsSheet, { defval: '' });
    metadata.sections = sectionRows
      .map((row, index) => {
        const title = String(row.Title || row.SectionTitle || '').trim();
        const passageRaw = row.Passage || row.SectionPassage || '';
        const audio = String(row.Audio || row.SectionAudio || row.AudioUrl || '').trim();
        const image = String(row.Image || row.SectionImage || row.ImageUrl || '').trim();
        const idx = row.SectionIndex !== undefined && row.SectionIndex !== ''
          ? coerceNumber(row.SectionIndex, index)
          : coerceNumber(row['Section Index'], index);

        return {
          index: Number.isFinite(idx) ? idx : index,
          title: title || `Section ${index + 1}`,
          passage: typeof passageRaw === 'string' ? passageRaw : String(passageRaw || ''),
          audio,
          image
        };
      })
      .sort((a, b) => a.index - b.index)
      .map((section) => ({
        title: section.title,
        passage: section.passage,
        audio: section.audio,
        image: section.image
      }));
  }

  const questionRows = xlsx.utils.sheet_to_json(questionsSheet, { defval: '' });
  if (!questionRows.length) {
    throw new Error('Sheet Questions đang trống');
  }

  const questions = questionRows.map((row, index) => {
    const type = String(row.Type || row.type || '').trim().toLowerCase();
    const allowMultiple = parseBoolean(row.AllowMultiple || row['Allow Multiple'], false);
    const options = parseOptionsFromString(row.Options || row.OptionList || '');
    const correctAnswers = String(row.CorrectAnswers || row.Answers || '')
      .split(/\||,|;/)
      .map((ans) => ans.trim())
      .filter(Boolean);
    const matchingPairs = parsePairsFromString(row.MatchingPairs || row.Pairs || '');

    const sectionIndexValue = row.SectionIndex !== undefined && row.SectionIndex !== ''
      ? row.SectionIndex
      : row['Section Index'];

    const question = {
      questionNumber: coerceNumber(row.QuestionNumber || row['Question Number'], index + 1),
      type: type || (matchingPairs.length ? 'matching' : options.length ? 'multi_choice' : 'short_answer'),
      content: String(row.Content || row.Question || '').trim(),
      points: coerceNumber(row.Points, 1),
      allowMultiple,
      options,
      correctAnswers,
      matchingPairs,
      explanation: String(row.Explanation || '').trim(),
      passage: String(row.Passage || '').trim(),
      media: {},
      sectionIndex: sectionIndexValue !== undefined && sectionIndexValue !== '' ? coerceNumber(sectionIndexValue, 0) : undefined,
      sectionKey: String(row.SectionKey || row.Section || '').trim().toLowerCase(),
      sectionTitle: String(row.SectionTitle || row['Section Title'] || '').trim(),
      sectionPassage: String(row.SectionPassage || '').trim(),
      sectionAudio: String(row.SectionAudio || '').trim(),
      sectionImage: String(row.SectionImage || '').trim()
    };

    if (row.MediaAudio || row.Audio) {
      question.media.audioUrl = String(row.MediaAudio || row.Audio).trim();
    }
    if (row.MediaImage || row.Image) {
      question.media.imageUrl = String(row.MediaImage || row.Image).trim();
    }
    if (row.WordBank) {
      question.wordBank = String(row.WordBank)
        .split(/\||,|;/)
        .map((word) => word.trim())
        .filter(Boolean);
    }

    if (!question.content) {
      throw new Error(`Question ${question.questionNumber} thiếu nội dung Content`);
    }

    if (question.type === 'multi_choice' || question.type === 'dropdown') {
      if (!question.options.length) {
        throw new Error(`Question ${question.questionNumber} cần khai báo Options`);
      }
      if (!question.options.some((opt) => opt.isCorrect)) {
        if (correctAnswers.length) {
          question.options = question.options.map((opt) => ({
            ...opt,
            isCorrect: correctAnswers.includes(opt.text)
          }));
        } else if (question.type === 'multi_choice') {
          throw new Error(`Question ${question.questionNumber} chưa đánh dấu đáp án đúng`);
        }
      }
      if (!question.allowMultiple) {
        question.allowMultiple = question.options.filter((opt) => opt.isCorrect).length > 1 ? true : false;
      }
    }

    if (question.type === 'short_answer' && !question.correctAnswers.length) {
      throw new Error(`Question ${question.questionNumber} cần cột CorrectAnswers`);
    }

    if (question.type === 'matching' && !question.matchingPairs.length) {
      throw new Error(`Question ${question.questionNumber} cần cột MatchingPairs`);
    }

    return question;
  });

  return finalizePreview(metadata, questions);
};

module.exports = {
  parseDocxFile,
  parsePdfBuffer,
  parseExcelBuffer,
  parseTextContent
};

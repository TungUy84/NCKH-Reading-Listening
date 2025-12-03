// Hàm chuyển mọi giá trị về chuỗi dùng làm khóa tạm cho câu hỏi.
const toStringId = (value) => {
  if (!value) return '';
  try {
    return String(value);
  } catch (error) {
    return '';
  }
};

// Hàm chuẩn hóa danh sách lựa chọn từ client, loại bỏ giá trị trống và trùng lặp.
const sanitizeSelectedOptions = (rawOptions) => {
  if (!Array.isArray(rawOptions)) return [];
  const unique = new Set();
  rawOptions.forEach((option) => {
    const trimmed = String(option ?? '').trim();
    if (trimmed) {
      unique.add(trimmed);
    }
  });
  return Array.from(unique);
};

// Hàm chuẩn hóa câu trả lời dạng text.
const sanitizeUserAnswer = (answer) => {
  if (typeof answer !== 'string') return '';
  return answer.trim();
};

// Hàm chuẩn hóa danh sách cặp matching mà học viên gửi lên.
const sanitizeMatchingAnswers = (answers) => {
  if (!Array.isArray(answers)) return [];
  return answers
    .map((item) => ({
      prompt: String(item?.prompt ?? '').trim(),
      selected: String(item?.selected ?? '').trim()
    }))
    .filter((item) => item.prompt);
};

// Hàm kiểm tra danh sách câu trả lời gửi lên và trả về bản đã chuẩn hóa.
const validatePracticeSubmissionPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Dữ liệu nộp bài không hợp lệ');
  }

  const answersInput = Array.isArray(payload.answers) ? payload.answers : [];
  if (!answersInput.length) {
    throw new Error('Danh sách câu trả lời không được để trống');
  }

  const sanitizedAnswers = answersInput.map((rawAnswer, index) => {
    if (!rawAnswer || typeof rawAnswer !== 'object') {
      throw new Error(`Câu trả lời thứ ${index + 1} không hợp lệ`);
    }

    const questionId = rawAnswer.questionId ? rawAnswer.questionId : undefined;
    const questionNumber = Number(rawAnswer.questionNumber);

    if (!questionId && !Number.isFinite(questionNumber)) {
      throw new Error(`Câu trả lời thứ ${index + 1} thiếu thông tin nhận diện câu hỏi`);
    }

    return {
      questionId,
      questionNumber: Number.isFinite(questionNumber) ? questionNumber : undefined,
      selectedOptions: sanitizeSelectedOptions(rawAnswer.selectedOptions),
      userAnswer: sanitizeUserAnswer(rawAnswer.userAnswer),
      matchingAnswers: sanitizeMatchingAnswers(rawAnswer.matchingAnswers)
    };
  });

  return {
    answers: sanitizedAnswers
  };
};

// Hàm lấy danh sách đáp án đúng tùy theo loại câu hỏi.
const getCorrectAnswers = (question) => {
  if (!question) return [];
  if (question.type === 'matching') {
    return (question.matchingPairs || [])
      .map((pair) => {
        const prompt = String(pair?.prompt ?? '').trim();
        const option = String(pair?.correctOption ?? '').trim();
        return prompt && option ? `${prompt}::${option}` : null;
      })
      .filter(Boolean);
  }

  if (question.type === 'multi_choice' || question.type === 'dropdown') {
    return (question.options || [])
      .filter((option) => option?.isCorrect)
      .map((option) => String(option?.text ?? '').trim())
      .filter(Boolean);
  }

  return (question.correctAnswers || [])
    .map((answer) => String(answer ?? '').trim())
    .filter(Boolean);
};

// Hàm kiểm tra độ chính xác của câu matching.
const isMatchingCorrect = (question, submittedPairs) => {
  const expectedPairs = question.matchingPairs || [];
  if (!expectedPairs.length) return false;
  if (expectedPairs.length !== submittedPairs.length) return false;

  return expectedPairs.every((pair) => {
    const prompt = String(pair?.prompt ?? '').trim();
    const correctOption = String(pair?.correctOption ?? '').trim();
    if (!prompt || !correctOption) {
      return false;
    }
    const actual = submittedPairs.find((item) => item.prompt === prompt);
    return !!actual && actual.selected === correctOption;
  });
};

// Hàm chấm điểm cho từng câu hỏi dựa trên dữ liệu chuẩn hóa (mỗi câu = 1 điểm).
const evaluateQuestion = (question, submission) => {
  const questionId = question?._id || submission?.questionId || undefined;
  const allowMultiple = Boolean(question.allowMultiple);
  const correctAnswers = getCorrectAnswers(question);

  if (!submission) {
    return {
      questionId,
      questionNumber: question.questionNumber,
      type: question.type,
      allowMultiple,
      selectedOptions: [],
      userAnswer: '',
      matchingAnswers: [],
      correctAnswers,
      earnedPoints: 0,
      isCorrect: false,
      isSkipped: true
    };
  }

  const selectedOptions = sanitizeSelectedOptions(submission.selectedOptions);
  const userAnswer = sanitizeUserAnswer(submission.userAnswer);
  const matchingAnswers = sanitizeMatchingAnswers(submission.matchingAnswers);

  let isAnswered = false;
  let isCorrect = false;

  switch (question.type) {
    case 'multi_choice': {
      if (allowMultiple) {
        isAnswered = selectedOptions.length > 0;
        if (isAnswered && correctAnswers.length) {
          const uniqueCorrect = Array.from(new Set(correctAnswers));
          isCorrect = uniqueCorrect.length === selectedOptions.length &&
            uniqueCorrect.every((answer) => selectedOptions.includes(answer));
        }
      } else {
        const chosen = selectedOptions[0] ?? '';
        isAnswered = !!chosen;
        if (isAnswered && correctAnswers.length === 1) {
          isCorrect = correctAnswers[0] === chosen;
        }
      }
      break;
    }
    case 'dropdown': {
      const chosen = selectedOptions[0] ?? '';
      isAnswered = !!chosen;
      if (isAnswered && correctAnswers.length === 1) {
        isCorrect = correctAnswers[0] === chosen;
      }
      break;
    }
    case 'short_answer': {
      isAnswered = !!userAnswer;
      if (isAnswered && correctAnswers.length) {
        const normalizedAnswer = userAnswer.toLowerCase();
        isCorrect = correctAnswers.some((answer) => answer.toLowerCase() === normalizedAnswer);
      }
      break;
    }
    case 'matching': {
      isAnswered = matchingAnswers.length > 0;
      if (isAnswered) {
        isCorrect = isMatchingCorrect(question, matchingAnswers);
      }
      break;
    }
    default:
      isAnswered = false;
  }

  const earnedPoints = isCorrect ? 1 : 0;

  return {
    questionId,
    questionNumber: question.questionNumber,
    type: question.type,
    allowMultiple,
    selectedOptions,
    userAnswer,
    matchingAnswers,
    correctAnswers,
    earnedPoints,
    isCorrect,
    isSkipped: !isAnswered
  };
};

// Hàm tổng hợp kết quả chấm bài cho toàn bộ bài luyện tập.
const scorePracticeSubmission = (practice, rawAnswers = []) => {
  const answersById = new Map();
  const answersByNumber = new Map();

  rawAnswers.forEach((item) => {
    if (!item || typeof item !== 'object') {
      return;
    }
    const idKey = toStringId(item.questionId);
    if (idKey) {
      answersById.set(idKey, item);
    }
    if (Number.isFinite(item.questionNumber)) {
      answersByNumber.set(Number(item.questionNumber), item);
    }
  });

  const questions = Array.isArray(practice?.questions) ? practice.questions : [];

  const evaluatedAnswers = questions.map((question) => {
    const idKey = toStringId(question._id);
    const submission = answersById.get(idKey) || answersByNumber.get(question.questionNumber) || null;
    return evaluateQuestion(question, submission);
  });

  const totalQuestions = evaluatedAnswers.length;
  const earnedPoints = evaluatedAnswers.reduce((sum, answer) => sum + (Number.isFinite(answer.earnedPoints) ? Number(answer.earnedPoints) : 0), 0);

  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;

  evaluatedAnswers.forEach((answer) => {
    if (answer.isSkipped) {
      skippedCount += 1;
    } else if (answer.isCorrect) {
      correctCount += 1;
    } else {
      incorrectCount += 1;
    }
  });

  const percentage = totalQuestions > 0 ? Math.round((earnedPoints / totalQuestions) * 100) : 0;
  const score = totalQuestions > 0 ? Number(((earnedPoints / totalQuestions) * 10).toFixed(2)) : 0;

  return {
    totalQuestions,
    earnedPoints,
    score,
    percentage,
    correctCount,
    incorrectCount,
    skippedCount,
    answers: evaluatedAnswers
  };
};

// Hàm chuẩn hóa thời lượng làm bài về số giây hợp lệ.
const sanitizeDuration = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return 0;
  }
  return Math.round(numeric);
};

// Hàm chuẩn hóa giá trị thời gian dạng Date.
const parseDateValue = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

module.exports = {
  validatePracticeSubmissionPayload,
  scorePracticeSubmission,
  sanitizeDuration,
  parseDateValue
};

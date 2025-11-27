const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { PlacementTest } = require('../models/PlacementTest');
const PlacementTestResult = require('../models/PlacementTestResult');
const { parseDocxFile, parsePdfBuffer, parseExcelBuffer } = require('../utils/placementTestImport');
const {
  validatePracticeSubmissionPayload,
  scorePracticeSubmission,
  sanitizeDuration,
  parseDateValue
} = require('../utils/placementTestResultHelper');

// Xóa các tệp media cũ để tránh rác khi admin cập nhật bài thi
const deleteMediaFiles = async (blocks = []) => {
  if (!Array.isArray(blocks) || !blocks.length) return;

  const targets = [];
  const seen = new Set();

  blocks.forEach((block) => {
    if (!block || !block.url) return;
    const fileName = path.basename(block.url);
    if (!fileName || seen.has(fileName)) return;
    seen.add(fileName);
    targets.push(path.join(__dirname, '..', 'uploads', 'tests', 'media', fileName));
  });

  await Promise.all(targets.map(async (filePath) => {
    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      if (error?.code !== 'ENOENT') {
        console.error('Không thể xóa file media:', filePath, error);
      }
    }
  }));
};

// Lấy danh sách các bài test theo category (Public)
const getActivePlacementTests = async (req, res) => {
  try {
    const { category, testType } = req.query; // listening hoặc reading, placement/mock-exam/checkpoint

    const filter = { isActive: true };
    if (category && ['listening', 'reading'].includes(category)) {
      filter.category = category;
    }
    if (testType && ['placement', 'mock-exam', 'checkpoint'].includes(testType)) {
      filter.testType = testType;
    }

    const tests = await PlacementTest.find(filter)
      .select('title description timeLimit totalQuestions category testType')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Lấy danh sách bài test thành công',
      tests
    });
  } catch (error) {
    console.error('Get placement tests error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách bài test' });
  }
};

// Hàm shuffle array (Fisher-Yates algorithm)
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Lấy chi tiết bài test để làm bài (Public)
const getPlacementTestForTaking = async (req, res) => {
  try {
    const { testId } = req.params;
    const { randomize } = req.query; // ?randomize=true để random câu hỏi

    const test = await PlacementTest.findById(testId)
      .select('-questions.correctAnswers -questions.explanation'); // Ẩn đáp án và giải thích

    if (!test) {
      return res.status(404).json({ message: 'Không tìm thấy bài test' });
    }

    if (!test.isActive) {
      return res.status(400).json({ message: 'Bài test này không còn hoạt động' });
    }

    // Convert to plain object để có thể modify
    const testObj = test.toObject();

    // Randomize questions nếu được yêu cầu (placement test và mock-exam)
    // CHỈ xáo trộn câu hỏi TRONG CÙNG 1 PART, giữ nguyên thứ tự các part
    if (randomize === 'true' && (testObj.testType === 'placement' || testObj.testType === 'mock-exam')) {
      // Nhóm câu hỏi theo sectionId (mỗi section = 1 part)
      const questionsBySectionId = new Map();
      const sectionOrder = []; // Lưu thứ tự xuất hiện của section
      
      testObj.questions.forEach(q => {
        const sectionKey = q.sectionId ? q.sectionId.toString() : 'no-section';
        
        if (!questionsBySectionId.has(sectionKey)) {
          questionsBySectionId.set(sectionKey, []);
          sectionOrder.push(sectionKey); // Ghi nhận thứ tự section
        }
        
        questionsBySectionId.get(sectionKey).push(q);
      });

      // Xáo trộn câu hỏi TRONG TỪNG section, giữ nguyên thứ tự section
      const shuffledQuestions = [];
      sectionOrder.forEach(sectionKey => {
        const sectionQuestions = questionsBySectionId.get(sectionKey);
        const shuffled = shuffleArray(sectionQuestions);
        shuffledQuestions.push(...shuffled);
      });

      // Cập nhật lại questionNumber theo thứ tự mới (chỉ để display)
      shuffledQuestions.forEach((q, idx) => {
        q.questionNumber = idx + 1;
      });

      testObj.questions = shuffledQuestions;
    }

    res.json({
      message: 'Lấy bài test thành công',
      test: testObj
    });
  } catch (error) {
    console.error('Get placement test error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy bài test' });
  }
};

// Chấm điểm bài test ngay lập tức (Public - không lưu database)
const checkPlacementTest = async (req, res) => {
  try {
  const { answers } = req.body || {};
    const testId = req.params.testId || req.body?.testId;

    if (!testId) {
      return res.status(400).json({ message: 'Thiếu mã bài test để chấm điểm' });
    }

    // Lấy bài test với đáp án đúng
    const test = await PlacementTest.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Không tìm thấy bài test' });
    }

    // Tính điểm
    let earnedPoints = 0;
    const detailedResults = [];

    const answerById = new Map();
    const answerByNumber = new Map();
    (answers || []).forEach((ans, idx) => {
      if (!ans) return;
      if (ans.questionId) answerById.set(String(ans.questionId), ans);
      if (typeof ans.questionNumber === 'number') answerByNumber.set(ans.questionNumber, ans);
      answerByNumber.set(idx + 1, ans);
    });

    const sectionById = new Map();
    const sectionByIndex = new Map();
    (test.sections || []).forEach((section, idx) => {
      if (!section) return;
      const asObject = typeof section.toObject === 'function' ? section.toObject() : section;
      sectionByIndex.set(idx, asObject);
      if (section._id) {
        sectionById.set(String(section._id), asObject);
      }
    });

    test.questions.forEach((question, index) => {
      const qId = question._id ? String(question._id) : undefined;
      const userAnswer = (qId && answerById.get(qId))
        || answerByNumber.get(question.questionNumber)
        || answers?.[index];
      const sectionId = question.sectionId ? String(question.sectionId) : undefined;
      const section = (() => {
        if (sectionId && sectionById.has(sectionId)) return sectionById.get(sectionId);
        if (typeof question.sectionIndex === 'number' && sectionByIndex.has(question.sectionIndex)) {
          return sectionByIndex.get(question.sectionIndex);
        }
        return undefined;
      })();
      const resolvedPassage = (() => {
        const questionPassage = question.passage;
        if (typeof questionPassage === 'string' && questionPassage.trim().length) {
          return questionPassage;
        }
        const sectionPassage = section?.passage;
        if (typeof sectionPassage === 'string' && sectionPassage.trim().length) {
          return sectionPassage;
        }
        return '';
      })();
      let isCorrect = false;
      let pointsEarned = 0;

      if (userAnswer) {
        const selectedOptions = Array.isArray(userAnswer.selectedOptions) ? userAnswer.selectedOptions : [];
        const normalizedSelected = selectedOptions.map((opt) => String(opt || '').trim());

        switch (question.type) {
          case 'multi_choice': {
            const correctOptions = (question.options || [])
              .filter((option) => option.isCorrect)
              .map((option) => String(option.text || '').trim());
            if (question.allowMultiple) {
              const uniqueSelected = Array.from(new Set(normalizedSelected));
              isCorrect = correctOptions.length > 0 &&
                correctOptions.length === uniqueSelected.length &&
                correctOptions.every((opt) => uniqueSelected.includes(opt));
            } else {
              const singleAnswer = normalizedSelected[0] || '';
              isCorrect = correctOptions.length === 1 && correctOptions[0] === singleAnswer;
            }
            break;
          }
          case 'dropdown': {
            const correctOption = (question.options || []).find((option) => option.isCorrect);
            const answer = normalizedSelected[0] || '';
            isCorrect = !!correctOption && String(correctOption.text || '').trim() === answer;
            break;
          }
          case 'short_answer': {
            const answer = (userAnswer.userAnswer || '').trim().toLowerCase();
            isCorrect = !!answer && (question.correctAnswers || []).some((correct) =>
              String(correct || '').trim().toLowerCase() === answer
            );
            break;
          }
          case 'matching': {
            const expectedPairs = question.matchingPairs || [];
            const submittedPairs = Array.isArray(userAnswer.matchingAnswers) ? userAnswer.matchingAnswers : [];
            if (expectedPairs.length && expectedPairs.length === submittedPairs.length) {
              isCorrect = expectedPairs.every((pair) => {
                const actual = submittedPairs.find((ans) => String(ans.prompt || '') === String(pair.prompt || ''));
                return actual && String(actual.selected || '') === String(pair.correctOption || '');
              });
            }
            break;
          }
          default:
            isCorrect = false;
        }

        if (isCorrect) {
          pointsEarned = question.points;
          earnedPoints += pointsEarned;
        }
      }

      detailedResults.push({
        questionNumber: index + 1,
        question: {
          type: question.type,
          content: question.content,
          passage: resolvedPassage,
          sectionId,
          sectionTitle: section?.title,
          media: question.media,
          options: question.options,
          allowMultiple: question.allowMultiple,
          matchingPairs: question.matchingPairs
        },
        userAnswer: {
          selectedOptions: userAnswer?.selectedOptions || [],
          userAnswer: userAnswer?.userAnswer || '',
          matchingAnswers: userAnswer?.matchingAnswers || []
        },
        correctAnswers: (() => {
          if (question.type === 'matching') {
            return (question.matchingPairs || []).map((pair) => `${pair.prompt} → ${pair.correctOption}`);
          }
          if (question.type === 'multi_choice' || question.type === 'dropdown') {
            return (question.options || []).filter((option) => option.isCorrect).map((option) => option.text);
          }
          return question.correctAnswers;
        })(),
        isCorrect,
        pointsEarned,
        explanation: question.explanation
      });
    });

    const percentage = Math.round((earnedPoints / test.totalPoints) * 100);

    // Tính điểm IELTS và level AV (không cần lưu database)
  // Quy đổi phần trăm sang thang điểm nội bộ để gợi ý lộ trình học
  const getIELTSAndLevel = (percentage) => {
      let ieltsScore, avLevel, recommendation;

      if (percentage >= 95) {
        ieltsScore = '8.5-9.0';
        avLevel = 'Đạt chuẩn đầu ra';
        recommendation = 'Xuất sắc! Bạn đã đạt trình độ rất cao và có thể tự tin sử dụng tiếng Anh trong mọi tình huống.';
      } else if (percentage >= 85) {
        ieltsScore = '7.5-8.0';
        avLevel = 'AV7';
        recommendation = 'Rất tốt! Bạn có thể tham gia các khóa học nâng cao để hoàn thiện kỹ năng.';
      } else if (percentage >= 75) {
        ieltsScore = '6.5-7.0';
        avLevel = 'AV6';
        recommendation = 'Tốt! Bạn nên tập trung rèn luyện thêm để đạt mức độ thành thạo.';
      } else if (percentage >= 65) {
        ieltsScore = '6.0-6.5';
        avLevel = 'AV5';
        recommendation = 'Khá tốt! Tiếp tục học tập đều đặn để nâng cao trình độ.';
      } else if (percentage >= 55) {
        ieltsScore = '5.5-6.0';
        avLevel = 'AV4';
        recommendation = 'Trung bình khá! Bạn cần luyện tập nhiều hơn ở những phần còn yếu.';
      } else if (percentage >= 45) {
        ieltsScore = '5.0-5.5';
        avLevel = 'AV3';
        recommendation = 'Trung bình! Hãy tập trung vào việc củng cố kiến thức cơ bản.';
      } else if (percentage >= 35) {
        ieltsScore = '4.5-5.0';
        avLevel = 'AV2';
        recommendation = 'Cần cải thiện! Bạn nên bắt đầu từ những bài học cơ bản.';
      } else {
        ieltsScore = '3.0-4.0';
        avLevel = 'AV1';
        recommendation = 'Cần học từ đầu! Hãy tham gia các khóa học tiếng Anh cơ bản.';
      }

      return { ieltsScore, avLevel, recommendation };
    };

    const { ieltsScore, avLevel, recommendation } = getIELTSAndLevel(percentage);

    res.json({
      message: 'Chấm bài thành công',
      result: {
        testTitle: test.title,
        category: test.category,
        score: {
          totalPoints: test.totalPoints,
          earnedPoints,
          percentage
        },
        ieltsScore,
        avLevel,
        recommendation,
        detailedResults
      }
    });
  } catch (error) {
    console.error('Check placement test error:', error);
    res.status(500).json({ message: 'Lỗi server khi chấm bài' });
  }
};

// === ADMIN FUNCTIONS ===

// Lấy tất cả bài test (Admin only) - hỗ trợ phân trang + tìm kiếm + lọc
const getAllPlacementTests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filters
    const { search, category, status, testType } = req.query;
    const filter = {};

    if (category && ['listening', 'reading'].includes(category)) {
      filter.category = category;
    }

    if (testType && ['placement', 'mock-exam', 'checkpoint'].includes(testType)) {
      filter.testType = testType;
    }

    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;

    if (filter.isActive === undefined && typeof req.query.isActive === 'string') {
      if (req.query.isActive === 'true') filter.isActive = true;
      if (req.query.isActive === 'false') filter.isActive = false;
    }

    if (search && typeof search === 'string') {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: regex },
        { description: regex },
      ];
    }

    const [tests, total] = await Promise.all([
      PlacementTest.find(filter)
        .populate('createdBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PlacementTest.countDocuments(filter),
    ]);

    res.json({
      message: 'Lấy danh sách bài test thành công',
      tests,
      pagination: {
        page,
        limit,
        totalItems: total,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all placement tests error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách bài test' });
  }
};

// Lấy chi tiết bài test (Admin only)
const getPlacementTestById = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await PlacementTest.findById(testId)
      .populate('createdBy', 'firstName lastName email');

    if (!test) {
      return res.status(404).json({ message: 'Không tìm thấy bài test' });
    }

    res.json({
      message: 'Lấy chi tiết bài test thành công',
      test
    });
  } catch (error) {
    console.error('Get placement test by id error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy chi tiết bài test' });
  }
};

// Tạo bài test mới (Admin only)
const createPlacementTest = async (req, res) => {
  try {
    const { title, description, instructions, timeLimit, questions = [], sections = [], category, testType = 'placement', isActive = true } = req.body;

    // Chuẩn hoá sections: nếu không có, tạo 1 section mặc định
    const sectionObjects = [];
    const explicitSections = Array.isArray(sections) ? sections : [];

    if (explicitSections.length) {
      explicitSections.forEach((section, idx) => {
        const objectId = section?._id ? section._id : new mongoose.Types.ObjectId();
        sectionObjects.push({
          _id: objectId,
          title: section?.title || `Section ${idx + 1}`,
          passage: section?.passage || '',
          audio: section?.audio || '',
          image: section?.image || '',
          mediaBlocks: Array.isArray(section?.mediaBlocks) ? section.mediaBlocks : []
        });
      });
    } else {
      // Nếu không có sections từ FE, tạo dựa trên sectionIndex của câu hỏi
      const sectionIndexes = new Set();
      questions.forEach((q) => {
        if (typeof q?.sectionIndex === 'number' && q.sectionIndex >= 0) {
          sectionIndexes.add(q.sectionIndex);
        }
      });

      if (sectionIndexes.size === 0) {
        sectionObjects.push({
          _id: new mongoose.Types.ObjectId(),
          title: title ? `${title} - Section 1` : 'Section 1',
          passage: '',
          audio: '',
          image: '',
          mediaBlocks: []
        });
      } else {
        Array.from(sectionIndexes).sort((a, b) => a - b).forEach((idx, order) => {
          sectionObjects.push({
            _id: new mongoose.Types.ObjectId(),
            title: `Section ${order + 1}`,
            passage: '',
            audio: '',
            image: '',
            mediaBlocks: []
          });
        });
      }
    }

    /** @type {Map<number, mongoose.Types.ObjectId>} */
    const sectionIdByIndex = new Map();
    sectionObjects.forEach((section, idx) => {
      sectionIdByIndex.set(idx, section._id);
    });

    const normalizedQuestions = Array.isArray(questions)
      ? questions.map((rawQuestion, idx) => {
        const question = { ...rawQuestion };
        const sectionIndex = typeof question.sectionIndex === 'number' && sectionIdByIndex.has(question.sectionIndex)
          ? question.sectionIndex
          : 0;
        const sectionId = question.sectionId || sectionIdByIndex.get(sectionIndex) || sectionObjects[0]._id;

        return {
          questionNumber: typeof question.questionNumber === 'number' ? question.questionNumber : idx + 1,
          type: question.type || 'multi_choice',
          allowMultiple: !!question.allowMultiple,
          content: question.content || question.text || '',
          options: Array.isArray(question.options)
            ? question.options.map((op) => ({
              text: op?.text || '',
              isCorrect: !!op?.isCorrect
            })).filter((op) => op.text)
            : [],
          matchingPairs: Array.isArray(question.matchingPairs)
            ? question.matchingPairs.map((pair) => ({
              prompt: pair?.prompt || '',
              correctOption: pair?.correctOption || ''
            })).filter((pair) => pair.prompt && pair.correctOption)
            : [],
          correctAnswers: Array.isArray(question.correctAnswers)
            ? question.correctAnswers.map((ans) => String(ans || '').trim()).filter(Boolean)
            : [],
          explanation: question.explanation || '',
          points: typeof question.points === 'number' && question.points > 0 ? question.points : 1,
          sectionId,
          sectionIndex,
        };
      })
      : [];

    const test = new PlacementTest({
      title,
      description: description || '',
      instructions: Array.isArray(instructions) ? instructions : [],
      category, // BẮT BUỘC theo schema
      testType, // placement, mock-exam, checkpoint
      timeLimit,
      sections: sectionObjects,
      questions: normalizedQuestions,
      isActive,
      createdBy: req.user._id
    });

    await test.save();

    res.status(201).json({
      message: 'Tạo bài test thành công',
      test
    });
  } catch (error) {
    console.error('Create placement test error:', error);
    if (error.name === 'ValidationError') {
      // Trả lỗi 400 với chi tiết để FE hiển thị thân thiện
      const errors = Object.values(error.errors || {}).map((e) => e.message);
      return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors });
    }
    res.status(500).json({ message: 'Lỗi server khi tạo bài test' });
  }
};

// Cập nhật bài test (Admin only)
const updatePlacementTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const { title, description, instructions, timeLimit, questions, isActive, category, testType } = req.body;

    const test = await PlacementTest.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Không tìm thấy bài test' });
    }

    // Cập nhật các field
    if (typeof title === 'string') test.title = title;
    if (description !== undefined) test.description = description;
    if (Array.isArray(instructions)) test.instructions = instructions;
    if (timeLimit !== undefined) test.timeLimit = timeLimit;
    if (Array.isArray(questions)) {
      test.questions = questions.map((question) => {
        if (question && typeof question === 'object' && 'skill' in question) {
          const { skill, ...rest } = question;
          return rest;
        }
        return question;
      });
    }
    if (typeof isActive === 'boolean') test.isActive = isActive;
    if (category) test.category = category;
    if (testType && ['placement', 'mock-exam', 'checkpoint'].includes(testType)) test.testType = testType;

    await test.save();

    res.json({
      message: 'Cập nhật bài test thành công',
      test
    });
  } catch (error) {
    console.error('Update placement test error:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật bài test' });
  }
};

// Cập nhật nội dung bài test: sections + questions (Admin only)
const updateTestContent = async (req, res) => {
  try {
    const { testId } = req.params;
    const { sections = [], questions = [] } = req.body;

    const test = await PlacementTest.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Không tìm thấy bài test' });
    }

    let removedMediaBlocks = [];

    // Cập nhật sections và questions nếu được gửi lên
    if (Array.isArray(sections)) {
      const currentSections = test.sections || [];
      const existingMediaMap = new Map();
      currentSections.forEach((section) => {
        (section?.mediaBlocks || []).forEach((block) => {
          if (block?.id) {
            existingMediaMap.set(String(block.id), block);
          }
        });
      });

      // Giữ nguyên _id của section nếu FE không gửi lên để không làm lệch liên kết sectionId của câu hỏi
      const nextSections = sections.map((s, idx) => {
        const existing = currentSections[idx] || {};
        const sectionId = s?._id || existing._id || new mongoose.Types.ObjectId();
        const mediaBlocks = Array.isArray(s?.mediaBlocks)
          ? s.mediaBlocks
          : (Array.isArray(existing.mediaBlocks) ? existing.mediaBlocks : []);

        const merged = {
          ...existing,
          ...s,
          _id: sectionId,
          mediaBlocks
        };

        if ('timeLimit' in merged) {
          delete merged.timeLimit;
        }

        return merged;
      });

      test.sections = nextSections;

      const newMediaIds = new Set();
      nextSections.forEach((section) => {
        (section?.mediaBlocks || []).forEach((block) => {
          if (block?.id) {
            newMediaIds.add(String(block.id));
          }
        });
      });

      removedMediaBlocks = Array.from(existingMediaMap.entries())
        .filter(([id]) => !newMediaIds.has(id))
        .map(([, block]) => block);
    }
    if (Array.isArray(questions)) {
      // Map questionNumber nếu chưa có và cố gắng gán sectionId khi thiếu dựa trên thứ tự section
      const currentSections = test.sections || [];
      const normalized = questions.map((q, idx) => {
        const qq = { ...q };
        if (!qq.questionNumber) qq.questionNumber = idx + 1;
        if (!qq.sectionId && typeof qq.sectionIndex === 'number' && currentSections[qq.sectionIndex]?._id) {
          qq.sectionId = currentSections[qq.sectionIndex]._id;
        }
        return qq;
      });
      test.questions = normalized;
    }

    // Tính lại tổng số câu hỏi và điểm
    test.totalQuestions = test.questions?.length || 0;
    test.totalPoints = (test.questions || []).reduce((sum, q) => sum + (q.points || 1), 0);

    await test.save();

    if (removedMediaBlocks.length) {
      await deleteMediaFiles(removedMediaBlocks);
    }

    res.json({
      message: 'Cập nhật nội dung bài test thành công',
      test
    });
  } catch (error) {
    // console.error('Update test content error:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật nội dung bài test' });
  }
};

// Upload media (image/audio) cho section passage
const uploadSectionMedia = async (req, res) => {
  try {
    const files = req.files || [];
    if (!files.length) {
      return res.status(400).json({ message: 'Không có file nào được tải lên' });
    }

    const uploaded = files.map((file) => ({
      id: new mongoose.Types.ObjectId().toString(),
      type: file.mimetype.startsWith('audio/') ? 'audio' : 'image',
      url: `/uploads/tests/media/${path.basename(file.path)}`,
      originalName: file.originalname,
      transcript: ''
    }));

    res.status(201).json({
      message: 'Tải media thành công',
      files: uploaded
    });
  } catch (error) {
    console.error('Upload section media error:', error);
    res.status(500).json({ message: 'Không thể tải media, vui lòng thử lại sau' });
  }
};

// Xóa bài test (Admin only)
const deletePlacementTest = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await PlacementTest.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Không tìm thấy bài test' });
    }

    // Check if test is used in any roadmap
    const Roadmap = require('../models/Roadmap');
    const roadmapsUsingTest = await Roadmap.find({ checkpointTest: testId })
      .select('levelGroup title')
      .lean();

    // Remove test reference from roadmaps
    if (roadmapsUsingTest.length > 0) {
      await Roadmap.updateMany(
        { checkpointTest: testId },
        { $unset: { checkpointTest: 1 } }
      );
    }

    const mediaBlocks = [];
    (test.sections || []).forEach((section) => {
      (section?.mediaBlocks || []).forEach((block) => mediaBlocks.push(block));
    });

    await PlacementTest.findByIdAndDelete(testId);

    if (mediaBlocks.length) {
      await deleteMediaFiles(mediaBlocks);
    }

    res.json({ 
      message: 'Xóa bài test thành công',
      removedFromRoadmaps: roadmapsUsingTest.map(r => r.levelGroup)
    });
  } catch (error) {
    console.error('Delete placement test error:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa bài test' });
  }
};

// Xóa nhiều bài test cùng lúc (Admin only)
const bulkDeletePlacementTests = async (req, res) => {
  try {
    const { testIds } = req.body || {};

    if (!Array.isArray(testIds) || !testIds.length) {
      return res.status(400).json({ message: 'Cần cung cấp danh sách testId để xóa' });
    }

    const ids = testIds
      .map((id) => {
        try {
          return new mongoose.Types.ObjectId(id);
        } catch (err) {
          return null;
        }
      })
      .filter(Boolean);

    if (!ids.length) {
      return res.status(400).json({ message: 'Danh sách testId không hợp lệ' });
    }

    // Check roadmap usage for all tests
    const Roadmap = require('../models/Roadmap');
    const roadmapsUsingTests = await Roadmap.find({ checkpointTest: { $in: ids } })
      .select('levelGroup title checkpointTest')
      .lean();

    // Remove test references from roadmaps
    if (roadmapsUsingTests.length > 0) {
      await Roadmap.updateMany(
        { checkpointTest: { $in: ids } },
        { $unset: { checkpointTest: 1 } }
      );
    }

    const testsToDelete = await PlacementTest.find({ _id: { $in: ids } }, { sections: 1 }).lean();
    const mediaBlocks = [];
    testsToDelete.forEach((test) => {
      (test?.sections || []).forEach((section) => {
        (section?.mediaBlocks || []).forEach((block) => mediaBlocks.push(block));
      });
    });

    const result = await PlacementTest.deleteMany({ _id: { $in: ids } });

    if (mediaBlocks.length) {
      await deleteMediaFiles(mediaBlocks);
    }

    res.json({
      message: `Đã xóa ${result.deletedCount} bài test`,
      deleted: result.deletedCount,
      removedFromRoadmaps: roadmapsUsingTests.map(r => r.levelGroup)
    });
  } catch (error) {
    console.error('Bulk delete placement tests error:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa nhiều bài test' });
  }
};

// Cập nhật trạng thái hoạt động của nhiều bài test (Admin only)
const bulkUpdatePlacementTestStatus = async (req, res) => {
  try {
    const { testIds, isActive } = req.body || {};

    if (!Array.isArray(testIds) || !testIds.length) {
      return res.status(400).json({ message: 'Cần cung cấp danh sách testId để cập nhật' });
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'Trạng thái isActive phải là boolean' });
    }

    const ids = testIds
      .map((id) => {
        try {
          return new mongoose.Types.ObjectId(id);
        } catch (err) {
          return null;
        }
      })
      .filter(Boolean);

    if (!ids.length) {
      return res.status(400).json({ message: 'Danh sách testId không hợp lệ' });
    }

    const result = await PlacementTest.updateMany(
      { _id: { $in: ids } },
      { $set: { isActive } }
    );

    res.json({
      message: `Đã cập nhật trạng thái cho ${result.modifiedCount} bài test`,
      modified: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk update placement test status error:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật trạng thái bài test' });
  }
};

// Lấy thống kê test (Admin only) - Đơn giản hóa vì không lưu kết quả
const getPlacementTestStats = async (req, res) => {
  try {
    const totalTests = await PlacementTest.countDocuments();
    const activeTests = await PlacementTest.countDocuments({ isActive: true });
    const listeningTests = await PlacementTest.countDocuments({ category: 'listening', isActive: true });
    const readingTests = await PlacementTest.countDocuments({ category: 'reading', isActive: true });

    // Thống kê theo category
    const categoryStats = [
      { category: 'listening', count: listeningTests },
      { category: 'reading', count: readingTests }
    ];

    res.json({
      message: 'Lấy thống kê thành công',
      stats: {
        totalTests,
        activeTests,
        categoryStats,
      }
    });
  } catch (error) {
    console.error('Get placement test stats error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy thống kê' });
  }
};

// Import bài test từ file Word/PDF/Excel (Admin)
const importPlacementTest = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không tìm thấy file upload' });
    }

    const filePath = req.file.path;
    const extension = path.extname(req.file.originalname || filePath).toLowerCase();
    let previewTest;

    try {
      if (extension === '.docx') {
        previewTest = await parseDocxFile(filePath);
      } else if (extension === '.pdf') {
        const buffer = fs.readFileSync(filePath);
        previewTest = await parsePdfBuffer(buffer);
      } else if (extension === '.xlsx') {
        const buffer = fs.readFileSync(filePath);
        previewTest = parseExcelBuffer(buffer);
      } else {
        throw new Error('Định dạng file không được hỗ trợ. Vui lòng sử dụng DOCX, PDF hoặc XLSX');
      }

      res.json({
        message: 'Phân tích file thành công',
        previewTest,
        source: extension.replace('.', '')
      });
    } finally {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (error) {
    console.error('Import placement test error:', error);
    res.status(500).json({ message: 'Lỗi khi xử lý file: ' + error.message });
  }
};

// Submit placement test và lưu kết quả
const submitPlacementTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }

    const test = await PlacementTest.findById(testId).lean();

    if (!test) {
      return res.status(404).json({ message: 'Không tìm thấy bài test' });
    }

    if (!test.isActive) {
      return res.status(400).json({ message: 'Bài test này đang bị vô hiệu hóa' });
    }

    // Kiểm tra và chuẩn hóa dữ liệu nộp bài
    let submissionPayload;
    try {
      submissionPayload = validatePracticeSubmissionPayload(req.body);
    } catch (validationError) {
      return res.status(400).json({
        message: validationError.message || 'Dữ liệu nộp bài không hợp lệ'
      });
    }

    // Chấm điểm
    const scoring = scorePracticeSubmission(test, submissionPayload.answers);

    // Xử lý thời gian
    const durationSeconds = sanitizeDuration(req.body?.durationSeconds);
    const providedStartedAt = parseDateValue(req.body?.startedAt);
    const providedCompletedAt = parseDateValue(req.body?.completedAt);
    const completedAt = providedCompletedAt || new Date();
    let startedAt = providedStartedAt;

    if (!startedAt && durationSeconds > 0) {
      startedAt = new Date(completedAt.getTime() - durationSeconds * 1000);
    }

    // Lưu kết quả vào database
    const resultDoc = await PlacementTestResult.create({
      testId: test._id,
      userId,
      testType: test.testType || 'placement',
      category: test.category,
      testTitle: test.title,
      totalQuestions: scoring.totalQuestions,
      totalPoints: scoring.totalPoints,
      earnedPoints: scoring.earnedPoints,
      percentage: scoring.percentage,
      correctCount: scoring.correctCount,
      incorrectCount: scoring.incorrectCount,
      skippedCount: scoring.skippedCount,
      durationSeconds,
      startedAt,
      completedAt,
      answers: scoring.answers
    });

    const result = resultDoc.toObject();

    return res.status(201).json({
      message: 'Nộp bài test thành công',
      data: {
        resultId: result._id,
        result: {
          percentage: result.percentage,
          earnedPoints: result.earnedPoints,
          totalPoints: result.totalPoints,
          correctCount: result.correctCount,
          incorrectCount: result.incorrectCount,
          skippedCount: result.skippedCount
        },
        test: {
          id: String(test._id),
          title: test.title,
          testType: test.testType,
          category: test.category,
          totalQuestions: scoring.totalQuestions,
          totalPoints: scoring.totalPoints
        }
      }
    });
  } catch (error) {
    console.error('[placementTestController][submitPlacementTest] Lỗi nộp bài test', error);
    return res.status(500).json({ message: 'Không thể nộp bài test' });
  }
};

// Lấy lịch sử làm bài của user cho một test cụ thể
const getMyTestAttempts = async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const query = {
      testId,
      userId
    };

    const [items, total] = await Promise.all([
      PlacementTestResult.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-answers')
        .populate('testId', 'title category testType totalQuestions totalPoints')
        .lean(),
      PlacementTestResult.countDocuments(query)
    ]);

    return res.status(200).json({
      message: 'Lấy lịch sử làm bài thành công',
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1
        }
      }
    });
  } catch (error) {
    console.error('[placementTestController][getMyTestAttempts] Lỗi lấy lịch sử', error);
    return res.status(500).json({ message: 'Không thể lấy lịch sử làm bài' });
  }
};

// Lấy chi tiết một lần làm bài
const getTestAttemptDetails = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user?._id || req.user?.id;

    const attemptDoc = await PlacementTestResult.findById(attemptId)
      .populate({
        path: 'testId',
        select: 'title category testType totalQuestions totalPoints sections questions'
      })
      .populate('userId', 'firstName lastName email username role');

    if (!attemptDoc) {
      return res.status(404).json({ message: 'Không tìm thấy kết quả bài làm' });
    }

    // Kiểm tra quyền: chỉ owner hoặc admin mới xem được
    const isOwner = attemptDoc.userId && attemptDoc.userId._id.toString() === userId.toString();
    const isAdmin = req.user?.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Bạn không có quyền xem kết quả này' });
    }

    const attempt = attemptDoc.toObject();
    const test = attempt.testId;

    // Map questions vào sections dựa trên sectionId
    if (test && test.sections && test.questions) {
      test.sections = test.sections.map(section => ({
        ...section,
        questions: test.questions.filter(q => 
          q.sectionId && q.sectionId.toString() === section._id.toString()
        )
      }));
    }

    return res.status(200).json({
      message: 'Lấy chi tiết kết quả thành công',
      data: {
        attempt,
        test
      }
    });
  } catch (error) {
    console.error('[placementTestController][getTestAttemptDetails] Lỗi lấy chi tiết', error);
    return res.status(500).json({ message: 'Không thể lấy chi tiết kết quả' });
  }
};

// Lấy tất cả lịch sử làm bài của user (cross all tests)
const getAllMyTestAttempts = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const query = { userId };

    // Filter by testType if provided
    if (req.query.testType && ['placement', 'mock-exam'].includes(req.query.testType)) {
      query.testType = req.query.testType;
    }

    // Filter by category if provided
    if (req.query.category && ['reading', 'listening'].includes(req.query.category)) {
      query.category = req.query.category;
    }

    const [items, total] = await Promise.all([
      PlacementTestResult.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-answers')
        .populate('testId', 'title category testType totalQuestions totalPoints')
        .lean(),
      PlacementTestResult.countDocuments(query)
    ]);

    return res.status(200).json({
      message: 'Lấy lịch sử làm bài thành công',
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1
        }
      }
    });
  } catch (error) {
    console.error('[placementTestController][getAllMyTestAttempts] Lỗi lấy lịch sử', error);
    return res.status(500).json({ message: 'Không thể lấy lịch sử làm bài' });
  }
};

module.exports = {
  // Public APIs
  getActivePlacementTests,
  getPlacementTestForTaking,
  checkPlacementTest, // Legacy - kept for compatibility
  submitPlacementTest, // NEW - Submit và lưu kết quả
  getMyTestAttempts, // NEW - Lịch sử làm bài của user
  getTestAttemptDetails, // NEW - Chi tiết một lần làm bài
  getAllMyTestAttempts, // NEW - Tất cả lịch sử làm bài

  // Admin APIs
  getAllPlacementTests,
  getPlacementTestById,
  createPlacementTest,
  updatePlacementTest,
  deletePlacementTest,
  bulkDeletePlacementTests,
  bulkUpdatePlacementTestStatus,
  getPlacementTestStats,
  importPlacementTest,
  updateTestContent,
  uploadSectionMedia
};

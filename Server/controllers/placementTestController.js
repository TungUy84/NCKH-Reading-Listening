const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { PlacementTest } = require('../models/PlacementTest');
const { parseDocxFile, parsePdfBuffer, parseExcelBuffer } = require('../utils/placementTestImport');

// Lấy danh sách các bài test theo category (Public)
const getActivePlacementTests = async (req, res) => {
  try {
    const { category } = req.query; // listening, reading, general

    const filter = { isActive: true };
    if (category && ['listening', 'reading', 'general'].includes(category)) {
      filter.category = category;
    }

    const tests = await PlacementTest.find(filter)
      .select('title description timeLimit totalQuestions category')
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

// Lấy chi tiết bài test để làm bài (Public)
const getPlacementTestForTaking = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await PlacementTest.findById(testId)
      .select('-questions.correctAnswers -questions.explanation'); // Ẩn đáp án và giải thích

    if (!test) {
      return res.status(404).json({ message: 'Không tìm thấy bài test' });
    }

    if (!test.isActive) {
      return res.status(400).json({ message: 'Bài test này không còn hoạt động' });
    }

    res.json({
      message: 'Lấy bài test thành công',
      test
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

    test.questions.forEach((question, index) => {
      const qId = question._id ? String(question._id) : undefined;
      const userAnswer = (qId && answerById.get(qId))
        || answerByNumber.get(question.questionNumber)
        || answers?.[index];
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
          passage: question.passage,
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
    const { search, category, status } = req.query;
    const filter = {};

    if (category && ['listening', 'reading', 'general'].includes(category)) {
      filter.category = category;
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
    const { title, description, instructions, timeLimit, questions = [], sections = [], category, isActive = true } = req.body;

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
          timeLimit: section?.timeLimit || timeLimit || 0,
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
          timeLimit: timeLimit || 0,
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
            timeLimit: timeLimit || 0,
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
          skill: question.skill === 'listening' ? 'listening' : 'reading',
          instructions: question.instructions || '',
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
          wordBank: Array.isArray(question.wordBank) ? question.wordBank.filter(Boolean) : [],
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
    const { title, description, instructions, timeLimit, questions, isActive, category } = req.body;

    const test = await PlacementTest.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Không tìm thấy bài test' });
    }

    // Cập nhật các field
    if (typeof title === 'string') test.title = title;
    if (description !== undefined) test.description = description;
    if (Array.isArray(instructions)) test.instructions = instructions;
    if (timeLimit !== undefined) test.timeLimit = timeLimit;
    if (Array.isArray(questions)) test.questions = questions;
    if (typeof isActive === 'boolean') test.isActive = isActive;
    if (category) test.category = category;

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

    // Cập nhật sections và questions nếu được gửi lên
    if (Array.isArray(sections)) {
      const currentSections = test.sections || [];
      // Giữ nguyên _id của section nếu FE không gửi lên để không làm lệch liên kết sectionId của câu hỏi
      test.sections = sections.map((s, idx) => {
        const existing = currentSections[idx] || {};
        const sectionId = s?._id || existing._id || new mongoose.Types.ObjectId();
        const mediaBlocks = Array.isArray(s?.mediaBlocks)
          ? s.mediaBlocks
          : (Array.isArray(existing.mediaBlocks) ? existing.mediaBlocks : []);

        return {
          ...existing,
          ...s,
          _id: sectionId,
          mediaBlocks
        };
      });
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
      mimeType: file.mimetype,
      size: file.size,
      caption: '',
      altText: ''
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

    await PlacementTest.findByIdAndDelete(testId);

    res.json({ message: 'Xóa bài test thành công' });
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

    const result = await PlacementTest.deleteMany({ _id: { $in: ids } });

    res.json({
      message: `Đã xóa ${result.deletedCount} bài test`,
      deleted: result.deletedCount
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
    const generalTests = await PlacementTest.countDocuments({ category: 'general', isActive: true });

    // Thống kê theo category
    const categoryStats = [
      { category: 'listening', count: listeningTests },
      { category: 'reading', count: readingTests },
      { category: 'general', count: generalTests }
    ];

    res.json({
      message: 'Lấy thống kê thành công',
      stats: {
        totalTests,
        activeTests,
        categoryStats,
        note: 'Kết quả test không được lưu trong database nên không có thống kê kết quả người dùng'
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

module.exports = {
  // Public APIs
  getActivePlacementTests,
  getPlacementTestForTaking,
  checkPlacementTest, // Thay thế submitPlacementTest

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

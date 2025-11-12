const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Practice = require('../models/Practice');
const PracticeAttempt = require('../models/PracticeAttempt');
const {parsePracticeDocxFile, parsePracticeExcelBuffer} = require('../utils/practiceImport');

// Import các hàm từ practiceHelper.js
const {
  ALLOWED_SKILLS,
  ALLOWED_LEVEL_GROUPS,
  buildSections,
  buildQuestions,
  parsePagination,
  buildFilters,
  ensureMediaDir,
  deletePracticeMediaFiles
} = require('../utils/practiceHelper');
const {
  scorePracticeSubmission,
  sanitizeDuration,
  parseDateValue,
  validatePracticeSubmissionPayload
} = require('../utils/practiceAttemptHelper');

// === controllers ===
// Hàm lấy danh sách bài ôn luyện công khai cho người học (chỉ trả về bài đang hoạt động).
const getPublicPractices = async (req, res) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const filters = buildFilters(req.query, false);

    const [items, total] = await Promise.all([
      Practice.find(filters)
        .select('title description skill levelGroup estimatedTime totalQuestions')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Practice.countDocuments(filters)
    ]);

    return res.status(200).json({
      message: 'Lấy danh sách bài ôn luyện thành công',
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
    console.error('[practiceController][getPublicPractices] Lỗi lấy danh sách', error);
    return res.status(500).json({
      message: 'Không thể lấy danh sách bài ôn luyện'
    });
  }
};

// Hàm lấy danh sách bài ôn luyện dành cho admin (bao gồm cả bản nháp và ngừng hoạt động).
const getAdminPractices = async (req, res) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const filters = buildFilters(req.query, true);

    const [items, total] = await Promise.all([
      Practice.find(filters)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('createdBy', 'firstName lastName email username'),
      Practice.countDocuments(filters)
    ]);

    return res.status(200).json({
      message: 'Lấy danh sách bài ôn luyện cho admin thành công',
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
    console.error('[practiceController][getAdminPractices] Lỗi lấy danh sách admin', error);
    return res.status(500).json({
      message: 'Không thể lấy danh sách bài ôn luyện cho admin'
    });
  }
};

// Hàm tạo mới bài ôn luyện dựa trên dữ liệu admin gửi lên.
const createPractice = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      createdBy: req.user?._id || req.user?.id
    };

    let normalizedSections = buildSections(payload.sections);
    const incomingQuestions = Array.isArray(payload.questions) ? payload.questions : [];

    if (!normalizedSections.length && incomingQuestions.length) {
      normalizedSections = buildSections([{}]);
    }

    payload.sections = normalizedSections;
    payload.questions = buildQuestions(incomingQuestions, normalizedSections);

    const practice = await Practice.create(payload);

    return res.status(201).json({
      message: 'Tạo bài ôn luyện thành công',
      practice
    });
  } catch (error) {
    console.error('[practiceController][createPractice] Lỗi tạo bài ôn luyện', error);
    const statusCode = error.name === 'ValidationError' ? 400 : 500;
    const message = error.name === 'ValidationError'
      ? Object.values(error.errors || {}).map((e) => e.message).join('; ')
      : 'Không thể tạo bài ôn luyện, vui lòng thử lại sau';

    return res.status(statusCode).json({
      message
    });
  }
};

// Hàm lấy chi tiết bài ôn luyện cho học viên làm bài (ẩn đáp án).
const getPracticeForLearner = async (req, res) => {
  try {
    const { practiceId } = req.params;

    const practice = await Practice.findById(practiceId)
      .select('-questions.correctAnswers -questions.explanation');

    if (!practice) {
      return res.status(404).json({ message: 'Không tìm thấy bài ôn luyện' });
    }

    if (!practice.isActive) {
      return res.status(400).json({ message: 'Bài ôn luyện này đang bị vô hiệu hóa' });
    }

    return res.status(200).json({
      message: 'Lấy chi tiết bài ôn luyện thành công',
      practice
    });
  } catch (error) {
    console.error('[practiceController][getPracticeForLearner] Lỗi lấy chi tiết', error);
    return res.status(500).json({
      message: 'Không thể lấy chi tiết bài ôn luyện'
    });
  }
};

// Hàm lấy chi tiết đầy đủ của bài ôn luyện (bao gồm đáp án) dành cho admin.
const getPracticeDetails = async (req, res) => {
  try {
    const { practiceId } = req.params;

    const practice = await Practice.findById(practiceId)
      .populate('createdBy', 'firstName lastName email username');

    if (!practice) {
      return res.status(404).json({ message: 'Không tìm thấy bài ôn luyện' });
    }

    return res.status(200).json({
      message: 'Lấy chi tiết bài ôn luyện cho admin thành công',
      practice
    });
  } catch (error) {
    console.error('[practiceController][getPracticeDetails] Lỗi lấy chi tiết admin', error);
    return res.status(500).json({
      message: 'Không thể lấy chi tiết bài ôn luyện cho admin'
    });
  }
};

// Hàm upload media cho passage trong bài ôn luyện.
const uploadPracticeMedia = async (req, res) => {
  try {
    const files = req.files || [];
    if (!files.length) {
      return res.status(400).json({ message: 'Không có file nào được tải lên' });
    }

    ensureMediaDir();

    const uploaded = files.map((file) => ({
      id: new mongoose.Types.ObjectId().toString(),
      type: file.mimetype.startsWith('audio/') ? 'audio' : 'image',
      url: `/uploads/practices/media/${path.basename(file.path)}`,
      originalName: file.originalname,
      transcript: ''
    }));

    return res.status(201).json({
      message: 'Tải media thành công',
      files: uploaded
    });
  } catch (error) {
    console.error('[practiceController][uploadPracticeMedia] Lỗi upload media', error);
    return res.status(500).json({ message: 'Không thể tải media, vui lòng thử lại sau' });
  }
};

// Hàm import bài ôn luyện từ file Word/Excel.
const importPractice = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không tìm thấy file upload. Vui lòng chọn file Word (.docx) hoặc Excel (.xlsx).' });
    }

    const filePath = req.file.path;
    const extension = path.extname(req.file.originalname || filePath).toLowerCase();
    let previewPractice;

    try {
      if (extension === '.docx') {
        previewPractice = await parsePracticeDocxFile(filePath);
      } else if (extension === '.xlsx') {
        const buffer = fs.readFileSync(filePath);
        previewPractice = parsePracticeExcelBuffer(buffer);
      } else {
        throw new Error('Định dạng file không được hỗ trợ. Vui lòng sử dụng DOCX hoặc XLSX');
      }

      return res.json({
        message: 'Phân tích file thành công',
        previewPractice,
        source: extension.replace('.', '')
      });
    } finally {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (error) {
    console.error('[practiceController][importPractice] Lỗi import bài ôn luyện', error);
    return res.status(500).json({ message: 'Lỗi khi xử lý file: ' + error.message });
  }
};

// Hàm cập nhật nội dung (sections + questions) của bài ôn luyện.
const updatePracticeContent = async (req, res) => {
  try {
    const { practiceId } = req.params;
    const { sections = [], questions = [] } = req.body || {};

    const practice = await Practice.findById(practiceId);
    if (!practice) {
      return res.status(404).json({ message: 'Không tìm thấy bài ôn luyện' });
    }

    let removedMediaBlocks = [];

    if (Array.isArray(sections)) {
      const currentSections = practice.sections || [];
      const existingMediaMap = new Map();

      currentSections.forEach((section) => {
        (section?.mediaBlocks || []).forEach((block) => {
          if (block?.id) {
            existingMediaMap.set(String(block.id), block);
          }
        });
      });

      const nextSections = sections.map((sectionPayload, index) => {
        const existing = currentSections[index] || {};
        const sectionId = sectionPayload?._id || existing._id || new mongoose.Types.ObjectId();

        const mediaBlocks = Array.isArray(sectionPayload?.mediaBlocks)
          ? sectionPayload.mediaBlocks
          : Array.isArray(existing.mediaBlocks) ? existing.mediaBlocks : [];

        const merged = {
          ...existing,
          ...sectionPayload,
          _id: sectionId,
          mediaBlocks
        };

        if ('timeLimit' in merged) {
          delete merged.timeLimit;
        }

        return merged;
      });

      practice.sections = nextSections;

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
      const currentSections = practice.sections || [];
      const normalizedQuestions = questions.map((questionPayload, index) => {
        const normalized = { ...questionPayload };
        if (!normalized.questionNumber) {
          normalized.questionNumber = index + 1;
        }
        if (!normalized.sectionId && typeof normalized.sectionIndex === 'number' && currentSections[normalized.sectionIndex]?._id) {
          normalized.sectionId = currentSections[normalized.sectionIndex]._id;
        }
        return normalized;
      });

      practice.questions = normalizedQuestions;
    }

    practice.totalQuestions = practice.questions?.length || 0;
    practice.totalPoints = (practice.questions || []).reduce((sum, question) => sum + (question.points || 1), 0);

    await practice.save();

    if (removedMediaBlocks.length) {
      await deletePracticeMediaFiles(removedMediaBlocks);
    }

    return res.json({
      message: 'Cập nhật nội dung bài ôn luyện thành công',
      practice
    });
  } catch (error) {
    console.error('[practiceController][updatePracticeContent] Lỗi cập nhật nội dung', error);
    return res.status(500).json({ message: 'Không thể cập nhật nội dung bài ôn luyện' });
  }
};

// Hàm cập nhật thông tin cơ bản bài ôn luyện.
const updatePracticeInfo = async (req, res) => {
  try {
    const { practiceId } = req.params;
    const payload = req.body || {};

    const practice = await Practice.findById(practiceId);
    if (!practice) {
      return res.status(404).json({ message: 'Không tìm thấy bài ôn luyện để cập nhật' });
    }

    const nextSkill = payload.skill || practice.skill;
    const nextLevelGroup = payload.levelGroup || practice.levelGroup;

    if (!ALLOWED_SKILLS.includes(nextSkill)) {
      return res.status(400).json({ message: 'Kỹ năng không hợp lệ' });
    }

    if (!ALLOWED_LEVEL_GROUPS.includes(nextLevelGroup)) {
      return res.status(400).json({ message: 'Nhóm level không hợp lệ' });
    }

    practice.title = payload.title?.trim() || practice.title;
    practice.description = typeof payload.description === 'string' ? payload.description : practice.description;
    practice.skill = nextSkill;
    practice.levelGroup = nextLevelGroup;
    if (typeof payload.estimatedTime !== 'undefined') {
      const parsedTime = parseInt(payload.estimatedTime, 10);
      if (!Number.isNaN(parsedTime) && parsedTime >= 0) {
        practice.estimatedTime = parsedTime;
      }
    }

    if (typeof payload.isActive === 'boolean') {
      practice.isActive = payload.isActive;
    }

    const updatedPractice = await practice.save();

    return res.status(200).json({
      message: 'Cập nhật thông tin bài ôn luyện thành công',
      practice: updatedPractice
    });
  } catch (error) {
    console.error('[practiceController][updatePracticeInfo] Lỗi cập nhật thông tin', error);
    const statusCode = error.name === 'ValidationError' ? 400 : 500;
    const message = error.name === 'ValidationError'
      ? Object.values(error.errors || {}).map((e) => e.message).join('; ')
      : 'Không thể cập nhật bài ôn luyện';

    return res.status(statusCode).json({ message });
  }
};

// Hàm xóa bài ôn luyện khỏi hệ thống.
const deletePractice = async (req, res) => {
  try {
    const { practiceId } = req.params;

    const practice = await Practice.findById(practiceId);
    if (!practice) {
      return res.status(404).json({ message: 'Không tìm thấy bài ôn luyện để xóa' });
    }

    const mediaBlocks = [];
    (practice.sections || []).forEach((section) => {
      (section?.mediaBlocks || []).forEach((block) => mediaBlocks.push(block));
    });

    await practice.deleteOne();

    if (mediaBlocks.length) {
      await deletePracticeMediaFiles(mediaBlocks);
    }

    return res.status(200).json({
      message: 'Xóa bài ôn luyện thành công'
    });
  } catch (error) {
    console.error('[practiceController][deletePractice] Lỗi xóa bài ôn luyện', error);
    return res.status(500).json({
      message: 'Không thể xóa bài ôn luyện'
    });
  }
};

// Hàm nộp bài ôn luyện, chấm điểm và lưu lịch sử làm bài.
const submitPracticeAttempt = async (req, res) => {
  try {
    const { practiceId } = req.params;
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }

    const practice = await Practice.findById(practiceId).lean();

    if (!practice) {
      return res.status(404).json({ message: 'Không tìm thấy bài ôn luyện' });
    }

    if (!practice.isActive) {
      return res.status(400).json({ message: 'Bài ôn luyện này đang bị vô hiệu hóa' });
    }

  // Kiểm tra và chuẩn hóa dữ liệu nộp bài trước khi chấm điểm.
  let submissionPayload;
    try {
      submissionPayload = validatePracticeSubmissionPayload(req.body);
    } catch (validationError) {
      return res.status(400).json({
        message: validationError.message || 'Dữ liệu nộp bài không hợp lệ'
      });
    }

    const scoring = scorePracticeSubmission(practice, submissionPayload.answers);

    const durationSeconds = sanitizeDuration(req.body?.durationSeconds);
    const providedStartedAt = parseDateValue(req.body?.startedAt);
    const providedCompletedAt = parseDateValue(req.body?.completedAt);
    const completedAt = providedCompletedAt || new Date();
    let startedAt = providedStartedAt;

    if (!startedAt && durationSeconds > 0) {
      startedAt = new Date(completedAt.getTime() - durationSeconds * 1000);
    }

    const attemptDoc = await PracticeAttempt.create({
      practiceId: practice._id,
      userId,
      skill: practice.skill,
      levelGroup: practice.levelGroup,
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

    const attempt = attemptDoc.toObject();

    return res.status(201).json({
      message: 'Nộp bài ôn luyện thành công',
      data: {
        attempt,
        practice: {
          id: String(practice._id),
          title: practice.title,
          skill: practice.skill,
          levelGroup: practice.levelGroup,
          totalQuestions: scoring.totalQuestions,
          totalPoints: scoring.totalPoints
        }
      }
    });
  } catch (error) {
    console.error('[practiceController][submitPracticeAttempt] Lỗi nộp bài ôn luyện', error);
    return res.status(500).json({ message: 'Không thể nộp bài ôn luyện' });
  }
};

// Hàm lấy lịch sử làm bài của người học cho một bài ôn luyện.
const getMyPracticeAttempts = async (req, res) => {
  try {
    const { practiceId } = req.params;
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }

    const { page, limit } = parsePagination(req.query);
    const query = {
      practiceId,
      userId
    };

    const [items, total] = await Promise.all([
      PracticeAttempt.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-answers')
        .populate('practiceId', 'title skill levelGroup totalQuestions totalPoints')
        .lean(),
      PracticeAttempt.countDocuments(query)
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
    console.error('[practiceController][getMyPracticeAttempts] Lỗi lấy lịch sử', error);
    return res.status(500).json({ message: 'Không thể lấy lịch sử làm bài' });
  }
};

// Hàm lấy danh sách lịch sử làm bài cho admin theo từng bài ôn luyện.
const getPracticeAttemptsForAdmin = async (req, res) => {
  try {
    const { practiceId } = req.params;
    const { page, limit } = parsePagination(req.query);
    const query = { practiceId };

    if (req.query.userId && mongoose.Types.ObjectId.isValid(req.query.userId)) {
      query.userId = req.query.userId;
    }

    const [items, total] = await Promise.all([
      PracticeAttempt.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-answers')
        .populate('practiceId', 'title skill levelGroup totalQuestions totalPoints')
        .populate('userId', 'firstName lastName email username role')
        .lean(),
      PracticeAttempt.countDocuments(query)
    ]);

    return res.status(200).json({
      message: 'Lấy danh sách lịch sử làm bài thành công',
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
    console.error('[practiceController][getPracticeAttemptsForAdmin] Lỗi lấy lịch sử admin', error);
    return res.status(500).json({ message: 'Không thể lấy danh sách lịch sử làm bài' });
  }
};

// Hàm lấy chi tiết một lần làm bài, bao gồm thông tin bài và người dùng.
const getPracticeAttemptDetails = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const attemptDoc = await PracticeAttempt.findById(attemptId)
      .populate('practiceId', 'title skill levelGroup totalQuestions totalPoints sections questions')
      .populate('userId', 'firstName lastName email username role');

    if (!attemptDoc) {
      return res.status(404).json({ message: 'Không tìm thấy lịch sử làm bài' });
    }

    const isAdmin = req.user?.role === 'admin';
    const ownerId = attemptDoc.userId?._id || attemptDoc.userId;
    const requesterId = req.user?._id || req.user?.id;

    if (!isAdmin && String(ownerId) !== String(requesterId)) {
      return res.status(403).json({ message: 'Không có quyền truy cập lịch sử này' });
    }

    const attempt = attemptDoc.toObject();
    const practiceDoc = attempt.practiceId && typeof attempt.practiceId === 'object' ? attempt.practiceId : null;
    const userDoc = attempt.userId && typeof attempt.userId === 'object' ? attempt.userId : null;

    const practice = practiceDoc ? {
      id: String(practiceDoc._id),
      title: practiceDoc.title,
      skill: practiceDoc.skill,
      levelGroup: practiceDoc.levelGroup,
      totalQuestions: practiceDoc.totalQuestions,
      totalPoints: practiceDoc.totalPoints,
      sections: (practiceDoc.sections || []).map((section) => ({
        _id: section._id,
        title: section.title,
        passage: section.passage,
        audio: section.audio,
        image: section.image,
        mediaBlocks: section.mediaBlocks
      })),
      questions: (practiceDoc.questions || []).map((question) => ({
        _id: question._id,
        questionNumber: question.questionNumber,
        type: question.type,
        allowMultiple: question.allowMultiple,
        content: question.content,
        options: question.options,
        matchingPairs: question.matchingPairs,
        correctAnswers: question.correctAnswers,
        explanation: question.explanation,
        points: question.points
      }))
    } : null;

    const user = userDoc ? {
      id: String(userDoc._id),
      firstName: userDoc.firstName,
      lastName: userDoc.lastName,
      email: userDoc.email,
      username: userDoc.username,
      role: userDoc.role
    } : null;

    attempt.practiceId = practice ? practice.id : attempt.practiceId;
    attempt.userId = user ? user.id : attempt.userId;

    if (!practice && attempt.practiceId) {
      attempt.practiceId = String(attempt.practiceId);
    }

    if (!user && attempt.userId) {
      attempt.userId = String(attempt.userId);
    }

    return res.status(200).json({
      message: 'Lấy chi tiết lịch sử làm bài thành công',
      data: {
        attempt,
        practice,
        user
      }
    });
  } catch (error) {
    console.error('[practiceController][getPracticeAttemptDetails] Lỗi lấy chi tiết lịch sử', error);
    return res.status(500).json({ message: 'Không thể lấy chi tiết lịch sử làm bài' });
  }
};

// === exports ===
module.exports = {
  getPublicPractices,
  getAdminPractices,
  createPractice,
  getPracticeForLearner,
  getPracticeDetails,
  updatePracticeContent,
  updatePracticeInfo,
  deletePractice,
  submitPracticeAttempt,
  getMyPracticeAttempts,
  getPracticeAttemptsForAdmin,
  getPracticeAttemptDetails,
  uploadPracticeMedia,
  importPractice
};

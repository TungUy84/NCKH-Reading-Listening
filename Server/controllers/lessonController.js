const Lesson = require('../models/Lesson');
const {
  ALLOWED_SKILLS,
  ALLOWED_LEVEL_GROUPS,
  parsePagination,
  buildFilters
} = require('../utils/lessonHelper');

const ADMIN_SELECT_FIELDS = '_id title summary skill levelGroup isActive viewCount coverImage createdBy updatedAt createdAt';
const PUBLIC_SUMMARY_FIELDS = '_id title summary skill levelGroup coverImage viewCount createdAt updatedAt';
const PUBLIC_DETAIL_FIELDS = '_id title summary content skill levelGroup coverImage viewCount createdAt updatedAt';

const formatPagination = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit) || 1)
});

const handleValidationError = (error) => {
  if (error?.name !== 'ValidationError') {
    return null;
  }
  return Object.values(error.errors || {}).map((item) => item.message).join('; ');
};

// Lấy danh sách bài học công khai dành cho học viên (chỉ trả bài đã xuất bản)
const getPublicLessons = async (req, res) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const filters = buildFilters(req.query, false);

    const [items, total] = await Promise.all([
      Lesson.find(filters)
        .select(PUBLIC_SUMMARY_FIELDS)
        .sort({ createdAt: -1, updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Lesson.countDocuments(filters)
    ]);

    return res.status(200).json({
      message: 'Lấy danh sách bài học thành công',
      data: {
        items,
        pagination: formatPagination(page, limit, total)
      }
    });
  } catch (error) {
    console.error('[lessonController][getPublicLessons] Error', error);
    return res.status(500).json({ message: 'Không thể lấy danh sách bài học' });
  }
};

// Lấy danh sách bài học cho admin (bao gồm cả bản nháp)
const getAdminLessons = async (req, res) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const filters = buildFilters(req.query, true);

    const [items, total] = await Promise.all([
      Lesson.find(filters)
        .select(ADMIN_SELECT_FIELDS)
        .populate('createdBy', 'firstName lastName email username')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Lesson.countDocuments(filters)
    ]);

    return res.status(200).json({
      message: 'Lấy danh sách bài học cho admin thành công',
      data: {
        items,
        pagination: formatPagination(page, limit, total)
      }
    });
  } catch (error) {
    console.error('[lessonController][getAdminLessons] Error', error);
    return res.status(500).json({ message: 'Không thể lấy danh sách bài học cho admin' });
  }
};

// Lấy chi tiết một bài học dành cho admin (kèm thông tin tạo/cập nhật)
const getLessonDetails = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const lesson = await Lesson.findById(lessonId)
      .populate('createdBy', 'firstName lastName email username');

    if (!lesson) {
      return res.status(404).json({ message: 'Không tìm thấy bài học' });
    }

    return res.status(200).json({
      message: 'Lấy chi tiết bài học thành công',
      lesson
    });
  } catch (error) {
    console.error('[lessonController][getLessonDetails] Error', error);
    return res.status(500).json({ message: 'Không thể lấy chi tiết bài học' });
  }
};

// Lấy chi tiết bài học cho học viên và tăng lượt xem
const getLessonForLearner = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findOneAndUpdate(
      { _id: lessonId, isActive: true },
      { $inc: { viewCount: 1 } },
      { new: true, projection: PUBLIC_DETAIL_FIELDS }
    ).lean();

    if (!lesson) {
      return res.status(404).json({ message: 'Bài học không tồn tại hoặc chưa được kích hoạt' });
    }

    return res.status(200).json({
      message: 'Lấy chi tiết bài học thành công',
      lesson
    });
  } catch (error) {
    console.error('[lessonController][getLessonForLearner] Error', error);
    return res.status(500).json({ message: 'Không thể lấy bài học' });
  }
};

// Tạo mới bài học từ nội dung admin gửi lên
const createLesson = async (req, res) => {
  try {
    const payload = req.body || {};

    if (!payload.title || typeof payload.title !== 'string' || !payload.title.trim()) {
      return res.status(400).json({ message: 'Tiêu đề bài học là bắt buộc' });
    }

    if (!payload.content || typeof payload.content !== 'string' || !payload.content.trim()) {
      return res.status(400).json({ message: 'Nội dung bài học là bắt buộc' });
    }

    if (!ALLOWED_SKILLS.includes(payload.skill)) {
      return res.status(400).json({ message: 'Kỹ năng không hợp lệ' });
    }

    if (!ALLOWED_LEVEL_GROUPS.includes(payload.levelGroup)) {
      return res.status(400).json({ message: 'Nhóm trình độ không hợp lệ' });
    }

    const lesson = await Lesson.create({
      title: payload.title.trim(),
      summary: typeof payload.summary === 'string' ? payload.summary.trim() : '',
      content: payload.content,
      skill: payload.skill,
      levelGroup: payload.levelGroup,
      coverImage: typeof payload.coverImage === 'string' ? payload.coverImage.trim() : '',
      isActive: Boolean(payload.isActive),
      createdBy: req.user?._id || req.user?.id
    });

    return res.status(201).json({
      message: 'Tạo bài học thành công',
      lesson
    });
  } catch (error) {
    console.error('[lessonController][createLesson] Error', error);
    const validationMessage = handleValidationError(error);
    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }
    return res.status(500).json({ message: 'Không thể tạo bài học, vui lòng thử lại sau' });
  }
};

// Cập nhật bài học hiện có (tiêu đề, nội dung, trạng thái xuất bản)
const updateLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const payload = req.body || {};
    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({ message: 'Không tìm thấy bài học để cập nhật' });
    }

    if (payload.title && typeof payload.title === 'string') {
      const trimmedTitle = payload.title.trim();
      if (!trimmedTitle.length) {
        return res.status(400).json({ message: 'Tiêu đề bài học không được để trống' });
      }
      lesson.title = trimmedTitle;
    }

    if (typeof payload.summary === 'string') {
      lesson.summary = payload.summary.trim();
    }

    if (typeof payload.content === 'string') {
      if (!payload.content.trim()) {
        return res.status(400).json({ message: 'Nội dung bài học không được để trống' });
      }
      lesson.content = payload.content;
    }

    if (payload.skill && ALLOWED_SKILLS.includes(payload.skill)) {
      lesson.skill = payload.skill;
    }

    if (payload.levelGroup && ALLOWED_LEVEL_GROUPS.includes(payload.levelGroup)) {
      lesson.levelGroup = payload.levelGroup;
    }

    if (typeof payload.coverImage === 'string') {
      lesson.coverImage = payload.coverImage.trim();
    }

    if (typeof payload.isActive === 'boolean') {
      lesson.isActive = payload.isActive;
    }

    await lesson.save();

    return res.status(200).json({
      message: 'Cập nhật bài học thành công',
      lesson
    });
  } catch (error) {
    console.error('[lessonController][updateLesson] Error', error);
    const validationMessage = handleValidationError(error);
    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }
    return res.status(500).json({ message: 'Không thể cập nhật bài học' });
  }
};

// Xóa bài học vĩnh viễn khỏi hệ thống
const deleteLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const lesson = await Lesson.findByIdAndDelete(lessonId);

    if (!lesson) {
      return res.status(404).json({ message: 'Không tìm thấy bài học để xóa' });
    }

    return res.status(200).json({ message: 'Xóa bài học thành công' });
  } catch (error) {
    console.error('[lessonController][deleteLesson] Error', error);
    return res.status(500).json({ message: 'Không thể xóa bài học' });
  }
};

module.exports = {
  getPublicLessons,
  getAdminLessons,
  getLessonDetails,
  getLessonForLearner,
  createLesson,
  updateLesson,
  deleteLesson
};

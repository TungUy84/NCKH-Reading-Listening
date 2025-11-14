const Lesson = require('../models/Lesson');

// Biến cấu hình dùng chung giữa controller và client
const ALLOWED_SKILLS = Lesson.ALLOWED_SKILLS || ['reading', 'listening'];
const ALLOWED_LEVEL_GROUPS = Lesson.ALLOWED_LEVEL_GROUPS || ['AV1-AV3', 'AV4-AV5', 'AV6', 'AV7'];

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

// Hàm chuẩn hóa tham số phân trang từ query string
const parsePagination = (query = {}) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limitCandidate = parseInt(query.limit, 10);
  const normalizedLimit = Number.isFinite(limitCandidate) ? limitCandidate : DEFAULT_LIMIT;
  const limit = Math.max(1, Math.min(normalizedLimit, MAX_LIMIT));
  return { page, limit };
};
// Hàm xây dựng bộ lọc tìm kiếm bài học theo yêu cầu admin/learner
const buildFilters = (query = {}, includeDraft = false) => {
  const filters = {};

  const skill = typeof query.skill === 'string' ? query.skill.trim() : '';
  if (skill && ALLOWED_SKILLS.includes(skill)) {
    filters.skill = skill;
  }

  const levelGroup = typeof query.levelGroup === 'string' ? query.levelGroup.trim() : '';
  if (levelGroup && ALLOWED_LEVEL_GROUPS.includes(levelGroup)) {
    filters.levelGroup = levelGroup;
  }

  const keyword = typeof query.keyword === 'string' ? query.keyword.trim() : '';
  if (keyword) {
    filters.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { summary: { $regex: keyword, $options: 'i' } }
    ];
  }

  if (!includeDraft) {
    filters.isActive = true;
  } else if (typeof query.status === 'string') {
    if (query.status === 'active') {
      filters.isActive = true;
    } else if (query.status === 'inactive') {
      filters.isActive = false;
    }
  }

  return filters;
};

module.exports = {
  ALLOWED_SKILLS,
  ALLOWED_LEVEL_GROUPS,
  parsePagination,
  buildFilters
};

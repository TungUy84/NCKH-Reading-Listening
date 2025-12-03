const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const ALLOWED_SKILLS = ['reading', 'listening'];
const ALLOWED_LEVEL_GROUPS = ['AV1-AV3', 'AV4-AV5', 'AV6', 'AV7'];
const MAX_LIMIT = 50;
const PRACTICE_MEDIA_DIR = path.join(__dirname, '..', 'uploads', 'practices', 'media');

// Sinh ObjectId an toàn ngay cả khi giá trị đầu vào trống hoặc sai định dạng.
const toObjectId = (value) => {
	if (value && mongoose.Types.ObjectId.isValid(value)) {
		return new mongoose.Types.ObjectId(value);
	}
	return new mongoose.Types.ObjectId();
};

// Chuẩn hóa danh sách section và đảm bảo mỗi section có _id ổn định.
const buildSections = (sections = []) => {
	if (!Array.isArray(sections)) return [];

	return sections.map((section, index) => {
		const normalized = section && typeof section === 'object' ? { ...section } : {};

		const title = typeof normalized.title === 'string' && normalized.title.trim()
			? normalized.title.trim()
			: `Section ${index + 1}`;

		return {
			...normalized,
			_id: toObjectId(section?._id),
			title,
			passage: typeof normalized.passage === 'string' ? normalized.passage : '',
			mediaBlocks: []
		};
	});
};

// Chuẩn hóa câu hỏi và gán sectionId dựa trên sectionIndex nếu có.
const buildQuestions = (questions = [], sections = []) => {
	if (!Array.isArray(questions)) return [];
	const fallbackSectionId = sections[0]?._id;

	return questions.map((question, index) => {
		const rawSectionIndex = typeof question?.sectionIndex === 'number' && question.sectionIndex >= 0
			? question.sectionIndex
			: null;
		const sectionFromIndex = rawSectionIndex !== null ? sections[rawSectionIndex] : undefined;

		const options = Array.isArray(question?.options) ? question.options.map((option) => ({
			text: String(option?.text || '').trim(),
			isCorrect: Boolean(option?.isCorrect)
		})).filter((option) => option.text) : [];

		const pairs = Array.isArray(question?.matchingPairs) ? question.matchingPairs.map((pair) => ({
			prompt: String(pair?.prompt || '').trim(),
			correctOption: String(pair?.correctOption || '').trim()
		})).filter((pair) => pair.prompt && pair.correctOption) : [];

		const answers = Array.isArray(question?.correctAnswers)
			? question.correctAnswers.map((answer) => String(answer || '').trim()).filter(Boolean)
			: [];

		const normalized = {
			...question,
			questionNumber: question?.questionNumber || index + 1,
			type: question?.type || 'multi_choice',
			allowMultiple: Boolean(question?.allowMultiple),
			content: String(question?.content || '').trim(),
			passage: typeof question?.passage === 'string' ? question.passage : undefined,
			options,
			matchingPairs: pairs,
			correctAnswers: answers,
			explanation: typeof question?.explanation === 'string' ? question.explanation : '',
			sectionId: question?.sectionId || sectionFromIndex?._id || fallbackSectionId || undefined
		};

		delete normalized.sectionIndex;
		return normalized;
	});
};

// Chuẩn hóa tham số phân trang và giới hạn số bản ghi trả về.
const parsePagination = (query = {}) => {
	const page = Math.max(parseInt(query.page, 10) || 1, 1);
	const limit = Math.min(parseInt(query.limit, 10) || 10, MAX_LIMIT);
	return { page, limit };
};

// Chuẩn hóa bộ lọc tìm kiếm dựa trên query string từ client.
const buildFilters = (query = {}, includeInactive = false) => {
	const filters = {};

	if (!includeInactive) {
		filters.isActive = true;
	}

	if (query.skill && ALLOWED_SKILLS.includes(query.skill)) {
		filters.skill = query.skill;
	}

	if (query.levelGroup && ALLOWED_LEVEL_GROUPS.includes(query.levelGroup)) {
		filters.levelGroup = query.levelGroup;
	}

	if (typeof query.keyword === 'string' && query.keyword.trim().length) {
		filters.title = { $regex: query.keyword.trim(), $options: 'i' };
	}

	if (typeof query.isActive !== 'undefined' && includeInactive) {
		filters.isActive = query.isActive === 'true';
	}

	return filters;
};

// Đảm bảo thư mục lưu trữ media tồn tại trước khi ghi file.
const ensureMediaDir = () => {
	if (!fs.existsSync(PRACTICE_MEDIA_DIR)) {
		fs.mkdirSync(PRACTICE_MEDIA_DIR, { recursive: true });
	}
};

// Xóa các file media không còn sử dụng nữa.
const deletePracticeMediaFiles = async (mediaBlocks = []) => {
	const tasks = mediaBlocks
		.map((block) => block?.url)
		.filter(Boolean)
		.map((url) => {
			const normalized = String(url).replace(/^\//, '');
			return path.join(__dirname, '..', '..', normalized);
		});

	await Promise.allSettled(tasks.map(async (filePath) => {
		try {
			if (fs.existsSync(filePath)) {
				await fs.promises.unlink(filePath);
			}
		} catch (error) {
			console.warn('[practiceHelper] Không thể xóa file media', filePath, error.message);
		}
	}));
};

module.exports = {
	ALLOWED_SKILLS,
	ALLOWED_LEVEL_GROUPS,
	buildSections,
	buildQuestions,
	parsePagination,
	buildFilters,
	ensureMediaDir,
	deletePracticeMediaFiles
};

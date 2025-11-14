const mongoose = require('mongoose');

// Danh sách kỹ năng được chấp nhận cho bài học
const ALLOWED_SKILLS = ['reading', 'listening'];
// Danh sách nhóm trình độ được chấp nhận cho bài học
const ALLOWED_LEVEL_GROUPS = ['AV1-AV3', 'AV4-AV5', 'AV6', 'AV7'];

// Schema mô tả cấu trúc bài học lý thuyết để tái sử dụng trong admin và người học
const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Tiêu đề bài học là bắt buộc'],
        trim: true,
        maxlength: [200, 'Tiêu đề bài học không vượt quá 200 ký tự']
    },
    summary: {
        type: String,
        default: '',
        maxlength: [500, 'Tóm tắt bài học không vượt quá 500 ký tự']
    },
    content: {
        type: String,
        required: true
    },
    skill: {
        type: String,
        enum: ALLOWED_SKILLS,
        required: [true, 'Kỹ năng của bài học là bắt buộc']
    },
    levelGroup: {
        type: String,
        enum: ALLOWED_LEVEL_GROUPS,
        required: [true, 'Nhóm trình độ của bài học là bắt buộc']
    },
    coverImage: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: false
    },
    viewCount: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

lessonSchema.statics.ALLOWED_SKILLS = ALLOWED_SKILLS;
lessonSchema.statics.ALLOWED_LEVEL_GROUPS = ALLOWED_LEVEL_GROUPS;

module.exports = mongoose.model('Lesson', lessonSchema);

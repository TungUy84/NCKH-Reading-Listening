const mongoose = require('mongoose');

// Media đính kèm cho passage hoặc câu hỏi trong bài ôn luyện
const mediaBlockSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['image', 'audio'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    default: ''
  },
  transcript: {
    type: String,
    default: ''
  }
}, { _id: false });

// Thông tin từng section trong bài ôn luyện
const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tiêu đề section là bắt buộc']
  },
  passage: {
    type: String,
    default: ''
  },
  audio: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  mediaBlocks: {
    type: [mediaBlockSchema],
    default: []
  }
});

// Cấu trúc câu hỏi ôn luyện
const questionSchema = new mongoose.Schema({
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  questionNumber: {
    type: Number,
    required: [true, 'Số thứ tự câu hỏi là bắt buộc']
  },
  type: {
    type: String,
    enum: ['multi_choice', 'short_answer', 'matching', 'dropdown'],
    required: [true, 'Loại câu hỏi là bắt buộc']
  },
  allowMultiple: {
    type: Boolean,
    default: false
  },
  content: {
    type: String,
    required: [true, 'Nội dung câu hỏi là bắt buộc']
  },
  options: [{
    text: {
      type: String,
      required: true
    },
    isCorrect: {
      type: Boolean,
      default: false
    }
  }],
  matchingPairs: [{
    prompt: {
      type: String,
      required: true
    },
    correctOption: {
      type: String,
      required: true
    }
  }],
  correctAnswers: {
    type: [String],
    default: []
  },
  explanation: {
    type: String,
    default: ''
  },
  points: {
    type: Number,
    default: 1
  }
});

// Schema chính cho bài ôn luyện
const practiceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tiêu đề bài ôn luyện là bắt buộc'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  skill: {
    type: String,
    enum: ['reading', 'listening'],
    required: [true, 'Kỹ năng là bắt buộc']
  },
  levelGroup: {
    type: String,
    enum: ['AV1-AV3', 'AV4-AV5', 'AV6', 'AV7'],
    required: [true, 'Nhóm level là bắt buộc']
  },
  estimatedTime: {
    type: Number,
    default: 0
  },
  sections: {
    type: [sectionSchema],
    default: []
  },
  questions: {
    type: [questionSchema],
    default: []
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true 
});

// Tự động tính tổng câu hỏi và điểm trước khi lưu
practiceSchema.pre('save', function handleAggregateFields(next) {
  this.totalQuestions = this.questions.length;
  this.totalPoints = this.questions.reduce((sum, question) => sum + (question.points || 0), 0);
  next();
});

const Practice = mongoose.model('Practice', practiceSchema);

module.exports = Practice;

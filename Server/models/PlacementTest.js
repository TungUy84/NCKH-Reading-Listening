const mongoose = require('mongoose');

// Schema media đính kèm trong passage
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

// Schema cho từng section trong bài test (như IELTS Reading có 3 passages)
const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tiêu đề section là bắt buộc']
  },
  passage: {
    type: String, // Đoạn văn chính cho reading
    default: ''
  },
  audio: {
    type: String, // URL file audio cho listening
    default: ''
  },
  image: {
    type: String, // URL hình ảnh nếu có
    default: ''
  },
  mediaBlocks: {
    type: [mediaBlockSchema],
    default: []
  }
});

// Schema cho từng câu hỏi trong bài test
const questionSchema = new mongoose.Schema({
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  questionNumber: {
    type: Number,
    required: [true, 'Số câu hỏi là bắt buộc']
  },
  type: {
    type: String,
    enum: [
      'multi_choice',   // Có thể chọn 1 hoặc nhiều đáp án
      'short_answer',   // Trả lời ngắn
      'matching',       // Ghép cặp
      'dropdown'        // Chọn đáp án từ menu thả xuống
    ],
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
  correctAnswers: [String], // Đáp án đúng
  explanation: {
    type: String,
    default: ''
  }
});

// Schema chính cho Placement Test
const placementTestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tiêu đề bài test là bắt buộc'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  instructions: {
    type: [String], // Hướng dẫn chung cho cả bài test
    default: ['Hãy đọc kỹ câu hỏi và chọn đáp án đúng nhất.']
  },
  category: {
    type: String,
    enum: ['listening', 'reading'],
    required: [true, 'Loại bài test là bắt buộc']
  },
  testType: {
    type: String,
    enum: ['placement', 'mock-exam', 'checkpoint'],
    default: 'placement',
    required: [true, 'Mục đích sử dụng bài test là bắt buộc']
  },
  timeLimit: {
    type: Number, // Thời gian làm bài (phút)
    required: [true, 'Thời gian làm bài là bắt buộc'],
    min: [1, 'Thời gian tối thiểu là 1 phút']
  },
  sections: [sectionSchema], // Các section trong bài test
  questions: [questionSchema], // Tất cả câu hỏi trong bài test
  totalQuestions: {
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

// Tự động tính totalQuestions
placementTestSchema.pre('save', function(next) {
  this.totalQuestions = this.questions.length;
  next();
});

// Schema cho kết quả test của người dùng
const placementResultSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PlacementTest',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Null nếu user chưa đăng nhập
  },
  userInfo: {
    name: String,
    email: String,
    phone: String
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    selectedOptions: [String], // Các đáp án đã chọn
    userAnswer: String, // Câu trả lời tự luận
    matchingAnswers: [{
      prompt: String,
      selected: String
    }],
    isCorrect: Boolean,
    pointsEarned: Number
  }],
  score: {
    earnedPoints: Number,
    percentage: Number
  },
  avLevel: {
    type: String,
    enum: ['AV1-AV3', 'AV4-AV5', 'AV6', 'AV7']
  },
  recommendation: String,
  completedAt: {
    type: Date,
    default: Date.now
  },
  timeSpent: Number // Thời gian làm bài (giây)
}, {
  timestamps: true
});

// Method để tính điểm IELTS và level AV
placementResultSchema.methods.calculateLevel = function() {
  const percentage = this.score.percentage;
  
  let avLevel, recommendation;
  
  if (percentage > 80) {
    // AV7 (> 80%)
    avLevel = 'AV7';
    recommendation = 'Xuất sắc! Bắt đầu cải thiện bằng các phương pháp học sâu, tích hợp IELTS, TOEIC, ...';
  } else if (percentage > 65) {
    // AV6 (65-80%)
    avLevel = 'AV6';
    recommendation = 'Mức cao trung cấp, nắm được các ý chính, tập trung vào việc nâng cao khả năng nghe những bài với vốn từ cao hơn.';
  } else if (percentage > 35) {
    // AV4-AV5 (35-65%)
    avLevel = 'AV4-AV5';
    recommendation = 'Mức trung cấp, tập trung vào nâng cao tốc độ nghe và hiểu ý chính trong các đoạn hội thoại dài hơn.';
  } else {
    // AV1-AV3 (0-35%)
    avLevel = 'AV1-AV3';
    recommendation = 'Mức cơ bản, cần cải thiện khả năng nhận diện từ vựng và nghe hiểu hội thoại ngắn.';
  }
  
  this.avLevel = avLevel;
  this.recommendation = recommendation;
};

const PlacementTest = mongoose.model('PlacementTest', placementTestSchema);
const PlacementResult = mongoose.model('PlacementResult', placementResultSchema);

module.exports = {
  PlacementTest,
  PlacementResult
};

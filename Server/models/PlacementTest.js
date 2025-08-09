const mongoose = require('mongoose');

// Schema cho từng câu hỏi trong bài test
const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['single_choice', 'multiple_choice', 'fill_blank', 'essay'],
    required: [true, 'Loại câu hỏi là bắt buộc']
  },
  content: {
    type: String,
    required: [true, 'Nội dung câu hỏi là bắt buộc']
  },
  passage: {
    type: String, // Đoạn văn dài cho reading comprehension
    default: ''
  },
  media: {
    image: {
      type: String, // URL của hình ảnh
      default: ''
    },
    audio: {
      type: String, // URL của file audio
      default: ''
    }
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
  correctAnswers: [String], // Đáp án đúng cho các loại câu hỏi khác nhau
  explanation: {
    type: String,
    default: ''
  },
  points: {
    type: Number,
    default: 1
  },
  skill: {
    type: String,
    enum: ['listening', 'reading', 'grammar', 'vocabulary'],
    required: [true, 'Kỹ năng kiểm tra là bắt buộc']
  },
  level: {
    type: String,
    enum: ['AV1', 'AV2', 'AV3', 'AV4', 'AV5', 'AV6', 'AV7'],
    required: [true, 'Cấp độ câu hỏi là bắt buộc']
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
    type: [String], // Thay đổi từ String thành Array of String
    default: ['Hãy đọc kỹ câu hỏi và chọn đáp án đúng nhất.']
  },
  timeLimit: {
    type: Number, // Thời gian làm bài (phút)
    default: 60
  },
  category: {
    type: String,
    enum: ['listening', 'reading', 'general'],
    default: 'general',
    required: [true, 'Loại bài test là bắt buộc']
  },
  questions: [questionSchema],
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

// Tự động tính totalQuestions và totalPoints
placementTestSchema.pre('save', function(next) {
  this.totalQuestions = this.questions.length;
  this.totalPoints = this.questions.reduce((sum, question) => sum + question.points, 0);
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
    isCorrect: Boolean,
    pointsEarned: Number
  }],
  score: {
    totalPoints: Number,
    earnedPoints: Number,
    percentage: Number
  },
  ieltsRange: {
    min: Number,
    max: Number
  },
  avLevel: {
    type: String,
    enum: ['AV1', 'AV2', 'AV3', 'AV4', 'AV5', 'AV6', 'AV7', 'Đạt chuẩn đầu ra']
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
placementResultSchema.methods.calculateIELTSAndLevel = function() {
  const percentage = this.score.percentage;
  
  let ieltsMin, ieltsMax, avLevel, recommendation;
  
  if (percentage < 30) {
    // AV1-AV3 (0-3.0)
    ieltsMin = 0;
    ieltsMax = 3.0;
    avLevel = percentage < 10 ? 'AV1' : percentage < 20 ? 'AV2' : 'AV3';
    recommendation = 'Mức cơ bản, cần cải thiện khả năng nhận diện từ vựng và nghe hiểu hội thoại ngắn.';
  } else if (percentage < 50) {
    // AV4-AV5 (3.0-4.0)
    ieltsMin = 3.0;
    ieltsMax = 4.0;
    avLevel = percentage < 40 ? 'AV4' : 'AV5';
    recommendation = 'Mức trung cấp, tập trung vào nâng cao tốc độ nghe và hiểu ý chính trong các đoạn hội thoại dài hơn.';
  } else if (percentage < 70) {
    // AV6 (4.0-5.0)
    ieltsMin = 4.0;
    ieltsMax = 5.0;
    avLevel = 'AV6';
    recommendation = 'Mức cao trung cấp, nắm được các ý chính, tập trung vào việc nâng cao khả năng nghe những bài với vốn từ cao hơn.';
  } else if (percentage < 85) {
    // AV7 (5.0-6.0)
    ieltsMin = 5.0;
    ieltsMax = 6.0;
    avLevel = 'AV7';
    recommendation = 'Mức khá, thích nghi được với các bài nghe dài hơn, nắm được ý chính, đánh đố.';
  } else {
    // Đạt chuẩn đầu ra (>=6.0)
    ieltsMin = 6.0;
    ieltsMax = 9.0;
    avLevel = 'Đạt chuẩn đầu ra';
    recommendation = 'Xuất sắc! Bắt đầu cải thiện bằng các phương pháp học sâu, tích hợp IELTS, TOEIC, ...';
  }
  
  this.ieltsRange = { min: ieltsMin, max: ieltsMax };
  this.avLevel = avLevel;
  this.recommendation = recommendation;
};

const PlacementTest = mongoose.model('PlacementTest', placementTestSchema);
const PlacementResult = mongoose.model('PlacementResult', placementResultSchema);

module.exports = {
  PlacementTest,
  PlacementResult
};

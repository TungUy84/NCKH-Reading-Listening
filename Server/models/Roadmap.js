const mongoose = require('mongoose');

// Schema cho Roadmap Template - Cố định 4 roadmap cho 4 level groups
const roadmapSchema = new mongoose.Schema({
  levelGroup: {
    type: String,
    enum: ['AV1-AV3', 'AV4-AV5', 'AV6', 'AV7'],
    required: true,
    unique: true  // Mỗi levelGroup chỉ có 1 roadmap template
  },
  title: {
    type: String,
    required: true,
    maxlength: [200, 'Tiêu đề không quá 200 ký tự']
  },
  description: {
    type: String,
    maxlength: [1000, 'Mô tả không quá 1000 ký tự']
  },
  estimatedDuration: {
    type: Number,  // Số tuần dự kiến hoàn thành
    default: 6
  },
  requirements: {
    totalLessons: {
      type: Number,
      default: 0
    },
    totalPractices: {
      type: Number,
      default: 0
    },
    passingScore: {
      type: Number,
      default: 70,  // Phần trăm điểm cần đạt để pass checkpoint
      min: 0,
      max: 100
    }
  },
  
  // Content được chia theo 2 skills
  content: {
    reading: {
      lessons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
      }],
      practices: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Practice'
      }]
    },
    listening: {
      lessons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
      }],
      practices: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Practice'
      }]
    }
  },
  
  // Bài test checkpoint để pass sang chặng tiếp theo
  checkpointTest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PlacementTest'
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { 
  timestamps: true 
});

// Pre-save hook để tính tổng số lessons và practices
roadmapSchema.pre('save', function(next) {
  this.requirements.totalLessons = 
    (this.content.reading.lessons?.length || 0) + 
    (this.content.listening.lessons?.length || 0);
  
  this.requirements.totalPractices = 
    (this.content.reading.practices?.length || 0) + 
    (this.content.listening.practices?.length || 0);
  
  next();
});

// Static method để lấy tất cả level groups
roadmapSchema.statics.LEVEL_GROUPS = ['AV1-AV3', 'AV4-AV5', 'AV6', 'AV7'];

// Method để validate content match với levelGroup
roadmapSchema.methods.validateContent = function() {
  // Có thể thêm logic validate lessons/practices phải match với levelGroup
  return true;
};

const Roadmap = mongoose.model('Roadmap', roadmapSchema);

module.exports = Roadmap;

const mongoose = require('mongoose');

// Schema cho progress của mỗi stage
const stageProgressSchema = new mongoose.Schema({
  reading: {
    completedLessons: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    }],
    completedPractices: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Practice'
    }]
  },
  listening: {
    completedLessons: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    }],
    completedPractices: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Practice'
    }]
  },
  overallPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, { _id: false });

// Schema cho mỗi stage trong roadmap
const roadmapStageSchema = new mongoose.Schema({
  levelGroup: {
    type: String,
    enum: ['AV1-AV3', 'AV4-AV5', 'AV6', 'AV7'],
    required: true
  },
  roadmapId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roadmap',
    required: true
  },
  status: {
    type: String,
    enum: ['locked', 'in-progress', 'checkpoint-ready', 'completed'],
    default: 'locked'
  },
  startedAt: Date,
  completedAt: Date,
  
  // Content in this stage (actual lessons/practices added by admin)
  content: {
    reading: {
      lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
      practices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Practice' }]
    },
    listening: {
      lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
      practices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Practice' }]
    }
  },
  
  // Progress tracking
  progress: {
    type: stageProgressSchema,
    default: () => ({
      reading: { completedLessons: [], completedPractices: [] },
      listening: { completedLessons: [], completedPractices: [] },
      overallPercentage: 0
    })
  },
  
  // Checkpoint test result
  checkpointTestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PlacementTest'
  },
  checkpointResult: {
    attemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlacementResult'
    },
    score: Number,
    passed: Boolean,
    attemptedAt: Date
  }
}, { _id: true });

// User Roadmap Schema - Instance cá nhân cho mỗi user
const userRoadmapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Thông tin lộ trình
  currentLevel: {
    type: String,
    enum: ['AV1-AV3', 'AV4-AV5', 'AV6', 'AV7'],
    required: true
  },
  targetLevel: {
    type: String,
    enum: ['AV1-AV3', 'AV4-AV5', 'AV6', 'AV7'],
    required: true
  },
  
  // Danh sách các chặng cần hoàn thành
  stages: [roadmapStageSchema],
  
  // Overall roadmap status
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'abandoned'],
    default: 'active'
  },
  
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
  
}, { timestamps: true });

// Index để query nhanh
userRoadmapSchema.index({ userId: 1, status: 1 });
userRoadmapSchema.index({ userId: 1 }, { unique: true }); // Mỗi user chỉ có 1 active roadmap

// Method tính tổng progress của toàn bộ roadmap
userRoadmapSchema.methods.calculateOverallProgress = function() {
  if (!this.stages || this.stages.length === 0) return 0;
  
  const totalStages = this.stages.length;
  const completedStages = this.stages.filter(s => s.status === 'completed').length;
  
  return totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;
};

// Method kiểm tra xem có thể làm checkpoint test không
userRoadmapSchema.methods.canTakeCheckpoint = function(stageIndex) {
  if (stageIndex < 0 || stageIndex >= this.stages.length) return false;
  
  const stage = this.stages[stageIndex];
  if (!stage || stage.status === 'completed') return false;
  
  // Phải hoàn thành 100% content
  return stage.progress.overallPercentage >= 100;
};

// Method tính progress cho một stage
userRoadmapSchema.methods.calculateStageProgress = function(stageIndex) {
  if (stageIndex < 0 || stageIndex >= this.stages.length) return;
  
  const stage = this.stages[stageIndex];
  const progress = stage.progress;
  const content = stage.content || { reading: { lessons: [], practices: [] }, listening: { lessons: [], practices: [] } };
  
  // Tính tổng số items đã hoàn thành
  const completedReading = 
    progress.reading.completedLessons.length + 
    progress.reading.completedPractices.length;
  
  const completedListening = 
    progress.listening.completedLessons.length + 
    progress.listening.completedPractices.length;
  
  // Tính tổng số items từ content thực tế được add vào stage
  const totalReading = 
    (content.reading.lessons?.length || 0) + 
    (content.reading.practices?.length || 0);
  
  const totalListening = 
    (content.listening.lessons?.length || 0) + 
    (content.listening.practices?.length || 0);
  
  const totalItems = totalReading + totalListening;
  const completedItems = completedReading + completedListening;
  
  // Tính percentage
  const percentage = totalItems > 0 
    ? Math.round((completedItems / totalItems) * 100) 
    : 0;
  
  stage.progress.overallPercentage = percentage;
  
  // Nếu đạt 100%, chuyển status sang checkpoint-ready
  if (percentage >= 100 && stage.status === 'in-progress') {
    stage.status = 'checkpoint-ready';
  }
};

// Method để unlock stage tiếp theo sau khi pass checkpoint
userRoadmapSchema.methods.unlockNextStage = function(currentStageIndex) {
  if (currentStageIndex < 0 || currentStageIndex >= this.stages.length - 1) {
    return false; // Đã là stage cuối cùng
  }
  
  const currentStage = this.stages[currentStageIndex];
  const nextStage = this.stages[currentStageIndex + 1];
  
  // Mark current stage as completed
  currentStage.status = 'completed';
  currentStage.completedAt = new Date();
  
  // Unlock next stage
  nextStage.status = 'in-progress';
  nextStage.startedAt = new Date();
  
  // Nếu là stage cuối cùng được unlock, check xem có hoàn thành roadmap không
  if (currentStageIndex === this.stages.length - 2) {
    // Stage tiếp theo là stage cuối
    return true;
  }
  
  return true;
};

// Pre-save hook để update lastActivityAt
userRoadmapSchema.pre('save', function(next) {
  this.lastActivityAt = new Date();
  next();
});

const UserRoadmap = mongoose.model('UserRoadmap', userRoadmapSchema);

module.exports = UserRoadmap;

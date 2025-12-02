const mongoose = require('mongoose');

const matchingAnswerSchema = new mongoose.Schema({
  prompt: {
    type: String,
    default: ''
  },
  selected: {
    type: String,
    default: ''
  }
}, { _id: false });

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  questionNumber: {
    type: Number,
    default: 0
  },
  type: {
    type: String,
    enum: ['multi_choice', 'short_answer', 'matching', 'dropdown'],
    required: true
  },
  allowMultiple: {
    type: Boolean,
    default: false
  },
  selectedOptions: {
    type: [String],
    default: []
  },
  userAnswer: {
    type: String,
    default: ''
  },
  matchingAnswers: {
    type: [matchingAnswerSchema],
    default: []
  },
  correctAnswers: {
    type: [String],
    default: []
  },
  earnedPoints: {
    type: Number,
    default: 0
  },
  points: {
    type: Number,
    default: 0
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  isSkipped: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const placementTestResultSchema = new mongoose.Schema({
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PlacementTest',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testType: {
    type: String,
    enum: ['placement', 'mock-exam'],
    required: true
  },
  category: {
    type: String,
    enum: ['reading', 'listening'],
    required: true
  },
  testTitle: {
    type: String,
    required: true
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  earnedPoints: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  correctCount: {
    type: Number,
    default: 0
  },
  incorrectCount: {
    type: Number,
    default: 0
  },
  skippedCount: {
    type: Number,
    default: 0
  },
  durationSeconds: {
    type: Number,
    default: 0
  },
  startedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  answers: {
    type: [answerSchema],
    default: []
  }
}, {
  timestamps: true
});

placementTestResultSchema.index({ userId: 1, testId: 1, createdAt: -1 });
placementTestResultSchema.index({ testId: 1, createdAt: -1 });
placementTestResultSchema.index({ userId: 1, testType: 1, createdAt: -1 });
placementTestResultSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('PlacementTestResult', placementTestResultSchema);

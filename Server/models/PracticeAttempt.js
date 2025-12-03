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
  isCorrect: {
    type: Boolean,
    default: false
  },
  isSkipped: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const practiceAttemptSchema = new mongoose.Schema({
  practiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Practice',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skill: {
    type: String,
    enum: ['reading', 'listening'],
    required: true
  },
  levelGroup: {
    type: String,
    enum: ['AV1-AV3', 'AV4-AV5', 'AV6', 'AV7'],
    required: true
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  earnedPoints: {
    type: Number,
    default: 0
  },
  score: {
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

practiceAttemptSchema.index({ userId: 1, practiceId: 1, createdAt: -1 });
practiceAttemptSchema.index({ practiceId: 1, createdAt: -1 });

module.exports = mongoose.model('PracticeAttempt', practiceAttemptSchema);

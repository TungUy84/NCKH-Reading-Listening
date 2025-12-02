const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Tiêu đề là bắt buộc'],
      trim: true,
      maxlength: [200, 'Tiêu đề không được vượt quá 200 ký tự'],
    },
    content: {
      type: String,
      required: [true, 'Nội dung là bắt buộc'],
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function(arr) {
          return arr.length <= 5;
        },
        message: 'Tối đa 5 ảnh'
      }
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    approvedAt: {
      type: Date,
      default: null,
      index: true,
    },
    comments: [{
      authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      content: {
        type: String,
        required: true,
        maxlength: [500, 'Comment không được vượt quá 500 ký tự'],
      },
      createdAt: {
        type: Date,
        default: Date.now,
      }
    }],
    likedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
  }
);

// Index compound cho query feed (approved blogs sorted by approvedAt)
blogSchema.index({ status: 1, approvedAt: -1 });

// Index cho query user's posts
blogSchema.index({ authorId: 1, status: 1 });

// Virtual cho likeCount
blogSchema.virtual('likeCount').get(function() {
  return this.likedBy ? this.likedBy.length : 0;
});

// Virtual cho commentCount
blogSchema.virtual('commentCount').get(function() {
  return this.comments ? this.comments.length : 0;
});

// Ensure virtuals are included in JSON
blogSchema.set('toJSON', { virtuals: true });
blogSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Blog', blogSchema);

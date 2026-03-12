const Blog = require('../models/Blog');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ========== MULTER CONFIG FOR IMAGE UPLOAD ==========
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.user.id;
    const uploadPath = path.join(__dirname, '../uploads/blogs', userId);
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (jpeg, jpg, png, webp)'), false);
  }
};

const uploadBlogImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB per file
}).array('images', 5);

// ========== USER FUNCTIONS ==========

/**
 * Tạo blog mới (status = pending)
 * POST /api/blogs
 */
const createBlog = async (req, res) => {
  try {
    const { title, content, images } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Tiêu đề và nội dung là bắt buộc'
      });
    }

    const blog = new Blog({
      title,
      content,
      images: images || [],
      authorId: req.user.id,
      status: 'pending',
    });

    await blog.save();

    await blog.populate('authorId', 'firstName lastName username avatar');

    res.status(201).json({
      success: true,
      message: 'Bài viết đã được tạo, chờ admin duyệt',
      data: blog
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo bài viết',
      error: error.message
    });
  }
};

/**
 * Lấy feed (approved blogs, sorted by approvedAt desc)
 * GET /api/blogs?page=1&limit=10
 */
const getPublicBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { status: 'approved' };

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort({ approvedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('authorId', 'firstName lastName username avatar')
        .lean(),
      Blog.countDocuments(query)
    ]);

    // Add isLikedByMe for logged-in users
    const userId = req.user?.id;
    const blogsWithLikeStatus = blogs.map(blog => ({
      ...blog,
      likeCount: blog.likeCount || 0,
      commentCount: blog.commentCount || 0,
      isLikedByMe: false, // Ở trang danh sách tổng quát có thể để mặc định hoặc xử lý nhẹ hơn
    }));

    res.json({
      success: true,
      data: {
        blogs: blogsWithLikeStatus,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách bài viết',
      error: error.message
    });
  }
};

/**
 * Lấy bài viết của tôi (all statuses)
 * GET /api/blogs/my-posts?status=pending&page=1&limit=10
 */
const getMyBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const query = { authorId: req.user.id };
    if (status) query.status = status;

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('authorId', 'firstName lastName username avatar')
        .lean(),
      Blog.countDocuments(query)
    ]);

    const blogsWithCounts = blogs.map(blog => ({
      ...blog,
      likeCount: blog.likedBy?.length || 0,
      commentCount: blog.comments?.length || 0,
      likedBy: undefined
    }));

    res.json({
      success: true,
      data: {
        blogs: blogsWithCounts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting my blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy bài viết của bạn',
      error: error.message
    });
  }
};

/**
 * Cập nhật blog (chỉ pending/rejected, reset về pending)
 * PUT /api/blogs/:id
 */
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, images } = req.body;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    // Only author can edit
    if (blog.authorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền sửa bài viết này'
      });
    }

    // Only pending/rejected can be edited
    if (blog.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Bài viết đã được duyệt không thể chỉnh sửa'
      });
    }

    // Update fields
    if (title) blog.title = title;
    if (content) blog.content = content;
    if (images !== undefined) blog.images = images;
    
    // Reset to pending after edit
    blog.status = 'pending';
    blog.approvedAt = null;

    await blog.save();
    await blog.populate('authorId', 'firstName lastName username avatar');

    res.json({
      success: true,
      message: 'Bài viết đã được cập nhật, chờ admin duyệt lại',
      data: blog
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật bài viết',
      error: error.message
    });
  }
};

/**
 * Xóa blog của mình
 * DELETE /api/blogs/:id
 */
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    // Only author can delete their own post
    if (blog.authorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa bài viết này'
      });
    }

    await Blog.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Bài viết đã được xóa'
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa bài viết',
      error: error.message
    });
  }
};

/**
 * Like/Unlike blog
 * POST /api/blogs/:id/like
 */
const likeBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    const likedIndex = blog.likedBy.findIndex(id => id.toString() === userId);

    if (likedIndex > -1) {
      // Unlike
      blog.likedBy.splice(likedIndex, 1);
    } else {
      // Like
      blog.likedBy.push(userId);
    }

    await blog.save();

    res.json({
      success: true,
      data: {
        isLiked: likedIndex === -1,
        likeCount: blog.likedBy.length
      }
    });
  } catch (error) {
    console.error('Error liking blog:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi like bài viết',
      error: error.message
    });
  }
};

/**
 * Thêm comment
 * POST /api/blogs/:id/comments
 */
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung comment là bắt buộc'
      });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    const comment = {
      authorId: req.user.id,
      content: content.trim(),
      createdAt: new Date()
    };

    blog.comments.push(comment);
    await blog.save();

    // Populate author info for the new comment
    const populatedBlog = await Blog.findById(id)
      .select('comments')
      .populate('comments.authorId', 'firstName lastName username avatar');

    const newComment = populatedBlog.comments[populatedBlog.comments.length - 1];

    res.status(201).json({
      success: true,
      message: 'Comment đã được thêm',
      data: newComment
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thêm comment',
      error: error.message
    });
  }
};

// ========== ADMIN FUNCTIONS ==========

/**
 * Lấy danh sách blog pending (chờ duyệt)
 * GET /api/blogs/admin/pending?page=1&limit=20
 */
const getPendingBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { status: 'pending' };

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('authorId', 'firstName lastName username avatar email')
        .lean(),
      Blog.countDocuments(query)
    ]);

    const blogsWithCounts = blogs.map(blog => ({
      ...blog,
      likeCount: blog.likedBy?.length || 0,
      commentCount: blog.comments?.length || 0,
      likedBy: undefined
    }));

    res.json({
      success: true,
      data: {
        blogs: blogsWithCounts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting pending blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách bài viết chờ duyệt',
      error: error.message
    });
  }
};

/**
 * Lấy danh sách blog approved/rejected
 * GET /api/blogs/admin/all?status=approved&page=1&limit=20
 */
const getAllBlogsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status; // approved or rejected

    const query = {};
    if (status && ['approved', 'rejected'].includes(status)) {
      query.status = status;
    } else {
      query.status = { $in: ['approved', 'rejected'] };
    }

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort({ approvedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('authorId', 'firstName lastName username avatar email')
        .lean(),
      Blog.countDocuments(query)
    ]);

    const blogsWithCounts = blogs.map(blog => ({
      ...blog,
      likeCount: blog.likedBy?.length || 0,
      commentCount: blog.comments?.length || 0,
      likedBy: undefined
    }));

    res.json({
      success: true,
      data: {
        blogs: blogsWithCounts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting blogs admin:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách bài viết',
      error: error.message
    });
  }
};

/**
 * Duyệt blog
 * PUT /api/blogs/:id/approve
 */
const approveBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    blog.status = 'approved';
    blog.approvedAt = new Date();

    await blog.save();
    await blog.populate('authorId', 'firstName lastName username avatar');

    res.json({
      success: true,
      message: 'Bài viết đã được duyệt',
      data: blog
    });
  } catch (error) {
    console.error('Error approving blog:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi duyệt bài viết',
      error: error.message
    });
  }
};

/**
 * Từ chối blog
 * PUT /api/blogs/:id/reject
 */
const rejectBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    blog.status = 'rejected';
    blog.approvedAt = null;

    await blog.save();
    await blog.populate('authorId', 'firstName lastName username avatar');

    res.json({
      success: true,
      message: 'Bài viết đã bị từ chối',
      data: blog
    });
  } catch (error) {
    console.error('Error rejecting blog:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi từ chối bài viết',
      error: error.message
    });
  }
};

/**
 * Admin xóa bất kỳ blog nào
 * DELETE /api/blogs/admin/:id
 */
const deleteBlogAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    await Blog.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Bài viết đã được xóa'
    });
  } catch (error) {
    console.error('Error deleting blog admin:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa bài viết',
      error: error.message
    });
  }
};

/**
 * Lấy thống kê blog
 * GET /api/blogs/admin/stats
 */
const getBlogStats = async (req, res) => {
  try {
    const totalBlogs = await Blog.countDocuments();
    const pendingBlogs = await Blog.countDocuments({ status: 'pending' });
    const approvedBlogs = await Blog.countDocuments({ status: 'approved' });
    const rejectedBlogs = await Blog.countDocuments({ status: 'rejected' });

    res.json({
      totalBlogs,
      pendingBlogs,
      approvedBlogs,
      rejectedBlogs
    });
  } catch (error) {
    console.error('Error getting blog stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê blog',
      error: error.message
    });
  }
};

module.exports = {
  uploadBlogImages,
  createBlog,
  getPublicBlogs,
  getMyBlogs,
  updateBlog,
  deleteBlog,
  likeBlog,
  addComment,
  getPendingBlogs,
  getAllBlogsAdmin,
  approveBlog,
  rejectBlog,
  deleteBlogAdmin,
  getBlogStats,
};

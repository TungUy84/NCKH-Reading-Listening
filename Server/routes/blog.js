const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/blogController');
const { protect, authorize } = require('../middleware/auth');

// ========== PUBLIC ROUTES ==========
// GET feed (approved blogs)
router.get('/', getPublicBlogs);

// ========== USER PROTECTED ROUTES ==========
// Upload images
router.post('/upload-images', protect, (req, res) => {
  uploadBlogImages(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không có file nào được upload'
      });
    }

    const imageUrls = req.files.map(file => {
      return `/uploads/blogs/${req.user.id}/${file.filename}`;
    });

    res.json({
      success: true,
      message: 'Upload ảnh thành công',
      data: { images: imageUrls }
    });
  });
});

// Create blog
router.post('/', protect, createBlog);

// Get my posts
router.get('/my-posts', protect, getMyBlogs);

// Update blog
router.put('/:id', protect, updateBlog);

// Delete blog
router.delete('/:id', protect, deleteBlog);

// Like/Unlike blog
router.post('/:id/like', protect, likeBlog);

// Add comment
router.post('/:id/comments', protect, addComment);

// ========== ADMIN ROUTES ==========
// Get blog statistics
router.get('/admin/stats', protect, authorize('admin'), getBlogStats);

// Get pending blogs
router.get('/admin/pending', protect, authorize('admin'), getPendingBlogs);

// Get all blogs (approved/rejected)
router.get('/admin/all', protect, authorize('admin'), getAllBlogsAdmin);

// Approve blog
router.put('/:id/approve', protect, authorize('admin'), approveBlog);

// Reject blog
router.put('/:id/reject', protect, authorize('admin'), rejectBlog);

// Delete blog (admin)
router.delete('/admin/:id', protect, authorize('admin'), deleteBlogAdmin);

module.exports = router;

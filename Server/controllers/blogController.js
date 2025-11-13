// const Blog = require("../models/Blog");

// // Lấy tất cả blog, sắp xếp mới nhất lên đầu
// exports.getBlogs = async (req, res) => {
//   try {
//     const blogs = await Blog.find().sort({ createdAt: -1 });
//     res.json(blogs);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // Lấy 1 blog theo id
// exports.getBlog = async (req, res) => {
//   try {
//     const blog = await Blog.findById(req.params.id);
//     res.json(blog);
//   } catch (err) {
//     res.status(404).json({ message: "Không tìm thấy bài viết" });
//   }
// };

// // Tạo 1 blog mới - ĐÃ SỬA
// exports.createBlog = async (req, res) => {
//   try {
//     const { title, description, content, category, published } = req.body;
//     const thumbnail = req.file ? `/uploads/${req.file.filename}` : "";
//     const newBlog = new Blog({ 
//       title, 
//       description, 
//       content, 
//       category, 
//       thumbnail,
//       published: published === 'true' // Xử lý giá trị published
//     });
//     await newBlog.save();
//     res.status(201).json(newBlog);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };

// // Cập nhật blog theo id - ĐÃ SỬA
// exports.updateBlog = async (req, res) => {
//   try {
//     const { title, description, content, category, published } = req.body;
//     const updateData = { 
//       title, 
//       description, 
//       content, 
//       category, 
//       published: published === 'true' 
//     };
    
//     // Nếu có file thumbnail mới
//     if (req.file) {
//       updateData.thumbnail = `/uploads/${req.file.filename}`;
//     }
    
//     const updated = await Blog.findByIdAndUpdate(
//       req.params.id, 
//       updateData, 
//       { new: true }
//     );
//     res.json(updated);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };

// // Xóa blog theo id
// exports.deleteBlog = async (req, res) => {
//   try {
//     await Blog.findByIdAndDelete(req.params.id);
//     res.json({ message: "Đã xóa bài viết" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// controllers/blogController.js
const Blog = require("../models/Blog");
const path = require("path");

// Lấy danh sách blog
const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy 1 blog
const getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Không tìm thấy bài viết" });
    res.status(200).json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Tạo blog mới
const createBlog = async (req, res) => {
  try {
    // Nhận thêm description và published từ client
    const { title, content, author, description, published } = req.body;
    // client upload file với field name 'thumbnail'
    const thumbnailPath = req.file ? `/uploads/${req.file.filename}` : (req.body.thumbnail || null);

    const newBlog = new Blog({ 
      title, 
      content, 
      author, 
      description,
      thumbnail: thumbnailPath,
      published: published === 'true' || published === true
    });
    await newBlog.save();

    res.status(201).json(newBlog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật blog
const updateBlog = async (req, res) => {
  try {
    const { title, content, author, description, published } = req.body;
    // Nếu có file mới, sử dụng file mới; nếu không, giữ thumbnail hiện tại từ req.body.thumbnail nếu client gửi
    const thumbnailPath = req.file ? `/uploads/${req.file.filename}` : (req.body.thumbnail || undefined);

    const updateData = {
      title,
      content,
      author,
      description,
    };

    if (thumbnailPath !== undefined) updateData.thumbnail = thumbnailPath;
    if (published !== undefined) updateData.published = published === 'true' || published === true;

    const updated = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Không tìm thấy bài viết" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa blog
const deleteBlog = async (req, res) => {
  try {
    const deleted = await Blog.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy bài viết" });
    res.status(200).json({ message: "Đã xóa bài viết" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
};

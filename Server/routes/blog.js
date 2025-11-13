// const express = require("express");
// const { getBlogs, getBlog, createBlog, updateBlog, deleteBlog } = require("../controllers/blogController");
// const multer = require("multer"); // để upload file
// const path = require("path"); // để xử lý đường dẫn

// const router = express.Router();

// // Cấu hình lưu file upload
// const storage = multer.diskStorage({
//   destination: path.join(__dirname, "../uploads"), // lưu trong thư mục uploads
//   filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname), // đặt tên file
// });
// const upload = multer({ storage });

// // Routes
// router.get("/", getBlogs); // Lấy danh sách blog
// router.get("/:id", getBlog); // Lấy chi tiết 1 blog theo id
// router.post("/", upload.single("thumbnail"), createBlog); // Tạo blog mới, upload thumbnail
// router.put("/:id", upload.single("thumbnail"), updateBlog)
// router.delete("/:id", deleteBlog); // Xóa blog theo id

// module.exports = router; // xuất router

// routes/blogRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogController");

const router = express.Router();

// Cấu hình upload ảnh
const storage = multer.diskStorage({
  destination: path.join(__dirname, "../uploads"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Định nghĩa route
router.get("/", getBlogs);
router.get("/:id", getBlog);
// Client gửi file dưới field name "thumbnail" nên server cũng chấp nhận cùng tên
router.post("/", upload.single("thumbnail"), createBlog);
router.put("/:id", upload.single("thumbnail"), updateBlog);
router.delete("/:id", deleteBlog);

module.exports = router;

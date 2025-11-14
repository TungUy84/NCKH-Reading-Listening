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

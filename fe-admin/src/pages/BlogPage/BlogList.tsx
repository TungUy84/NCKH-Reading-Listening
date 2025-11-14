import React, { useEffect, useState } from "react";
import { getBlogs, deleteBlog } from "../../services/api";

export interface Blog {
  _id: string;
  title: string;
  description: string;
  content?: string;
  thumbnail?: string; // URL trực tiếp
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface BlogListProps {
  onEdit: (blog: Blog) => void;
}

const BlogList: React.FC<BlogListProps> = ({ onEdit }) => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await getBlogs();
      setBlogs(res.data);
    } catch (err) {
      console.error(err);
      alert("Lấy danh sách bài viết thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa bài viết này?")) return;
    try {
      await deleteBlog(id);
      setBlogs(blogs.filter((b) => b._id !== id)); // cập nhật UI
    } catch (err) {
      console.error(err);
      alert("Xóa bài viết thất bại, vui lòng thử lại");
    }
  };

  if (loading) return <p className="p-6 text-center">Đang tải...</p>;
  if (!blogs.length) return <p className="p-6 text-center">Chưa có bài viết nào</p>;

  return (
    <div className="space-y-4">
      {blogs.map((b) => (
        <div
          key={b._id}
          className="p-4 border rounded-lg flex justify-between items-center"
        >
          <div className="flex items-center gap-4">
            {b.thumbnail && (
              <img
                src={b.thumbnail}
                alt={b.title}
                className="w-16 h-16 object-cover rounded-md"
                crossOrigin="anonymous"
                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.png"; }}
              />
            )}
            <div>
              <h3 className="font-semibold text-lg">{b.title}</h3>
              <p className="text-sm text-gray-500">{b.description}</p>
              <p className="text-xs mt-1">
                {b.published ? "Đã đăng" : "Bản nháp"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="btn btn-sm btn-primary"
              onClick={() => onEdit(b)}
            >
              Chỉnh sửa
            </button>
            <button
              className="btn btn-sm btn-error"
              onClick={() => handleDelete(b._id)}
            >
              Xóa
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BlogList;

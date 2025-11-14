import React, { useEffect, useState } from "react";
import BlogForm from "./BlogForm";
import BlogList, { Blog } from "./BlogList";

const BlogPage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "form">("list");
  const [loading, setLoading] = useState(false);

  // Bộ lọc & tìm kiếm
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  // Lấy dữ liệu từ API
  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/blogs`);
      const data: Blog[] = await res.json();
      setBlogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi tải blog:", err);
      alert("Không thể tải dữ liệu blog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Lọc & tìm kiếm
  const filteredBlogs = blogs.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.description.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "published"
        ? b.published
        : !b.published;

    return matchesSearch && matchesStatus;
  });

  // Phân trang
  const totalPages = Math.ceil(filteredBlogs.length / limit);
  const startIndex = (page - 1) * limit;
  const paginated = filteredBlogs.slice(startIndex, startIndex + limit);

  // Xóa bài viết
  const handleDeleted = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa bài viết này?")) return;
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/blogs/${id}`, {
        method: "DELETE",
      });
      setBlogs(blogs.filter((b) => b._id !== id));
    } catch (err) {
      console.error(err);
      alert("Xóa bài viết thất bại, vui lòng thử lại");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-slate-800">Quản lý Blog</h1>
        {viewMode === "list" && (
          <button
            onClick={() => {
              setEditingBlog(null);
              setViewMode("form");
            }}
            className="btn btn-primary"
          >
            + Thêm bài mới
          </button>
        )}
      </div>

      {viewMode === "form" ? (
        <BlogForm
          editingBlog={
            editingBlog
              ? { ...editingBlog, content: editingBlog.content || "" } // <-- fix content
              : undefined
          }
          onCreated={() => {
            fetchBlogs();
            setViewMode("list");
          }}
          onCancel={() => setViewMode("list")}
        />
      ) : (
        <div className="space-y-4">
          {/* Thanh tìm kiếm & lọc */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <input
              type="text"
              placeholder="Tìm bài viết..."
              className="input input-bordered w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="select select-bordered"
              >
                <option value="all">Tất cả</option>
                <option value="published">Đã đăng</option>
                <option value="draft">Nháp</option>
              </select>

              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="select select-bordered"
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n} / trang
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Danh sách bài viết */}
          <BlogList
            onEdit={(b) => {
              setEditingBlog(b);
              setViewMode("form");
            }}
          />

          {/* Phân trang */}
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-500">
              Trang {page}/{totalPages || 1}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="btn btn-sm"
              >
                Trước
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="btn btn-sm"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPage;

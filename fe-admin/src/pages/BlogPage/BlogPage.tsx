import React, { useEffect, useState } from "react";
import BlogForm from "./BlogForm";
import BlogList from "./BlogList";

const BlogPage: React.FC = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<any[]>([]);
  const [editingBlog, setEditingBlog] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "form">("list");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bộ lọc và tìm kiếm
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/blogs`);
      const data = await res.json();
      setBlogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Không thể tải dữ liệu blog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Lọc + tìm kiếm
  useEffect(() => {
    let list = blogs;
    if (search.trim()) {
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          b.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      list = list.filter((b) =>
        statusFilter === "draft" ? !b.published : b.published
      );
    }

    setFilteredBlogs(list);
  }, [search, statusFilter, blogs]);

  // Phân trang
  const totalPages = Math.ceil(filteredBlogs.length / limit);
  const startIndex = (page - 1) * limit;
  const paginated = filteredBlogs.slice(startIndex, startIndex + limit);

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
          editingBlog={editingBlog}
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
                onChange={(e) => setStatusFilter(e.target.value)}
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

          {loading ? (
            <p>Đang tải dữ liệu...</p>
          ) : (
            <BlogList
              blogs={paginated}
              onEdit={(b: any) => {
                setEditingBlog(b);
                setViewMode("form");
              }}
              onDeleted={fetchBlogs}
            />
          )}

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


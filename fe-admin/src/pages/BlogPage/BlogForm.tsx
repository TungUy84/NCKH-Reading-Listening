import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { API_BASE_URL } from "../../services/api";

interface Props {
  onCreated: () => void;
  editingBlog?: any | null;
  onCancel: () => void;
}

const BlogForm: React.FC<Props> = ({ onCreated, editingBlog, onCancel }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [published, setPublished] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingBlog) {
      setTitle(editingBlog.title);
      setDescription(editingBlog.description);
      setContent(editingBlog.content);
      setPublished(editingBlog.published ?? false);
      setThumbnailPreview(editingBlog.thumbnail || "");
    } else {
      setTitle("");
      setDescription("");
      setContent("");
      setPublished(false);
      setThumbnailPreview("");
    }
  }, [editingBlog]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setThumbnail(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setThumbnailPreview("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("content", content);
      formData.append("published", String(published));
      if (thumbnail) formData.append("thumbnail", thumbnail);

      const method = editingBlog ? "PUT" : "POST";
      const url = editingBlog
        ? `${API_BASE_URL}/blogs/${editingBlog._id}`
        : `${API_BASE_URL}/blogs`;

      const response = await fetch(url, { 
        method, 
        body: formData 
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      onCreated();
      onCancel();
      
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi lưu bài viết");
    } finally {
      setLoading(false);
    }
  };

  const getSubmitButtonText = () => {
    if (editingBlog) {
      return published ? "Cập nhật & Đăng" : "Cập nhật nháp";
    } else {
      return published ? "Đăng bài" : "Lưu nháp";
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white rounded-xl border shadow-sm space-y-12"
    >
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* Title */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Tiêu đề bài viết"
        className="input input-bordered w-full"
        required
      />

      {/* Description */}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Mô tả ngắn"
        className="textarea textarea-bordered w-full"
      />

      {/* Content */}
      <div className="mb-4">
        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          placeholder="Nội dung bài viết..."
          className="h-[300px]"
        />
      </div>

      {/* Thumbnail */}
      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text">Ảnh thumbnail</span>
        </label>
        {thumbnailPreview && (
          <div className="mb-3">
            <img
              src={thumbnailPreview}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg border"
            />
          </div>
        )}
        <input
          type="file"
          className="file-input file-input-bordered w-full"
          accept="image/*"
          onChange={handleThumbnailChange}
        />
      </div>

      {/* Published Switch */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="toggle toggle-primary"
          id="publish-switch"
        />
        <label htmlFor="publish-switch" className="ml-2 cursor-pointer font-medium">
          Đăng bài
        </label>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 justify-end pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-ghost"
          disabled={loading}
        >
          Hủy
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="loading loading-spinner"></span>
              Đang lưu...
            </>
          ) : (
            getSubmitButtonText()
          )}
        </button>
      </div>
    </form>
  );
};

export default BlogForm;

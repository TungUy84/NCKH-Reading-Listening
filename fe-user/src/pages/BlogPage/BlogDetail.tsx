import React, { useEffect, useState } from "react";
import { getBlog } from "../../services/api";
import { useParams } from "react-router-dom";

interface Blog {
  _id: string;
  title: string;
  description?: string;
  content: string;
  thumbnail?: string; // URL trực tiếp hoặc path server
  published?: boolean;
}

export default function BlogDetail() {
  const { blogId } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);

  useEffect(() => {
    if (blogId) {
      getBlog(blogId)
        .then((res) => setBlog(res.data))
        .catch((err) => console.error(err));
    }
  }, [blogId]);

  if (!blog) return <p className="p-6 text-center">Đang tải...</p>;

  // Xác định URL hiển thị
  const thumbnailSrc = blog.thumbnail
    ? blog.thumbnail.startsWith("http") // nếu là URL trực tiếp
      ? blog.thumbnail
      : `http://localhost:5000${blog.thumbnail}` // nếu là path từ server
    : "/placeholder.png"; // fallback nếu không có thumbnail

  return (
    <div className="max-w-3xl mx-auto p-6">
      {thumbnailSrc && (
        <img
          src={thumbnailSrc}
          alt={blog.title}
          className="w-full h-80 object-cover rounded-lg"
          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.png"; }}
        />
      )}
      <h1 className="text-3xl font-bold mt-4">{blog.title}</h1>
      <div
        className="text-lg leading-relaxed mt-6"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />
    </div>
  );
}

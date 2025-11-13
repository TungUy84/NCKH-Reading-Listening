import React, { useEffect, useState } from "react";
import { getBlog } from "../../services/api";
import { useParams } from "react-router-dom";

export default function BlogDetail() {
  const { blogId } = useParams();
  const [blog, setBlog] = useState<any>(null);

  useEffect(() => {
    if (blogId) {
      getBlog(blogId).then((res) => setBlog(res.data));
    }
  }, [blogId]);

  if (!blog) return <p className="p-6 text-center">Đang tải...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <img
        src={`http://localhost:5000${blog.thumbnail}`}
        alt={blog.title}
        className="w-full h-80 object-cover rounded-lg"
      />
      <h1 className="text-3xl font-bold mt-4">{blog.title}</h1>
      <div className="text-lg leading-relaxed mt-6">{blog.content}</div>
    </div>
  );
}

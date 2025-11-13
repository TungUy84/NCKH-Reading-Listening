import React, { useEffect, useState } from "react";
import { getBlogs } from "../../services/api";
import { Link } from "react-router-dom";

export default function BlogList() {
  const [blogs, setBlogs] = useState<any[]>([]);

  useEffect(() => {
    getBlogs().then((res) => setBlogs(res.data));
  }, []);

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      {blogs.map((b) => (
        <Link
          key={b._id}
          to={`/blog/${b._id}`}
          className="border rounded-lg overflow-hidden shadow hover:shadow-lg cursor-pointer block"
        >
          <img
            src={`http://localhost:5000${b.thumbnail}`}
            alt={b.title}
            className="w-full h-48 object-cover"
          />
          <div className="p-3">
            <h2 className="text-lg font-semibold">{b.title}</h2>
            <p className="text-gray-600 text-sm">{b.author}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

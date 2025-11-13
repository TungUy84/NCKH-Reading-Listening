  // import React, { useEffect, useState } from "react";

  // const BlogPage: React.FC = () => {
  //   const [blogs, setBlogs] = useState<any[]>([]);
  //   const [loading, setLoading] = useState(false);
  //   const [error, setError] = useState<string | null>(null);

  //   useEffect(() => {
  //     const fetchBlogs = async () => {
  //       setLoading(true);
  //       setError(null);
  //       try {
  //         const res = await fetch(`${process.env.REACT_APP_API_URL}/blogs`);
  //         const data = await res.json();
  //         setBlogs(Array.isArray(data) ? data : []); // đảm bảo array
  //       } catch (err: any) {
  //         console.error("Lỗi khi fetch blogs:", err);
  //         setError("Không thể tải dữ liệu blog");
  //         setBlogs([]);
  //       } finally {
  //         setLoading(false);
  //       }
  //     };

  //     fetchBlogs();
  //   }, []);

  //   return (
  //     <div className="section-container py-20">
  //       <div className="max-w-5xl mx-auto">
  //         <h1 className="text-4xl font-bold text-gray-900 text-center mb-6">Blog</h1>
  //         <p className="text-lg text-gray-600 text-center mb-12">
  //           Cập nhật mẹo học, lộ trình, và kinh nghiệm thi hiệu quả.
  //         </p>
  //         {error && <p className="text-red-500 text-center">{error}</p>}
  //         {loading ? (
  //           <p className="text-center">Đang tải dữ liệu...</p>
  //         ) : (
  //           <div className="grid gap-6 sm:grid-cols-2">
  //             {Array.isArray(blogs) && blogs.map((post: any) => (
  //               <article
  //                 key={post._id}
  //                 className="card text-left hover:shadow-lg transition"
  //               >
  //                 {post.thumbnail && (
  //                   <img
  //                     src={post.thumbnail}
  //                     alt={post.title}
  //                     className="rounded-lg mb-3"
  //                   />
  //                 )}
  //                 <h2 className="text-xl font-semibold text-gray-900 mb-2">
  //                   {post.title}
  //                 </h2>
  //                 <p className="text-gray-600 text-sm">{post.description}</p>
  //               </article>
  //             ))}
  //           </div>
  //         )}
  //       </div>
  //     </div>
  //   );
  // };

  // export default BlogPage;



// src/pages/BlogPage/BlogPage.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const BlogPage: React.FC = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/blogs`);
        const data = await res.json();
        setBlogs(Array.isArray(data) ? data : []); // đảm bảo array
      } catch (err: any) {
        console.error("Lỗi khi fetch blogs:", err);
        setError("Không thể tải dữ liệu blog");
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <div className="section-container py-20">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-6">Blog</h1>
        <p className="text-lg text-gray-600 text-center mb-12">
          Cập nhật mẹo học, lộ trình, và kinh nghiệm thi hiệu quả.
        </p>

        {error && <p className="text-red-500 text-center">{error}</p>}
        {loading ? (
          <p className="text-center">Đang tải dữ liệu...</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {blogs.map((post: any) => (
              <Link key={post._id} to={`/blog/${post._id}`}>
                <article className="card text-left hover:shadow-lg transition cursor-pointer">
                  {post.thumbnail && (
                    <img
                      src={
                        post.thumbnail.startsWith("http")
                          ? post.thumbnail
                          : `http://localhost:5000${post.thumbnail}`
                      }
                      alt={post.title}
                      className="rounded-lg mb-3 w-full h-48 object-cover"
                    />
                  )}
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 text-sm">{post.description}</p>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;

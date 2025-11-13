import React from "react";

export interface Blog {
  _id: string;
  title: string;
  description: string;
  content?: string;
  thumbnail?: string;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface BlogListProps {
  blogs: Blog[];
  onEdit: (blog: Blog) => void;
  onDeleted: () => Promise<void>;
}

const BlogList: React.FC<BlogListProps> = ({ blogs, onEdit, onDeleted }) => {
  if (!blogs.length) {
    return <p>Chưa có bài viết nào</p>;
  }

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
              />
            )}
            <div>
              <h3 className="font-semibold text-lg">{b.title}</h3>
              <p className="text-sm text-gray-500">{b.description}</p>
              <p className="text-xs mt-1">
                {b.published ? "Đã đăng" : " Bản nháp"}
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
              onClick={async () => {
                if (window.confirm("Bạn có chắc muốn xóa bài viết này?")) {
                  await onDeleted();
                }
              }}
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

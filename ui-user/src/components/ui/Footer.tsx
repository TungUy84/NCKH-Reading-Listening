import { BookOpen } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold">EnglishMaster</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Hệ thống luyện thi tiếng Anh hiện đại với AI thông minh, 
              giúp bạn cải thiện kỹ năng nghe và đọc hiệu quả.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2 text-gray-400">
              <li><button onClick={() => navigate('/placement')} className="hover:text-white transition-colors">Kiểm tra đầu vào</button></li>
              <li><button onClick={() => navigate('/practice')} className="hover:text-white transition-colors">Ôn luyện</button></li>
              <li><button onClick={() => navigate('/mock-test')} className="hover:text-white transition-colors">Thi thử</button></li>
              <li><button onClick={() => navigate('/lessons')} className="hover:text-white transition-colors">Bài học</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Trung tâm trợ giúp</a></li>
              <li><Link to="contact" className="hover:text-white transition-colors">Liên hệ</Link></li>
              <li><Link to="contact" className="hover:text-white transition-colors">Chính sách bảo mật</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Điều khoản sử dụng</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2025 EnglishMaster. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}

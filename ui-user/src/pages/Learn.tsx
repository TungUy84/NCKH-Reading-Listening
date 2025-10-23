import React from "react";
import { BookOpen, Home, Layers, User, Target, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LearningPath: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm p-6 space-y-6">
        <h2 className="text-xl font-semibold text-indigo-600 mb-4">Chương trình bạn chọn</h2>
        <div className="space-y-4">
          <select className="w-full border rounded-lg p-2 text-gray-700 focus:ring-2 focus:ring-indigo-500">
            <option>AV7</option>
            <option>Anh Văn đầu ra</option>
            <option>IELTS</option>
          </select>

          <nav className="space-y-2">
            <button className="flex items-center w-full text-left text-gray-700 hover:text-indigo-600 font-medium">
              <Home className="w-5 h-5 mr-2" /> Tổng quan
            </button>
            <button className="flex items-center w-full text-left text-gray-700 hover:text-indigo-600 font-medium">
              <Layers className="w-5 h-5 mr-2" /> Study Plan
            </button>
            <button className="flex items-center w-full text-left text-gray-700 hover:text-indigo-600 font-medium">
              <BookOpen className="w-5 h-5 mr-2" /> My Courses
            </button>
            <button className="flex items-center w-full text-left text-gray-700 hover:text-indigo-600 font-medium">
              <Target className="w-5 h-5 mr-2" /> Test Practice
            </button>
            <button className="flex items-center w-full text-left text-gray-700 hover:text-indigo-600 font-medium">
              <User className="w-5 h-5 mr-2" /> Learning Profile
            </button>
          </nav>
        </div>

        <button
          onClick={() => navigate("/home")}
          className="mt-8 w-full bg-gray-100 hover:bg-gray-200 py-2 rounded-lg font-medium text-gray-700"
        >
          ← Trở về trang chủ
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 space-y-6">
        <section className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Xin chào, Thảo 👋</h1>
            <p className="text-gray-500">Cùng tiến bộ mỗi ngày nhé!</p>
          </div>
          <button className="bg-indigo-100 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-200 transition">
            Xem giới thiệu
          </button>
        </section>

        {/* Study Plan */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Study Plan</h2>
          <p className="text-gray-600 mb-4">
            Bạn chưa sở hữu khóa học nào. Cùng khám phá lộ trình học phù hợp với bạn nhé!
          </p>
          <button className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600">
            Khám phá ngay
          </button>
        </section>

        {/* Courses */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Khóa học của tôi</h2>
          <p className="text-gray-600 mb-4">
            Bạn chưa có khóa học nào. Hãy để hệ thống giúp bạn lựa chọn khóa học phù hợp!
          </p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            Chọn khóa học
          </button>
        </section>

        {/* Test Practice */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Test Practice</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center hover:shadow-md transition">
              <p className="font-medium">Listening</p>
            </div>
            <div className="p-4 border rounded-lg text-center hover:shadow-md transition">
              <p className="font-medium">Reading</p>
            </div>
          </div>
        </section>
      </main>

      {/* Right Sidebar */}
      <aside className="w-80 bg-white border-l shadow-sm p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Trình độ TOEIC của bạn</h2>
          <div className="text-sm text-gray-600 space-y-2">
            <p>Listening - Reading Level</p>
            <div className="flex justify-between text-gray-500">
              <span>Entry</span> <span>Predicted</span> <span>Target</span>
            </div>
            <p>Speaking - Writing Level</p>
            <div className="flex justify-between text-gray-500">
              <span>Entry</span> <span>Predicted</span> <span>Target</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Learning Summary</h2>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li className="flex items-center"><Award className="w-4 h-4 text-yellow-500 mr-2" /> Tổng thời lượng: <span className="ml-auto text-gray-800 font-medium">0 phút</span></li>
            <li className="flex items-center"><Award className="w-4 h-4 text-indigo-500 mr-2" /> Tổng số cúp đạt được: <span className="ml-auto text-gray-800 font-medium">0</span></li>
            <li className="flex items-center"><Award className="w-4 h-4 text-pink-500 mr-2" /> Tổng số bài test: <span className="ml-auto text-gray-800 font-medium">0</span></li>
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default LearningPath;

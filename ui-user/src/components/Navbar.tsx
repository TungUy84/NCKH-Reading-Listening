import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Book,
  Users,
  Award,
  GraduationCap,
  BookOpen,
  MapPin,
} from "lucide-react";

interface NavbarProps {
  isLoggedIn: boolean;
  user: { name: string; email: string } | null;
  onLogin: (status: boolean) => void;
  onSetUser: (user: { name: string; email: string } | null) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  isLoggedIn,
  user,
  onLogin,
  onSetUser,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // để highlight trang đang active

  const menuItems = [
    {
      id: "placement",
      title: "Kiểm tra đầu vào",
      icon: <Users className="w-4 h-4" />,
      path: "/placement",
    },
    {
      id: "practice",
      title: "Ôn luyện",
      icon: <Book className="w-4 h-4" />,
      path: "/practice",
    },
    {
      id: "mock-test",
      title: "Thi thử",
      icon: <Award className="w-4 h-4" />,
      path: "/mock-test",
    },
    {
      id: "lessons",
      title: "Bài học",
      icon: <GraduationCap className="w-4 h-4" />,
      path: "/lessons",
    },
    {
      id: "blog",
      title: "Blog",
      icon: <BookOpen className="w-4 h-4" />,
      path: "/blog",
    },
    {
      id: "learning-path",
      title: "Lộ trình học",
      icon: <MapPin className="w-4 h-4" />,
      path: "/learning-path",
    },
  ];

  const handleLogout = () => {
    onLogin(false);
    onSetUser(null);
    navigate("/"); // logout về trang chủ
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => navigate("/")}
              className="flex items-center space-x-2 text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <GraduationCap className="w-8 h-8" />
              <span>EnglishMaster</span>
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 ${
                  location.pathname === item.path
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700"
                }`}
              >
                {item.icon}
                <span>{item.title}</span>
              </button>
            ))}

            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Xin chào, {user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors font-medium"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Đăng nhập
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg border-t border-gray-200">
            <div className="px-4 py-4 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center w-full px-3 py-2 text-left rounded-md transition-colors ${
                    location.pathname === item.path
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {item.icon}
                    <span>{item.title}</span>
                  </div>
                </button>
              ))}

              {isLoggedIn ? (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-700">Xin chào, {user?.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors font-medium"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    navigate("/auth");
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium mt-4"
                >
                  Đăng nhập
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

// 




import React, { useState } from "react";
import {
  HeadphonesIcon,
  Clock,
  FileText,
  Award,
  TrendingUp,
  Calendar,
  Search,
} from "lucide-react";

const MockTest: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"reading" | "listening">("reading");
  const [searchTerm, setSearchTerm] = useState("");
  const [durationFilter, setDurationFilter] = useState<"all" | "45" | "60" | "90" | "120">("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    "beginner" | "intermediate" | "advanced"
  >("intermediate");

  const mockTests = [
    {
      id: 1,
      title: "TOEIC Practice Test #1",
      type: "reading",
      duration: 120,
      questions: "200 câu",
      difficulty: "intermediate",
      lastScore: 750,
      attempts: 3,
      description: "Bài thi thử đầy đủ theo format TOEIC chính thức",
    },
    {
      id: 2,
      title: "IELTS Academic Reading",
      type: "reading",
      duration: 60,
      questions: "40 câu",
      difficulty: "advanced",
      lastScore: 6.5,
      attempts: 2,
      description: "Chuyên luyện kỹ năng Reading theo format IELTS Academic",
    },
    {
      id: 3,
      title: "Business English Test",
      type: "reading",
      duration: 90,
      questions: "150 câu",
      difficulty: "intermediate",
      lastScore: 820,
      attempts: 1,
      description: "Kiểm tra tiếng Anh thương mại cho môi trường công sở",
    },
    {
      id: 4,
      title: "Academic Listening Challenge",
      type: "listening",
      duration: 45,
      questions: "30 câu",
      difficulty: "advanced",
      lastScore: 85,
      attempts: 4,
      description: "Thử thách kỹ năng nghe với nội dung học thuật",
    },
  ];

  const recentResults = [
    { test: "TOEIC Practice #1", score: 750, date: "2024-01-15" },
    { test: "IELTS Reading", score: 6.5, date: "2024-01-12" },
    { test: "Business English", score: 820, date: "2024-01-10" },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "text-green-600 bg-green-100";
      case "intermediate":
        return "text-yellow-600 bg-yellow-100";
      case "advanced":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const filteredTests = mockTests.filter(
    (test) =>
      test.type === activeTab &&
      (durationFilter === "all" || test.duration === Number(durationFilter)) &&
      test.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedDifficulty === "beginner" || test.difficulty === selectedDifficulty)
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Thi thử</h1>
          <p className="text-xl text-gray-600">
            Kiểm tra tiến độ học tập và chuẩn bị cho các kỳ thi chính thức
          </p>
        </div>

       {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-2 mb-8 max-w-md mx-auto">
          <div className="flex">
            <button
              onClick={() => setActiveTab('listening')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === 'listening'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <HeadphonesIcon className="w-5 h-5" />
              <span>Listening</span>
            </button>
            <button
              onClick={() => setActiveTab('reading')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === 'reading'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Reading</span>
            </button>
          </div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              {/* Search + Filters */}
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-6 gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm bài thi..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  value={durationFilter}
                  onChange={(e) =>
                    setDurationFilter(
                      e.target.value as "all" | "45" | "60" | "90" | "120"
                    )
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="all">Tất cả thời gian</option>
                  <option value="45">45 phút</option>
                  <option value="60">60 phút</option>
                  <option value="90">90 phút</option>
                  <option value="120">120 phút</option>
                </select>
              </div>

              {/* Difficulty Filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                {["beginner", "intermediate", "advanced"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedDifficulty(level as any)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedDifficulty === level
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {level === "beginner"
                      ? "Cơ bản"
                      : level === "intermediate"
                      ? "Trung bình"
                      : "Nâng cao"}
                  </button>
                ))}
              </div>

              {/* Test Cards */}
              <div className="space-y-4">
                {filteredTests.map((test) => (
                  <div
                    key={test.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {test.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          {test.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{test.duration} phút</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FileText className="w-4 h-4" />
                            <span>{test.questions}</span>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(
                              test.difficulty
                            )}`}
                          >
                            {test.difficulty === "beginner"
                              ? "Cơ bản"
                              : test.difficulty === "intermediate"
                              ? "Trung bình"
                              : "Nâng cao"}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        {test.lastScore && (
                          <div className="text-lg font-bold text-blue-600 mb-1">
                            {test.lastScore}
                            {test.title.includes("IELTS") ? "/9.0" : "/990"}
                          </div>
                        )}
                        <div className="text-sm text-gray-500">
                          {test.attempts} lần thử
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        Bắt đầu thi
                      </button>
                      {test.lastScore && (
                        <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                          Xem kết quả
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {filteredTests.length === 0 && (
                  <p className="text-gray-500 italic text-center">
                    Không tìm thấy bài thi phù hợp.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistics */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                Thống kê cá nhân
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tổng số bài thi</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Điểm cao nhất</span>
                  <span className="font-semibold text-green-600">850/990</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Điểm trung bình</span>
                  <span className="font-semibold">720/990</span>
                </div>
              </div>
            </div>

            {/* Recent Results */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-purple-600" />
                Kết quả gần đây
              </h3>

              <div className="space-y-3">
                {recentResults.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {result.test}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {result.date}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-blue-600">
                        {result.score}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockTest;

import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { TestResult } from "@/types";

const ResultPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const result = (state?.result || state?.data) as TestResult | undefined;

  const handleBackToTests = () => navigate("/placement");

  const handleViewLearningPath = () => {
    navigate("/learning-path", { state: { level: result?.avLevel } });
  };

  if (!result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Không tìm thấy kết quả bài thi
        </h1>
        <p className="text-gray-600 mb-6">
          Vui lòng thực hiện bài kiểm tra và nộp bài để xem kết quả của bạn.
        </p>
        <Button onClick={handleBackToTests} className="bg-blue-600 hover:bg-blue-700">
          Quay lại danh sách bài kiểm tra
        </Button>
      </div>
    );
  }

  const getLevelBadgeClasses = (level: string) => {
    const normalized = level.toLowerCase();
    if (normalized.includes("av7")) return "bg-blue-100 text-blue-700";
    if (normalized.includes("av5") || normalized.includes("av6")) {
      return "bg-emerald-100 text-emerald-700";
    }
    if (normalized.includes("av3") || normalized.includes("av4")) {
      return "bg-amber-100 text-amber-700";
    }
    return "bg-rose-100 text-rose-700";
  };

  const getScoreTone = (percentage: number) => {
    if (percentage >= 80) return "text-emerald-600";
    if (percentage >= 60) return "text-amber-600";
    if (percentage >= 40) return "text-orange-600";
    return "text-rose-600";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Kết quả bài kiểm tra
          </h1>
          <p className="text-gray-600">
            Bạn vừa hoàn thành bài kiểm tra {result.category === "listening" ? "Listening" : "Reading"}
          </p>
          <p className="mt-2 text-lg font-medium text-blue-600">{result.testTitle}</p>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Tỉ lệ hoàn thành
            </p>
            <p className={`mt-4 text-4xl font-bold ${getScoreTone(result.score.percentage)}`}>
              {result.score.percentage}%
            </p>
            <p className="mt-2 text-sm text-gray-500">
              {result.score.earnedPoints} / {result.score.totalPoints} điểm
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Điểm IELTS tương đương
            </p>
            <p className="mt-4 text-4xl font-bold text-blue-600">{result.ieltsScore}</p>
            <p className="mt-2 text-sm text-gray-500">Tham khảo theo thang quy đổi nội bộ</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Trình độ hiện tại
            </p>
            <span
              className={`mt-4 inline-flex items-center justify-center rounded-full px-4 py-2 text-lg font-semibold ${getLevelBadgeClasses(result.avLevel)}`}
            >
              {result.avLevel}
            </span>
            <p className="mt-2 text-sm text-gray-500">Căn cứ theo hệ thống AV</p>
          </div>
        </section>

        <section className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            Đề xuất dành cho bạn
          </h2>
          <p className="text-blue-800 leading-relaxed">{result.recommendation}</p>
        </section>

        <section className="mt-10 bg-white rounded-xl shadow-sm p-6">
          <header className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Chi tiết từng câu hỏi</h2>
              <p className="text-sm text-gray-500 mt-1">
                Theo dõi đáp án của bạn và lời giải tương ứng
              </p>
            </div>
            <Button variant="outline" onClick={handleBackToTests}>
              Làm bài khác
            </Button>
          </header>

          <div className="space-y-4">
            {result.detailedResults?.length ? (
              result.detailedResults.map((detail) => (
                <article
                  key={detail.questionNumber}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Câu {detail.questionNumber}
                      </p>
                      <p className="mt-1 text-gray-900 font-medium">
                        {detail.question.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          detail.isCorrect
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {detail.isCorrect ? "Đúng" : "Sai"}
                      </span>
                      <span className="text-sm text-gray-500">
                        +{detail.pointsEarned} điểm
                      </span>
                    </div>
                  </div>

                  {detail.question.passage && (
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm text-gray-600 mb-3">
                      {detail.question.passage}
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">
                        Câu trả lời của bạn
                      </h3>
                      <p
                        className={`text-sm ${
                          detail.isCorrect ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {detail.userAnswer.selectedOptions?.length
                          ? detail.userAnswer.selectedOptions.join(", ")
                          : detail.userAnswer.userAnswer || "Không trả lời"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">
                        Đáp án đúng
                      </h3>
                      <p className="text-sm text-emerald-600">
                        {detail.correctAnswers.join(", ")}
                      </p>
                    </div>
                  </div>

                  {detail.explanation && (
                    <div className="mt-3 border-t border-gray-100 pt-3">
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">
                        Giải thích
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {detail.explanation}
                      </p>
                    </div>
                  )}
                </article>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center">
                Không có dữ liệu chi tiết cho bài kiểm tra này.
              </p>
            )}
          </div>
        </section>

        <footer className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button onClick={handleBackToTests} className="bg-blue-600 hover:bg-blue-700">
            Làm bài kiểm tra khác
          </Button>
          <Button variant="secondary" onClick={handleViewLearningPath}>
            Xem lộ trình học phù hợp
          </Button>
        </footer>
      </div>
    </div>
  );
};

export default ResultPage;

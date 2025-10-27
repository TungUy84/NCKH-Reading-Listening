import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useParams } from "react-router-dom";

const ExamTest: React.FC = () => {
  const { mode } = useParams<{ mode: "reading" | "listening" }>();
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 phút
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-white shadow">
        <h1 className="text-xl font-bold text-blue-600">
          ExamTest - {mode === "reading" ? "Reading" : "Listening"}
        </h1>
        <div className="text-lg font-semibold text-red-500">
          ⏱ {formatTime(timeLeft)}
        </div>
        <Button className="bg-green-600 text-white">Nộp bài</Button>
      </header>

      {/* Main layout */}
      <main className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 flex-1 overflow-hidden">
        {/* Left Panel */}
        <Card className="p-4 overflow-y-auto max-h-[80vh]">
          {mode === "reading" ? (
            <div>
              <h2 className="text-lg font-semibold mb-2">Reading Passage</h2>
              <div className="text-sm text-gray-700 space-y-4">
                {/* 👉 Render passage từ file Word */}
                <p>[Nội dung passage sẽ hiển thị ở đây]</p>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-semibold mb-4">Listening Audio</h2>
              <audio controls className="w-full mb-4">
                <source src="/audio/sample.mp3" type="audio/mpeg" />
                Trình duyệt của bạn không hỗ trợ audio.
              </audio>
              <p className="text-sm text-gray-600">
                Hãy lắng nghe file audio và trả lời câu hỏi bên phải.
              </p>
            </div>
          )}
        </Card>

        {/* Right Panel */}
        <div className="space-y-4 overflow-y-auto max-h-[80vh] pr-2">
          {[1, 2, 3].map((id) => (
            <Card key={id} className="p-4">
              <p className="font-medium mb-2">
                {id}. [Câu hỏi số {id} sẽ hiển thị ở đây]
              </p>
              <div className="space-y-2">
                {["A", "B", "C", "D"].map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={`q-${id}`}
                      value={opt}
                      checked={answers[id] === opt}
                      onChange={() =>
                        setAnswers({ ...answers, [id]: opt })
                      }
                    />
                    <span>Đáp án {opt}</span>
                  </label>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="flex justify-between items-center px-6 py-3 bg-white shadow">
        <Progress
          value={(Object.keys(answers).length / 3) * 100}
          className="w-1/2"
        />
        <div className="space-x-2">
          <Button variant="outline">Lưu tạm</Button>
          <Button variant="secondary">Xem lại</Button>
          <Button className="bg-green-600 text-white">Nộp bài</Button>
        </div>
      </footer>
    </div>
  );
};

export default ExamTest;

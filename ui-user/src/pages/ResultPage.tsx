// import React from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";

// const ResultPage: React.FC = () => {
//   const { state } = useLocation();
//   const navigate = useNavigate();

//   const { score, total, level } = state || {};

//   const handleGoToPath = () => {
//     // Chuyển sang trang lộ trình và gửi level hiện tại
//     navigate("/learning-path", { state: { level } });
//   };

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 text-blue-900 p-6">
//       <h1 className="text-3xl font-bold mb-4">Kết quả kiểm tra</h1>
//       <p className="text-xl mb-2">Điểm của bạn: <strong>{score}/{total}</strong></p>
//       <p className="text-xl mb-8">Trình độ tương ứng: <strong>{level}</strong></p>

//       <Button onClick={handleGoToPath} className="bg-blue-600 text-white px-6 py-3 rounded-lg">
//         Xem lộ trình học phù hợp
//       </Button>
//     </div>
//   );
// };

// export default ResultPage;



import React from "react";
import { useNavigate } from "react-router-dom";

interface ResultPageProps {
  userId: string;
  listeningScore: number;
  readingScore: number;
  achievedLevel: string;
}

const ResultPage: React.FC<ResultPageProps> = ({
  userId,
  listeningScore,
  readingScore,
  achievedLevel,
}) => {
  const navigate = useNavigate();

  const handleContinue = async () => {
    try {
      // 1️⃣ Gửi kết quả test vào MongoDB
      const resultResponse = await fetch("http://localhost:5000/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          listeningScore,
          readingScore,
          overallLevel: achievedLevel,
        }),
      });

      const resultData = await resultResponse.json();
      if (!resultResponse.ok) throw new Error(resultData.message);

      // 2️⃣ Cập nhật level người dùng (nếu muốn lưu vào bảng User)
      const userResponse = await fetch(
        `http://localhost:5000/api/users/${userId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentLevel: achievedLevel }),
        }
      );

      const userData = await userResponse.json();
      if (!userResponse.ok) throw new Error(userData.message);

      // ✅ Nếu cả hai đều thành công
      alert("Kết quả đã được lưu thành công!");
      navigate("/learning-path");
    } catch (error: any) {
      console.error("❌ Error saving result:", error);
      alert("Không thể lưu kết quả. Vui lòng thử lại.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-400 text-white p-8">
      <h1 className="text-4xl font-bold mb-6">Kết quả bài kiểm tra</h1>
      <p className="text-2xl mb-6">
        Chúc mừng! Bạn đạt trình độ: <strong>{achievedLevel}</strong>
      </p>
      <button
        onClick={handleContinue}
        className="px-6 py-3 bg-white text-blue-600 font-bold rounded-full hover:bg-gray-200 transition"
      >
        Tiếp tục đến lộ trình học
      </button>
    </div>
  );
};

export default ResultPage;

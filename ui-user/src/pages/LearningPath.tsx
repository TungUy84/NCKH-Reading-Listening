import React, { useState } from "react";
import { Link } from "react-router-dom";
import { learningPaths, stageIcons } from "../data/pathData";

// Nhóm trình độ
const levelGroups = [
  ["AV1-2"], // AV1-2
  ["AV3-4"], // AV3-4
  ["AV5-6"], // AV5-6
  ["AV7+"],  // AV7
];

// Nhóm mục tiêu
const targetGroups = [
  ["AV7"],
  ["AV đầu ra"],
];

const LearningPath: React.FC = () => {
  const [currentLevel, setCurrentLevel] = useState<string | null>(null);
  const [targetLevel, setTargetLevel] = useState<string | null>(null);

  const key = currentLevel && targetLevel ? `${currentLevel}-${targetLevel}` : null;
  const path = key && learningPaths[key] ? learningPaths[key] : [];

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-400 to-blue-600 text-white p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Thiết kế lộ trình học dành riêng cho bạn, ngay tại đây!
      </h1>

      {/* Box bọc ngoài */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Trình độ của tôi */}
        <div className="bg-blue-700 p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Trình độ của tôi</h2>
          {levelGroups.map((group, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentLevel(group.join(" / "))}
              className={`block w-full text-left px-4 py-3 mb-3 rounded-full transition ${
                currentLevel === group.join(" / ")
                  ? "bg-white text-blue-600 font-bold"
                  : "bg-blue-600 hover:bg-blue-500"
              }`}
            >
              {group.join(" – ")}
            </button>
          ))}

          <p className="text-sm mt-4">
            Bạn chưa rõ trình độ bản thân?{" "}
            <Link to="/placement" className="underline text-yellow-300">
              Kiểm tra đầu vào
            </Link>
          </p>
        </div>

        {/* Mục tiêu của tôi */}
        <div className="bg-blue-700 p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Mục tiêu của tôi</h2>
          {targetGroups.map((group, idx) => (
            <button
              key={idx}
              onClick={() => setTargetLevel(group.join(" / "))}
              className={`block w-full text-left px-4 py-3 mb-3 rounded-full transition ${
                targetLevel === group.join(" / ")
                  ? "bg-white text-blue-600 font-bold"
                  : "bg-blue-600 hover:bg-blue-500"
              }`}
            >
              {group.join(" – ")}
            </button>
          ))}
        </div>
      </div>

      {/* Hiển thị chặng */}
      <div className="mt-10 bg-white text-blue-700 p-6 rounded-2xl shadow-2xl max-w-5xl mx-auto">
        {currentLevel && targetLevel ? (
          path.length > 0 ? (
            <>
              <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">
                Các chặng cần đi qua
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {path.map((stage, i) => {
                  const Icon = stageIcons[stage] || stageIcons["Chặng 1: Nền tảng"];
                  return (
                    <div
                      key={i}
                      className="flex flex-col items-center justify-center bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-xl shadow hover:scale-105 transition"
                    >
                      <Icon className="w-12 h-12 text-blue-600 mb-4" />
                      <h3 className="text-lg font-semibold text-center">{stage}</h3>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-center text-lg">Chưa có lộ trình cho tổ hợp này.</p>
          )
        ) : (
          <p className="text-lg text-center">
            Hãy chọn trình độ và mục tiêu để xem lộ trình
          </p>
        )}
      </div>
    </div>
  );
};

export default LearningPath;
// src/data/pathData.ts
import { BookOpen, Target, GraduationCap, PenTool, FileCheck } from "lucide-react";

// Icon cho từng chặng
export const stageIcons: Record<string, React.FC<any>> = {
  "Chặng 1: Nền tảng": BookOpen,
  "Chặng 2: Giao tiếp cơ bản": PenTool,
  "Chặng 3: Kỹ năng học thuật": FileCheck,
  "Chặng 4: Luyện thi": GraduationCap,
  "Chặng 5: Đầu ra": Target,
};

// Các lộ trình học (tùy theo trình độ hiện tại và mục tiêu)
export const learningPaths: Record<string, string[]> = {
  // Từ AV1-2 lên AV7
  "AV1-2-AV7": [
    "Chặng 1: Nền tảng",
    "Chặng 2: Giao tiếp cơ bản",
    "Chặng 3: Kỹ năng học thuật",
    "Chặng 4: Luyện thi",
    "Chặng 5: Đầu ra",
  ],

  // Từ AV3-4 lên AV7
  "AV3-4-AV7": [
    "Chặng 2: Giao tiếp cơ bản",
    "Chặng 3: Kỹ năng học thuật",
    "Chặng 4: Luyện thi",
    "Chặng 5: Đầu ra",
  ],

  // Từ AV5-6 lên AV7
  "AV5-6-AV7": [
    "Chặng 3: Kỹ năng học thuật",
    "Chặng 4: Luyện thi",
    "Chặng 5: Đầu ra",
  ],

  // Từ AV7+ lên AV đầu ra
  "AV7+-AV đầu ra": [
    "Chặng 4: Luyện thi",
    "Chặng 5: Đầu ra",
  ],
};
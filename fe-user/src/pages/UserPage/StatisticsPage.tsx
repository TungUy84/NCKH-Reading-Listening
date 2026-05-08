import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  ChartBarIcon,
  ClockIcon,
  TrophyIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { getAllMyTestAttempts } from '../../services/api';
import { ClipLoader } from 'react-spinners';

const StatisticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTests: 0,
    averageScore: 0,
    totalTime: 0, // in minutes
    streak: 0,
    recentActivity: [] as any[],
    scoreHistory: [] as any[],
    skillBreakdown: [] as any[]
  });

  const fetchStatistics = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch all test attempts
      const response = await getAllMyTestAttempts({ limit: 50 }); // Get last 50 attempts
      const attempts = response.data?.items || [];

      // Process data
      const totalTests = attempts.length;

      // Calculate average score
      const totalScore = attempts.reduce((sum: number, attempt: any) => sum + (attempt.score || 0), 0);
      const averageScore = totalTests > 0 ? Math.round((totalScore / totalTests) * 10) / 10 : 0;

      // Calculate total time (mocking duration if not available or summing up)
      // Assuming durationSeconds is in the attempt object
      const totalSeconds = attempts.reduce((sum: number, attempt: any) => sum + (attempt.durationSeconds || 0), 0);
      const totalTime = Math.round(totalSeconds / 60);

      // Calculate streak (simplified logic: consecutive days with activity)
      // This is a placeholder logic as real streak calculation is complex
      const streak = calculateStreak(attempts);

      // Prepare chart data
      // 1. Score History (Last 10 tests)
      const scoreHistory = attempts
        .slice(0, 10)
        .reverse()
        .map((attempt: any) => ({
          name: attempt.testId?.title || attempt.testTitle || 'Bài kiểm tra',
          score: attempt.score || 0,
          date: new Date(attempt.createdAt).toLocaleDateString('vi-VN')
        }));

      // 2. Skill Breakdown (Mocking Reading vs Listening based on test type or category)
      // If category is not available, we might need to infer or use mock data for now
      const readingTests = attempts.filter((a: any) => a.category === 'reading' || a.testId?.category === 'reading');
      const listeningTests = attempts.filter((a: any) => a.category === 'listening' || a.testId?.category === 'listening');

      const avgReading = readingTests.length ? readingTests.reduce((s: number, a: any) => s + (a.score || 0), 0) / readingTests.length : 0;
      const avgListening = listeningTests.length ? listeningTests.reduce((s: number, a: any) => s + (a.score || 0), 0) / listeningTests.length : 0;

      const skillBreakdown = [
        { subject: 'Reading', A: Math.round(avgReading), fullMark: 100 },
        { subject: 'Listening', A: Math.round(avgListening), fullMark: 100 },
      ];

      setStats({
        totalTests,
        averageScore,
        totalTime,
        streak,
        recentActivity: attempts.slice(0, 5),
        scoreHistory,
        skillBreakdown
      });

    } catch (error) {
      console.error('Error fetching statistics:', error);
      // toast.error('Không thể tải dữ liệu thống kê');
      setStats({
        totalTests: 0,
        averageScore: 0,
        totalTime: 0,
        streak: 0,
        recentActivity: [],
        scoreHistory: [],
        skillBreakdown: []
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const calculateStreak = (attempts: any[]) => {
    if (!attempts.length) return 0;

    // 1. Lấy danh sách các ngày duy nhất đã làm bài (YYYY-MM-DD)
    const uniqueDates = Array.from(new Set(
      attempts.map(a => new Date(a.createdAt).toISOString().split('T')[0])
    )).sort().reverse(); // Sắp xếp giảm dần (mới nhất trước)

    if (uniqueDates.length === 0) return 0;

    // 2. Kiểm tra xem chuỗi có còn hiệu lực không (phải có hoạt động hôm nay hoặc hôm qua)
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const lastActivity = uniqueDates[0];

    // Nếu bài làm gần nhất không phải hôm nay hoặc hôm qua -> mất chuỗi
    if (lastActivity !== today && lastActivity !== yesterday) {
      return 0;
    }

    // 3. Đếm số ngày liên tiếp
    let streak = 1;
    let currentDateStr = lastActivity;

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(currentDateStr);
      prevDate.setDate(prevDate.getDate() - 1);
      const expectedPrevDateStr = prevDate.toISOString().split('T')[0];

      if (uniqueDates[i] === expectedPrevDateStr) {
        streak++;
        currentDateStr = expectedPrevDateStr;
      } else {
        break; // Ngắt quãng
      }
    }

    return streak;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <ClipLoader color="#3B82F6" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8" data-aos="fade-up">
          <h1 className="text-3xl font-bold text-slate-900">Thống kê học tập</h1>
          <p className="text-slate-500 mt-2">Theo dõi tiến độ và kết quả học tập của bạn</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:scale-105" data-aos="fade-up" data-aos-delay="100">
            <div className="p-4 bg-blue-50 rounded-xl text-blue-600">
              <ChartBarIcon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Tổng bài thi</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.totalTests}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:scale-105" data-aos="fade-up" data-aos-delay="200">
            <div className="p-4 bg-green-50 rounded-xl text-green-600">
              <TrophyIcon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Điểm trung bình</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.averageScore}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:scale-105" data-aos="fade-up" data-aos-delay="300">
            <div className="p-4 bg-purple-50 rounded-xl text-purple-600">
              <ClockIcon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Thời gian học</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.totalTime} <span className="text-sm font-normal text-slate-400">phút</span></h3>
            </div>
          </div>

          {/* Streak Card - Updated Design */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-6 rounded-2xl shadow-lg shadow-orange-500/5 relative overflow-hidden group hover:-translate-y-1 transition-all" data-aos="fade-up" data-aos-delay="400">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <FireIcon className="h-24 w-24 text-orange-500" />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Chuỗi ngày</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
                <FireIcon className="h-8 w-8" />
              </div>
              <div>
                <p className="font-bold text-slate-900">{stats.streak > 0 ? 'Đang học tập' : 'Chưa bắt đầu'}</p>
                <p className="text-xs text-slate-500">{stats.streak > 0 ? 'Giữ vững phong độ nhé!' : 'Hãy bắt đầu ngay hôm nay!'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map(d => (
                <div key={d} className={`h-2 flex-1 rounded-full ${d <= (stats.streak > 7 ? 7 : stats.streak) ? "bg-orange-400" : "bg-slate-200"}`} />
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2 text-right">Tuần này</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="mb-8">
          {/* Score History Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6" data-aos="fade-up" data-aos-delay="500">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ArrowTrendingUpIcon className="w-5 h-5 text-blue-500" />
                Biểu đồ điểm số
              </h3>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.scoreHistory} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tick={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[0, 10]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    name="Điểm số"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" data-aos="fade-up" data-aos-delay="600">
          <div className="px-6 py-5 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Hoạt động gần đây</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer"
                  onClick={() => navigate(`/mock-test/result/${activity._id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.score >= 8 ? 'bg-green-100 text-green-600' :
                        activity.score >= 5 ? 'bg-blue-100 text-blue-600' :
                          'bg-red-100 text-red-600'
                      }`}>
                      <span className="font-bold text-sm">{activity.score}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                        {activity.testId?.title || activity.testTitle || 'Bài kiểm tra'}
                      </h4>
                      <p className="text-sm text-slate-500">{new Date(activity.createdAt).toLocaleDateString('vi-VN')} • {Math.round((activity.durationSeconds || 0) / 60)} phút</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${activity.score >= 5 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {activity.score >= 5 ? 'Đạt' : 'Chưa đạt'}
                    </span>
                    <ChevronRightIcon className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">
                Chưa có hoạt động nào gần đây
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;

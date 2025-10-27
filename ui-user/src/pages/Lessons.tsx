// import React, { useState } from 'react';
// import { HeadphonesIcon, FileText, Play, BookOpen, Video, Clock, Star, ChevronRight, Search, Filter, SortAsc, Target, Award, Users } from 'lucide-react';

// const Lessons: React.FC = () => {
//   const [activeTab, setActiveTab] = useState<'listening' | 'reading'>('listening');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedLevel, setSelectedLevel] = useState('all');
//   const [selectedCategory, setSelectedCategory] = useState('all');
//   const [sortBy, setSortBy] = useState('newest');

//   const lessonsData = {
//     listening: {
//       lessons: [
//         {
//           id: 1,
//           title: 'Basic Conversations - Hội thoại cơ bản',
//           level: 'Beginner',
//           duration: '25 min',
//           type: 'Interactive',
//           category: 'conversation',
//           description: 'Video hướng dẫn chi tiết cách nghe và hiểu các cuộc hội thoại cơ bản hàng ngày',
//           videoGuide: {
//             title: 'Hướng dẫn kỹ thuật nghe hội thoại',
//             duration: '12 min',
//             topics: ['Cách nhận diện từ khóa', 'Hiểu ngữ cảnh', 'Dự đoán nội dung']
//           },
//           practiceExercises: [
//             { title: 'Bài tập 1: Greeting & Introduction', questions: 10, duration: '5 min' },
//             { title: 'Bài tập 2: Daily Routines', questions: 8, duration: '4 min' },
//             { title: 'Bài tập 3: Shopping Conversations', questions: 12, duration: '6 min' }
//           ],
//           completed: true,
//           rating: 4.8,
//           difficulty: 1,
//           dateAdded: '2024-01-15',
//           instructor: 'Ms. Sarah Johnson',
//           students: 1250,
//           tips: ['Tập trung vào từ khóa chính', 'Chú ý ngữ điệu của người nói', 'Luyện tập hàng ngày 15-20 phút']
//         },
//         {
//           id: 2,
//           title: 'Business Meetings - Họp kinh doanh',
//           level: 'Intermediate',
//           duration: '35 min',
//           type: 'Professional',
//           category: 'business',
//           description: 'Video hướng dẫn kỹ thuật nghe hiểu trong môi trường công sở và các cuộc họp',
//           videoGuide: {
//             title: 'Chiến lược nghe hiểu meeting',
//             duration: '18 min',
//             topics: ['Thuật ngữ business', 'Cấu trúc meeting', 'Note-taking hiệu quả']
//           },
//           practiceExercises: [
//             { title: 'Bài tập 1: Meeting Opening', questions: 15, duration: '8 min' },
//             { title: 'Bài tập 2: Presentations', questions: 12, duration: '7 min' },
//             { title: 'Bài tập 3: Decision Making', questions: 10, duration: '6 min' }
//           ],
//           completed: false,
//           rating: 4.9,
//           difficulty: 3,
//           dateAdded: '2024-01-12',
//           instructor: 'Mr. David Chen',
//           students: 890,
//           tips: ['Học thuộc các cụm từ business thông dụng', 'Luyện ghi chú nhanh', 'Hiểu cấu trúc meeting chuẩn']
//         },
//         {
//           id: 3,
//           title: 'Academic Lectures - Bài giảng học thuật',
//           level: 'Advanced',
//           duration: '45 min',
//           type: 'Academic',
//           category: 'academic',
//           description: 'Video hướng dẫn chuyên sâu về kỹ thuật nghe các bài giảng học thuật và báo cáo khoa học',
//           videoGuide: {
//             title: 'Mastering Academic Listening',
//             duration: '22 min',
//             topics: ['Cấu trúc bài giảng', 'Thuật ngữ khoa học', 'Phân tích luận điểm']
//           },
//           practiceExercises: [
//             { title: 'Bài tập 1: Lecture Introduction', questions: 8, duration: '10 min' },
//             { title: 'Bài tập 2: Main Arguments', questions: 12, duration: '15 min' },
//             { title: 'Bài tập 3: Conclusion & Q&A', questions: 10, duration: '12 min' }
//           ],
//           completed: false,
//           rating: 4.7,
//           difficulty: 4,
//           dateAdded: '2024-01-10',
//           instructor: 'Dr. Emily Watson',
//           students: 650,
//           tips: ['Nắm vững cấu trúc bài giảng chuẩn', 'Tập trung vào main ideas', 'Luyện tập với nhiều chủ đề khác nhau']
//         },
//         {
//           id: 4,
//           title: 'TOEIC Listening Strategies',
//           level: 'Intermediate',
//           duration: '40 min',
//           type: 'Test Prep',
//           category: 'exam',
//           description: 'Video hướng dẫn chiến lược làm bài TOEIC Listening hiệu quả với các mẹo hay',
//           videoGuide: {
//             title: 'TOEIC Listening Mastery',
//             duration: '20 min',
//             topics: ['Phân tích 4 parts', 'Time management', 'Common traps']
//           },
//           practiceExercises: [
//             { title: 'Part 1: Photographs', questions: 10, duration: '8 min' },
//             { title: 'Part 2: Question-Response', questions: 15, duration: '10 min' },
//             { title: 'Part 3 & 4: Conversations & Talks', questions: 20, duration: '15 min' }
//           ],
//           completed: false,
//           rating: 4.6,
//           difficulty: 3,
//           dateAdded: '2024-01-08',
//           instructor: 'Ms. Lisa Park',
//           students: 1100,
//           tips: ['Đọc trước câu hỏi', 'Loại trừ đáp án sai', 'Quản lý thời gian chặt chẽ']
//         }
//       ],
//       categories: [
//         { id: 'all', name: 'Tất cả', count: 4 },
//         { id: 'conversation', name: 'Hội thoại', count: 1 },
//         { id: 'business', name: 'Kinh doanh', count: 1 },
//         { id: 'academic', name: 'Học thuật', count: 1 },
//         { id: 'exam', name: 'Luyện thi', count: 1 }
//       ]
//     },
//     reading: {
//       lessons: [
//         {
//           id: 1,
//           title: 'News Articles - Đọc báo hiệu quả',
//           level: 'Intermediate',
//           duration: '30 min',
//           type: 'Current Affairs',
//           category: 'news',
//           description: 'Video hướng dẫn kỹ thuật đọc hiểu bài báo với phương pháp skimming và scanning',
//           videoGuide: {
//             title: 'Chiến lược đọc báo thông minh',
//             duration: '15 min',
//             topics: ['Skimming technique', 'Scanning for details', 'Understanding headlines']
//           },
//           practiceExercises: [
//             { title: 'Bài tập 1: Headlines Analysis', questions: 10, duration: '8 min' },
//             { title: 'Bài tập 2: Main Ideas', questions: 12, duration: '10 min' },
//             { title: 'Bài tập 3: Supporting Details', questions: 8, duration: '7 min' }
//           ],
//           completed: true,
//           rating: 4.6,
//           difficulty: 2,
//           dateAdded: '2024-01-14',
//           instructor: 'Mr. James Wilson',
//           students: 980,
//           tips: ['Đọc headline trước', 'Tìm topic sentence', 'Chú ý linking words']
//         },
//         {
//           id: 2,
//           title: 'Academic Texts - Văn bản học thuật',
//           level: 'Advanced',
//           duration: '50 min',
//           type: 'Academic',
//           category: 'academic',
//           description: 'Video hướng dẫn chuyên sâu cách phân tích và hiểu các văn bản học thuật phức tạp',
//           videoGuide: {
//             title: 'Academic Reading Mastery',
//             duration: '25 min',
//             topics: ['Text structure analysis', 'Critical thinking', 'Citation understanding']
//           },
//           practiceExercises: [
//             { title: 'Bài tập 1: Abstract Reading', questions: 8, duration: '12 min' },
//             { title: 'Bài tập 2: Data Interpretation', questions: 10, duration: '15 min' },
//             { title: 'Bài tập 3: Arguments Analysis', questions: 12, duration: '18 min' }
//           ],
//           completed: false,
//           rating: 4.8,
//           difficulty: 4,
//           dateAdded: '2024-01-11',
//           instructor: 'Dr. Michael Brown',
//           students: 720,
//           tips: ['Hiểu cấu trúc academic text', 'Phân biệt fact vs opinion', 'Luyện tập với nhiều field khác nhau']
//         },
//         {
//           id: 3,
//           title: 'IELTS Reading Strategies',
//           level: 'Advanced',
//           duration: '55 min',
//           type: 'Test Prep',
//           category: 'exam',
//           description: 'Video hướng dẫn toàn diện các chiến lược làm bài IELTS Reading để đạt band 7+',
//           videoGuide: {
//             title: 'IELTS Reading Band 7+ Guide',
//             duration: '28 min',
//             topics: ['Question types analysis', 'Time management', 'Common mistakes']
//           },
//           practiceExercises: [
//             { title: 'Passage 1: General Training', questions: 14, duration: '20 min' },
//             { title: 'Passage 2: Academic Text', questions: 13, duration: '20 min' },
//             { title: 'Passage 3: Complex Analysis', questions: 13, duration: '20 min' }
//           ],
//           completed: false,
//           rating: 4.9,
//           difficulty: 4,
//           dateAdded: '2024-01-09',
//           instructor: 'Prof. Anna Taylor',
//           students: 850,
//           tips: ['Đọc instructions cẩn thận', 'Không dành quá nhiều thời gian cho 1 câu', 'Transfer answers chính xác']
//         },
//         {
//           id: 4,
//           title: 'Business Documents - Tài liệu kinh doanh',
//           level: 'Intermediate',
//           duration: '35 min',
//           type: 'Professional',
//           category: 'business',
//           description: 'Video hướng dẫn đọc hiểu các loại tài liệu kinh doanh: hợp đồng, báo cáo, email',
//           videoGuide: {
//             title: 'Business Reading Skills',
//             duration: '18 min',
//             topics: ['Document types', 'Key information extraction', 'Professional vocabulary']
//           },
//           practiceExercises: [
//             { title: 'Bài tập 1: Contracts & Agreements', questions: 12, duration: '12 min' },
//             { title: 'Bài tập 2: Business Reports', questions: 10, duration: '10 min' },
//             { title: 'Bài tập 3: Professional Emails', questions: 8, duration: '8 min' }
//           ],
//           completed: true,
//           rating: 4.5,
//           difficulty: 3,
//           dateAdded: '2024-01-07',
//           instructor: 'Ms. Rachel Green',
//           students: 750,
//           tips: ['Nắm vững business vocabulary', 'Hiểu formal writing style', 'Chú ý legal terms']
//         }
//       ],
//       categories: [
//         { id: 'all', name: 'Tất cả', count: 4 },
//         { id: 'news', name: 'Tin tức', count: 1 },
//         { id: 'academic', name: 'Học thuật', count: 1 },
//         { id: 'exam', name: 'Luyện thi', count: 1 },
//         { id: 'business', name: 'Kinh doanh', count: 1 }
//       ]
//     }
//   };

//   const currentData = lessonsData[activeTab];

//   const levels = [
//     { id: 'all', name: 'Tất cả cấp độ' },
//     { id: 'Beginner', name: 'Cơ bản' },
//     { id: 'Intermediate', name: 'Trung bình' },
//     { id: 'Advanced', name: 'Nâng cao' },
//     { id: 'Expert', name: 'Chuyên gia' }
//   ];

//   const sortOptions = [
//     { id: 'newest', name: 'Mới nhất' },
//     { id: 'oldest', name: 'Cũ nhất' },
//     { id: 'rating', name: 'Đánh giá cao' },
//     { id: 'popular', name: 'Phổ biến' },
//     { id: 'duration', name: 'Thời gian ngắn' }
//   ];

//   // Filter and sort lessons
//   const filteredLessons = currentData.lessons
//     .filter(lesson => {
//       const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                            lesson.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                            lesson.videoGuide.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()));
//       const matchesLevel = selectedLevel === 'all' || lesson.level === selectedLevel;
//       const matchesCategory = selectedCategory === 'all' || lesson.category === selectedCategory;
//       return matchesSearch && matchesLevel && matchesCategory;
//     })
//     .sort((a, b) => {
//       switch (sortBy) {
//         case 'newest':
//           return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
//         case 'oldest':
//           return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
//         case 'rating':
//           return b.rating - a.rating;
//         case 'popular':
//           return b.students - a.students;
//         case 'duration':
//           return parseInt(a.duration) - parseInt(b.duration);
//         default:
//           return 0;
//       }
//     });

//   const getLevelColor = (level: string) => {
//     switch (level.toLowerCase()) {
//       case 'beginner': return 'text-green-600 bg-green-100';
//       case 'intermediate': return 'text-yellow-600 bg-yellow-100';
//       case 'advanced': return 'text-orange-600 bg-orange-100';
//       case 'expert': return 'text-red-600 bg-red-100';
//       default: return 'text-gray-600 bg-gray-100';
//     }
//   };

//   const getDifficultyStars = (difficulty: number) => {
//     return Array.from({ length: 5 }, (_, i) => (
//       <Star
//         key={i}
//         className={`w-3 h-3 ${i < difficulty ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
//       />
//     ));
//   };

//   const handleStartLesson = (lessonId: number) => {
//     alert(`Bắt đầu bài học #${lessonId}! Sẽ mở video hướng dẫn trước.`);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-12">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <h1 className="text-4xl font-bold text-gray-900 mb-4">Bài học</h1>
//           <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//             Học miễn phí với video hướng dẫn chi tiết và bài tập ôn tập thực hành
//           </p>
//         </div>

//         {/* Tab Navigation */}
//         <div className="bg-white rounded-xl shadow-lg p-2 mb-8 max-w-md mx-auto">
//           <div className="flex">
//             <button
//               onClick={() => setActiveTab('listening')}
//               className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
//                 activeTab === 'listening'
//                   ? 'bg-blue-600 text-white shadow-md'
//                   : 'text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               <HeadphonesIcon className="w-5 h-5" />
//               <span>Listening</span>
//             </button>
//             <button
//               onClick={() => setActiveTab('reading')}
//               className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
//                 activeTab === 'reading'
//                   ? 'bg-purple-600 text-white shadow-md'
//                   : 'text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               <FileText className="w-5 h-5" />
//               <span>Reading</span>
//             </button>
//           </div>
//         </div>

//         {/* Search and Filters */}
//         <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
//           <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
//             {/* Search */}
//             <div className="lg:col-span-2 relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//               <input
//                 type="text"
//                 placeholder="Tìm kiếm bài học..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* Level Filter */}
//             <div className="relative">
//               <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//               <select
//                 value={selectedLevel}
//                 onChange={(e) => setSelectedLevel(e.target.value)}
//                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
//               >
//                 {levels.map(level => (
//                   <option key={level.id} value={level.id}>{level.name}</option>
//                 ))}
//               </select>
//             </div>

//             {/* Sort */}
//             <div className="relative">
//               <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//               <select
//                 value={sortBy}
//                 onChange={(e) => setSortBy(e.target.value)}
//                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
//               >
//                 {sortOptions.map(option => (
//                   <option key={option.id} value={option.id}>{option.name}</option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Category Filter */}
//           <div className="flex flex-wrap gap-2">
//             {currentData.categories.map(category => (
//               <button
//                 key={category.id}
//                 onClick={() => setSelectedCategory(category.id)}
//                 className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
//                   selectedCategory === category.id
//                     ? activeTab === 'listening' 
//                       ? 'bg-blue-600 text-white'
//                       : 'bg-purple-600 text-white'
//                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                 }`}
//               >
//                 {category.name} ({category.count})
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Lessons Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
//           {filteredLessons.length === 0 ? (
//             <div className="col-span-full text-center py-12">
//               <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//               <p className="text-gray-500 text-lg">Không tìm thấy bài học nào phù hợp với bộ lọc của bạn</p>
//             </div>
//           ) : (
//             filteredLessons.map((lesson) => (
//               <div key={lesson.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
//                 {/* Lesson Header */}
//                 <div className={`p-6 ${activeTab === 'listening' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-purple-500 to-purple-600'} text-white`}>
//                   <div className="flex items-center justify-between mb-3">
//                     <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(lesson.level)} bg-white`}>
//                       {lesson.level}
//                     </span>
//                     <div className="flex items-center space-x-1">
//                       <Star className="w-4 h-4 fill-current text-yellow-300" />
//                       <span className="text-sm">{lesson.rating}</span>
//                     </div>
//                   </div>
//                   <h3 className="text-xl font-bold mb-2">{lesson.title}</h3>
//                   <p className="text-blue-100 text-sm mb-3">{lesson.description}</p>
//                   <div className="flex items-center justify-between text-sm">
//                     <div className="flex items-center space-x-4">
//                       <div className="flex items-center space-x-1">
//                         <Clock className="w-4 h-4" />
//                         <span>{lesson.duration}</span>
//                       </div>
//                       <div className="flex items-center space-x-1">
//                         <Users className="w-4 h-4" />
//                         <span>{lesson.students}</span>
//                       </div>
//                     </div>
//                     <div className="flex items-center space-x-1">
//                       {getDifficultyStars(lesson.difficulty)}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Lesson Content */}
//                 <div className="p-6">
//                   <div className="mb-4">
//                     <div className="flex items-center justify-between mb-2">
//                       <h4 className="font-semibold text-gray-900">Giảng viên:</h4>
//                       <span className="text-sm text-blue-600 font-medium">{lesson.instructor}</span>
//                     </div>
//                   </div>

//                   {/* Video Guide Section */}
//                   <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
//                     <div className="flex items-center space-x-2 mb-3">
//                       <Video className="w-5 h-5 text-orange-600" />
//                       <h4 className="font-semibold text-gray-900">📹 Video hướng dẫn</h4>
//                       <span className="text-sm text-orange-600 font-medium">({lesson.videoGuide.duration})</span>
//                     </div>
//                     <h5 className="font-medium text-gray-800 mb-2">{lesson.videoGuide.title}</h5>
//                     <div className="flex flex-wrap gap-2 mb-3">
//                       {lesson.videoGuide.topics.map((topic, index) => (
//                         <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
//                           {topic}
//                         </span>
//                       ))}
//                     </div>
//                   </div>

//                   {/* Practice Exercises */}
//                   <div className="mb-6">
//                     <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
//                       <BookOpen className="w-5 h-5 mr-2 text-green-600" />
//                       Bài tập ôn tập:
//                     </h4>
//                     <div className="space-y-2">
//                       {lesson.practiceExercises.map((exercise, index) => (
//                         <div key={index} className="flex items-center justify-between py-2 px-3 bg-green-50 rounded-lg border border-green-200">
//                           <div className="flex items-center space-x-2">
//                             <Target className="w-4 h-4 text-green-600" />
//                             <span className="text-sm font-medium">{exercise.title}</span>
//                             <span className="text-xs text-gray-500">({exercise.questions} câu)</span>
//                           </div>
//                           <span className="text-xs text-green-600 font-medium">{exercise.duration}</span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>

//                   {/* Tips Section */}
//                   <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
//                     <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
//                       <Award className="w-5 h-5 mr-2 text-blue-600" />
//                       💡 Mẹo học tập:
//                     </h4>
//                     <ul className="space-y-1">
//                       {lesson.tips.map((tip, index) => (
//                         <li key={index} className="text-sm text-gray-700 flex items-start">
//                           <span className="text-blue-600 mr-2">•</span>
//                           {tip}
//                         </li>
//                       ))}
//                     </ul>
//                   </div>

//                   <button
//                     onClick={() => handleStartLesson(lesson.id)}
//                     className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
//                       lesson.completed
//                         ? 'bg-green-100 text-green-800 hover:bg-green-200'
//                         : activeTab === 'listening'
//                         ? 'bg-blue-600 text-white hover:bg-blue-700'
//                         : 'bg-purple-600 text-white hover:bg-purple-700'
//                     }`}
//                   >
//                     <Play className="w-5 h-5" />
//                     <span>{lesson.completed ? 'Xem lại video & luyện tập' : 'Bắt đầu với video hướng dẫn'}</span>
//                     <ChevronRight className="w-4 h-4" />
//                   </button>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>

//         {/* Free Access Notice */}
//         <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-2xl p-8 text-center">
//           <Award className="w-12 h-12 mx-auto mb-4" />
//           <h2 className="text-2xl font-bold mb-4">✨ Hoàn toàn miễn phí!</h2>
//           <p className="text-lg mb-6 max-w-2xl mx-auto">
//             Tất cả video hướng dẫn và bài tập đều có thể truy cập mà không cần đăng ký tài khoản. 
//             Bắt đầu học ngay hôm nay để nâng cao kỹ năng tiếng Anh của bạn!
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <div className="flex items-center space-x-2">
//               <Video className="w-5 h-5" />
//               <span>Video hướng dẫn chi tiết</span>
//             </div>
//             <div className="flex items-center space-x-2">
//               <BookOpen className="w-5 h-5" />
//               <span>Bài tập ôn tập đa dạng</span>
//             </div>
//             <div className="flex items-center space-x-2">
//               <Star className="w-5 h-5" />
//               <span>Mẹo học tập hiệu quả</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Lessons;


import React, { useState } from 'react';
import { HeadphonesIcon, FileText, Play, BookOpen, Video, Clock, ChevronRight, Search, Filter, SortAsc, Target } from 'lucide-react';

const Lessons: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'listening' | 'reading'>('listening');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Map lại thành dạng bài tập
  const levels = [
    { id: 'all', name: 'Tất cả dạng bài' },
    { id: 'multichoice', name: 'Multichoice' },
    { id: 'cloze', name: 'Cloze' },
    { id: 'matching', name: 'Matching' },
    { id: 'shortanswer', name: 'Short Answer' }
  ];

  const lessonsData = {
    listening: {
      lessons: [
        {
          id: 1,
          title: 'Basic Conversations - Hội thoại cơ bản',
          level: 'multichoice',
          duration: '25 min',
          type: 'Interactive',
          category: 'conversation',
          description: 'Video hướng dẫn chi tiết cách nghe và hiểu các cuộc hội thoại cơ bản hàng ngày',
          videoGuide: {
            title: 'Hướng dẫn kỹ thuật nghe hội thoại',
            duration: '12 min',
            topics: ['Cách nhận diện từ khóa', 'Hiểu ngữ cảnh', 'Dự đoán nội dung']
          },
          practiceExercises: [
            { title: 'Bài tập 1: Greeting & Introduction', questions: 10, duration: '5 min' },
            { title: 'Bài tập 2: Daily Routines', questions: 8, duration: '4 min' }
          ],
          completed: true,
          difficulty: 1,
          dateAdded: '2024-01-15',
          students: 1250
        },
        {
          id: 2,
          title: 'Business Meetings - Họp kinh doanh',
          level: 'cloze',
          duration: '35 min',
          type: 'Professional',
          category: 'business',
          description: 'Video hướng dẫn kỹ thuật nghe hiểu trong môi trường công sở và các cuộc họp',
          videoGuide: {
            title: 'Chiến lược nghe hiểu meeting',
            duration: '18 min',
            topics: ['Thuật ngữ business', 'Cấu trúc meeting', 'Note-taking hiệu quả']
          },
          practiceExercises: [
            { title: 'Bài tập 1: Meeting Opening', questions: 15, duration: '8 min' },
            { title: 'Bài tập 2: Presentations', questions: 12, duration: '7 min' }
          ],
          completed: false,
          difficulty: 3,
          dateAdded: '2024-01-12',
          students: 890
        }
      ],
      categories: [
        { id: 'all', name: 'Tất cả', count: 2 },
        { id: 'conversation', name: 'Hội thoại', count: 1 },
        { id: 'business', name: 'Kinh doanh', count: 1 }
      ]
    },
    reading: {
      lessons: [
        {
          id: 1,
          title: 'News Articles - Đọc báo hiệu quả',
          level: 'matching',
          duration: '30 min',
          type: 'Current Affairs',
          category: 'news',
          description: 'Video hướng dẫn kỹ thuật đọc hiểu bài báo với phương pháp skimming và scanning',
          videoGuide: {
            title: 'Chiến lược đọc báo thông minh',
            duration: '15 min',
            topics: ['Skimming technique', 'Scanning for details', 'Understanding headlines']
          },
          practiceExercises: [
            { title: 'Bài tập 1: Headlines Analysis', questions: 10, duration: '8 min' },
            { title: 'Bài tập 2: Main Ideas', questions: 12, duration: '10 min' }
          ],
          completed: true,
          difficulty: 2,
          dateAdded: '2024-01-14',
          students: 980
        },
        {
          id: 2,
          title: 'Academic Texts - Văn bản học thuật',
          level: 'shortanswer',
          duration: '50 min',
          type: 'Academic',
          category: 'academic',
          description: 'Video hướng dẫn cách phân tích và hiểu các văn bản học thuật phức tạp',
          videoGuide: {
            title: 'Academic Reading Mastery',
            duration: '25 min',
            topics: ['Text structure analysis', 'Critical thinking']
          },
          practiceExercises: [
            { title: 'Bài tập 1: Abstract Reading', questions: 8, duration: '12 min' },
            { title: 'Bài tập 2: Data Interpretation', questions: 10, duration: '15 min' }
          ],
          completed: false,
          difficulty: 4,
          dateAdded: '2024-01-11',
          students: 720
        }
      ],
      categories: [
        { id: 'all', name: 'Tất cả', count: 2 },
        { id: 'news', name: 'Tin tức', count: 1 },
        { id: 'academic', name: 'Học thuật', count: 1 }
      ]
    }
  };

  const currentData = lessonsData[activeTab];

  // Filter and sort lessons
  const filteredLessons = currentData.lessons
    .filter(lesson => {
      const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.videoGuide.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesLevel = selectedLevel === 'all' || lesson.level === selectedLevel;
      const matchesCategory = selectedCategory === 'all' || lesson.category === selectedCategory;
      return matchesSearch && matchesLevel && matchesCategory;
    })
    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'multichoice': return 'text-blue-600 bg-blue-100';
      case 'cloze': return 'text-purple-600 bg-purple-100';
      case 'matching': return 'text-green-600 bg-green-100';
      case 'shortanswer': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleStartLesson = (lessonId: number) => {
    alert(`Bắt đầu bài học #${lessonId}!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Bài học</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Học miễn phí với video hướng dẫn chi tiết và bài tập ôn tập thực hành
          </p>
        </div>

        {/* Tabs */}
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

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm bài học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Level Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                {levels.map(level => (
                  <option key={level.id} value={level.id}>{level.name}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="relative">
              <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
              </select>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {currentData.categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? activeTab === 'listening' 
                      ? 'bg-blue-600 text-white'
                      : 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {filteredLessons.map((lesson) => (
            <div key={lesson.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              {/* Header */}
              <div className={`p-6 ${activeTab === 'listening' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-purple-500 to-purple-600'} text-white`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(lesson.level)} bg-white`}>
                    {levels.find(l => l.id === lesson.level)?.name}
                  </span>
                  <div className="flex items-center space-x-1 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{lesson.duration}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{lesson.title}</h3>
                <p className="text-blue-100 text-sm">{lesson.description}</p>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Video Guide */}
                <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Video className="w-5 h-5 text-orange-600" />
                    <h4 className="font-semibold text-gray-900">📹 Video hướng dẫn</h4>
                    <span className="text-sm text-orange-600 font-medium">({lesson.videoGuide.duration})</span>
                  </div>
                  <h5 className="font-medium text-gray-800 mb-2">{lesson.videoGuide.title}</h5>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {lesson.videoGuide.topics.map((topic, index) => (
                      <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Exercises */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-green-600" />
                    Bài tập ôn tập:
                  </h4>
                  <div className="space-y-2">
                    {lesson.practiceExercises.map((exercise, index) => (
                      <div key={index} className="flex items-center justify-between py-2 px-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium">{exercise.title}</span>
                          <span className="text-xs text-gray-500">({exercise.questions} câu)</span>
                        </div>
                        <span className="text-xs text-green-600 font-medium">{exercise.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleStartLesson(lesson.id)}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
                    lesson.completed
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : activeTab === 'listening'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  <Play className="w-5 h-5" />
                  <span>{lesson.completed ? 'Xem lại video & luyện tập' : 'Bắt đầu với video hướng dẫn'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Lessons;

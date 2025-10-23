// import React, { useState } from 'react';
// import { HeadphonesIcon, FileText, TrendingUp, Clock, CheckCircle, Star, Search, Filter, SortAsc, Play, Target } from 'lucide-react';

// const Practice: React.FC = () => {
//   const [activeTab, setActiveTab] = useState<'listening' | 'reading'>('listening');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedLevel, setSelectedLevel] = useState('all');
//   const [selectedCategory, setSelectedCategory] = useState('all');
//   const [sortBy, setSortBy] = useState('newest');

//   const practiceData = {
//     listening: {
//       exercises: [
//         { 
//           id: 1,
//           title: 'Daily Conversations', 
//           level: 'Basic', 
//           duration: '15 min', 
//           completed: true,
//           category: 'conversation',
//           difficulty: 1,
//           rating: 4.5,
//           attempts: 3,
//           bestScore: 85,
//           description: 'Luyện nghe các cuộc hội thoại hàng ngày',
//           topics: ['Greetings', 'Shopping', 'Restaurant'],
//           dateAdded: '2024-01-15'
//         },
//         { 
//           id: 2,
//           title: 'Short Talks', 
//           level: 'Intermediate', 
//           duration: '20 min', 
//           completed: true,
//           category: 'presentation',
//           difficulty: 2,
//           rating: 4.3,
//           attempts: 2,
//           bestScore: 78,
//           description: 'Nghe hiểu các bài thuyết trình ngắn',
//           topics: ['Business', 'Technology', 'Health'],
//           dateAdded: '2024-01-12'
//         },
//         { 
//           id: 3,
//           title: 'Academic Lectures', 
//           level: 'Advanced', 
//           duration: '25 min', 
//           completed: false,
//           category: 'academic',
//           difficulty: 4,
//           rating: 4.7,
//           attempts: 0,
//           bestScore: 0,
//           description: 'Luyện nghe các bài giảng học thuật',
//           topics: ['Science', 'History', 'Literature'],
//           dateAdded: '2024-01-10'
//         },
//         { 
//           id: 4,
//           title: 'News Reports', 
//           level: 'Advanced', 
//           duration: '18 min', 
//           completed: false,
//           category: 'news',
//           difficulty: 4,
//           rating: 4.4,
//           attempts: 1,
//           bestScore: 65,
//           description: 'Nghe hiểu bản tin thời sự',
//           topics: ['Current Events', 'Politics', 'Economy'],
//           dateAdded: '2024-01-08'
//         },
//         { 
//           id: 5,
//           title: 'Business Meetings', 
//           level: 'Intermediate', 
//           duration: '22 min', 
//           completed: false,
//           category: 'business',
//           difficulty: 3,
//           rating: 4.6,
//           attempts: 0,
//           bestScore: 0,
//           description: 'Luyện nghe các cuộc họp công sở',
//           topics: ['Meetings', 'Presentations', 'Negotiations'],
//           dateAdded: '2024-01-05'
//         },
//         { 
//           id: 6,
//           title: 'Phone Conversations', 
//           level: 'Basic', 
//           duration: '12 min', 
//           completed: true,
//           category: 'conversation',
//           difficulty: 1,
//           rating: 4.2,
//           attempts: 4,
//           bestScore: 92,
//           description: 'Luyện nghe cuộc gọi điện thoại',
//           topics: ['Phone Skills', 'Appointments', 'Information'],
//           dateAdded: '2024-01-03'
//         }
//       ],
//       stats: { completed: 45, total: 120, accuracy: 85 },
//       categories: [
//         { id: 'all', name: 'Tất cả', count: 6 },
//         { id: 'conversation', name: 'Hội thoại', count: 2 },
//         { id: 'presentation', name: 'Thuyết trình', count: 1 },
//         { id: 'academic', name: 'Học thuật', count: 1 },
//         { id: 'news', name: 'Tin tức', count: 1 },
//         { id: 'business', name: 'Kinh doanh', count: 1 }
//       ]
//     },
//     reading: {
//       exercises: [
//         { 
//           id: 1,
//           title: 'Short Passages', 
//           level: 'Basic', 
//           duration: '10 min', 
//           completed: true,
//           category: 'general',
//           difficulty: 1,
//           rating: 4.3,
//           attempts: 2,
//           bestScore: 88,
//           description: 'Đọc hiểu các đoạn văn ngắn',
//           topics: ['Daily Life', 'Travel', 'Food'],
//           dateAdded: '2024-01-14'
//         },
//         { 
//           id: 2,
//           title: 'News Articles', 
//           level: 'Intermediate', 
//           duration: '15 min', 
//           completed: true,
//           category: 'news',
//           difficulty: 2,
//           rating: 4.5,
//           attempts: 3,
//           bestScore: 82,
//           description: 'Đọc hiểu bài báo thời sự',
//           topics: ['Current Events', 'Society', 'Environment'],
//           dateAdded: '2024-01-11'
//         },
//         { 
//           id: 3,
//           title: 'Academic Texts', 
//           level: 'Advanced', 
//           duration: '30 min', 
//           completed: false,
//           category: 'academic',
//           difficulty: 4,
//           rating: 4.8,
//           attempts: 0,
//           bestScore: 0,
//           description: 'Đọc hiểu văn bản học thuật',
//           topics: ['Research', 'Science', 'Analysis'],
//           dateAdded: '2024-01-09'
//         },
//         { 
//           id: 4,
//           title: 'Literary Works', 
//           level: 'Expert', 
//           duration: '25 min', 
//           completed: false,
//           category: 'literature',
//           difficulty: 5,
//           rating: 4.9,
//           attempts: 0,
//           bestScore: 0,
//           description: 'Phân tích tác phẩm văn học',
//           topics: ['Poetry', 'Novels', 'Drama'],
//           dateAdded: '2024-01-07'
//         },
//         { 
//           id: 5,
//           title: 'Business Reports', 
//           level: 'Intermediate', 
//           duration: '20 min', 
//           completed: false,
//           category: 'business',
//           difficulty: 3,
//           rating: 4.4,
//           attempts: 1,
//           bestScore: 70,
//           description: 'Đọc hiểu báo cáo kinh doanh',
//           topics: ['Finance', 'Marketing', 'Strategy'],
//           dateAdded: '2024-01-06'
//         },
//         { 
//           id: 6,
//           title: 'Scientific Papers', 
//           level: 'Advanced', 
//           duration: '35 min', 
//           completed: false,
//           category: 'academic',
//           difficulty: 4,
//           rating: 4.6,
//           attempts: 0,
//           bestScore: 0,
//           description: 'Đọc hiểu bài báo khoa học',
//           topics: ['Research Methods', 'Data Analysis', 'Conclusions'],
//           dateAdded: '2024-01-04'
//         }
//       ],
//       stats: { completed: 32, total: 98, accuracy: 78 },
//       categories: [
//         { id: 'all', name: 'Tất cả', count: 6 },
//         { id: 'general', name: 'Tổng quát', count: 1 },
//         { id: 'news', name: 'Tin tức', count: 1 },
//         { id: 'academic', name: 'Học thuật', count: 2 },
//         { id: 'literature', name: 'Văn học', count: 1 },
//         { id: 'business', name: 'Kinh doanh', count: 1 }
//       ]
//     }
//   };

//   const currentData = practiceData[activeTab];

//   const levels = [
//     { id: 'all', name: 'Tất cả cấp độ' },
//     { id: 'Basic', name: 'Cơ bản' },
//     { id: 'Intermediate', name: 'Trung bình' },
//     { id: 'Advanced', name: 'Nâng cao' },
//     { id: 'Expert', name: 'Chuyên gia' }
//   ];

//   const sortOptions = [
//     { id: 'newest', name: 'Mới nhất' },
//     { id: 'oldest', name: 'Cũ nhất' },
//     { id: 'difficulty', name: 'Độ khó' },
//     { id: 'rating', name: 'Đánh giá' },
//     { id: 'duration', name: 'Thời gian' }
//   ];

//   // Filter and sort exercises
//   const filteredExercises = currentData.exercises
//     .filter(exercise => {
//       const matchesSearch = exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                            exercise.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                            exercise.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()));
//       const matchesLevel = selectedLevel === 'all' || exercise.level === selectedLevel;
//       const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
//       return matchesSearch && matchesLevel && matchesCategory;
//     })
//     .sort((a, b) => {
//       switch (sortBy) {
//         case 'newest':
//           return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
//         case 'oldest':
//           return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
//         case 'difficulty':
//           return b.difficulty - a.difficulty;
//         case 'rating':
//           return b.rating - a.rating;
//         case 'duration':
//           return parseInt(a.duration) - parseInt(b.duration);
//         default:
//           return 0;
//       }
//     });

//   const getLevelColor = (level: string) => {
//     switch (level) {
//       case 'Basic': return 'bg-green-100 text-green-800';
//       case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
//       case 'Advanced': return 'bg-orange-100 text-orange-800';
//       case 'Expert': return 'bg-red-100 text-red-800';
//       default: return 'bg-gray-100 text-gray-800';
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

//   return (
//     <div className="min-h-screen bg-gray-50 py-12">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <h1 className="text-4xl font-bold text-gray-900 mb-4">Ôn luyện</h1>
//           <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//             Nâng cao kỹ năng tiếng Anh với các bài tập đa dạng từ cơ bản đến nâng cao
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

//         {/* Stats Header */}
//         <div className={`bg-gradient-to-r ${activeTab === 'listening' ? 'from-blue-500 to-blue-700' : 'from-purple-500 to-purple-700'} text-white rounded-2xl p-8 mb-8`}>
//           <div className="flex items-center justify-between mb-6">
//             <div className="flex items-center space-x-4">
//               {activeTab === 'listening' ? <HeadphonesIcon className="w-8 h-8" /> : <FileText className="w-8 h-8" />}
//               <h2 className="text-3xl font-bold">{activeTab === 'listening' ? 'Listening Practice' : 'Reading Practice'}</h2>
//             </div>
//             <div className="text-right">
//               <div className="text-sm opacity-90">Tiến độ</div>
//               <div className="text-2xl font-bold">
//                 {currentData.stats.completed}/{currentData.stats.total}
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-3 gap-6">
//             <div className="text-center">
//               <div className="text-2xl font-bold">{currentData.stats.completed}</div>
//               <div className="text-sm opacity-90">Hoàn thành</div>
//             </div>
//             <div className="text-center">
//               <div className="text-2xl font-bold">{currentData.stats.accuracy}%</div>
//               <div className="text-sm opacity-90">Độ chính xác</div>
//             </div>
//             <div className="text-center">
//               <div className="text-2xl font-bold">
//                 {Math.round((currentData.stats.completed / currentData.stats.total) * 100)}%
//               </div>
//               <div className="text-sm opacity-90">Tiến độ</div>
//             </div>
//           </div>
//         </div>

//         {/* Search and Filters */}
//         <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
//           <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
//             {/* Search */}
//             <div className="lg:col-span-2 relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//               <input
//                 type="text"
//                 placeholder="Tìm kiếm bài tập..."
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
//           <div className="flex flex-wrap gap-2 mt-4">
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

//         {/* Exercises Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//           {filteredExercises.map((exercise) => (
//             <div key={exercise.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
//               <div className="p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="text-lg font-semibold text-gray-900">{exercise.title}</h3>
//                   {exercise.completed ? (
//                     <CheckCircle className="w-6 h-6 text-green-500" />
//                   ) : (
//                     <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
//                   )}
//                 </div>

//                 <p className="text-gray-600 text-sm mb-4">{exercise.description}</p>

//                 <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
//                   <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(exercise.level)}`}>
//                     {exercise.level}
//                   </span>
//                   <div className="flex items-center space-x-1">
//                     <Clock className="w-4 h-4" />
//                     <span>{exercise.duration}</span>
//                   </div>
//                 </div>

//                 <div className="flex items-center justify-between mb-4">
//                   <div className="flex items-center space-x-1">
//                     <Star className="w-4 h-4 text-yellow-400 fill-current" />
//                     <span className="text-sm font-medium">{exercise.rating}</span>
//                   </div>
//                   <div className="flex items-center space-x-1">
//                     {getDifficultyStars(exercise.difficulty)}
//                   </div>
//                 </div>

//                 {exercise.completed && (
//                   <div className="bg-green-50 rounded-lg p-3 mb-4">
//                     <div className="flex items-center justify-between text-sm">
//                       <span className="text-green-700">Điểm cao nhất:</span>
//                       <span className="font-semibold text-green-800">{exercise.bestScore}/100</span>
//                     </div>
//                     <div className="flex items-center justify-between text-sm">
//                       <span className="text-green-700">Số lần thử:</span>
//                       <span className="font-semibold text-green-800">{exercise.attempts}</span>
//                     </div>
//                   </div>
//                 )}

//                 <div className="flex flex-wrap gap-1 mb-4">
//                   {exercise.topics.map((topic, index) => (
//                     <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
//                       {topic}
//                     </span>
//                   ))}
//                 </div>

//                 <button className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 ${
//                   exercise.completed 
//                     ? 'bg-green-100 text-green-800 hover:bg-green-200'
//                     : activeTab === 'listening'
//                     ? 'bg-blue-600 text-white hover:bg-blue-700'
//                     : 'bg-purple-600 text-white hover:bg-purple-700'
//                 }`}>
//                   <Play className="w-4 h-4" />
//                   <span>{exercise.completed ? 'Luyện lại' : 'Bắt đầu'}</span>
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>

//         {filteredExercises.length === 0 && (
//           <div className="text-center py-12">
//             <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//             <p className="text-gray-500 text-lg">Không tìm thấy bài tập nào phù hợp với bộ lọc của bạn</p>
//           </div>
//         )}

//         {/* Progress Overview */}
//         <div className="bg-white rounded-2xl shadow-lg p-8">
//           <h2 className="text-2xl font-bold text-gray-900 mb-6">Tổng quan tiến độ</h2>
          
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="text-center p-6 bg-blue-50 rounded-lg">
//               <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
//               <div className="text-2xl font-bold text-blue-600">{currentData.stats.completed}</div>
//               <div className="text-gray-600">Bài tập hoàn thành</div>
//             </div>
            
//             <div className="text-center p-6 bg-green-50 rounded-lg">
//               <Star className="w-8 h-8 text-green-600 mx-auto mb-2" />
//               <div className="text-2xl font-bold text-green-600">{currentData.stats.accuracy}%</div>
//               <div className="text-gray-600">Độ chính xác trung bình</div>
//             </div>
            
//             <div className="text-center p-6 bg-purple-50 rounded-lg">
//               <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
//               <div className="text-2xl font-bold text-purple-600">
//                 {filteredExercises.reduce((total, ex) => total + parseInt(ex.duration), 0)} phút
//               </div>
//               <div className="text-gray-600">Tổng thời gian luyện tập</div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Practice;


import React, { useState } from 'react';
import { HeadphonesIcon, FileText, Clock, CheckCircle, Search, Filter, SortAsc, Play, Target } from 'lucide-react';

const Practice: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'listening' | 'reading'>('listening');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const practiceData = {
    listening: {
      exercises: [
        { 
          id: 1,
          title: 'Daily Conversations', 
          level: 'Basic', 
          duration: '15 min', 
          completed: true,
          category: 'conversation',
          difficulty: 1,
          attempts: 3,
          bestScore: 85,
          description: 'Luyện nghe các cuộc hội thoại hàng ngày',
          topics: ['Greetings', 'Shopping', 'Restaurant'],
          dateAdded: '2024-01-15'
        },
        { 
          id: 2,
          title: 'Short Talks', 
          level: 'Intermediate', 
          duration: '20 min', 
          completed: true,
          category: 'presentation',
          difficulty: 2,
          attempts: 2,
          bestScore: 78,
          description: 'Nghe hiểu các bài thuyết trình ngắn',
          topics: ['Business', 'Technology', 'Health'],
          dateAdded: '2024-01-12'
        },
        { 
          id: 3,
          title: 'Academic Lectures', 
          level: 'Advanced', 
          duration: '25 min', 
          completed: false,
          category: 'academic',
          difficulty: 4,
          attempts: 0,
          bestScore: 0,
          description: 'Luyện nghe các bài giảng học thuật',
          topics: ['Science', 'History', 'Literature'],
          dateAdded: '2024-01-10'
        }
      ]
    },
    reading: {
      exercises: [
        { 
          id: 1,
          title: 'Short Passages', 
          level: 'Basic', 
          duration: '10 min', 
          completed: true,
          category: 'general',
          difficulty: 1,
          attempts: 2,
          bestScore: 88,
          description: 'Đọc hiểu các đoạn văn ngắn',
          topics: ['Daily Life', 'Travel', 'Food'],
          dateAdded: '2024-01-14'
        },
        { 
          id: 2,
          title: 'News Articles', 
          level: 'Intermediate', 
          duration: '15 min', 
          completed: true,
          category: 'news',
          difficulty: 2,
          attempts: 3,
          bestScore: 82,
          description: 'Đọc hiểu bài báo thời sự',
          topics: ['Current Events', 'Society', 'Environment'],
          dateAdded: '2024-01-11'
        }
      ]
    }
  };

  const currentData = practiceData[activeTab];

  const levels = [
    { id: 'all', name: 'Tất cả cấp độ' },
    { id: 'Basic', name: 'Cơ bản' },
    { id: 'Intermediate', name: 'Trung bình' },
    { id: 'Advanced', name: 'Nâng cao' },
    { id: 'Expert', name: 'Chuyên gia' }
  ];

  const sortOptions = [
    { id: 'newest', name: 'Mới nhất' },
    { id: 'oldest', name: 'Cũ nhất' },
    { id: 'difficulty', name: 'Độ khó' },
    { id: 'duration', name: 'Thời gian' }
  ];

  // Filter and sort exercises
  const filteredExercises = currentData.exercises
    .filter(exercise => {
      const matchesSearch = exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           exercise.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           exercise.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesLevel = selectedLevel === 'all' || exercise.level === selectedLevel;
      return matchesSearch && matchesLevel;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        case 'oldest':
          return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
        case 'difficulty':
          return b.difficulty - a.difficulty;
        case 'duration':
          return parseInt(a.duration) - parseInt(b.duration);
        default:
          return 0;
      }
    });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Basic': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-orange-100 text-orange-800';
      case 'Expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Ôn luyện</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nâng cao kỹ năng tiếng Anh với các bài tập đa dạng từ cơ bản đến nâng cao
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

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm bài tập..."
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
                {sortOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Exercises Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredExercises.map((exercise) => (
            <div key={exercise.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{exercise.title}</h3>
                  {exercise.completed ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4">{exercise.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(exercise.level)}`}>
                    {exercise.level}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{exercise.duration}</span>
                  </div>
                </div>

                {exercise.completed && (
                  <div className="bg-green-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-700">Điểm cao nhất:</span>
                      <span className="font-semibold text-green-800">{exercise.bestScore}/100</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-700">Số lần thử:</span>
                      <span className="font-semibold text-green-800">{exercise.attempts}</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-1 mb-4">
                  {exercise.topics.map((topic, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {topic}
                    </span>
                  ))}
                </div>

                <button className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 ${
                  exercise.completed 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : activeTab === 'listening'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}>
                  <Play className="w-4 h-4" />
                  <span>{exercise.completed ? 'Luyện lại' : 'Bắt đầu'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredExercises.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Không tìm thấy bài tập nào phù hợp với bộ lọc của bạn</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Practice;

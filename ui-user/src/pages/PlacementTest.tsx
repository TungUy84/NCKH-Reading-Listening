// import React, { useState } from 'react';
// import { useNavigate } from "react-router-dom";
// import { HeadphonesIcon, FileText, Clock, Users, ArrowRight, CheckCircle } from 'lucide-react';

// const PlacementTest: React.FC = () => {
//   const [activeTab, setActiveTab] = useState<'listening' | 'reading'>('listening');

//   const testData = {
//     listening: {
//       title: 'Listening Placement Test',
//       icon: <HeadphonesIcon className="w-12 h-12" />,
//       duration: '30 phút',
//       questions: '25 câu hỏi',
//       description: 'Đánh giá khả năng nghe hiểu tiếng Anh của bạn thông qua các đoạn hội thoại và monologue',
//       features: ['Âm thanh chất lượng cao', 'Đa dạng giọng nói', 'Phản hồi chi tiết'],
//       color: 'from-blue-500 to-blue-700',
//       sections: [
//         { name: 'Part 1: Photographs', questions: 6, description: 'Mô tả hình ảnh' },
//         { name: 'Part 2: Question-Response', questions: 25, description: 'Câu hỏi và phản hồi' },
//         { name: 'Part 3: Conversations', questions: 39, description: 'Hội thoại ngắn' },
//         { name: 'Part 4: Short Talks', questions: 30, description: 'Bài nói ngắn' }
//       ]
//     },
//     reading: {
//       title: 'Reading Placement Test',
//       icon: <FileText className="w-12 h-12" />,
//       duration: '45 phút',
//       questions: '30 câu hỏi',
//       description: 'Kiểm tra khả năng đọc hiểu và phân tích văn bản tiếng Anh ở nhiều cấp độ khác nhau',
//       features: ['Đa dạng thể loại văn bản', 'Từ cơ bản đến nâng cao', 'Phân tích kết quả chi tiết'],
//       color: 'from-purple-500 to-purple-700',
//       sections: [
//         { name: 'Part 1: Incomplete Sentences', questions: 30, description: 'Hoàn thành câu' },
//         { name: 'Part 2: Text Completion', questions: 16, description: 'Hoàn thành đoạn văn' },
//         { name: 'Part 3: Reading Comprehension', questions: 54, description: 'Đọc hiểu' }
//       ]
//     }
//   };

//   // const currentTest = testData[activeTab];

//   // const handleStartTest = () => {
//   //   alert(`Bắt đầu ${activeTab === 'listening' ? 'Listening' : 'Reading'} Placement Test!`);
//   // };

  
//   const PlacementTest: React.FC = () => {
//     const [activeTab, setActiveTab] = useState<'listening' | 'reading'>('listening');
//     const navigate = useNavigate();

//     const handleStartTest = () => {
//       navigate(`/examtest/${activeTab}`);
//     };
//   return (
//     <div className="min-h-screen bg-gray-50 py-12">
//       <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <h1 className="text-4xl font-bold text-gray-900 mb-4">
//             Kiểm tra đầu vào
//           </h1>
//           <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//             Xác định trình độ tiếng Anh hiện tại của bạn để tạo lộ trình học tập phù hợp
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

//         {/* Test Content */}
//         <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
//           <div className={`bg-gradient-to-r ${currentTest.color} p-8 text-white`}>
//             <div className="flex items-center justify-center mb-4">
//               {currentTest.icon}
//             </div>
//             <h2 className="text-3xl font-bold text-center mb-2">{currentTest.title}</h2>
//             <div className="flex justify-center space-x-6 text-sm">
//               <div className="flex items-center space-x-1">
//                 <Clock className="w-4 h-4" />
//                 <span>{currentTest.duration}</span>
//               </div>
//               <div className="flex items-center space-x-1">
//                 <Users className="w-4 h-4" />
//                 <span>{currentTest.questions}</span>
//               </div>
//             </div>
//           </div>

//           <div className="p-8">
//             <p className="text-gray-600 mb-6 leading-relaxed text-center">
//               {currentTest.description}
//             </p>

//             {/* Test Sections */}
//             <div className="mb-8">
//               <h3 className="text-xl font-semibold text-gray-900 mb-4">Cấu trúc bài thi:</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {currentTest.sections.map((section, index) => (
//                   <div key={index} className="bg-gray-50 rounded-lg p-4">
//                     <div className="flex items-center justify-between mb-2">
//                       <h4 className="font-medium text-gray-900">{section.name}</h4>
//                       <span className="text-sm text-blue-600 font-semibold">{section.questions} câu</span>
//                     </div>
//                     <p className="text-sm text-gray-600">{section.description}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Features */}
//             <div className="mb-8">
//               <h3 className="font-semibold text-gray-900 mb-3">Tính năng nổi bật:</h3>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 {currentTest.features.map((feature, index) => (
//                   <div key={index} className="flex items-center space-x-2 text-gray-600">
//                     <CheckCircle className="w-5 h-5 text-green-500" />
//                     <span>{feature}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="text-center">
//               <button
//                 onClick={handleStartTest}
//                 className={`bg-gradient-to-r ${currentTest.color} text-white py-4 px-8 rounded-lg font-semibold text-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 mx-auto`}
//               >
//                 <span>Bắt đầu kiểm tra</span>
//                 <ArrowRight className="w-5 h-5" />
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Information Section */}
//         <div className="bg-white rounded-xl shadow-lg p-8">
//           <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin quan trọng</h2>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//             <div>
//               <h3 className="font-semibold text-gray-900 mb-3">Trước khi bắt đầu:</h3>
//               <ul className="space-y-2 text-gray-600">
//                 <li>• Chuẩn bị tai nghe chất lượng tốt (cho Listening test)</li>
//                 <li>• Tìm không gian yên tĩnh, không bị gián đoạn</li>
//                 <li>• Đảm bảo kết nối internet ổn định</li>
//                 <li>• Chuẩn bị tinh thần tập trung trong suốt quá trình làm bài</li>
//               </ul>
//             </div>
            
//             <div>
//               <h3 className="font-semibold text-gray-900 mb-3">Sau khi hoàn thành:</h3>
//               <ul className="space-y-2 text-gray-600">
//                 <li>• Nhận kết quả và phân tích chi tiết ngay lập tức</li>
//                 <li>• Được đề xuất lộ trình học tập cá nhân hóa</li>
//                 <li>• Truy cập vào các bài luyện tập phù hợp với trình độ</li>
//                 <li>• Theo dõi tiến độ học tập và cải thiện kỹ năng</li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PlacementTest;


import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { HeadphonesIcon, FileText, Clock, Users, ArrowRight, CheckCircle } from 'lucide-react';

const PlacementTest: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'listening' | 'reading'>('listening');
  const navigate = useNavigate();

  const testData = {
    listening: {
      title: 'Listening Placement Test',
      icon: <HeadphonesIcon className="w-12 h-12" />,
      duration: '30 phút',
      questions: '25 câu hỏi',
      description: 'Đánh giá khả năng nghe hiểu tiếng Anh của bạn thông qua các đoạn hội thoại và monologue',
      features: ['Âm thanh chất lượng cao', 'Đa dạng giọng nói', 'Phản hồi chi tiết'],
      color: 'from-blue-500 to-blue-700',
      sections: [
        { name: 'Part 1: Photographs', questions: 6, description: 'Mô tả hình ảnh' },
        { name: 'Part 2: Question-Response', questions: 25, description: 'Câu hỏi và phản hồi' },
        { name: 'Part 3: Conversations', questions: 39, description: 'Hội thoại ngắn' },
        { name: 'Part 4: Short Talks', questions: 30, description: 'Bài nói ngắn' }
      ]
    },
    reading: {
      title: 'Reading Placement Test',
      icon: <FileText className="w-12 h-12" />,
      duration: '45 phút',
      questions: '30 câu hỏi',
      description: 'Kiểm tra khả năng đọc hiểu và phân tích văn bản tiếng Anh ở nhiều cấp độ khác nhau',
      features: ['Đa dạng thể loại văn bản', 'Từ cơ bản đến nâng cao', 'Phân tích kết quả chi tiết'],
      color: 'from-purple-500 to-purple-700',
      sections: [
        { name: 'Part 1: Incomplete Sentences', questions: 30, description: 'Hoàn thành câu' },
        { name: 'Part 2: Text Completion', questions: 16, description: 'Hoàn thành đoạn văn' },
        { name: 'Part 3: Reading Comprehension', questions: 54, description: 'Đọc hiểu' }
      ]
    }
  };

  const currentTest = testData[activeTab];

  const handleStartTest = () => {
    navigate(`/examtest/${activeTab}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Kiểm tra đầu vào
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Xác định trình độ tiếng Anh hiện tại của bạn để tạo lộ trình học tập phù hợp
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

        {/* Test Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
          <div className={`bg-gradient-to-r ${currentTest.color} p-8 text-white`}>
            <div className="flex items-center justify-center mb-4">
              {currentTest.icon}
            </div>
            <h2 className="text-3xl font-bold text-center mb-2">{currentTest.title}</h2>
            <div className="flex justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{currentTest.duration}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{currentTest.questions}</span>
              </div>
            </div>
          </div>

          <div className="p-8">
            <p className="text-gray-600 mb-6 leading-relaxed text-center">
              {currentTest.description}
            </p>

            {/* Test Sections */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Cấu trúc bài thi:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentTest.sections.map((section, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{section.name}</h4>
                      <span className="text-sm text-blue-600 font-semibold">{section.questions} câu</span>
                    </div>
                    <p className="text-sm text-gray-600">{section.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-3">Tính năng nổi bật:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentTest.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleStartTest}
                className={`bg-gradient-to-r ${currentTest.color} text-white py-4 px-8 rounded-lg font-semibold text-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 mx-auto`}
              >
                <span>Bắt đầu kiểm tra</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Information Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin quan trọng</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Trước khi bắt đầu:</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Chuẩn bị tai nghe chất lượng tốt (cho Listening test)</li>
                <li>• Tìm không gian yên tĩnh, không bị gián đoạn</li>
                <li>• Đảm bảo kết nối internet ổn định</li>
                <li>• Chuẩn bị tinh thần tập trung trong suốt quá trình làm bài</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Sau khi hoàn thành:</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Nhận kết quả và phân tích chi tiết ngay lập tức</li>
                <li>• Được đề xuất lộ trình học tập cá nhân hóa</li>
                <li>• Truy cập vào các bài luyện tập phù hợp với trình độ</li>
                <li>• Theo dõi tiến độ học tập và cải thiện kỹ năng</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacementTest;

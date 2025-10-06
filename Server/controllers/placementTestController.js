const { PlacementTest } = require('../models/PlacementTest');
const mammoth = require('mammoth');
const fs = require('fs');
// Không cần import PlacementResult vì không lưu kết quả vào database

// Lấy danh sách các bài test theo category (Public)
const getActivePlacementTests = async (req, res) => {
  try {
    const { category } = req.query; // listening, reading, general
    
    const filter = { isActive: true };
    if (category && ['listening', 'reading', 'general'].includes(category)) {
      filter.category = category;
    }

    const tests = await PlacementTest.find(filter)
      .select('title description timeLimit totalQuestions category')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Lấy danh sách bài test thành công',
      tests
    });
  } catch (error) {
    console.error('Get placement tests error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách bài test' });
  }
};

// Lấy chi tiết bài test để làm bài (Public)
const getPlacementTestForTaking = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await PlacementTest.findById(testId)
      .select('-questions.correctAnswers -questions.explanation'); // Ẩn đáp án và giải thích

    if (!test) {
      return res.status(404).json({ message: 'Không tìm thấy bài test' });
    }

    if (!test.isActive) {
      return res.status(400).json({ message: 'Bài test này không còn hoạt động' });
    }

    res.json({
      message: 'Lấy bài test thành công',
      test
    });
  } catch (error) {
    console.error('Get placement test error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy bài test' });
  }
};

// Chấm điểm bài test ngay lập tức (Public - không lưu database)
const checkPlacementTest = async (req, res) => {
  try {
    const { testId, answers } = req.body;

    // Lấy bài test với đáp án đúng
    const test = await PlacementTest.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Không tìm thấy bài test' });
    }

    // Tính điểm
    let earnedPoints = 0;
    const detailedResults = [];

    test.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      let isCorrect = false;
      let pointsEarned = 0;

      if (userAnswer) {
        if (question.type === 'single_choice') {
          isCorrect = question.options.some(option => 
            option.text === userAnswer.selectedOptions[0] && option.isCorrect
          );
        } else if (question.type === 'multiple_choice') {
          const correctOptions = question.options
            .filter(option => option.isCorrect)
            .map(option => option.text);
          
          isCorrect = correctOptions.length === userAnswer.selectedOptions.length &&
            correctOptions.every(option => userAnswer.selectedOptions.includes(option));
        } else if (question.type === 'fill_blank') {
          isCorrect = question.correctAnswers.some(correct => 
            correct.toLowerCase().trim() === userAnswer.userAnswer.toLowerCase().trim()
          );
        }

        if (isCorrect) {
          pointsEarned = question.points;
          earnedPoints += pointsEarned;
        }
      }

      detailedResults.push({
        questionNumber: index + 1,
        question: {
          type: question.type,
          content: question.content,
          passage: question.passage,
          media: question.media,
          options: question.options
        },
        userAnswer: {
          selectedOptions: userAnswer?.selectedOptions || [],
          userAnswer: userAnswer?.userAnswer || ''
        },
        correctAnswers: question.correctAnswers,
        isCorrect,
        pointsEarned,
        explanation: question.explanation
      });
    });

    const percentage = Math.round((earnedPoints / test.totalPoints) * 100);

    // Tính điểm IELTS và level AV (không cần lưu database)
    const getIELTSAndLevel = (percentage) => {
      let ieltsScore, avLevel, recommendation;

      if (percentage >= 95) {
        ieltsScore = '8.5-9.0';
        avLevel = 'Đạt chuẩn đầu ra';
        recommendation = 'Xuất sắc! Bạn đã đạt trình độ rất cao và có thể tự tin sử dụng tiếng Anh trong mọi tình huống.';
      } else if (percentage >= 85) {
        ieltsScore = '7.5-8.0';
        avLevel = 'AV7';
        recommendation = 'Rất tốt! Bạn có thể tham gia các khóa học nâng cao để hoàn thiện kỹ năng.';
      } else if (percentage >= 75) {
        ieltsScore = '6.5-7.0';
        avLevel = 'AV6';
        recommendation = 'Tốt! Bạn nên tập trung rèn luyện thêm để đạt mức độ thành thạo.';
      } else if (percentage >= 65) {
        ieltsScore = '6.0-6.5';
        avLevel = 'AV5';
        recommendation = 'Khá tốt! Tiếp tục học tập đều đặn để nâng cao trình độ.';
      } else if (percentage >= 55) {
        ieltsScore = '5.5-6.0';
        avLevel = 'AV4';
        recommendation = 'Trung bình khá! Bạn cần luyện tập nhiều hơn ở những phần còn yếu.';
      } else if (percentage >= 45) {
        ieltsScore = '5.0-5.5';
        avLevel = 'AV3';
        recommendation = 'Trung bình! Hãy tập trung vào việc củng cố kiến thức cơ bản.';
      } else if (percentage >= 35) {
        ieltsScore = '4.5-5.0';
        avLevel = 'AV2';
        recommendation = 'Cần cải thiện! Bạn nên bắt đầu từ những bài học cơ bản.';
      } else {
        ieltsScore = '3.0-4.0';
        avLevel = 'AV1';
        recommendation = 'Cần học từ đầu! Hãy tham gia các khóa học tiếng Anh cơ bản.';
      }

      return { ieltsScore, avLevel, recommendation };
    };

    const { ieltsScore, avLevel, recommendation } = getIELTSAndLevel(percentage);

    res.json({
      message: 'Chấm bài thành công',
      result: {
        testTitle: test.title,
        category: test.category,
        score: {
          totalPoints: test.totalPoints,
          earnedPoints,
          percentage
        },
        ieltsScore,
        avLevel,
        recommendation,
        detailedResults
      }
    });
  } catch (error) {
    console.error('Check placement test error:', error);
    res.status(500).json({ message: 'Lỗi server khi chấm bài' });
  }
};

// === ADMIN FUNCTIONS ===

// Lấy tất cả bài test (Admin only) - hỗ trợ phân trang + tìm kiếm + lọc
const getAllPlacementTests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filters
    const { search, category, status } = req.query;
    const filter = {};

    if (category && ['listening', 'reading', 'general'].includes(category)) {
      filter.category = category;
    }

    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;

    if (search && typeof search === 'string') {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: regex },
        { description: regex },
      ];
    }

    const [tests, total] = await Promise.all([
      PlacementTest.find(filter)
        .populate('createdBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PlacementTest.countDocuments(filter),
    ]);

    res.json({
      message: 'Lấy danh sách bài test thành công',
      tests,
      pagination: {
        page,
        limit,
        totalItems: total,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all placement tests error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách bài test' });
  }
};

// Lấy chi tiết bài test (Admin only)
const getPlacementTestById = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await PlacementTest.findById(testId)
      .populate('createdBy', 'firstName lastName email');

    if (!test) {
      return res.status(404).json({ message: 'Không tìm thấy bài test' });
    }

    res.json({
      message: 'Lấy chi tiết bài test thành công',
      test
    });
  } catch (error) {
    console.error('Get placement test by id error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy chi tiết bài test' });
  }
};

// Tạo bài test mới (Admin only)
const createPlacementTest = async (req, res) => {
  try {
    const { title, description, instructions, timeLimit, questions = [], sections = [], category, isActive = true } = req.body;

    const test = new PlacementTest({
      title,
      description: description || '',
      instructions: Array.isArray(instructions) ? instructions : [],
      category, // BẮT BUỘC theo schema
      timeLimit,
      sections,
      questions,
      isActive,
      createdBy: req.user._id
    });

    await test.save();

    res.status(201).json({
      message: 'Tạo bài test thành công',
      test
    });
  } catch (error) {
    console.error('Create placement test error:', error);
    if (error.name === 'ValidationError') {
      // Trả lỗi 400 với chi tiết để FE hiển thị thân thiện
      const errors = Object.values(error.errors || {}).map((e) => e.message);
      return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors });
    }
    res.status(500).json({ message: 'Lỗi server khi tạo bài test' });
  }
};

// Cập nhật bài test (Admin only)
const updatePlacementTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const { title, description, instructions, timeLimit, questions, isActive, category } = req.body;

    const test = await PlacementTest.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Không tìm thấy bài test' });
    }

    // Cập nhật các field
    if (typeof title === 'string') test.title = title;
    if (description !== undefined) test.description = description;
    if (Array.isArray(instructions)) test.instructions = instructions;
    if (timeLimit !== undefined) test.timeLimit = timeLimit;
    if (Array.isArray(questions)) test.questions = questions;
    if (typeof isActive === 'boolean') test.isActive = isActive;
    if (category) test.category = category;

    await test.save();

    res.json({
      message: 'Cập nhật bài test thành công',
      test
    });
  } catch (error) {
    console.error('Update placement test error:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật bài test' });
  }
};

  // Cập nhật nội dung bài test: sections + questions (Admin only)
const updateTestContent = async (req, res) => {
  try {
    const { testId } = req.params;
    const { sections = [], questions = [] } = req.body;

    const test = await PlacementTest.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Không tìm thấy bài test' });
    }

    // Cập nhật sections và questions nếu được gửi lên
    if (Array.isArray(sections)) {
      const currentSections = test.sections || [];
      // Giữ nguyên _id của section nếu FE không gửi lên để không làm lệch liên kết sectionId của câu hỏi
      test.sections = sections.map((s, idx) => ({
        _id: s._id || currentSections[idx]?._id,
        ...s,
      }));
    }
    if (Array.isArray(questions)) {
      // Map questionNumber nếu chưa có và cố gắng gán sectionId khi thiếu dựa trên thứ tự section
      const currentSections = test.sections || [];
      const normalized = questions.map((q, idx) => {
        const qq = { ...q };
        if (!qq.questionNumber) qq.questionNumber = idx + 1;
        if (!qq.sectionId && typeof qq.sectionIndex === 'number' && currentSections[qq.sectionIndex]?._id) {
          qq.sectionId = currentSections[qq.sectionIndex]._id;
        }
        return qq;
      });
      test.questions = normalized;
    }

    // Tính lại tổng số câu hỏi và điểm
    test.totalQuestions = test.questions?.length || 0;
    test.totalPoints = (test.questions || []).reduce((sum, q) => sum + (q.points || 1), 0);

    await test.save();

    res.json({
      message: 'Cập nhật nội dung bài test thành công',
      test
    });
  } catch (error) {
    console.error('Update test content error:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật nội dung bài test' });
  }
};

// Xóa bài test (Admin only)
const deletePlacementTest = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await PlacementTest.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Không tìm thấy bài test' });
    }

    await PlacementTest.findByIdAndDelete(testId);

    res.json({ message: 'Xóa bài test thành công' });
  } catch (error) {
    console.error('Delete placement test error:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa bài test' });
  }
};

// Lấy thống kê test (Admin only) - Đơn giản hóa vì không lưu kết quả
const getPlacementTestStats = async (req, res) => {
  try {
    const totalTests = await PlacementTest.countDocuments();
    const activeTests = await PlacementTest.countDocuments({ isActive: true });
    const listeningTests = await PlacementTest.countDocuments({ category: 'listening', isActive: true });
    const readingTests = await PlacementTest.countDocuments({ category: 'reading', isActive: true });
    const generalTests = await PlacementTest.countDocuments({ category: 'general', isActive: true });

    // Thống kê theo category
    const categoryStats = [
      { category: 'listening', count: listeningTests },
      { category: 'reading', count: readingTests },
      { category: 'general', count: generalTests }
    ];

    res.json({
      message: 'Lấy thống kê thành công',
      stats: {
        totalTests,
        activeTests,
        categoryStats,
        note: 'Kết quả test không được lưu trong database nên không có thống kê kết quả người dùng'
      }
    });
  } catch (error) {
    console.error('Get placement test stats error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy thống kê' });
  }
};

// Import bài test từ file Word (Admin)
const importPlacementTest = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không tìm thấy file upload' });
    }

    const filePath = req.file.path;
    
    try {
      // Đọc file Word
      const result = await mammoth.extractRawText({ path: filePath });
      const content = result.value;
      
      // Parse nội dung file
      const previewTest = parseWordContent(content);
      
      // Xóa file tạm
      fs.unlinkSync(filePath);
      
      res.json({
        message: 'Phân tích file thành công',
        previewTest
      });
    } catch (parseError) {
      // Xóa file tạm nếu có lỗi
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw parseError;
    }
  } catch (error) {
    console.error('Import placement test error:', error);
    res.status(500).json({ message: 'Lỗi khi xử lý file Word: ' + error.message });
  }
};

// Helper function để parse nội dung Word
const parseWordContent = (content) => {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  if (lines.length < 6) {
    throw new Error('File không đúng format. Cần ít nhất: tiêu đề, mô tả, loại, thời gian, hướng dẫn và dấu phân cách ---');
  }

  let currentLine = 0;
  
  // Parse thông tin cơ bản
  const title = lines[currentLine++];
  const description = lines[currentLine++];
  const category = lines[currentLine++].toLowerCase();
  const timeLimit = parseInt(lines[currentLine++]);
  
  // Validate category
  if (!['listening', 'reading', 'general'].includes(category)) {
    throw new Error('Loại bài test phải là: listening, reading, hoặc general');
  }
  
  if (isNaN(timeLimit) || timeLimit <= 0) {
    throw new Error('Thời gian phải là số nguyên dương');
  }

  // Parse hướng dẫn
  const instructions = [];
  while (currentLine < lines.length && lines[currentLine] !== '---') {
    instructions.push(lines[currentLine++]);
  }
  
  if (currentLine >= lines.length || lines[currentLine] !== '---') {
    throw new Error('Không tìm thấy dấu phân cách --- giữa hướng dẫn và câu hỏi');
  }
  
  currentLine++; // Skip '---'

  // Parse câu hỏi
  const questions = [];
  let currentQuestion = null;
  
  while (currentLine < lines.length) {
    const line = lines[currentLine++];
    
    // Kiểm tra nếu là câu hỏi mới (bắt đầu bằng Q[số]:)
    const questionMatch = line.match(/^Q(\d+):\s*(.+?)\s*\(Level:\s*(AV[1-7]),\s*Skill:\s*(listening|reading|grammar|vocabulary),\s*Points:\s*(\d+)\)$/i);
    
    if (questionMatch) {
      // Lưu câu hỏi trước đó nếu có
      if (currentQuestion) {
        questions.push(currentQuestion);
      }
      
      // Tạo câu hỏi mới
      currentQuestion = {
        type: 'single_choice', // Mặc định
        content: questionMatch[2].trim(),
        level: questionMatch[3].toUpperCase(),
        skill: questionMatch[4].toLowerCase(),
        points: parseInt(questionMatch[5]),
        options: [],
        correctAnswers: []
      };
    }
    // Kiểm tra nếu là đáp án (A), B), C), D))
    else if (currentQuestion && line.match(/^[A-D]\)/)) {
      const isCorrect = line.endsWith('*');
      const optionText = line.replace(/^[A-D]\)\s*/, '').replace(/\s*\*$/, '').trim();
      
      currentQuestion.options.push(optionText);
      
      if (isCorrect) {
        currentQuestion.correctAnswers.push(optionText);
      }
    }
    // Kiểm tra nếu là đoạn văn (Passage:)
    else if (currentQuestion && line.toLowerCase().startsWith('passage:')) {
      currentQuestion.passage = line.substring(8).trim();
    }
  }
  
  // Lưu câu hỏi cuối cùng
  if (currentQuestion) {
    questions.push(currentQuestion);
  }
  
  if (questions.length === 0) {
    throw new Error('Không tìm thấy câu hỏi nào trong file');
  }

  // Xác định loại câu hỏi dựa trên số đáp án đúng
  questions.forEach(question => {
    if (question.correctAnswers.length > 1) {
      question.type = 'multiple_choice';
    } else if (question.options.length === 0) {
      question.type = 'fill_blank';
    } else {
      question.type = 'single_choice';
    }
  });

  return {
    title,
    description,
    category,
    timeLimit,
    instructions,
    questions
  };
};

module.exports = {
  // Public APIs
  getActivePlacementTests,
  getPlacementTestForTaking,
  checkPlacementTest, // Thay thế submitPlacementTest
  
  // Admin APIs
  getAllPlacementTests,
  getPlacementTestById,
  createPlacementTest,
  updatePlacementTest,
  deletePlacementTest,
  getPlacementTestStats,
  importPlacementTest,
  updateTestContent
};

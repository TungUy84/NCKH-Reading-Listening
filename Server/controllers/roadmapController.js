const Roadmap = require('../models/Roadmap');
const UserRoadmap = require('../models/UserRoadmap');
const { PlacementResult } = require('../models/PlacementTest');

// ============================================================================
// ADMIN CONTROLLERS - Quản lý Roadmap Templates
// ============================================================================

/**
 * Lấy danh sách tất cả roadmap templates (Admin only)
 * Tự động tạo skeleton cho các level group chưa có roadmap
 */
exports.getAdminRoadmaps = async (req, res) => {
  try {
    const LEVEL_GROUPS = Roadmap.LEVEL_GROUPS;
    
    // Lấy tất cả roadmap hiện có
    let roadmaps = await Roadmap.find()
      .populate('checkpointTest', 'title category totalQuestions timeLimit')
      .populate('createdBy', 'firstName lastName email')
      .sort({ levelGroup: 1 })
      .lean();
    
    // Nếu chưa có đủ roadmap, tự động tạo skeleton
    const existingLevelGroups = roadmaps.map(r => r.levelGroup);
    const missingLevelGroups = LEVEL_GROUPS.filter(
      lg => !existingLevelGroups.includes(lg)
    );
    
    if (missingLevelGroups.length > 0) {
      const skeletons = missingLevelGroups.map(levelGroup => ({
        levelGroup,
        title: `Lộ trình ${levelGroup}`,
        description: `Lộ trình học tập cho cấp độ ${levelGroup}. Vui lòng cập nhật nội dung.`,
        estimatedDuration: 6,
        requirements: {
          totalLessons: 0,
          totalPractices: 0,
          passingScore: 70
        },
        content: {
          reading: { lessons: [], practices: [] },
          listening: { lessons: [], practices: [] }
        },
        createdBy: req.user._id
      }));
      
      const created = await Roadmap.insertMany(skeletons);
      roadmaps = [...roadmaps, ...created];
    }
    
    // Sắp xếp theo thứ tự level group
    roadmaps.sort((a, b) => {
      return LEVEL_GROUPS.indexOf(a.levelGroup) - LEVEL_GROUPS.indexOf(b.levelGroup);
    });
    
    res.json({
      success: true,
      data: roadmaps
    });
  } catch (error) {
    console.error('Error in getAdminRoadmaps:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Không thể tải danh sách lộ trình',
      error: error.message 
    });
  }
};

/**
 * Lấy chi tiết một roadmap template (Admin)
 */
exports.getAdminRoadmapDetail = async (req, res) => {
  try {
    const { id } = req.params;
    
    const roadmap = await Roadmap.findById(id)
      .populate('content.reading.lessons', 'title skill levelGroup')
      .populate('content.reading.practices', 'title skill levelGroup')
      .populate('content.listening.lessons', 'title skill levelGroup')
      .populate('content.listening.practices', 'title skill levelGroup')
      .populate('checkpointTest', 'title category totalQuestions timeLimit')
      .populate('createdBy', 'firstName lastName email');
    
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy roadmap'
      });
    }
    
    res.json({
      success: true,
      data: roadmap
    });
  } catch (error) {
    console.error('Error in getAdminRoadmapDetail:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải chi tiết roadmap',
      error: error.message
    });
  }
};

/**
 * Cập nhật roadmap template (Admin only)
 */
exports.updateRoadmap = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Tìm roadmap
    const roadmap = await Roadmap.findById(id);
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy roadmap'
      });
    }
    
    // Update các fields
    const allowedFields = [
      'title', 
      'description', 
      'estimatedDuration', 
      'content', 
      'checkpointTest',
      'requirements'
    ];
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        roadmap[field] = updateData[field];
      }
    });
    
    await roadmap.save();
    
    // Populate lại để trả về data đầy đủ
    await roadmap.populate('checkpointTest', 'title category');
    
    res.json({
      success: true,
      message: 'Cập nhật roadmap thành công',
      data: roadmap
    });
  } catch (error) {
    console.error('Error in updateRoadmap:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật roadmap',
      error: error.message
    });
  }
};

/**
 * Lấy danh sách lessons/practices có thể thêm vào roadmap
 */
exports.getAvailableContent = async (req, res) => {
  try {
    const { skill, levelGroup } = req.query;
    
    const Lesson = require('../models/Lesson');
    const Practice = require('../models/Practice');
    
    const filter = { isActive: true };
    if (skill) filter.skill = skill;
    if (levelGroup) filter.levelGroup = levelGroup;
    
    const lessons = await Lesson.find(filter)
      .select('title skill levelGroup viewCount')
      .sort({ createdAt: -1 })
      .lean();
    
    const practices = await Practice.find(filter)
      .select('title skill levelGroup totalQuestions')
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({
      success: true,
      data: {
        lessons,
        practices
      }
    });
  } catch (error) {
    console.error('Error in getAvailableContent:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải danh sách nội dung',
      error: error.message
    });
  }
};

// ============================================================================
// USER CONTROLLERS - Quản lý User Roadmap (Instance cá nhân)
// ============================================================================

/**
 * Tạo roadmap cá nhân cho user
 */
exports.createUserRoadmap = async (req, res) => {
  try {
    const { currentLevel, targetLevel } = req.body;
    const userId = req.user._id;
    
    // Validate input
    const LEVEL_GROUPS = Roadmap.LEVEL_GROUPS;
    if (!LEVEL_GROUPS.includes(currentLevel) || !LEVEL_GROUPS.includes(targetLevel)) {
      return res.status(400).json({
        success: false,
        message: 'Level không hợp lệ'
      });
    }
    
    const currentIdx = LEVEL_GROUPS.indexOf(currentLevel);
    const targetIdx = LEVEL_GROUPS.indexOf(targetLevel);
    
    if (targetIdx < currentIdx) {
      return res.status(400).json({
        success: false,
        message: 'Mục tiêu phải cao hơn hoặc bằng trình độ hiện tại'
      });
    }
    
    // Kiểm tra user đã có roadmap chưa
    const existingRoadmap = await UserRoadmap.findOne({ userId, status: 'active' });
    if (existingRoadmap) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã có một lộ trình đang hoạt động'
      });
    }
    
    // Lấy danh sách level groups cần học
    const levelGroupsToLearn = LEVEL_GROUPS.slice(currentIdx, targetIdx + 1);
    
    // Lấy roadmap templates tương ứng
    const roadmapTemplates = await Roadmap.find({
      levelGroup: { $in: levelGroupsToLearn }
    }).sort({ levelGroup: 1 });
    
    if (roadmapTemplates.length !== levelGroupsToLearn.length) {
      return res.status(400).json({
        success: false,
        message: 'Chưa có đủ roadmap template cho các level được chọn'
      });
    }
    
    // Tạo stages từ templates
    const stages = roadmapTemplates.map((template, index) => ({
      levelGroup: template.levelGroup,
      roadmapId: template._id,
      status: index === 0 ? 'in-progress' : 'locked', // Stage đầu tiên là in-progress
      startedAt: index === 0 ? new Date() : null,
      content: {
        reading: {
          lessons: template.content.reading.lessons || [],
          practices: template.content.reading.practices || []
        },
        listening: {
          lessons: template.content.listening.lessons || [],
          practices: template.content.listening.practices || []
        }
      },
      progress: {
        reading: {
          completedLessons: [],
          completedPractices: []
        },
        listening: {
          completedLessons: [],
          completedPractices: []
        },
        overallPercentage: 0
      },
      checkpointTestId: template.checkpointTest
    }));
    
    // Tạo UserRoadmap
    const userRoadmap = new UserRoadmap({
      userId,
      currentLevel,
      targetLevel,
      stages,
      status: 'active'
    });
    
    await userRoadmap.save();
    
    res.status(201).json({
      success: true,
      message: 'Tạo lộ trình thành công',
      data: userRoadmap
    });
  } catch (error) {
    console.error('Error in createUserRoadmap:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tạo lộ trình',
      error: error.message
    });
  }
};

/**
 * Đồng bộ content từ template vào UserRoadmap (dùng khi template được cập nhật)
 */
exports.syncContentFromTemplate = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const userRoadmap = await UserRoadmap.findOne({ userId, status: 'active' });
    if (!userRoadmap) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lộ trình'
      });
    }
    
    // Lấy tất cả roadmap templates
    const roadmapIds = userRoadmap.stages.map(s => s.roadmapId);
    const templates = await Roadmap.find({ _id: { $in: roadmapIds } });
    
    // Tạo map để dễ lookup
    const templateMap = {};
    templates.forEach(t => {
      templateMap[t._id.toString()] = t;
    });
    
    // Cập nhật content cho từng stage
    let updated = false;
    userRoadmap.stages.forEach((stage, index) => {
      const template = templateMap[stage.roadmapId.toString()];
      if (template) {
        // Sync content từ template
        stage.content = {
          reading: {
            lessons: template.content.reading.lessons || [],
            practices: template.content.reading.practices || []
          },
          listening: {
            lessons: template.content.listening.lessons || [],
            practices: template.content.listening.practices || []
          }
        };
        
        // Tính lại progress với content mới
        userRoadmap.calculateStageProgress(index);
        updated = true;
      }
    });
    
    if (updated) {
      await userRoadmap.save();
    }
    
    res.json({
      success: true,
      message: 'Đồng bộ content thành công',
      data: userRoadmap
    });
  } catch (error) {
    console.error('Error in syncContentFromTemplate:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể đồng bộ content',
      error: error.message
    });
  }
};

/**
 * Lấy roadmap hiện tại của user
 */
exports.getCurrentUserRoadmap = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const userRoadmap = await UserRoadmap.findOne({ userId, status: 'active' })
      .populate({
        path: 'stages.roadmapId',
        select: 'title description estimatedDuration requirements content checkpointTest',
        populate: {
          path: 'checkpointTest',
          select: 'title category totalQuestions timeLimit'
        }
      });
    
    if (!userRoadmap) {
      return res.status(404).json({
        success: false,
        message: 'Bạn chưa có lộ trình học tập',
        hasRoadmap: false
      });
    }
    
    res.json({
      success: true,
      hasRoadmap: true,
      data: userRoadmap
    });
  } catch (error) {
    console.error('Error in getCurrentUserRoadmap:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải lộ trình',
      error: error.message
    });
  }
};

/**
 * Lấy chi tiết một stage cụ thể với full content
 */
exports.getStageDetail = async (req, res) => {
  try {
    const { levelGroup } = req.params;
    const userId = req.user._id;
    
    const userRoadmap = await UserRoadmap.findOne({ userId, status: 'active' });
    if (!userRoadmap) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lộ trình'
      });
    }
    
    const stage = userRoadmap.stages.find(s => s.levelGroup === levelGroup);
    if (!stage) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chặng học'
      });
    }
    
    // Lấy roadmap template để có đầy đủ content
    const roadmapTemplate = await Roadmap.findById(stage.roadmapId)
      .populate('content.reading.lessons')
      .populate('content.reading.practices')
      .populate('content.listening.lessons')
      .populate('content.listening.practices')
      .populate('checkpointTest');
    
    res.json({
      success: true,
      data: {
        stage,
        content: roadmapTemplate.content,
        checkpointTest: roadmapTemplate.checkpointTest,
        requirements: roadmapTemplate.requirements
      }
    });
  } catch (error) {
    console.error('Error in getStageDetail:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải chi tiết chặng',
      error: error.message
    });
  }
};

/**
 * Cập nhật progress khi user hoàn thành lesson/practice
 */
exports.updateProgress = async (req, res) => {
  try {
    const { type, itemId } = req.body; // type: 'lesson' | 'practice', skill will be auto-detected
    const userId = req.user._id;
    
    // Validate
    if (!['lesson', 'practice'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type không hợp lệ'
      });
    }
    
    const userRoadmap = await UserRoadmap.findOne({ userId, status: 'active' });
    if (!userRoadmap) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lộ trình'
      });
    }
    
    // Tìm stage đang in-progress hoặc checkpoint-ready
    const stageIndex = userRoadmap.stages.findIndex(
      s => s.status === 'in-progress' || s.status === 'checkpoint-ready'
    );
    
    if (stageIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Không có chặng nào đang học'
      });
    }
    
    const stage = userRoadmap.stages[stageIndex];
    
    // Auto-detect skill by checking which array contains this item
    let skill = null;
    const contentField = type === 'lesson' ? 'lessons' : 'practices';
    
    // Debug logging
    console.log('=== DEBUG updateProgress ===');
    console.log('Type:', type);
    console.log('ItemId:', itemId);
    console.log('Stage content:', JSON.stringify(stage.content, null, 2));
    console.log('Reading practices:', stage.content.reading[contentField]);
    console.log('Listening practices:', stage.content.listening[contentField]);
    
    // Convert itemId to string for comparison
    const itemIdStr = String(itemId);
    
    if (stage.content.reading[contentField].map(String).includes(itemIdStr)) {
      skill = 'reading';
    } else if (stage.content.listening[contentField].map(String).includes(itemIdStr)) {
      skill = 'listening';
    }
    
    if (!skill) {
      console.log('ERROR: Item not found in stage content');
      return res.status(400).json({
        success: false,
        message: 'Item không thuộc stage hiện tại'
      });
    }
    
    console.log('Detected skill:', skill);
    
    const progressField = type === 'lesson' ? 'completedLessons' : 'completedPractices';
    
    // Kiểm tra đã hoàn thành chưa
    const completedArray = stage.progress[skill][progressField];
    if (!completedArray.includes(itemId)) {
      completedArray.push(itemId);
    }
    
    // Tính lại progress
    userRoadmap.calculateStageProgress(stageIndex);
    
    await userRoadmap.save();
    
    res.json({
      success: true,
      message: 'Cập nhật tiến độ thành công',
      data: {
        stage: userRoadmap.stages[stageIndex],
        overallProgress: userRoadmap.calculateOverallProgress()
      }
    });
  } catch (error) {
    console.error('Error in updateProgress:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật tiến độ',
      error: error.message
    });
  }
};

/**
 * Submit checkpoint test result và unlock stage tiếp theo nếu pass
 */
exports.submitCheckpoint = async (req, res) => {
  try {
    const { levelGroup, testId, score } = req.body;
    const userId = req.user._id;
    
    const userRoadmap = await UserRoadmap.findOne({ userId, status: 'active' });
    if (!userRoadmap) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lộ trình'
      });
    }
    
    // Tìm stage theo levelGroup
    const stageIndex = userRoadmap.stages.findIndex(s => s.levelGroup === levelGroup);
    
    if (stageIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy chặng'
      });
    }
    
    const stage = userRoadmap.stages[stageIndex];
    
    // Kiểm tra có thể làm checkpoint không
    if (!userRoadmap.canTakeCheckpoint(stageIndex)) {
      return res.status(400).json({
        success: false,
        message: 'Bạn cần hoàn thành 100% nội dung trước khi làm bài kiểm tra chặng'
      });
    }
    
    // Lấy roadmap template để biết passing score
    const roadmapTemplate = await Roadmap.findById(stage.roadmapId);
    const passingScore = roadmapTemplate.requirements.passingScore;
    const userScore = score; // score from frontend (percentage)
    const passed = userScore >= passingScore;
    
    // Lưu checkpoint result
    stage.checkpointResult = {
      attemptId: testId,
      score: userScore,
      passed,
      attemptedAt: new Date()
    };
    
    let message = '';
    let nextStage = null;
    
    if (passed) {
      // Pass - unlock stage tiếp theo
      if (stageIndex < userRoadmap.stages.length - 1) {
        userRoadmap.unlockNextStage(stageIndex);
        nextStage = userRoadmap.stages[stageIndex + 1];
        message = `Chúc mừng! Bạn đã hoàn thành chặng ${stage.levelGroup}. Chặng ${nextStage.levelGroup} đã được mở khóa.`;
      } else {
        // Hoàn thành roadmap
        stage.status = 'completed';
        stage.completedAt = new Date();
        userRoadmap.status = 'completed';
        userRoadmap.completedAt = new Date();
        message = `Xuất sắc! Bạn đã hoàn thành toàn bộ lộ trình học tập từ ${userRoadmap.currentLevel} đến ${userRoadmap.targetLevel}!`;
      }
    } else {
      // Fail - giữ nguyên stage
      message = `Bạn cần đạt ${passingScore}% để qua chặng. Hãy ôn tập và thử lại!`;
    }
    
    await userRoadmap.save();
    
    res.json({
      success: true,
      passed,
      message,
      data: {
        currentStage: stage,
        nextStage,
        score: userScore,
        passingScore,
        roadmapCompleted: userRoadmap.status === 'completed'
      }
    });
  } catch (error) {
    console.error('Error in submitCheckpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể xử lý kết quả kiểm tra',
      error: error.message
    });
  }
};

/**
 * Gợi ý currentLevel dựa trên PlacementTest gần nhất
 */
exports.getSuggestedLevel = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Tìm placement test result gần nhất
    const latestResult = await PlacementResult.findOne({ userId })
      .sort({ createdAt: -1 })
      .select('avLevel category score');
    
    if (!latestResult) {
      return res.json({
        success: true,
        hasSuggestion: false,
        message: 'Chưa có kết quả kiểm tra đầu vào'
      });
    }
    
    // Map avLevel sang levelGroup (nếu cần, hoặc dùng trực tiếp nếu đã lưu theo group)
    // Với logic mới, avLevel đã là group (AV1-AV3, AV4-AV5, AV6, AV7)
    const validGroups = ['AV1-AV3', 'AV4-AV5', 'AV6', 'AV7'];
    let suggestedLevel = latestResult.avLevel;

    // Fallback cho dữ liệu cũ hoặc không khớp
    if (!validGroups.includes(suggestedLevel)) {
        // Map cũ
        const avLevelToGroup = {
            'AV1': 'AV1-AV3',
            'AV2': 'AV1-AV3',
            'AV3': 'AV1-AV3',
            'AV4': 'AV4-AV5',
            'AV5': 'AV4-AV5',
            'AV6': 'AV6',
            'AV7': 'AV7',
            'Đạt chuẩn đầu ra': 'AV7'
        };
        suggestedLevel = avLevelToGroup[suggestedLevel] || 'AV1-AV3';
    }
    
    res.json({
      success: true,
      hasSuggestion: true,
      data: {
        suggestedLevel,
        avLevel: latestResult.avLevel,
        ieltsRange: latestResult.ieltsRange,
        category: latestResult.category,
        score: latestResult.score
      }
    });
  } catch (error) {
    console.error('Error in getSuggestedLevel:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy gợi ý level',
      error: error.message
    });
  }
};

/**
 * Check if a placement test is used in any roadmap (Admin only)
 * Returns roadmap info if test is used as checkpoint
 */
exports.checkTestUsageInRoadmap = async (req, res) => {
  try {
    const { testId } = req.params;
    
    const roadmaps = await Roadmap.find({ checkpointTest: testId })
      .select('levelGroup title')
      .lean();
    
    res.json({
      success: true,
      isUsed: roadmaps.length > 0,
      roadmaps: roadmaps.map(r => ({
        id: r._id,
        levelGroup: r.levelGroup,
        title: r.title
      }))
    });
  } catch (error) {
    console.error('Error in checkTestUsageInRoadmap:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể kiểm tra test usage',
      error: error.message
    });
  }
};

/**
 * Check if a lesson is used in any roadmap (Admin only)
 */
exports.checkLessonUsageInRoadmap = async (req, res) => {
  try {
    const { lessonId } = req.params;
    
    const roadmaps = await Roadmap.find({
      $or: [
        { 'content.reading.lessons': lessonId },
        { 'content.listening.lessons': lessonId }
      ]
    }).select('levelGroup title').lean();
    
    res.json({
      success: true,
      isUsed: roadmaps.length > 0,
      roadmaps: roadmaps.map(r => ({
        id: r._id,
        levelGroup: r.levelGroup,
        title: r.title
      }))
    });
  } catch (error) {
    console.error('Error in checkLessonUsageInRoadmap:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể kiểm tra lesson usage',
      error: error.message
    });
  }
};

/**
 * Check if a practice is used in any roadmap (Admin only)
 */
exports.checkPracticeUsageInRoadmap = async (req, res) => {
  try {
    const { practiceId } = req.params;
    
    const roadmaps = await Roadmap.find({
      $or: [
        { 'content.reading.practices': practiceId },
        { 'content.listening.practices': practiceId }
      ]
    }).select('levelGroup title').lean();
    
    res.json({
      success: true,
      isUsed: roadmaps.length > 0,
      roadmaps: roadmaps.map(r => ({
        id: r._id,
        levelGroup: r.levelGroup,
        title: r.title
      }))
    });
  } catch (error) {
    console.error('Error in checkPracticeUsageInRoadmap:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể kiểm tra practice usage',
      error: error.message
    });
  }
};

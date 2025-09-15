const mongoose = require('mongoose');
const { PlacementTest } = require('../models/PlacementTest');

// Kết nối MongoDB Atlas (giống như trong .env)
mongoose.connect('mongodb+srv://tunguykim:Qk21VuxbkcGrl0VD@nckh.qetgprq.mongodb.net/english_learning_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Dữ liệu mẫu cho IELTS Reading Test
const sampleTestData = {
  title: "IELTS Reading Practice Test - Academic",
  description: "Bài test thực hành IELTS Reading với 3 passages và 40 câu hỏi",
  instructions: [
    "Bạn có 60 phút để hoàn thành bài test",
    "Đọc kỹ các đoạn văn và trả lời câu hỏi",
    "Ghi đáp án vào phiếu trả lời",
    "Không được sử dụng từ điển"
  ],
  category: "reading",
  timeLimit: 60,
  sections: [
    {
      title: "PASSAGE 1: The Phoenicians: An Almost Forgotten People",
      passage: `The Phoenicians inhabited the region of modern Lebanon and Syria from about 3000 BC. They became the greatest traders of the pre-classical world, and were the first people to establish a large colonial network. Both of these activities were based on seafaring, an ability the Phoenicians developed from the example of their maritime predecessors, the Minoans of Crete.

An Egyptian narrative of about 1080 BC, the Story of Wen-Amen, provides an insight into the scale of their trading activity. One of the characters is Wereket-El, a Phoenician merchant living at Tanis in Egypt's Nile delta. As many as 50 ships carry out his business, plying back and forth between the Nile and the Phoenician port of Sidon.

The most prosperous period for Phoenicia was the 10th century BC, when the surrounding region was stable. Hiram, the king of the Phoenician city of Tyre, was an ally and business partner of Solomon, King of Israel. For Solomon's temple in Jerusalem, Hiram provided craftsmen with particular skills that were needed for this major construction project. He also supplied materials – particularly timber, including cedar from the forests of Lebanon. And the two kings went into trade in partnership. They sent out Phoenician vessels on long expeditions (of up to three years for the return trip) to bring back gold, sandalwood, ivory, monkeys and peacocks from Ophir. This is an unidentified place, probably on the east coast of Africa or the west coast of India.

Phoenicia was famous for its luxury goods. The cedar wood was not only exported as top-quality timber for architecture and shipbuilding. It was also carved by the Phoenicians into expensive furniture. Their most famous export was a purple dye, extracted from murex shells found on the Phoenician coast. This luxury item was in great demand in royal and religious circles throughout the ancient world (the Christian bishop's purple vestments and the purple of Byzantine emperors both derive from this source).`,
      timeLimit: 20
    },
    {
      title: "PASSAGE 2: The Impact of Social Media on Modern Communication",
      passage: `Social media has fundamentally transformed the way we communicate in the 21st century. Platforms such as Facebook, Twitter, Instagram, and TikTok have created new forms of social interaction that were unimaginable just two decades ago. These platforms have not only changed how we share information but also how we form relationships, conduct business, and even how we perceive ourselves and others.

One of the most significant impacts of social media is the speed at which information can be disseminated. News that once took hours or days to reach the public can now be shared instantly across the globe. This has democratized information sharing, allowing ordinary citizens to become reporters and commentators. However, this rapid spread of information has also led to the proliferation of misinformation and fake news, creating new challenges for media literacy and critical thinking.

The rise of social media has also changed the nature of personal relationships. People can now maintain connections with friends and family across great distances, and can easily reconnect with old acquaintances. Social media platforms have become virtual meeting places where communities can form around shared interests, causes, or experiences. However, critics argue that these online relationships may lack the depth and authenticity of face-to-face interactions.

Furthermore, social media has created new economic opportunities. The rise of influencer marketing has created entirely new career paths, while businesses have found innovative ways to reach customers through targeted advertising and direct engagement. The gig economy has been facilitated by social media platforms that connect service providers with customers.`,
      timeLimit: 20
    },
    {
      title: "PASSAGE 3: The New Way to Be a Fifth-Grader",
      passage: `I peer over his shoulder at his laptop screen to see the math problem the fifth-grader is pondering. It's a trigonometry problem. Carpenter, a serious-faced ten-year-old, pauses for a second, fidgets, then clicks on "0 degrees." The computer tells him that he's correct. "It took a while for me to work it out," he admits sheepishly.

Last November, his teacher, Kami Thordarson, began using Khan Academy in her class. It is an educational website on which students can watch some 2,400 videos. The videos are anything but sophisticated. At seven to 14 minutes long, they consist of a voiceover by the site's founder, Salman Khan, chattily describing a mathematical concept or explaining how to solve a problem, while his hand-scribbled formulas and diagrams appear on-screen.

But Khan Academy represents a new form of teaching that is beginning to be taken seriously by educators. The process is known as "flipping the classroom." Instead of a teacher presenting a lesson to a class of 20 or 30 students, then assigning homework based on the day's lesson, students watch Khan's videos at home – or, in Thordarson's class, on laptops during school time – and the classroom becomes a place where the homework problems are worked through with the teacher's help.

Thordarson believes this system lets her focus more closely on students who need help, rather than having to get the material across to everyone at the same time. Students like Carpenter advance through the curriculum at their own pace. On Khan Academy, concepts are broken down into digestible pieces. Students can replay videos they don't understand and receive immediate feedback on their problem-solving.`,
      timeLimit: 20
    }
  ],
  questions: [
    // PASSAGE 1 Questions (1-13)
    {
      questionNumber: 1,
      type: "true_false_not_given",
      content: "The Phoenicians were the first people to develop seafaring abilities.",
      correctAnswers: ["FALSE"],
      explanation: "The text states they developed seafaring from the example of the Minoans.",
      points: 1
    },
    {
      questionNumber: 2,
      type: "true_false_not_given",
      content: "Wereket-El was based in a Phoenician city.",
      correctAnswers: ["FALSE"],
      explanation: "He was living at Tanis in Egypt's Nile delta.",
      points: 1
    },
    {
      questionNumber: 3,
      type: "true_false_not_given",
      content: "The 10th century BC was a period of prosperity for Phoenicia.",
      correctAnswers: ["TRUE"],
      explanation: "The text clearly states this was their most prosperous period.",
      points: 1
    },
    {
      questionNumber: 4,
      type: "fill_blank",
      content: "Hiram provided _______ with particular skills for Solomon's temple construction.",
      correctAnswers: ["craftsmen"],
      explanation: "The text mentions craftsmen with particular skills.",
      points: 1
    },
    {
      questionNumber: 5,
      type: "fill_blank",
      content: "The expeditions to Ophir could take up to _______ years for the return trip.",
      correctAnswers: ["three"],
      explanation: "The text states expeditions of up to three years for the return trip.",
      points: 1
    },
    {
      questionNumber: 6,
      type: "multiple_choice",
      content: "What was Phoenicia's most famous export?",
      options: [
        { text: "Cedar wood", isCorrect: false },
        { text: "Purple dye", isCorrect: true },
        { text: "Gold", isCorrect: false },
        { text: "Ivory", isCorrect: false }
      ],
      correctAnswers: ["Purple dye"],
      points: 1
    },
    {
      questionNumber: 7,
      type: "multiple_choice",
      content: "The purple dye was extracted from:",
      options: [
        { text: "Cedar trees", isCorrect: false },
        { text: "Murex shells", isCorrect: true },
        { text: "Sea plants", isCorrect: false },
        { text: "Precious stones", isCorrect: false }
      ],
      correctAnswers: ["Murex shells"],
      points: 1
    },
    {
      questionNumber: 8,
      type: "fill_blank",
      content: "The Phoenicians inhabited the region from about _______ BC.",
      correctAnswers: ["3000"],
      explanation: "The text states they inhabited the region from about 3000 BC.",
      points: 1
    },
    {
      questionNumber: 9,
      type: "true_false_not_given",
      content: "The location of Ophir has been definitively identified by historians.",
      correctAnswers: ["FALSE"],
      explanation: "The text says it's an unidentified place.",
      points: 1
    },
    {
      questionNumber: 10,
      type: "multiple_choice",
      content: "What materials did Hiram supply for Solomon's temple?",
      options: [
        { text: "Only craftsmen", isCorrect: false },
        { text: "Only timber", isCorrect: false },
        { text: "Craftsmen and materials including timber", isCorrect: true },
        { text: "Gold and precious stones", isCorrect: false }
      ],
      correctAnswers: ["Craftsmen and materials including timber"],
      points: 1
    },
    {
      questionNumber: 11,
      type: "fill_blank",
      content: "As many as _______ ships carried out Wereket-El's business.",
      correctAnswers: ["50"],
      explanation: "The text mentions as many as 50 ships.",
      points: 1
    },
    {
      questionNumber: 12,
      type: "true_false_not_given",
      content: "Christian bishops still use purple vestments that derive from Phoenician dye.",
      correctAnswers: ["TRUE"],
      explanation: "The text states that Christian bishop's purple vestments derive from this source.",
      points: 1
    },
    {
      questionNumber: 13,
      type: "multiple_choice",
      content: "The Phoenicians learned seafaring from:",
      options: [
        { text: "The Egyptians", isCorrect: false },
        { text: "The Minoans of Crete", isCorrect: true },
        { text: "The Israelites", isCorrect: false },
        { text: "Trial and error", isCorrect: false }
      ],
      correctAnswers: ["The Minoans of Crete"],
      points: 1
    },

    // PASSAGE 2 Questions (14-26)
    {
      questionNumber: 14,
      type: "true_false_not_given",
      content: "Social media platforms have existed for more than two decades.",
      correctAnswers: ["FALSE"],
      explanation: "The text says these forms of interaction were unimaginable just two decades ago.",
      points: 1
    },
    {
      questionNumber: 15,
      type: "multiple_choice",
      content: "According to the passage, social media has democratized:",
      options: [
        { text: "Education", isCorrect: false },
        { text: "Information sharing", isCorrect: true },
        { text: "Government", isCorrect: false },
        { text: "Banking", isCorrect: false }
      ],
      correctAnswers: ["Information sharing"],
      points: 1
    },
    {
      questionNumber: 16,
      type: "true_false_not_given",
      content: "The rapid spread of information through social media has only positive effects.",
      correctAnswers: ["FALSE"],
      explanation: "The text mentions it has led to misinformation and fake news.",
      points: 1
    },
    {
      questionNumber: 17,
      type: "fill_blank",
      content: "Social media has created new challenges for _______ and critical thinking.",
      correctAnswers: ["media literacy"],
      explanation: "The text mentions media literacy and critical thinking as challenges.",
      points: 1
    },
    {
      questionNumber: 18,
      type: "true_false_not_given",
      content: "Online relationships are superior to face-to-face interactions.",
      correctAnswers: ["NOT GIVEN"],
      explanation: "Critics argue online relationships may lack depth, but superiority is not stated.",
      points: 1
    },
    {
      questionNumber: 19,
      type: "multiple_choice",
      content: "The gig economy has been facilitated by social media through:",
      options: [
        { text: "Creating new jobs", isCorrect: false },
        { text: "Connecting service providers with customers", isCorrect: true },
        { text: "Providing training", isCorrect: false },
        { text: "Offering insurance", isCorrect: false }
      ],
      correctAnswers: ["Connecting service providers with customers"],
      points: 1
    },
    {
      questionNumber: 20,
      type: "fill_blank",
      content: "Social media platforms have become virtual _______ where communities can form.",
      correctAnswers: ["meeting places"],
      explanation: "The text describes platforms as virtual meeting places.",
      points: 1
    },
    {
      questionNumber: 21,
      type: "true_false_not_given",
      content: "Influencer marketing existed before social media.",
      correctAnswers: ["NOT GIVEN"],
      explanation: "The text doesn't mention whether influencer marketing existed before.",
      points: 1
    },
    {
      questionNumber: 22,
      type: "multiple_choice",
      content: "Which platforms are mentioned in the passage?",
      options: [
        { text: "Facebook, Twitter, Instagram, and TikTok", isCorrect: true },
        { text: "Facebook, Twitter, and YouTube", isCorrect: false },
        { text: "Instagram, Snapchat, and TikTok", isCorrect: false },
        { text: "Twitter, LinkedIn, and Pinterest", isCorrect: false }
      ],
      correctAnswers: ["Facebook, Twitter, Instagram, and TikTok"],
      points: 1
    },
    {
      questionNumber: 23,
      type: "true_false_not_given",
      content: "Social media has fundamentally transformed 21st-century communication.",
      correctAnswers: ["TRUE"],
      explanation: "This is stated in the opening sentence.",
      points: 1
    },
    {
      questionNumber: 24,
      type: "fill_blank",
      content: "Businesses have found innovative ways to reach customers through targeted _______ and direct engagement.",
      correctAnswers: ["advertising"],
      explanation: "The text mentions targeted advertising and direct engagement.",
      points: 1
    },
    {
      questionNumber: 25,
      type: "true_false_not_given",
      content: "Social media allows people to reconnect with old acquaintances easily.",
      correctAnswers: ["TRUE"],
      explanation: "The text explicitly states this capability.",
      points: 1
    },
    {
      questionNumber: 26,
      type: "multiple_choice",
      content: "What challenge does rapid information spread create?",
      options: [
        { text: "Information overload", isCorrect: false },
        { text: "Misinformation and fake news", isCorrect: true },
        { text: "Slow communication", isCorrect: false },
        { text: "Expensive technology", isCorrect: false }
      ],
      correctAnswers: ["Misinformation and fake news"],
      points: 1
    },

    // PASSAGE 3 Questions (27-40)
    {
      questionNumber: 27,
      type: "multiple_choice",
      content: "Carpenter is working on a:",
      options: [
        { text: "Algebra problem", isCorrect: false },
        { text: "Trigonometry problem", isCorrect: true },
        { text: "Geometry problem", isCorrect: false },
        { text: "Arithmetic problem", isCorrect: false }
      ],
      correctAnswers: ["Trigonometry problem"],
      points: 1
    },
    {
      questionNumber: 28,
      type: "fill_blank",
      content: "Kami Thordarson began using Khan Academy in _______ .",
      correctAnswers: ["November"],
      explanation: "The text states 'Last November'.",
      points: 1
    },
    {
      questionNumber: 29,
      type: "multiple_choice",
      content: "How many videos are available on Khan Academy?",
      options: [
        { text: "1,400", isCorrect: false },
        { text: "2,400", isCorrect: true },
        { text: "3,400", isCorrect: false },
        { text: "4,400", isCorrect: false }
      ],
      correctAnswers: ["2,400"],
      points: 1
    },
    {
      questionNumber: 30,
      type: "fill_blank",
      content: "The videos are _______ to _______ minutes long.",
      correctAnswers: ["seven", "14"],
      explanation: "The text states 'seven to 14 minutes long'.",
      points: 1
    },
    {
      questionNumber: 31,
      type: "true_false_not_given",
      content: "The Khan Academy videos are highly sophisticated productions.",
      correctAnswers: ["FALSE"],
      explanation: "The text says they are 'anything but sophisticated'.",
      points: 1
    },
    {
      questionNumber: 32,
      type: "fill_blank",
      content: "The process is known as '_______ the classroom'.",
      correctAnswers: ["flipping"],
      explanation: "The text introduces this term.",
      points: 1
    },
    {
      questionNumber: 33,
      type: "true_false_not_given",
      content: "In Thordarson's class, students watch videos at home.",
      correctAnswers: ["FALSE"],
      explanation: "The text says they watch on laptops during school time.",
      points: 1
    },
    {
      questionNumber: 34,
      type: "multiple_choice",
      content: "What advantage does Thordarson see in this system?",
      options: [
        { text: "Less preparation time", isCorrect: false },
        { text: "More focus on students who need help", isCorrect: true },
        { text: "Easier grading", isCorrect: false },
        { text: "Lower costs", isCorrect: false }
      ],
      correctAnswers: ["More focus on students who need help"],
      points: 1
    },
    {
      questionNumber: 35,
      type: "true_false_not_given",
      content: "Students advance through the curriculum at their own pace.",
      correctAnswers: ["TRUE"],
      explanation: "This is explicitly stated in the text.",
      points: 1
    },
    {
      questionNumber: 36,
      type: "fill_blank",
      content: "Carpenter is a _______ -year-old student.",
      correctAnswers: ["ten"],
      explanation: "The text describes him as a 'serious-faced ten-year-old'.",
      points: 1
    },
    {
      questionNumber: 37,
      type: "true_false_not_given",
      content: "Students can replay videos they don't understand.",
      correctAnswers: ["TRUE"],
      explanation: "This capability is mentioned in the final paragraph.",
      points: 1
    },
    {
      questionNumber: 38,
      type: "multiple_choice",
      content: "What do the videos consist of?",
      options: [
        { text: "Animated graphics", isCorrect: false },
        { text: "Live demonstrations", isCorrect: false },
        { text: "Voiceover with hand-scribbled formulas", isCorrect: true },
        { text: "Interactive games", isCorrect: false }
      ],
      correctAnswers: ["Voiceover with hand-scribbled formulas"],
      points: 1
    },
    {
      questionNumber: 39,
      type: "true_false_not_given",
      content: "Khan Academy is beginning to be taken seriously by educators.",
      correctAnswers: ["TRUE"],
      explanation: "This is stated directly in the text.",
      points: 1
    },
    {
      questionNumber: 40,
      type: "fill_blank",
      content: "On Khan Academy, concepts are broken down into _______ pieces.",
      correctAnswers: ["digestible"],
      explanation: "The text mentions 'digestible pieces'.",
      points: 1
    }
  ],
  totalQuestions: 40,
  totalPoints: 40,
  isActive: true,
  difficulty: "intermediate",
  tags: ["IELTS", "Reading", "Academic", "Practice"],
  createdBy: new mongoose.Types.ObjectId() // Tạo ObjectId tạm thời
};

// Hàm import dữ liệu
async function importSampleData() {
  try {
    console.log('Đang kết nối tới MongoDB...');
    
    // Xóa dữ liệu cũ nếu có
    await PlacementTest.deleteMany({});
    console.log('Đã xóa dữ liệu cũ');

    // Tạo test mới
    const newTest = new PlacementTest(sampleTestData);
    
    // Lưu vào database TRƯỚC để có _id cho sections
    const savedTest = await newTest.save();
    console.log('✅ Test được tạo với sections có _id');
    
    // BÂY GIỜ mới gán sectionId cho các questions
    savedTest.questions = savedTest.questions.map((question, index) => {
      let sectionIndex;
      if (question.questionNumber <= 13) {
        sectionIndex = 0; // Passage 1
      } else if (question.questionNumber <= 26) {
        sectionIndex = 1; // Passage 2  
      } else {
        sectionIndex = 2; // Passage 3
      }
      
      console.log(`Question ${question.questionNumber} -> Section ${sectionIndex} ID: ${savedTest.sections[sectionIndex]._id}`);
      question.sectionId = savedTest.sections[sectionIndex]._id;
      return question;
    });

    // Lưu lại với sectionId đã được cập nhật
    const finalTest = await savedTest.save();
    console.log('✅ Import thành công!');
    console.log(`Test ID: ${finalTest._id}`);
    console.log(`Tổng sections: ${finalTest.sections.length}`);
    console.log(`Tổng questions: ${finalTest.questions.length}`);
    
    // Hiển thị thống kê theo section
    finalTest.sections.forEach((section, index) => {
      const sectionQuestions = finalTest.questions.filter(q => 
        q.sectionId.toString() === section._id.toString()
      );
      console.log(`Section ${index + 1}: ${section.title} - ${sectionQuestions.length} câu hỏi`);
    });

  } catch (error) {
    console.error('❌ Lỗi import:', error);
  } finally {
    mongoose.connection.close();
    console.log('Đã đóng kết nối MongoDB');
  }
}

// Chạy import
importSampleData();

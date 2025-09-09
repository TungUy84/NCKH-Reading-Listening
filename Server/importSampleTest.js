const mongoose = require('mongoose');
const { PlacementTest } = require('./models/PlacementTest');
const User = require('./models/User');
require('dotenv').config();

// Sample IELTS Reading Test Data
const sampleIELTSTest = {
  title: "IELTSs Reading Practice Test – Ancient Civilisations & Modern Innovations",
  description: "A comprehensive IELTS Reading test covering ancient history and modern technology",
  category: "reading",
  instructions: [
    "You should spend about 60 minutes on this task.",
    "Read the passages and answer the questions.",
    "Write your answers on the answer sheet.",
    "Note: There are 40 questions in this test."
  ],
  timeLimit: 60,
  sections: [
    {
      title: "PASSAGE 1: The Phoenicians: An Almost Forgotten People",
      passage: `The Phoenicians inhabited the region of modern Lebanon and Syria from about 3000 BC. They became the greatest traders of the pre-classical world, and were the first people to establish a large colonial network. Both of these activities were based on seafaring, an ability the Phoenicians developed from the example of their maritime predecessors, the Minoans of Crete.

An Egyptian narrative of about 1080 BC, the Story of Wen-Amen, provides an insight into the scale of their trading activity. One of the characters is Wereket-El, a Phoenician merchant living at Tanis in Egypt's Nile delta. As many as 50 ships carry out his business, plying back and forth between the Nile and the Phoenician port of Sidon.

The most prosperous period for Phoenicia was the 10th century BC, when the surrounding region was stable. Hiram, the king of the Phoenician city of Tyre, was an ally and business partner of Solomon, King of Israel. For Solomon's temple in Jerusalem, Hiram provided craftsmen with particular skills that were needed for this major construction project. He also supplied materials – particularly timber, including cedar from the forests of Lebanon. And the two kings went into trade in partnership. They sent out Phoenician vessels on long expeditions (of up to three years for the return trip) to bring back gold, sandalwood, ivory, monkeys and peacocks from Ophir. This is an unidentified place, probably on the east coast of Africa or the west coast of India.

Phoenicia was famous for its luxury goods. The cedar wood was not only exported as top-quality timber for architecture and shipbuilding. It was also carved by the Phoenicians, and the same skill was adapted to even more precious work in ivory. The rare and expensive dye for cloth, Tyrian purple, complemented another famous local product, fine linen. The metalworkers of the region, particularly those working in gold, were famous. Tyre and Sidon were also known for their glass.

These were the main products which the Phoenicians exported. In addition, as traders and middlemen, they took a commission on a much greater range of precious goods that they transported from elsewhere.

The extensive trade of Phoenicia required much book-keeping and correspondence, and it was in the field of writing that the Phoenicians made their most lasting contribution to world history. The scripts in use in the world up to the second millennium BC (in Egypt, Mesopotamia or China) all required the writer to learn a large number of separate characters – each of them expressing either a whole word or an element of its meaning. By contrast, the Phoenicians, in about 1500 BC, developed an entirely new approach to writing. The marks made (with a pointed tool called a stylus, on damp clay) now attempted to capture the sound of a word. This required an alphabet of individual letters.

The trading and seafaring skills of the Phoenicians resulted in a network of colonies, spreading westwards through the Mediterranean. The first was probably Citium, in Cyprus, established in the 9th century BC. But the main expansion came from the 8th century BC onwards, when pressure from Assyria to the east disrupted the patterns of trade on the Phoenician coast.

Trading colonies were developed on the string of islands in the centre of the Mediterranean – Crete, Sicily, Malta, Sardinia, Ibiza – and also on the coast of north Africa. The African colonies clustered in particular around the great promontory which, with Sicily opposite, forms the narrowest channel on the main Mediterranean sea route. This is the site of Carthage.

Carthage was the largest of the towns founded by the Phoenicians on the north African coast, and it rapidly assumed a leading position among the neighbouring colonies. The traditional date of its founding is 814 BC, but archaeological evidence suggests that it was probably settled a little over a century later.

The subsequent spread and growth of Phoenician colonies in the western Mediterranean, and even out to the Atlantic coasts of Africa and Spain, was as much the achievement of Carthage as of the original Phoenician trading cities such as Tyre and Sidon. But no doubt links were maintained with the homeland, and new colonists continued to travel west.

From the 8th century BC, many of the coastal cities of Phoenicia came under the control of a succession of imperial powers, each of them defeated and replaced in the region by the next: first the Assyrians, then the Babylonians, Persians and Macedonian Greeks. In 64 BC, the area of Phoenicia became part of the Roman province of Syria. The Phoenicians as an identifiable people then faded from history, merging into the populations of modern Lebanon and northern Syria.`,
      timeLimit: 20
    },
    {
      title: "PASSAGE 2: Examining the Placebo Effect",
      passage: `Several years ago, Merck, a global pharmaceutical company, was falling behind its rivals in sales. To make matters worse, patents on five blockbuster drugs were about to expire, which would allow cheaper generic products to flood the market. In interviews with the press, Edward Scolnick, Merck's Research Director, presented his plan to restore the firm to pre-eminence. The key to his strategy was expanding the company's reach into the anti-depressant market, where Merck had trailed behind, while competitors like Pfizer and GlaxoSmithKline had created some of the best-selling drugs in the world.

His plan hinged on the success of an experimental anti-depressant codenamed MK-869. Still, in clinical trials, it was a new kind of medication that exploited brain chemistry in innovative ways to promote feelings of well-being. The drug tested extremely well early on, with minimal side effects. Behind the scenes, however, MK-869 was starting to unravel. True, many test subjects treated with the medication felt their hopelessness and anxiety lift. But so did nearly the same number who took a placebo, a look-alike pill made of milk sugar or another inert substance given to groups of volunteers in subsequent clinical trials to gauge the effectiveness of the real drug by comparison.

MK-869 has not been the only much-awaited medical breakthrough to be undone in recent years by the placebo effect and it's not only trials of new drugs that are crossing the futility boundary. Some products that have been on the market for decades are faltering in more recent follow-up tests. It's not that the old medications are getting weaker, drug developers say. It's as if the placebo effect is somehow getting stronger.

Why are fake pills suddenly overwhelming promising new drugs and established medicines alike? The reasons are only just beginning to be understood. A network of independent researchers is doggedly uncovering the inner workings and potential applications of the placebo effect.

A psychiatrist, William Potter, who knew that some patients really do seem to get healthier for reasons that have more to do with a doctor's empathy than with the contents of a pill, was baffled by the fact that drugs he had been prescribing for years seemed to be struggling to prove their effectiveness. Thinking that a crucial factor may have been overlooked, Potter combed through his company's database of published and unpublished trials— including those that had been kept secret because of high placebo response.

Studies like this open the door to hybrid treatment strategies that exploit the placebo effect to make real drugs safer and more effective, as Potter says- "To really do the best for your patients, you want the best placebo response plus the best drug response".`,
      timeLimit: 20
    },
    {
      title: "PASSAGE 3: The New Way to Be a Fifth-Grader",
      passage: `I peer over his shoulder at his laptop screen to see the math problem the fifth-grader is pondering. It's a trigonometry problem. Carpenter, a serious-faced ten-year-old, pauses for a second, fidgets, then clicks on "0 degrees." The computer tells him that he's correct. "It took a while for me to work it out," he admits sheepishly.

Last November, his teacher, Kami Thordarson, began using Khan Academy in her class. It is an educational website on which students can watch some 2,400 videos. The videos are anything but sophisticated. At seven to 14 minutes long, they consist of a voiceover by the site's founder, Salman Khan, chattily describing a mathematical concept or explaining how to solve a problem, while his hand-scribbled formulas and diagrams appear on-screen.

Initially, Thordarson thought Khan Academy would merely be a helpful supplement to her normal instruction. But it quickly became far more than that. She is now on her way to "flipping" the way her class works. This involves replacing some of her lectures with Khan's videos, which students can watch at home. Then in class, they focus on working on the problem areas together.

Khan never intended to overhaul the school curricula and he doesn't have a consistent, comprehensive plan for doing so. Nevertheless, some of his fans believe that he has stumbled onto the solution to education's middle-of-the-class mediocrity. Most notable among them is Bill Gates, whose foundation has invested $1.5 million in Khan's site.

However, not all educators are enamoured with Khan and his site. Gary Stager, a long time educational consultant and advocate of laptops in classrooms, thinks Khan Academy is not innovative at all. The videos and software modules, he contends, are just a high-tech version of the outdated teaching techniques—lecturing and drilling.

Khan's success has injected him into the heated wars over school reform. Reformers today, by and large, believe student success should be carefully tested, with teachers and principals receiving better pay if their students advance more quickly.`,
      timeLimit: 20
    }
  ],
  questions: [
    // PASSAGE 1 - Fill in the blank questions
    {
      questionNumber: 1,
      type: "fill_blank",
      content: "The Phoenicians' skill, from their __________, at seafaring helped them to trade.",
      instructions: "Complete the sentences below. Choose ONE WORD ONLY from the passage.",
      correctAnswers: ["Minoans", "minoans"],
      explanation: "Paragraph A says they learned seafaring from the Minoans.",
      points: 1
    },
    {
      questionNumber: 2,
      type: "fill_blank",
      content: "A Phoenician __________ in Egypt owned 50 ships.",
      instructions: "Complete the sentences below. Choose ONE WORD ONLY from the passage.",
      correctAnswers: ["merchant"],
      explanation: "Paragraph B mentions Wereket-El, a Phoenician merchant.",
      points: 1
    },
    {
      questionNumber: 3,
      type: "fill_blank",
      content: "A king of Israel built a __________ using supplies from Phoenicia.",
      instructions: "Complete the sentences below. Choose ONE WORD ONLY from the passage.",
      correctAnswers: ["temple"],
      explanation: "Paragraph C: Hiram helped Solomon build the temple.",
      points: 1
    },
    {
      questionNumber: 4,
      type: "fill_blank",
      content: "Phoenicia supplied Solomon with skilled __________.",
      instructions: "Complete the sentences below. Choose ONE WORD ONLY from the passage.",
      correctAnswers: ["craftsmen"],
      explanation: "Paragraph C mentions craftsmen provided for the temple.",
      points: 1
    },
    {
      questionNumber: 5,
      type: "fill_blank",
      content: "The main material that Phoenicia sent to Israel was __________.",
      instructions: "Complete the sentences below. Choose ONE WORD ONLY from the passage.",
      correctAnswers: ["cedar"],
      explanation: "Cedar timber from Lebanon was provided.",
      points: 1
    },
    
    // True/False/Not Given questions
    {
      questionNumber: 9,
      type: "true_false_not_given",
      content: "The agreement of Assyria led to the establishment of colonies.",
      instructions: "Do the following statements agree with the information in the passage?",
      correctAnswers: ["FALSE"],
      explanation: "Colonies spread because Assyrian pressure disrupted trade, not by agreement.",
      points: 1
    },
    {
      questionNumber: 10,
      type: "true_false_not_given",
      content: "A town named Carthage was occupied by the Phoenicians.",
      instructions: "Do the following statements agree with the information in the passage?",
      correctAnswers: ["TRUE"],
      explanation: "Carthage was founded as a Phoenician colony.",
      points: 1
    },
    {
      questionNumber: 11,
      type: "true_false_not_given",
      content: "The Atlantic is the only ocean that Phoenicians reached.",
      instructions: "Do the following statements agree with the information in the passage?",
      correctAnswers: ["FALSE"],
      explanation: "They traded across the Mediterranean and Atlantic.",
      points: 1
    },
    {
      questionNumber: 12,
      type: "true_false_not_given",
      content: "Parts of Phoenicia were conquered by the neighboring empire.",
      instructions: "Do the following statements agree with the information in the passage?",
      correctAnswers: ["TRUE"],
      explanation: "Paragraph K mentions Assyrians, Babylonians, Persians, Greeks, and Romans.",
      points: 1
    },
    {
      questionNumber: 13,
      type: "true_false_not_given",
      content: "The Phoenicians expressed hostility to Roman control.",
      instructions: "Do the following statements agree with the information in the passage?",
      correctAnswers: ["NOT GIVEN"],
      explanation: "No statement about their reaction to Roman rule.",
      points: 1
    },
    
    // PASSAGE 2 - Yes/No/Not Given questions
    {
      questionNumber: 14,
      type: "yes_no_not_given",
      content: "Only Merck has the unique experience with MK-869.",
      instructions: "Do the following statements agree with the writer's claims?",
      correctAnswers: ["NO"],
      explanation: "Other companies also faced problems with placebo.",
      points: 1
    },
    {
      questionNumber: 15,
      type: "yes_no_not_given",
      content: "A small number of unsuccessful test results can ruin a well-established company.",
      instructions: "Do the following statements agree with the writer's claims?",
      correctAnswers: ["YES"],
      explanation: "Paragraph C says a firm's fate can hang on a handful of tests.",
      points: 1
    },
    
    // Summary completion with word bank
    {
      questionNumber: 19,
      type: "summary_completion",
      content: "As a result of concerns about increasing __________ in the drugs industry.",
      instructions: "Complete the summary using words from the list below.",
      wordBank: ["activity", "prices", "success", "patients", "tests", "diseases", "symptoms", "competition", "criticism"],
      correctAnswers: ["competition"],
      explanation: "The passage says Merck was behind rivals, facing competition.",
      points: 1
    },
    {
      questionNumber: 20,
      type: "summary_completion",
      content: "The pharmaceutical company Merck decided to increase its __________ in the anti-depressant market.",
      instructions: "Complete the summary using words from the list below.",
      wordBank: ["activity", "prices", "success", "patients", "tests", "diseases", "symptoms", "competition", "criticism"],
      correctAnswers: ["activity"],
      explanation: "Merck sought to expand its presence/activity in the sector.",
      points: 1
    },
    
    // Multiple choice questions
    {
      questionNumber: 24,
      type: "multiple_choice",
      content: "Which is true of William Potter's research?",
      instructions: "Choose the correct letter A–D.",
      options: [
        { text: "A. It was based on recently developed drugs that he had recommended.", isCorrect: false },
        { text: "B. It included trial results from a range of drugs companies.", isCorrect: false },
        { text: "C. Some of the trial results he investigated had not been made public.", isCorrect: true },
        { text: "D. Some of his findings were not accepted by the drugs industry.", isCorrect: false }
      ],
      correctAnswers: ["C"],
      explanation: "He checked both published and unpublished trials.",
      points: 1
    },
    
    // PASSAGE 3 - Multiple choice questions
    {
      questionNumber: 27,
      type: "multiple_choice",
      content: "What do you learn about the student in paragraph 1?",
      instructions: "Choose the correct letter A–D.",
      options: [
        { text: "A. He has not used the maths software before.", isCorrect: false },
        { text: "B. He did not expect his answer to the problem to be correct.", isCorrect: false },
        { text: "C. He was not initially doing the right maths problem.", isCorrect: false },
        { text: "D. He did not immediately know how to solve the maths problem.", isCorrect: true }
      ],
      correctAnswers: ["D"],
      explanation: "He paused and admitted it took a while.",
      points: 1
    },
    {
      questionNumber: 28,
      type: "multiple_choice",
      content: "What about Khan Academy videos?",
      instructions: "Choose the correct letter A–D.",
      options: [
        { text: "A. They have been produced in a professional manner.", isCorrect: false },
        { text: "B. They include a mix of verbal and visual features.", isCorrect: true },
        { text: "C. Some of the maths problems are too easy.", isCorrect: false },
        { text: "D. Some of the explanations are too brief.", isCorrect: false }
      ],
      correctAnswers: ["B"],
      explanation: "Voiceover plus handwritten notes.",
      points: 1
    }
  ],
  isActive: true,
  createdBy: null // Will be set when importing
};

async function importSampleTest() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find admin user (should exist)
    let adminUser = await User.findOne({ email: 'tunguykim@gmail.com' });
    if (!adminUser) {
      // If no admin user exists, use any user or create a dummy ObjectId
      adminUser = { _id: new mongoose.Types.ObjectId() };
      console.log('No admin user found, using dummy ID');
    } else {
      console.log('Found admin user:', adminUser.email);
    }

    // Create sections with ObjectIds
    const sectionsWithIds = sampleIELTSTest.sections.map(section => ({
      ...section,
      _id: new mongoose.Types.ObjectId()
    }));

    // Update questions with section IDs
    const questionsWithSectionIds = sampleIELTSTest.questions.map(question => {
      let sectionId;
      if (question.questionNumber <= 13) {
        sectionId = sectionsWithIds[0]._id; // Passage 1
      } else if (question.questionNumber <= 26) {
        sectionId = sectionsWithIds[1]._id; // Passage 2
      } else {
        sectionId = sectionsWithIds[2]._id; // Passage 3
      }
      
      return {
        ...question,
        sectionId
      };
    });

    // Create the test
    const test = new PlacementTest({
      ...sampleIELTSTest,
      sections: sectionsWithIds,
      questions: questionsWithSectionIds,
      createdBy: adminUser._id
    });

    const savedTest = await test.save();
    console.log('Sample IELTS test imported successfully!');
    console.log('Test ID:', savedTest._id);
    console.log('Test Title:', savedTest.title);
    console.log('Sections:', savedTest.sections.length);
    console.log('Questions:', savedTest.questions.length);

  } catch (error) {
    console.error('Error importing sample test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the import
importSampleTest();

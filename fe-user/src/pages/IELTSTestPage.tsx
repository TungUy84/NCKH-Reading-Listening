import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPlacementTestForTaking, submitPlacementTest } from '../services/api';
import { PlacementTest, TestQuestion, UserAnswer } from '../types';

interface IELTSTestPageProps {}

const IELTSTestPage: React.FC<IELTSTestPageProps> = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  
  const [test, setTest] = useState<PlacementTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestionGroup, setCurrentQuestionGroup] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: UserAnswer }>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (testId) {
      loadTest();
    }
  }, [testId]);

  useEffect(() => {
    if (test && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeRemaining, test]);

  const loadTest = async () => {
    try {
      const response = await getPlacementTestForTaking(testId!);
      setTest(response.test);
      setTimeRemaining(response.test.timeLimit * 60); // Convert to seconds
    } catch (error) {
      console.error('Failed to load test:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionNumber: number, answer: UserAnswer) => {
    setAnswers(prev => ({
      ...prev,
      [questionNumber]: answer
    }));
  };

  const handleSubmitTest = async () => {
    if (submitted || !test) return;
    
    setSubmitted(true);
    try {
      const formattedAnswers = Object.keys(answers).map(key => ({
        questionNumber: parseInt(key),
        ...answers[parseInt(key)]
      }));

      const response = await submitPlacementTest(test._id, formattedAnswers);
      navigate(`/test-result/${test._id}`, { state: { result: response.result } });
    } catch (error) {
      console.error('Failed to submit test:', error);
      setSubmitted(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentSection = () => {
    if (!test || !test.sections) return null;
    return test.sections[currentSection];
  };

  const getCurrentQuestions = () => {
    if (!test) return [];
    
    // Group questions by instructions/type for IELTS style
    const section = getCurrentSection();
    if (!section) return [];
    
    const sectionQuestions = test.questions.filter(q => q.sectionId === section._id);
    
    // Group questions by instructions
    const questionGroups: TestQuestion[][] = [];
    let currentGroup: TestQuestion[] = [];
    let lastInstruction: string | undefined = undefined;
    
    sectionQuestions.forEach(question => {
      if (question.instructions !== lastInstruction && currentGroup.length > 0) {
        questionGroups.push([...currentGroup]);
        currentGroup = [];
      }
      currentGroup.push(question);
      lastInstruction = question.instructions;
    });
    
    if (currentGroup.length > 0) {
      questionGroups.push(currentGroup);
    }
    
    return questionGroups[currentQuestionGroup] || [];
  };

  const renderQuestion = (question: TestQuestion) => {
    const answer = answers[question.questionNumber];
    
    switch (question.type) {
      case 'fill_blank':
        return (
          <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
            <p className="font-medium text-gray-800 mb-3">
              {question.questionNumber}. {question.content}
            </p>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Type your answer here..."
              value={answer?.userAnswer || ''}
              onChange={(e) => handleAnswerChange(question.questionNumber, {
                selectedOptions: [],
                userAnswer: e.target.value
              })}
            />
          </div>
        );
        
      case 'true_false_not_given':
      case 'yes_no_not_given':
        const options = question.type === 'true_false_not_given' 
          ? ['TRUE', 'FALSE', 'NOT GIVEN']
          : ['YES', 'NO', 'NOT GIVEN'];
          
        return (
          <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
            <p className="font-medium text-gray-800 mb-3">
              {question.questionNumber}. {question.content}
            </p>
            <div className="space-y-2">
              {options.map((option, index) => (
                <label key={index} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${question.questionNumber}`}
                    value={option}
                    checked={answer?.selectedOptions[0] === option}
                    onChange={() => handleAnswerChange(question.questionNumber, {
                      selectedOptions: [option],
                      userAnswer: ''
                    })}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );
        
      case 'multiple_choice':
        return (
          <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
            <p className="font-medium text-gray-800 mb-3">
              {question.questionNumber}. {question.content}
            </p>
            <div className="space-y-2">
              {question.options?.map((option, index) => (
                <label key={index} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${question.questionNumber}`}
                    value={option.text}
                    checked={answer?.selectedOptions[0] === option.text}
                    onChange={() => handleAnswerChange(question.questionNumber, {
                      selectedOptions: [option.text],
                      userAnswer: ''
                    })}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option.text}</span>
                </label>
              ))}
            </div>
          </div>
        );
        
      case 'summary_completion':
        return (
          <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
            <p className="font-medium text-gray-800 mb-3">
              {question.questionNumber}. {question.content}
            </p>
            {question.wordBank && question.wordBank.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-2">Choose from:</p>
                <div className="flex flex-wrap gap-2">
                  {question.wordBank.map((word, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Choose a word from the list above..."
              value={answer?.userAnswer || ''}
              onChange={(e) => handleAnswerChange(question.questionNumber, {
                selectedOptions: [],
                userAnswer: e.target.value
              })}
            />
          </div>
        );
        
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test...</p>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 text-lg">Test not found</p>
        </div>
      </div>
    );
  }

  const currentSection_data = getCurrentSection();
  const currentQuestions = getCurrentQuestions();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{test.title}</h1>
              <p className="text-sm text-gray-600">
                Section {currentSection + 1}: {currentSection_data?.title}
              </p>
            </div>
            
            {/* Timer */}
            <div className="flex items-center space-x-4">
              <div className={`px-4 py-2 rounded-lg font-mono text-lg ${
                timeRemaining < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {formatTime(timeRemaining)}
              </div>
              <button
                onClick={handleSubmitTest}
                disabled={submitted}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {submitted ? 'Submitting...' : 'Submit Test'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Split Screen */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 gap-6 h-[calc(100vh-140px)]">
          {/* Left Panel - Passage/Media */}
          <div className="bg-white rounded-lg shadow-sm border overflow-y-auto">
            <div className="p-6">
              {currentSection_data?.passage && (
                <div className="prose max-w-none">
                  <h2 className="text-lg font-bold mb-4">{currentSection_data.title}</h2>
                  <div 
                    className="text-gray-800 leading-relaxed whitespace-pre-line"
                    dangerouslySetInnerHTML={{ __html: currentSection_data.passage.replace(/\n/g, '<br/>') }}
                  />
                </div>
              )}
              
              {currentSection_data?.audio && (
                <div className="mt-6">
                  <audio controls className="w-full">
                    <source src={currentSection_data.audio} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
              
              {currentSection_data?.image && (
                <div className="mt-6">
                  <img 
                    src={currentSection_data.image} 
                    alt="Test material" 
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Questions */}
          <div className="bg-white rounded-lg shadow-sm border overflow-y-auto">
            <div className="p-6">
              {currentQuestions.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Questions {currentQuestions[0].questionNumber} - {currentQuestions[currentQuestions.length - 1].questionNumber}
                  </h3>
                  {currentQuestions[0].instructions && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                      <p className="text-sm text-blue-800 font-medium">Instructions:</p>
                      <p className="text-sm text-blue-700 mt-1">{currentQuestions[0].instructions}</p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="space-y-4">
                {currentQuestions.map(question => renderQuestion(question))}
              </div>
              
              {/* Navigation */}
              <div className="mt-8 flex justify-between items-center pt-6 border-t">
                <button
                  onClick={() => {
                    if (currentQuestionGroup > 0) {
                      setCurrentQuestionGroup(prev => prev - 1);
                    } else if (currentSection > 0) {
                      setCurrentSection(prev => prev - 1);
                      setCurrentQuestionGroup(0);
                    }
                  }}
                  disabled={currentSection === 0 && currentQuestionGroup === 0}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="text-sm text-gray-600">
                  Section {currentSection + 1} of {test.sections?.length || 0}
                </div>
                
                <button
                  onClick={() => {
                    const maxGroups = Math.ceil(getCurrentQuestions().length / 10); // Assuming 10 questions per group
                    if (currentQuestionGroup < maxGroups - 1) {
                      setCurrentQuestionGroup(prev => prev + 1);
                    } else if (currentSection < (test.sections?.length || 0) - 1) {
                      setCurrentSection(prev => prev + 1);
                      setCurrentQuestionGroup(0);
                    }
                  }}
                  disabled={currentSection === (test.sections?.length || 0) - 1}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IELTSTestPage;


import { Question } from "./questionGenerator";

export interface QuestionAnswer {
  question: Question;
  answer: string;
  duration: number;
}

export interface AnalysisResult {
  overallScore: number;
  confidence: number;
  clarity: number;
  relevance: number;
  detail: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  questionFeedback: {
    question: string;
    answer: string;
    feedback: string;
    score: number;
  }[];
}

export const analyzeAnswers = (answers: QuestionAnswer[]): AnalysisResult => {
  // Generate random scores within the 60-85 range
  const randomScore = () => Math.floor(Math.random() * 26) + 60; // 60-85
  
  // Scores are now randomly generated between 60-85
  const confidence = randomScore();
  const clarity = randomScore();
  const relevance = randomScore();
  const detail = randomScore();
  
  // Use average of other metrics for overall score
  const overallScore = Math.round((confidence + clarity + relevance + detail) / 4);
  
  // Analyze individual answers
  const questionFeedback = answers.map(({ question, answer }) => {
    const score = randomScore();
    
    // Generate appropriate feedback based on score range
    let feedback = '';
    if (score >= 75) {
      feedback = generatePositiveFeedback(question.category);
    } else {
      feedback = generateConstructiveFeedback(question.category);
    }
    
    return {
      question: question.text,
      answer,
      feedback,
      score
    };
  });
  
  // Generate overall feedback
  const strengths = generateStrengths(confidence, clarity, relevance, detail);
  const weaknesses = generateWeaknesses(confidence, clarity, relevance, detail);
  const improvements = generateImprovements(weaknesses);
  
  return {
    overallScore,
    confidence,
    clarity,
    relevance,
    detail,
    strengths,
    weaknesses,
    improvements,
    questionFeedback
  };
};

// Helper functions to generate feedback
const generatePositiveFeedback = (category: Question["category"]): string => {
  const positiveByCategory = {
    skills: [
      "Excellent demonstration of technical expertise. You provided specific examples that showcase your proficiency.",
      "Strong answer that highlights both your knowledge and practical experience with this skill.",
      "Great job connecting your technical abilities to real-world applications and problem-solving."
    ],
    experience: [
      "Well-structured response that effectively communicates your professional achievements.",
      "Excellent use of the STAR method to illustrate your experience with concrete examples.",
      "Strong answer that demonstrates both your technical and soft skills in a professional context."
    ],
    projects: [
      "Impressive explanation of your technical decisions and implementation process.",
      "Great job highlighting both the challenges and your approach to solving them.",
      "Excellent demonstration of your project management and technical implementation skills."
    ],
    general: [
      "Well-articulated response that demonstrates clear thinking and good communication.",
      "Strong answer that effectively addresses the question while showcasing your strengths.",
      "Great job providing a comprehensive yet concise response to the question."
    ]
  };
  
  const feedback = positiveByCategory[category];
  return feedback[Math.floor(Math.random() * feedback.length)];
};

const generateConstructiveFeedback = (category: Question["category"]): string => {
  const constructiveByCategory = {
    skills: [
      "Consider providing more specific examples of how you've applied this skill in real projects.",
      "Try to quantify your experience or achievements with this technology when possible.",
      "Consider explaining both the technical aspects and the business value of your skills."
    ],
    experience: [
      "Consider using the STAR method (Situation, Task, Action, Result) to structure your response.",
      "Try to highlight specific metrics or achievements from this experience.",
      "Consider mentioning both technical skills and soft skills gained from this experience."
    ],
    projects: [
      "Try to explain your technical decisions in more detail, including alternatives considered.",
      "Consider discussing both the challenges and the lessons learned from this project.",
      "Try to connect your project work to broader business or user impact."
    ],
    general: [
      "Try to structure your answer with a clear beginning, middle, and conclusion.",
      "Consider providing specific examples to support your points.",
      "Try to be more concise while still addressing all parts of the question."
    ]
  };
  
  const feedback = constructiveByCategory[category];
  return feedback[Math.floor(Math.random() * feedback.length)];
};

const generateStrengths = (confidence: number, clarity: number, relevance: number, detail: number): string[] => {
  const strengths: string[] = [];
  
  if (confidence >= 70) {
    strengths.push("You projected confidence in your responses, which strengthens your credibility.");
  }
  
  if (clarity >= 70) {
    strengths.push("Your answers were clear and well-structured, making them easy to follow.");
  }
  
  if (relevance >= 70) {
    strengths.push("You showed excellent ability to provide relevant information directly addressing the questions.");
  }
  
  if (detail >= 70) {
    strengths.push("You provided good level of detail with specific examples to support your points.");
  }
  
  // Add some general strengths if we don't have enough
  if (strengths.length < 2) {
    strengths.push("You demonstrated knowledge of your field through your responses.");
    strengths.push("You effectively communicated your professional experiences and skills.");
  }
  
  return strengths;
};

const generateWeaknesses = (confidence: number, clarity: number, relevance: number, detail: number): string[] => {
  const weaknesses: string[] = [];
  
  if (confidence < 70) {
    weaknesses.push("Some responses could benefit from a more confident delivery.");
  }
  
  if (clarity < 70) {
    weaknesses.push("Some answers could be more structured to improve clarity.");
  }
  
  if (relevance < 70) {
    weaknesses.push("At times, your responses could more directly address the specific questions asked.");
  }
  
  if (detail < 70) {
    weaknesses.push("More specific examples would strengthen some of your answers.");
  }
  
  // Add some general areas for improvement if we don't have enough
  if (weaknesses.length < 2) {
    weaknesses.push("Your responses could be more concise while maintaining informativeness.");
    weaknesses.push("Consider providing more quantifiable achievements in your answers.");
  }
  
  return weaknesses;
};

const generateImprovements = (weaknesses: string[]): string[] => {
  const improvementMap: Record<string, string> = {
    "Some responses could benefit from a more confident delivery.": 
      "Practice your answers aloud and record yourself to review your delivery and tone.",
    
    "Some answers could be more structured to improve clarity.": 
      "Try using the STAR method (Situation, Task, Action, Result) to structure your responses.",
    
    "At times, your responses could more directly address the specific questions asked.": 
      "Take a moment to consider the core of the question before answering, and ensure you're directly addressing it.",
    
    "More specific examples would strengthen some of your answers.": 
      "Prepare specific stories and metrics from your experience that demonstrate your skills and achievements.",
    
    "Your responses could be more concise while maintaining informativeness.": 
      "Practice condensing your answers to 1-2 minutes while keeping the key points.",
    
    "Consider providing more quantifiable achievements in your answers.": 
      "Review your resume and prepare metrics that demonstrate the impact of your work (e.g., increased efficiency by 30%)."
  };
  
  return weaknesses.map(weakness => 
    improvementMap[weakness] || "Consider preparing more detailed examples that highlight your achievements."
  );
};

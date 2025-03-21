import { Question, Question as QuestionType } from "./questionGenerator";

export type QuestionAnswer = {
  question: QuestionType;
  answer: string;
  duration: number;
};

export type AnalysisResult = {
  overallScore: number;
  confidence: number;
  clarity: number;
  relevance: number;
  detail: number;
  strengths: string[];
  weaknesses: string[];
  responses: {
    question: string;
    answer: string;
    feedback: string;
  }[];
  recommendations: string[];
};

const getRandomScore = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const analyzeAnswers = (answers: QuestionAnswer[]): AnalysisResult => {
  // This is a simplified analysis for demo purposes
  
  // Generate scores between 60-85 as requested
  const confidenceScore = getRandomScore(60, 85);
  const clarityScore = getRandomScore(60, 85);
  const relevanceScore = getRandomScore(60, 85);
  const detailScore = getRandomScore(60, 85);
  
  // Calculate overall score as average
  const overallScore = Math.round((confidenceScore + clarityScore + relevanceScore + detailScore) / 4);
  
  // Generate feedback based on answers
  const responses = answers.map(answer => {
    return {
      question: answer.question.text,
      answer: answer.answer,
      feedback: generateFeedback(answer, confidenceScore, clarityScore)
    };
  });
  
  // Generate strengths and weaknesses
  const strengths = generateStrengths(confidenceScore, clarityScore, relevanceScore, detailScore);
  const weaknesses = generateWeaknesses(confidenceScore, clarityScore, relevanceScore, detailScore);
  
  // Generate recommendations
  const recommendations = generateRecommendations(weaknesses);
  
  return {
    overallScore,
    confidence: confidenceScore,
    clarity: clarityScore,
    relevance: relevanceScore,
    detail: detailScore,
    strengths,
    weaknesses,
    responses,
    recommendations
  };
};

const generateFeedback = (answer: QuestionAnswer, confidenceScore: number, clarityScore: number): string => {
  const feedbackOptions = [
    "Your answer demonstrated good knowledge of the subject.",
    "You provided a clear explanation with relevant examples.",
    "Consider adding more specific examples to strengthen your answer.",
    "Your response was well-structured and easy to follow.",
    "You effectively highlighted your relevant experience.",
    "Good job connecting your experience to the question asked."
  ];
  
  // For short answers, suggest more detail
  if (answer.answer.length < 50) {
    return "Your answer was quite brief. Consider providing more details and examples to fully demonstrate your knowledge and experience.";
  }
  
  // For very long answers, suggest being more concise
  if (answer.answer.length > 500) {
    return "Your answer was comprehensive, but consider being more concise in interviews to maintain the interviewer's attention.";
  }
  
  // For quick answers (less than 10 seconds), suggest taking more time
  if (answer.duration < 10) {
    return "You answered quickly, which might suggest confidence, but consider taking a moment to structure your thoughts before responding.";
  }
  
  // Otherwise return a random positive feedback
  return feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)];
};

const generateStrengths = (confidenceScore: number, clarityScore: number, relevanceScore: number, detailScore: number): string[] => {
  const strengths = [];
  
  if (confidenceScore >= 75) strengths.push("You demonstrated strong confidence in your responses.");
  if (clarityScore >= 75) strengths.push("Your answers were clear and well-articulated.");
  if (relevanceScore >= 75) strengths.push("You provided highly relevant information to the questions asked.");
  if (detailScore >= 75) strengths.push("You included good details and examples in your answers.");
  
  // Add some general strengths if the list is short
  if (strengths.length < 2) {
    strengths.push("You maintained a professional tone throughout the interview.");
    strengths.push("You demonstrated knowledge of the topics discussed.");
  }
  
  return strengths;
};

const generateWeaknesses = (confidenceScore: number, clarityScore: number, relevanceScore: number, detailScore: number): string[] => {
  const weaknesses = [];
  
  if (confidenceScore < 70) weaknesses.push("Some of your responses could benefit from more confident delivery.");
  if (clarityScore < 70) weaknesses.push("A few of your answers could be more clearly structured.");
  if (relevanceScore < 70) weaknesses.push("Some answers could be more focused on directly addressing the question.");
  if (detailScore < 70) weaknesses.push("Consider including more specific examples in your responses.");
  
  // If there are no weaknesses based on scores, add a general improvement area
  if (weaknesses.length === 0) {
    weaknesses.push("Consider preparing more concise answers for common questions.");
    weaknesses.push("Practice quantifying your achievements more in your responses.");
  }
  
  return weaknesses;
};

const generateRecommendations = (weaknesses: string[]): string[] => {
  const recommendations = [];
  
  // Generate specific recommendations based on weaknesses
  if (weaknesses.some(w => w.includes("confident"))) {
    recommendations.push("Practice interviewing with a friend and ask for feedback on your confidence level.");
    recommendations.push("Record yourself answering questions and review your tone and body language.");
  }
  
  if (weaknesses.some(w => w.includes("structure") || w.includes("clearly"))) {
    recommendations.push("Use the STAR method (Situation, Task, Action, Result) to structure your answers.");
    recommendations.push("Practice outlining your thoughts briefly before providing a full answer.");
  }
  
  if (weaknesses.some(w => w.includes("examples") || w.includes("specific"))) {
    recommendations.push("Prepare a list of 5-7 concrete examples from your experience that demonstrate key skills.");
    recommendations.push("Quantify your achievements with numbers when possible (e.g., 'increased efficiency by 30%').");
  }
  
  // Add general recommendations
  recommendations.push("Research the company thoroughly before interviews to tailor your answers to their needs.");
  recommendations.push("Prepare questions to ask the interviewer that demonstrate your interest in the role.");
  
  return recommendations;
};

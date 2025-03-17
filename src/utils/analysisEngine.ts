
import { Question } from "./questionGenerator";

export type QuestionAnswer = {
  question: Question;
  answer: string;
  duration: number; // in seconds
};

export type AnalysisResult = {
  overallScore: number; // 0-100
  confidenceScore: number; // 0-100
  clarityScore: number; // 0-100
  relevanceScore: number; // 0-100
  detailScore: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
};

// For demo purposes, this is a simplified analysis engine
export const analyzeAnswers = (answers: QuestionAnswer[]): AnalysisResult => {
  // In a real implementation, you would use NLP or send to an API for analysis
  
  // Calculate scores based on simple metrics
  const confidenceScore = calculateConfidenceScore(answers);
  const clarityScore = calculateClarityScore(answers);
  const relevanceScore = calculateRelevanceScore(answers);
  const detailScore = calculateDetailScore(answers);
  
  const overallScore = Math.round((confidenceScore + clarityScore + relevanceScore + detailScore) / 4);
  
  // Generate strengths based on highest scores
  const strengths = generateStrengths(confidenceScore, clarityScore, relevanceScore, detailScore);
  
  // Generate weaknesses based on lowest scores
  const weaknesses = generateWeaknesses(confidenceScore, clarityScore, relevanceScore, detailScore);
  
  // Generate recommendations
  const recommendations = generateRecommendations(weaknesses);
  
  return {
    overallScore,
    confidenceScore,
    clarityScore,
    relevanceScore,
    detailScore,
    strengths,
    weaknesses,
    recommendations
  };
};

// Helper functions for analysis
const calculateConfidenceScore = (answers: QuestionAnswer[]): number => {
  // This would normally analyze speech patterns, pauses, etc.
  // For demo purposes, we'll use answer length and randomness
  const scores = answers.map(answer => {
    const length = answer.answer.length;
    const duration = answer.duration;
    
    // Longer answers with reasonable duration score higher
    const baseScore = Math.min(length / 20, 100);
    const durationFactor = Math.min(duration / 5, 4); // Optimal duration around 20 seconds
    
    return Math.min(Math.round(baseScore * (1 - Math.abs(durationFactor - 2) / 4)), 100);
  });
  
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
};

const calculateClarityScore = (answers: QuestionAnswer[]): number => {
  // This would normally analyze sentence structure, vocabulary, etc.
  // For demo purposes, we'll use answer length and randomness
  return Math.round(70 + Math.random() * 20);
};

const calculateRelevanceScore = (answers: QuestionAnswer[]): number => {
  // This would normally analyze keyword matching to the question
  // For demo purposes, we'll use answer length and randomness
  return Math.round(65 + Math.random() * 25);
};

const calculateDetailScore = (answers: QuestionAnswer[]): number => {
  // This would normally analyze depth of answer
  // For demo purposes, we'll use answer length and randomness
  const scores = answers.map(answer => {
    const words = answer.answer.split(' ').length;
    return Math.min(words / 3, 100); // More words = more detail (simplified)
  });
  
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
};

const generateStrengths = (
  confidenceScore: number,
  clarityScore: number,
  relevanceScore: number,
  detailScore: number
): string[] => {
  const strengths: string[] = [];
  
  if (confidenceScore >= 80) {
    strengths.push("Demonstrates excellent confidence in responses");
  } else if (confidenceScore >= 70) {
    strengths.push("Shows good confidence when addressing questions");
  }
  
  if (clarityScore >= 80) {
    strengths.push("Communicates with exceptional clarity and precision");
  } else if (clarityScore >= 70) {
    strengths.push("Expresses ideas in a clear, understandable manner");
  }
  
  if (relevanceScore >= 80) {
    strengths.push("Provides highly relevant answers that directly address the questions");
  } else if (relevanceScore >= 70) {
    strengths.push("Maintains good focus on the questions being asked");
  }
  
  if (detailScore >= 80) {
    strengths.push("Offers detailed examples and thorough explanations");
  } else if (detailScore >= 70) {
    strengths.push("Includes good supporting details in responses");
  }
  
  // Add general strengths if we don't have enough specific ones
  if (strengths.length < 2) {
    strengths.push("Shows good preparation for technical questions");
  }
  
  return strengths;
};

const generateWeaknesses = (
  confidenceScore: number,
  clarityScore: number,
  relevanceScore: number,
  detailScore: number
): string[] => {
  const weaknesses: string[] = [];
  
  if (confidenceScore < 60) {
    weaknesses.push("Could improve confidence when responding to technical questions");
  } else if (confidenceScore < 70) {
    weaknesses.push("Occasional hesitation when addressing complex topics");
  }
  
  if (clarityScore < 60) {
    weaknesses.push("Responses could be more clearly structured and articulated");
  } else if (clarityScore < 70) {
    weaknesses.push("Some answers could benefit from more precise language");
  }
  
  if (relevanceScore < 60) {
    weaknesses.push("Responses sometimes drift from the specific question asked");
  } else if (relevanceScore < 70) {
    weaknesses.push("Could improve focus on directly addressing the questions");
  }
  
  if (detailScore < 60) {
    weaknesses.push("Answers would benefit from more specific examples and details");
  } else if (detailScore < 70) {
    weaknesses.push("Some responses lack sufficient depth or supporting information");
  }
  
  // Ensure we have at least one area for improvement
  if (weaknesses.length === 0) {
    weaknesses.push("Could provide more quantifiable achievements and metrics in examples");
  }
  
  return weaknesses;
};

const generateRecommendations = (weaknesses: string[]): string[] => {
  const recommendations: string[] = [];
  
  if (weaknesses.find(w => w.includes("confidence"))) {
    recommendations.push("Practice answering technical questions with a friend or mentor");
  }
  
  if (weaknesses.find(w => w.includes("clarity") || w.includes("structure"))) {
    recommendations.push("Structure answers using the STAR method (Situation, Task, Action, Result)");
  }
  
  if (weaknesses.find(w => w.includes("drift") || w.includes("focus"))) {
    recommendations.push("Listen carefully to each question and ensure your answer directly addresses it");
  }
  
  if (weaknesses.find(w => w.includes("detail") || w.includes("examples"))) {
    recommendations.push("Prepare specific, quantifiable examples of your achievements for common interview questions");
  }
  
  // Add general recommendations
  recommendations.push("Record yourself answering practice questions to identify areas for improvement");
  
  if (recommendations.length < 3) {
    recommendations.push("Research common interview questions for your specific role and prepare concise answers");
  }
  
  return recommendations;
};

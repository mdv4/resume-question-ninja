
import { ParsedResume } from "./resumeParser";

export type Question = {
  id: string;
  text: string;
  category: "skills" | "experience" | "projects" | "general";
  context?: string;
};

export const generateQuestions = (resume: ParsedResume): Question[] => {
  const questions: Question[] = [];
  
  // Generate skill-based questions
  if (resume.skills.length > 0) {
    resume.skills.slice(0, 3).forEach((skill, index) => {
      questions.push({
        id: `skill-${index}`,
        text: `Tell me about your experience with ${skill}. What specific projects have you used it on?`,
        category: "skills",
        context: skill
      });
    });
  }
  
  // Generate experience-based questions
  if (resume.experience.length > 0) {
    resume.experience.forEach((exp, index) => {
      questions.push({
        id: `exp-${index}`,
        text: `As a ${exp.role} at ${exp.company}, what was the most challenging project you worked on?`,
        category: "experience",
        context: `${exp.role} at ${exp.company}`
      });
    });
  }
  
  // Generate project-based questions
  if (resume.projects.length > 0) {
    resume.projects.forEach((project, index) => {
      questions.push({
        id: `project-${index}`,
        text: `For your ${project.title} project, can you explain the technical decisions you made and why?`,
        category: "projects",
        context: project.title
      });
    });
  }
  
  // Add general questions
  const generalQuestions = [
    {
      id: "general-1",
      text: "How do you approach learning new technologies or frameworks?",
      category: "general"
    },
    {
      id: "general-2",
      text: "Can you describe a situation where you had to solve a complex problem? What was your approach?",
      category: "general"
    },
    {
      id: "general-3",
      text: "How do you handle tight deadlines and pressure?",
      category: "general"
    },
    {
      id: "general-4",
      text: "Describe a time when you had to collaborate with a difficult team member. How did you handle it?",
      category: "general"
    },
    {
      id: "general-5",
      text: "What are your career goals for the next 3-5 years?",
      category: "general"
    },
    {
      id: "general-6",
      text: "Tell me about a time you received critical feedback and how you responded to it.",
      category: "general"
    },
    {
      id: "general-7",
      text: "How do you stay updated with industry trends and new technologies?",
      category: "general"
    }
  ];
  
  // Add general questions to ensure we have at least 10 questions
  questions.push(...generalQuestions);
  
  // Shuffle the questions to mix categories
  const shuffledQuestions = shuffleArray(questions);
  
  // Return the first 10 questions, or all questions if less than 10
  return shuffledQuestions.slice(0, 10);
};

// Helper function to shuffle an array
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

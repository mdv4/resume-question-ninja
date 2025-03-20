
import { ParsedResume } from "./resumeParser";

export type Question = {
  id: string;
  text: string;
  category: "skills" | "experience" | "projects" | "general";
  context?: string;
};

export const generateQuestions = (resume: ParsedResume, resumeOnlyQuestions: boolean = false): Question[] => {
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
      
      // For commonly used skills, ask more specific questions
      if (["JavaScript", "React", "TypeScript", "Node.js"].includes(skill)) {
        questions.push({
          id: `skill-detail-${index}`,
          text: `What's the most challenging problem you've solved using ${skill}?`,
          category: "skills",
          context: skill
        });
      }
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
      
      // Add more detailed questions about each experience
      questions.push({
        id: `exp-detail-${index}`,
        text: `What key skills did you develop during your time as ${exp.role} at ${exp.company}?`,
        category: "experience",
        context: `${exp.role} at ${exp.company}`
      });
      
      questions.push({
        id: `exp-impact-${index}`,
        text: `Can you describe a specific impact or achievement you had as ${exp.role} at ${exp.company}?`,
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
      
      if (project.technologies && project.technologies.length > 0) {
        questions.push({
          id: `project-tech-${index}`,
          text: `How did you implement ${project.technologies.slice(0, 2).join(" and ")} in your ${project.title} project?`,
          category: "projects",
          context: project.title
        });
      }
      
      questions.push({
        id: `project-challenge-${index}`,
        text: `What was the biggest challenge you faced while working on ${project.title} and how did you overcome it?`,
        category: "projects",
        context: project.title
      });
    });
  }
  
  // If we don't have enough questions, add more resume-specific ones
  if (questions.length < 5) {
    if (resume.education.length > 0) {
      const education = resume.education[0];
      questions.push({
        id: "education-1",
        text: `How did your ${education.degree} from ${education.institution} prepare you for your career?`,
        category: "general",
        context: education.degree
      });
    }
    
    if (resume.skills.length > 0) {
      questions.push({
        id: "skill-growth",
        text: `How do you stay updated with the latest developments in ${resume.skills.slice(0, 3).join(", ")}?`,
        category: "skills"
      });
    }
  }
  
  // We're not adding general questions since resumeOnlyQuestions should be true
  
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

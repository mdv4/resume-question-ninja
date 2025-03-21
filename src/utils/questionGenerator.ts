
import { ParsedResume } from "./resumeParser";

export type Question = {
  id: string;
  text: string;
  category: "skills" | "experience" | "projects" | "general";
  context?: string;
};

export const generateQuestions = (resume: ParsedResume, resumeOnlyQuestions: boolean = true): Question[] => {
  console.log("Generating questions based on resume:", resume);
  const questions: Question[] = [];
  
  // Generate skill-based questions
  if (resume.skills.length > 0) {
    // Take up to 3 skills to generate questions for
    const skillsToUse = resume.skills.slice(0, 3);
    
    skillsToUse.forEach((skill, index) => {
      questions.push({
        id: `skill-${index}`,
        text: `Tell me about your experience with ${skill}. What specific projects have you used it on?`,
        category: "skills",
        context: skill
      });
      
      questions.push({
        id: `skill-challenge-${index}`,
        text: `What's the most challenging problem you've solved using ${skill}?`,
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
      
      questions.push({
        id: `exp-impact-${index}`,
        text: `Can you describe a specific impact or achievement you had as ${exp.role} at ${exp.company}?`,
        category: "experience",
        context: `${exp.role} at ${exp.company}`
      });
      
      questions.push({
        id: `exp-teamwork-${index}`,
        text: `How did you collaborate with team members during your time at ${exp.company}?`,
        category: "experience",
        context: `${exp.company}`
      });
    });
  }
  
  // Generate project-based questions
  if (resume.projects.length > 0) {
    resume.projects.forEach((project, index) => {
      questions.push({
        id: `project-${index}`,
        text: `For your ${project.title} project, what were the main challenges and how did you overcome them?`,
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
        id: `project-learning-${index}`,
        text: `What was the most important thing you learned while working on the ${project.title} project?`,
        category: "projects",
        context: project.title
      });
    });
  }
  
  // Add general questions based on candidate's background
  questions.push({
    id: `general-strengths`,
    text: `What would you say are your greatest technical strengths, especially with ${resume.skills.slice(0, 2).join(" and ")}?`,
    category: "general"
  });
  
  questions.push({
    id: `general-weakness`,
    text: `What area of your technical skills are you currently working to improve?`,
    category: "general"
  });
  
  questions.push({
    id: `general-motivation`,
    text: `What motivates you most in your professional work?`,
    category: "general"
  });
  
  if (resume.education.length > 0) {
    const education = resume.education[0];
    questions.push({
      id: "education-1",
      text: `How did your studies at ${education.institution} prepare you for your career?`,
      category: "general",
      context: education.institution
    });
  }
  
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

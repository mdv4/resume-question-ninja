
import { ParsedResume } from "./resumeParser";

export type Question = {
  id: string;
  text: string;
  category: "skills" | "experience" | "projects" | "general";
  context?: string;
};

// Store the Google Gemini API key
const GEMINI_API_KEY = "AIzaSyAEujCzwKJ239nKwWzfeDu7qmvXG3wJRrE";

export const generateQuestions = async (resume: ParsedResume): Promise<Question[]> => {
  try {
    // Always use the API to generate dynamic questions from the resume
    if (!resume.rawText && (!resume.skills.length || !resume.experience.length)) {
      throw new Error("Resume data is insufficient to generate questions");
    }
    
    // Use Google Gemini API to generate questions
    const questions = await generateQuestionsWithGemini(resume);
    
    // If API fails, fall back to local generation
    if (!questions || questions.length === 0) {
      console.error("Gemini API failed to generate questions, falling back to local generation");
      return generateLocalQuestions(resume);
    }
    
    console.log("Generated questions from Gemini API:", questions);
    return questions;
  } catch (error) {
    console.error("Error generating questions:", error);
    // Fall back to local generation if API fails
    return generateLocalQuestions(resume);
  }
};

const generateQuestionsWithGemini = async (resume: ParsedResume): Promise<Question[]> => {
  try {
    // Create a formatted resume text for the API
    const resumeText = `
Name: ${resume.name || ""}
${resume.email ? `Email: ${resume.email}` : ""}
${resume.phone ? `Phone: ${resume.phone}` : ""}

Skills: ${resume.skills.join(", ")}

Experience:
${resume.experience.map(exp => 
  `${exp.company} - ${exp.role} (${exp.duration})\n${exp.description}`
).join("\n\n")}

Education:
${resume.education.map(edu => 
  `${edu.institution} - ${edu.degree} (${edu.year})`
).join("\n\n")}

Projects:
${resume.projects.map(proj => 
  `${proj.title}: ${proj.description}\nTechnologies: ${proj.technologies.join(", ")}`
).join("\n\n")}
`;

    // Use raw text if available
    const finalText = resume.rawText || resumeText;
    
    console.log("Calling Gemini API with resume data:", finalText);
    
    // Call the Gemini API
    const apiURL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";
    
    const response = await fetch(`${apiURL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Generate exactly 10 interview questions based on the following resume.
Do not add any introductions, explanations, or extra text—only list the questions:

${finalText}

Format:
1. [First Question]
2. [Second Question]
... up to 10.

Make sure questions are very specific to the resume content, skills, experience, projects, and education mentioned.
Do not generate generic questions that could apply to any resume.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Gemini API response:", data);
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
      throw new Error("Invalid response format");
    }
    
    const text = data.candidates[0].content.parts[0].text;
    console.log("Extracted text from API response:", text);
    
    // Parse the questions from the response
    const questionLines = text.split('\n').filter(line => line.trim()).filter(line => /^\d+\./.test(line));
    console.log("Parsed question lines:", questionLines);
    
    // Convert to Question objects
    return questionLines.map((line, index) => {
      // Remove the number prefix (e.g., "1. ")
      const questionText = line.replace(/^\d+\.\s*/, '');
      
      // Determine question category
      let category: Question["category"] = "general";
      
      if (questionText.toLowerCase().includes("skill") || 
          resume.skills.some(skill => questionText.includes(skill))) {
        category = "skills";
      } else if (questionText.toLowerCase().includes("project") || 
                resume.projects.some(proj => questionText.includes(proj.title))) {
        category = "projects";
      } else if (questionText.toLowerCase().includes("experience") || 
                resume.experience.some(exp => 
                  questionText.includes(exp.company) || questionText.includes(exp.role))) {
        category = "experience";
      }
      
      return {
        id: `api-${index + 1}`,
        text: questionText,
        category,
        context: determineContext(questionText, resume)
      };
    });
    
  } catch (error) {
    console.error("Error with Gemini API:", error);
    return [];
  }
};

// Helper to determine the context of a question
const determineContext = (questionText: string, resume: ParsedResume): string | undefined => {
  // Check skills
  const matchedSkill = resume.skills.find(skill => questionText.includes(skill));
  if (matchedSkill) return matchedSkill;
  
  // Check companies
  for (const exp of resume.experience) {
    if (questionText.includes(exp.company)) {
      return `${exp.role} at ${exp.company}`;
    }
    if (questionText.includes(exp.role)) {
      return `${exp.role} at ${exp.company}`;
    }
  }
  
  // Check projects
  const matchedProject = resume.projects.find(proj => questionText.includes(proj.title));
  if (matchedProject) return matchedProject.title;
  
  // Check education
  const matchedEducation = resume.education.find(edu => 
    questionText.includes(edu.institution) || questionText.includes(edu.degree)
  );
  if (matchedEducation) return matchedEducation.degree;
  
  return undefined;
};

// Fallback to generate questions locally if API fails
const generateLocalQuestions = (resume: ParsedResume): Question[] => {
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
    });
  }
  
  // If we don't have enough questions, add more resume-specific ones based on education
  if (questions.length < 5 && resume.education.length > 0) {
    const education = resume.education[0];
    questions.push({
      id: "education-1",
      text: `How did your ${education.degree} from ${education.institution} prepare you for your career?`,
      category: "general",
      context: education.degree
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

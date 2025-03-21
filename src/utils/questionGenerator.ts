
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
    console.log("Generating questions for resume:", resume);
    
    // Always try to use the API to generate dynamic questions
    const questions = await generateQuestionsWithGemini(resume);
    
    if (questions && questions.length > 0) {
      console.log("Successfully generated questions from Gemini API:", questions);
      return questions;
    } else {
      console.error("Gemini API failed to generate questions, falling back to local generation");
      return generateLocalQuestions(resume);
    }
  } catch (error) {
    console.error("Error generating questions:", error);
    // Fall back to local generation if API fails
    return generateLocalQuestions(resume);
  }
};

const generateQuestionsWithGemini = async (resume: ParsedResume): Promise<Question[]> => {
  try {
    // Create a formatted resume text for the API
    const resumeText = resume.rawText || `
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
    
    console.log("Calling Gemini API with resume data:", resumeText);
    
    // Call the Gemini API with a more specific prompt
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
Do not add any introductions, explanations, or extra text—only list the numbered questions.
Questions MUST be specific to the candidate's skills, experience, projects, and education.

${resumeText}

Format each question as:
1. [First Question]
2. [Second Question]
... up to 10.

Make sure questions are very specific to the resume content. Each question should reference specific skills, job roles, projects, or education mentioned in the resume.
Do NOT generate generic questions that could apply to any resume.
Include at least 3 questions about specific technical skills mentioned in the resume.
Include at least 2 questions about specific projects mentioned in the resume.
Include at least 3 questions about specific work experiences or job roles mentioned.
Each question must directly reference something specific from the resume.`
          }]
        }],
        generationConfig: {
          temperature: 0.6,
          topK: 30,
          topP: 0.9,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      console.error(`Gemini API error status: ${response.status}`);
      const errorText = await response.text();
      console.error(`Gemini API error response: ${errorText}`);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Gemini API raw response:", data);
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
      console.error("Invalid response format from Gemini API:", data);
      throw new Error("Invalid response format from Gemini API");
    }
    
    const text = data.candidates[0].content.parts[0].text;
    console.log("Extracted text from Gemini API response:", text);
    
    // Parse the questions from the response using a regex to find numbered lines
    const questionLines = text.split('\n')
                             .filter(line => line.trim())
                             .filter(line => /^\d+\./.test(line));
    
    console.log("Parsed question lines:", questionLines);
    
    if (questionLines.length === 0) {
      console.error("No questions found in API response");
      throw new Error("No questions found in API response");
    }
    
    // Convert to Question objects
    return questionLines.slice(0, 10).map((line, index) => {
      // Remove the number prefix (e.g., "1. ")
      const questionText = line.replace(/^\d+\.\s*/, '');
      
      // Determine question category based on content
      let category: Question["category"] = "general";
      
      if (questionText.toLowerCase().includes("skill") || 
          resume.skills.some(skill => questionText.toLowerCase().includes(skill.toLowerCase()))) {
        category = "skills";
      } else if (questionText.toLowerCase().includes("project") || 
                resume.projects.some(proj => questionText.toLowerCase().includes(proj.title.toLowerCase()))) {
        category = "projects";
      } else if (questionText.toLowerCase().includes("experience") || 
                questionText.toLowerCase().includes("work") ||
                resume.experience.some(exp => 
                  questionText.toLowerCase().includes(exp.company.toLowerCase()) || 
                  questionText.toLowerCase().includes(exp.role.toLowerCase()))) {
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
  const lowerQuestion = questionText.toLowerCase();
  
  // Check skills
  const matchedSkill = resume.skills.find(skill => lowerQuestion.includes(skill.toLowerCase()));
  if (matchedSkill) return matchedSkill;
  
  // Check companies
  for (const exp of resume.experience) {
    if (lowerQuestion.includes(exp.company.toLowerCase())) {
      return `${exp.role} at ${exp.company}`;
    }
    if (lowerQuestion.includes(exp.role.toLowerCase())) {
      return `${exp.role} at ${exp.company}`;
    }
  }
  
  // Check projects
  const matchedProject = resume.projects.find(proj => lowerQuestion.includes(proj.title.toLowerCase()));
  if (matchedProject) return matchedProject.title;
  
  // Check education
  const matchedEducation = resume.education.find(edu => 
    lowerQuestion.includes(edu.institution.toLowerCase()) || lowerQuestion.includes(edu.degree.toLowerCase())
  );
  if (matchedEducation) return matchedEducation.degree;
  
  return undefined;
};

// Fallback to generate questions locally if API fails
const generateLocalQuestions = (resume: ParsedResume): Question[] => {
  const questions: Question[] = [];
  
  // Generate skill-based questions
  if (resume.skills.length > 0) {
    resume.skills.slice(0, 5).forEach((skill, index) => {
      questions.push({
        id: `skill-${index}`,
        text: `Tell me about your experience with ${skill}. How have you applied it in your work?`,
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
        text: `What were your main responsibilities as ${exp.role} at ${exp.company}?`,
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
        text: `What challenges did you overcome in your ${project.title} project?`,
        category: "projects",
        context: project.title
      });
    });
  }
  
  // Add general questions if we don't have enough
  const generalQuestions = [
    "What's your greatest professional achievement?",
    "Where do you see yourself in 5 years?",
    "What makes you a good fit for this role?",
    "How do you handle pressure and tight deadlines?",
    "Describe a situation where you had to learn a new skill quickly."
  ];
  
  let i = 0;
  while (questions.length < 10 && i < generalQuestions.length) {
    questions.push({
      id: `general-${i}`,
      text: generalQuestions[i],
      category: "general"
    });
    i++;
  }
  
  // Return the first 10 questions, or all questions if less than 10
  return questions.slice(0, 10);
};

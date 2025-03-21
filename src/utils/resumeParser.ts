
import { toast } from "sonner";

export type ParsedResume = {
  name: string;
  email?: string;
  phone?: string;
  skills: string[];
  experience: {
    company: string;
    role: string;
    duration: string;
    description: string;
  }[];
  education: {
    institution: string;
    degree: string;
    year: string;
  }[];
  projects: {
    title: string;
    description: string;
    technologies: string[];
  }[];
  rawText?: string; // Full resume text for API calls
};

export const parseResume = async (file: File): Promise<ParsedResume | null> => {
  try {
    // Check file size (max 3MB)
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Resume file size must be less than 3MB");
      return null;
    }

    // Check file type (PDF, DOCX, etc.)
    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a PDF or DOCX file");
      return null;
    }

    toast.info("Parsing resume...");
    
    // Send file to the Flask server for parsing
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      console.log("Sending file to server for parsing:", file.name);
      
      // Use the Flask server to parse the resume
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        console.error(`Server returned error status: ${response.status}`);
        const errorText = await response.text();
        console.error(`Server error response: ${errorText}`);
        throw new Error('Server error parsing resume');
      }
      
      const resumeData = await response.json();
      console.log("Parsed resume data from server:", resumeData);
      
      if (!resumeData || Object.keys(resumeData).length === 0) {
        console.error("Received empty or invalid response from server");
        throw new Error('Invalid response from server');
      }
      
      // Create structured ParsedResume from Flask response
      const parsedResume: ParsedResume = {
        name: resumeData.name || "User",
        email: resumeData.email,
        phone: resumeData.phone,
        skills: parseSkills(resumeData.skills || ""),
        experience: parseExperience(resumeData.experience || ""),
        education: parseEducation(resumeData.education || ""),
        projects: parseProjects(resumeData.projects || ""),
        rawText: `Name: ${resumeData.name || "User"}
${resumeData.email ? `Email: ${resumeData.email}` : ""}
${resumeData.phone ? `Phone: ${resumeData.phone}` : ""}

Skills: ${resumeData.skills || ""}

Experience: ${resumeData.experience || ""}

Education: ${resumeData.education || ""}

Projects: ${resumeData.projects || ""}`
      };
      
      console.log("Final parsed resume object:", parsedResume);
      toast.success("Resume parsing complete!");
      return parsedResume;
      
    } catch (error) {
      console.error("Error from server:", error);
      
      // Fallback to mock data for testing if server fails
      toast.error("Error connecting to parsing server, using demo data");
      return getFallbackResumeData();
    }
  } catch (error) {
    console.error("Error parsing resume:", error);
    toast.error("Failed to parse resume. Please try again.");
    return null;
  }
};

// Helper functions to parse resume sections from text
const parseSkills = (skillsText: string): string[] => {
  if (!skillsText) return [];
  // Basic skill extraction - split by commas or newlines and clean up
  const skills = skillsText.split(/[,\n]/).map(s => s.trim()).filter(s => s.length > 0);
  return skills.slice(0, 10); // Limit to 10 skills
};

const parseExperience = (experienceText: string): ParsedResume["experience"] => {
  if (!experienceText) return [];
  
  // Simple experience parsing - assume company names might be in bold or at start of lines
  const experiences = experienceText.split(/\n\n/).filter(Boolean).slice(0, 3);
  
  return experiences.map(exp => {
    const lines = exp.split('\n');
    const firstLine = lines[0] || '';
    
    return {
      company: firstLine.includes('-') ? firstLine.split('-')[0].trim() : firstLine,
      role: firstLine.includes('-') ? firstLine.split('-')[1].trim() : '',
      duration: extractDuration(exp),
      description: lines.slice(1).join(' ')
    };
  });
};

const parseEducation = (educationText: string): ParsedResume["education"] => {
  if (!educationText) return [];
  
  const educations = educationText.split(/\n\n/).filter(Boolean).slice(0, 2);
  
  return educations.map(edu => {
    const lines = edu.split('\n');
    const firstLine = lines[0] || '';
    
    return {
      institution: firstLine,
      degree: lines[1] || '',
      year: extractYear(edu)
    };
  });
};

const parseProjects = (projectsText: string): ParsedResume["projects"] => {
  if (!projectsText) return [];
  
  const projects = projectsText.split(/\n\n/).filter(Boolean).slice(0, 3);
  
  return projects.map(proj => {
    const lines = proj.split('\n');
    const firstLine = lines[0] || '';
    
    return {
      title: firstLine,
      description: lines.slice(1).join(' '),
      technologies: extractTechnologies(proj)
    };
  });
};

// Helper utility functions
const extractDuration = (text: string): string => {
  const match = text.match(/\b(20\d{2})\s*-\s*(20\d{2}|present|current)\b/i);
  return match ? match[0] : '';
};

const extractYear = (text: string): string => {
  const match = text.match(/\b(20\d{2})\b/);
  return match ? match[0] : '';
};

const extractTechnologies = (text: string): string[] => {
  // Look for technologies usually mentioned with keywords like: using, with, technologies
  const techMatch = text.match(/using|with|technologies|tools|stack|built\s+with|developed\s+with/i);
  
  if (techMatch && techMatch.index !== undefined) {
    const techPart = text.slice(techMatch.index).split(/[,\n]/).map(t => t.trim());
    return techPart.slice(0, 5);
  }
  
  // Otherwise extract words that look like technologies
  const techWords = text.match(/\b(React|Angular|Vue|Node|Python|Java|TypeScript|JavaScript|HTML|CSS|AWS|Docker|SQL)\b/g);
  return techWords || [];
};

// Fallback mock data for testing when server is unavailable
const getFallbackResumeData = (): ParsedResume => {
  return {
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phone: "555-123-4567",
    skills: ["JavaScript", "React", "TypeScript", "Node.js", "CSS", "HTML", "Git", "UI/UX Design"],
    experience: [
      {
        company: "Tech Solutions Inc.",
        role: "Senior Frontend Developer",
        duration: "2020-Present",
        description: "Led development of responsive web applications using React and TypeScript. Implemented state management with Redux and improved performance by 30%."
      },
      {
        company: "Digital Innovations",
        role: "Web Developer",
        duration: "2018-2020",
        description: "Developed and maintained client websites. Created reusable components and implemented responsive designs."
      }
    ],
    education: [
      {
        institution: "University of Technology",
        degree: "Bachelor of Science in Computer Science",
        year: "2018"
      }
    ],
    projects: [
      {
        title: "E-commerce Platform",
        description: "Built a full-featured e-commerce platform with React, Node.js, and MongoDB",
        technologies: ["React", "Node.js", "MongoDB", "Express"]
      },
      {
        title: "Portfolio Website",
        description: "Designed and developed a personal portfolio website with modern animations",
        technologies: ["React", "Three.js", "Tailwind CSS"]
      }
    ],
    rawText: "Skills: JavaScript, React, TypeScript, Node.js, CSS, HTML, Git, UI/UX Design\n\nExperience: Tech Solutions Inc - Senior Frontend Developer (2020-Present)\nDigital Innovations - Web Developer (2018-2020)\n\nEducation: University of Technology\nBachelor of Science in Computer Science (2018)\n\nProjects: E-commerce Platform, Portfolio Website"
  };
};

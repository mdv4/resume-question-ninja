
import { toast } from "sonner";

export type ParsedResume = {
  name: string;
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

    // In a real implementation, you would use a resume parsing library or API
    // For now, we'll extract some data from the file name to simulate parsing
    toast.info("Parsing resume...");
    
    // Get the filename without extension for a simulated name extraction
    const fileName = file.name.split('.')[0].replace(/_/g, ' ').replace(/-/g, ' ');
    const candidateName = fileName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    // Read some content from the file to extract skills (for demonstration)
    const fileContent = await readFileContent(file);
    
    // Extract skills from content (simplified)
    const extractedSkills = extractSkillsFromContent(fileContent);
    
    // Build a more personalized resume object
    const parsedResume: ParsedResume = {
      name: candidateName || "Candidate",
      skills: extractedSkills.length > 0 ? extractedSkills : 
              ["JavaScript", "React", "TypeScript", "Node.js", "CSS", "HTML", "Git"],
      experience: [
        {
          company: extractCompanyFromContent(fileContent) || "Previous Company",
          role: extractRoleFromContent(fileContent) || "Software Developer",
          duration: "2020-Present",
          description: "Worked on various projects using the skills mentioned in the resume."
        }
      ],
      education: [
        {
          institution: extractEducationFromContent(fileContent) || "University",
          degree: "Computer Science",
          year: "2018"
        }
      ],
      projects: [
        {
          title: extractProjectFromContent(fileContent) || "Portfolio Project",
          description: "A project showcasing my skills and experience.",
          technologies: extractedSkills.slice(0, 3)
        }
      ]
    };
    
    console.log("Parsed resume:", parsedResume); // Debugging log
    toast.success("Resume parsing complete!");
    return parsedResume;
  } catch (error) {
    console.error("Error parsing resume:", error);
    toast.error("Failed to parse resume. Please try again.");
    return null;
  }
};

// Helper function to read file content
const readFileContent = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        resolve(event.target.result);
      } else {
        resolve("");
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    if (file.type === "application/pdf") {
      // For PDF, we just get the filename for now
      // In a real implementation, you would use a PDF parsing library
      resolve(file.name);
    } else {
      // For DOCX and other text formats
      reader.readAsText(file);
    }
  });
};

// Helper functions to extract information from content
const extractSkillsFromContent = (content: string): string[] => {
  const commonSkills = [
    "JavaScript", "TypeScript", "React", "Angular", "Vue", "Node.js", 
    "Python", "Java", "C#", "C++", "Ruby", "PHP", "Go", "Rust", "Swift",
    "HTML", "CSS", "SASS", "LESS", "Bootstrap", "Tailwind", "Material UI",
    "Git", "GitHub", "GitLab", "CI/CD", "Docker", "Kubernetes", "AWS", 
    "Azure", "GCP", "Firebase", "MongoDB", "MySQL", "PostgreSQL", "SQL",
    "NoSQL", "Redis", "GraphQL", "REST", "API", "microservices", "testing",
    "Jest", "Mocha", "Chai", "Cypress", "Selenium", "Agile", "Scrum"
  ];
  
  const foundSkills: string[] = [];
  
  commonSkills.forEach(skill => {
    if (content.toLowerCase().includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });
  
  // If no skills found, return some default ones
  return foundSkills.length > 0 ? foundSkills : 
         ["JavaScript", "React", "TypeScript", "HTML", "CSS", "Git"];
};

const extractCompanyFromContent = (content: string): string | null => {
  // Simple extraction based on common patterns
  const companyPattern = /(worked at|company|employer|corporation|inc|llc)/i;
  const contentWords = content.split(/\s+/);
  
  for (let i = 0; i < contentWords.length; i++) {
    if (companyPattern.test(contentWords[i]) && i + 1 < contentWords.length) {
      return contentWords[i + 1];
    }
  }
  
  return null;
};

const extractRoleFromContent = (content: string): string | null => {
  // Simple extraction based on common roles
  const roles = [
    "developer", "engineer", "programmer", "architect", "designer",
    "manager", "lead", "consultant", "analyst", "specialist"
  ];
  
  for (const role of roles) {
    if (content.toLowerCase().includes(role)) {
      const index = content.toLowerCase().indexOf(role);
      const start = Math.max(0, index - 15);
      const end = Math.min(content.length, index + 20);
      const snippet = content.substring(start, end);
      
      // Try to extract the complete role
      const rolePattern = new RegExp(`(\\w+\\s+)?${role}(\\s+\\w+)?`, 'i');
      const match = snippet.match(rolePattern);
      
      if (match && match[0]) {
        return match[0].charAt(0).toUpperCase() + match[0].slice(1);
      }
      
      return role.charAt(0).toUpperCase() + role.slice(1);
    }
  }
  
  return null;
};

const extractEducationFromContent = (content: string): string | null => {
  const educationPatterns = [
    /(university|college|institute|school)/i,
    /(bs|ba|b\.s\.|b\.a\.|bachelor|master|phd|doctorate|degree)/i
  ];
  
  for (const pattern of educationPatterns) {
    const match = content.match(pattern);
    if (match && match.index !== undefined) {
      const start = Math.max(0, match.index - 10);
      const end = Math.min(content.length, match.index + 30);
      const snippet = content.substring(start, end);
      
      // Extract the institution name
      const words = snippet.split(/\s+/);
      const nameIndex = words.findIndex(word => pattern.test(word));
      
      if (nameIndex >= 0 && nameIndex + 1 < words.length) {
        return words[nameIndex + 1];
      }
      
      if (nameIndex >= 0) {
        return words[nameIndex];
      }
    }
  }
  
  return null;
};

const extractProjectFromContent = (content: string): string | null => {
  const projectPatterns = [
    /(project|developed|created|built|implemented)/i,
    /(application|app|website|platform|system|solution)/i
  ];
  
  for (const pattern of projectPatterns) {
    const match = content.match(pattern);
    if (match && match.index !== undefined) {
      const start = Math.max(0, match.index - 5);
      const end = Math.min(content.length, match.index + 25);
      const snippet = content.substring(start, end);
      
      // Extract project name
      const words = snippet.split(/\s+/);
      const nameIndex = words.findIndex(word => pattern.test(word));
      
      if (nameIndex >= 0 && nameIndex + 2 < words.length) {
        return `${words[nameIndex + 1]} ${words[nameIndex + 2]}`;
      }
      
      if (nameIndex >= 0 && nameIndex + 1 < words.length) {
        return words[nameIndex + 1];
      }
    }
  }
  
  return null;
};

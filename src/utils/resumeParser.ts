import { toast } from "sonner";

export type ParsedResume = {
  name: string; // Added name field
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
    // For demo purposes, we'll simulate parsing with a timeout
    toast.info("Parsing resume...");
    
    // Simulating API call with timeout
    return new Promise((resolve) => {
      setTimeout(() => {
        // For demo purposes, we'll return mock data
        const mockParsedResume: ParsedResume = {
          name: "Alex Johnson", // Added mock name
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
          ]
        };
        
        toast.success("Resume parsing complete!");
        resolve(mockParsedResume);
      }, 2000);
    });
  } catch (error) {
    console.error("Error parsing resume:", error);
    toast.error("Failed to parse resume. Please try again.");
    return null;
  }
};

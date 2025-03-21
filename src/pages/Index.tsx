
import { useState } from "react";
import ResumeUpload from "@/components/ResumeUpload";
import Interview from "@/components/Interview";
import Analysis from "@/components/Analysis";
import { ParsedResume } from "@/utils/resumeParser";
import { QuestionAnswer, analyzeAnswers, AnalysisResult } from "@/utils/analysisEngine";
import { toast } from "sonner";

const Index = () => {
  const [step, setStep] = useState<"upload" | "interview" | "analysis">("upload");
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleResumeProcessed = async (resume: ParsedResume) => {
    setParsedResume(resume);
    setIsLoading(true);
    
    try {
      // Wait a moment to let the UI update before transitioning to interview
      setTimeout(() => {
        setStep("interview");
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      toast.error("Error preparing interview questions");
      console.error("Error:", error);
      setIsLoading(false);
    }
  };
  
  const handleInterviewComplete = (answers: QuestionAnswer[]) => {
    setAnswers(answers);
    
    // Analyze answers
    const result = analyzeAnswers(answers);
    setAnalysisResult(result);
    
    setStep("analysis");
  };
  
  const handleRestart = () => {
    setParsedResume(null);
    setAnswers([]);
    setAnalysisResult(null);
    setStep("upload");
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-foreground mb-2">
            <span className="font-semibold text-primary">AI</span> Interview Assistant
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Upload your resume, practice answering questions, and get personalized feedback to improve your interview skills
          </p>
        </header>
        
        {step === "upload" && (
          <ResumeUpload onResumeProcessed={handleResumeProcessed} isLoading={isLoading} />
        )}
        
        {step === "interview" && parsedResume && (
          <Interview 
            resume={parsedResume} 
            onComplete={handleInterviewComplete} 
          />
        )}
        
        {step === "analysis" && analysisResult && (
          <Analysis 
            result={analysisResult} 
            onRestart={handleRestart} 
          />
        )}
      </div>
    </div>
  );
};

export default Index;

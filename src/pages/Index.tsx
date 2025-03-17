
import { useState } from "react";
import ResumeUpload from "@/components/ResumeUpload";
import Interview from "@/components/Interview";
import Analysis from "@/components/Analysis";
import { ParsedResume } from "@/utils/resumeParser";
import { QuestionAnswer, analyzeAnswers, AnalysisResult } from "@/utils/analysisEngine";

const Index = () => {
  const [step, setStep] = useState<"upload" | "interview" | "analysis">("upload");
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  const handleResumeProcessed = (resume: ParsedResume) => {
    setParsedResume(resume);
    setStep("interview");
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
    <div className="min-h-screen bg-[#F1F0FB]">
      <div className="container mx-auto px-4 py-8">
        {step === "upload" && (
          <ResumeUpload onResumeProcessed={handleResumeProcessed} />
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


import { useState } from "react";
import { parseResume, ParsedResume } from "@/utils/resumeParser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileUp, File, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ResumeUploadProps {
  onResumeProcessed: (resume: ParsedResume) => void;
}

const ResumeUpload = ({ onResumeProcessed }: ResumeUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };
  
  const handleFile = (file: File) => {
    if (file.type === "application/pdf" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      setFile(file);
    } else {
      toast.error("Please upload a PDF or DOCX file");
    }
  };
  
  const handleProcessResume = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    
    try {
      const parsedResume = await parseResume(file);
      if (parsedResume) {
        onResumeProcessed(parsedResume);
      }
    } catch (error) {
      toast.error("Failed to process resume");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen w-full p-4 sm:p-6 lg:p-8 animate-fade-in">
      <Card className="w-full max-w-2xl glass shadow-glass-strong animate-scale-in">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-medium tracking-tight mb-2">Practice Better,</CardTitle>
          <CardTitle className="text-4xl font-medium tracking-tight mb-4">Interview Easier</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Prepare for job interviews with <span className="font-medium">real questions</span> asked at real companies.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center space-y-6">
          <div
            className={`
              w-full h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-6
              transition-all duration-300 ease-in-out
              ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-accent/50"}
              ${file ? "bg-secondary/50" : ""}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <File className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">{file.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setFile(null)}
                  >
                    Change
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleProcessResume}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <span className="animate-pulse-subtle">Processing...</span>
                      </>
                    ) : (
                      <>Process Resume</>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileUp className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">Drop your resume here</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Supports PDF, DOCX (Max 3MB)
                </p>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => document.getElementById("resume-upload")?.click()}
                >
                  Browse Files
                </Button>
                <input
                  id="resume-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx"
                  onChange={handleFileInput}
                />
              </>
            )}
          </div>
          
          <Separator />
          
          <div className="w-full space-y-6">
            <h3 className="text-lg font-medium">What happens next?</h3>
            
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-base">Resume Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    We'll analyze your resume to generate personalized interview questions based on your skills and experience.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-base">Interactive Interview</h4>
                  <p className="text-sm text-muted-foreground">
                    Answer questions using your microphone. Your responses will be transcribed in real-time.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-base">Performance Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    Get detailed feedback on your interview performance with specific recommendations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center pt-4">
          <Button
            size="lg"
            className="px-8 py-2 rounded-md font-medium"
            onClick={() => document.getElementById("resume-upload")?.click()}
          >
            Get Started
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResumeUpload;

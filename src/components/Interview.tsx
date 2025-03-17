
import { useState, useEffect, useRef } from "react";
import { Question, generateQuestions } from "@/utils/questionGenerator";
import { ParsedResume } from "@/utils/resumeParser";
import { QuestionAnswer } from "@/utils/analysisEngine";
import { videoRecorder, VideoRecorderStatus } from "@/utils/videoRecorder";
import QuestionCard from "./Question";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Camera, CameraOff, CheckCheck, Loader2, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface InterviewProps {
  resume: ParsedResume;
  onComplete: (answers: QuestionAnswer[]) => void;
}

const Interview = ({ resume, onComplete }: InterviewProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [isStarted, setIsStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [videoStatus, setVideoStatus] = useState<VideoRecorderStatus>("inactive");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    // Generate questions based on resume
    const generatedQuestions = generateQuestions(resume);
    setQuestions(generatedQuestions); // Now using all 10 questions from generator
  }, [resume]);
  
  useEffect(() => {
    // Configure video recorder
    videoRecorder.onStatusChange((newStatus) => {
      setVideoStatus(newStatus);
      
      if (newStatus === "denied") {
        toast.error("Camera access denied");
        setVideoEnabled(false);
      } else if (newStatus === "error") {
        toast.error("There was an error with video recording");
        setVideoEnabled(false);
      }
    });
    
    return () => {
      // Clean up video
      if (videoStatus === "recording") {
        videoRecorder.stop();
      }
    };
  }, []);
  
  const handleStartInterview = async () => {
    setIsLoading(true);
    
    // Start camera if video is enabled
    if (videoEnabled && videoRef.current) {
      try {
        const success = await videoRecorder.start(videoRef.current);
        if (!success) {
          setVideoEnabled(false);
        }
      } catch (error) {
        console.error("Failed to start video:", error);
        toast.error("Failed to start camera");
        setVideoEnabled(false);
      }
    }
    
    // Simulate loading for better UX
    setTimeout(() => {
      setIsStarted(true);
      setCurrentQuestionIndex(0);
      setIsLoading(false);
    }, 1500);
  };
  
  const handleQuestionComplete = (answer: string, duration: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    
    setAnswers([
      ...answers,
      {
        question: currentQuestion,
        answer,
        duration
      }
    ]);
    
    // Move to next question or finish
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishInterview();
    }
  };
  
  const finishInterview = () => {
    setIsComplete(true);
    
    // Stop video recording if active
    if (videoStatus === "recording") {
      videoRecorder.stop();
    }
    
    // Simulate processing time
    setTimeout(() => {
      onComplete(answers);
    }, 2000);
  };
  
  const toggleVideo = async () => {
    if (!videoEnabled) {
      // Check camera permission before enabling
      const hasPermission = await videoRecorder.checkPermission();
      if (!hasPermission) {
        toast.error("Camera permission is required for video recording");
        return;
      }
    }
    
    setVideoEnabled(!videoEnabled);
  };
  
  if (!isStarted) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full p-4 sm:p-6 lg:p-8 animate-fade-in bg-gradient-to-b from-background to-background/80">
        <Card className="w-full max-w-2xl glass shadow-glass-strong animate-scale-in">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-3xl font-light tracking-tight mb-2">Ready to Begin</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Your personalized interview with {questions.length} questions
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex flex-col items-center space-y-6">
            <div className="w-full p-5 rounded-lg bg-secondary/50 border border-border">
              <h3 className="font-medium text-lg mb-3">Interview Preparation Tips</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <CheckCheck className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <span>Find a quiet environment with minimal background noise</span>
                </li>
                <li className="flex items-start">
                  <CheckCheck className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <span>Make sure your microphone is working properly</span>
                </li>
                <li className="flex items-start">
                  <CheckCheck className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <span>Take your time to think before answering each question</span>
                </li>
                <li className="flex items-start">
                  <CheckCheck className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <span>Speak clearly and at a moderate pace for best results</span>
                </li>
              </ul>
            </div>
            
            <div className="flex items-center space-x-2 w-full justify-center">
              <Switch 
                id="enable-video" 
                checked={videoEnabled}
                onCheckedChange={toggleVideo}
              />
              <Label htmlFor="enable-video" className="text-sm">
                Enable video recording (optional)
              </Label>
            </div>
            
            {videoEnabled && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border bg-black/10">
                <video 
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  muted
                  playsInline
                />
                {!videoStatus && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera className="h-12 w-12 text-muted-foreground opacity-30" />
                  </div>
                )}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <Button 
              size="lg" 
              onClick={handleStartInterview}
              disabled={isLoading}
              className="px-8 py-6 text-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Preparing Interview...
                </>
              ) : (
                <>Start Interview</>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (isComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full p-4 sm:p-6 lg:p-8 animate-fade-in">
        <Card className="w-full max-w-2xl glass shadow-glass-strong animate-scale-in">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-light tracking-tight mb-2">Interview Complete</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Analyzing your responses...
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex flex-col items-center space-y-8 py-12">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-12 w-12 text-primary animate-spin-slow" />
            </div>
            <p className="text-center text-muted-foreground">
              Please wait while we analyze your interview performance
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen w-full p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="container max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Main question area */}
          <div className="lg:col-span-3 space-y-6">
            {currentQuestionIndex >= 0 && currentQuestionIndex < questions.length && (
              <QuestionCard
                question={questions[currentQuestionIndex]}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={questions.length}
                onComplete={handleQuestionComplete}
              />
            )}
          </div>
          
          {/* Video preview area (if enabled) */}
          <div className="lg:col-span-2 space-y-4">
            {videoEnabled ? (
              <Card className="glass shadow-glass overflow-hidden">
                <div className="aspect-video relative bg-black/10">
                  <video 
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    muted
                    playsInline
                  />
                  <div className="absolute bottom-3 right-3">
                    <div className="bg-black/50 text-white px-2 py-1 rounded-md text-xs flex items-center">
                      <div className="w-2 h-2 rounded-full bg-red-500 mr-1 animate-pulse-subtle" />
                      REC
                    </div>
                  </div>
                </div>
                <CardFooter className="p-3 flex justify-between">
                  <p className="text-sm text-muted-foreground">Camera Preview</p>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={toggleVideo}
                  >
                    <CameraOff className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card className="glass shadow-glass h-52 flex flex-col items-center justify-center">
                <CardContent className="flex flex-col items-center justify-center h-full text-center">
                  <Camera className="h-12 w-12 text-muted-foreground opacity-30 mb-4" />
                  <p className="text-muted-foreground">Video recording is disabled</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={toggleVideo}
                  >
                    Enable Camera
                  </Button>
                </CardContent>
              </Card>
            )}
            
            <Card className="glass shadow-glass">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Interview Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {questions.map((q, index) => (
                    <li key={q.id} className="flex items-center space-x-2">
                      <div 
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
                          ${index < currentQuestionIndex 
                            ? 'bg-primary text-primary-foreground' 
                            : index === currentQuestionIndex 
                              ? 'bg-primary/20 text-primary border border-primary/30' 
                              : 'bg-secondary text-muted-foreground'
                          }`}
                      >
                        {index + 1}
                      </div>
                      <span 
                        className={`text-sm truncate
                          ${index < currentQuestionIndex 
                            ? 'text-muted-foreground line-through' 
                            : index === currentQuestionIndex 
                              ? 'text-foreground font-medium' 
                              : 'text-muted-foreground'
                          }`}
                      >
                        {q.text.length > 40 ? q.text.substring(0, 40) + '...' : q.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interview;

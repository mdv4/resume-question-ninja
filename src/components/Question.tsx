
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Mic, MicOff, ChevronRight, Loader2 } from "lucide-react";
import { Question } from "@/utils/questionGenerator";
import { speechToText, SpeechRecognitionStatus } from "@/utils/speechToText";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onComplete: (answer: string, duration: number) => void;
}

const QuestionCard = ({ question, questionNumber, totalQuestions, onComplete }: QuestionCardProps) => {
  const [status, setStatus] = useState<SpeechRecognitionStatus>("inactive");
  const [currentText, setCurrentText] = useState("");
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Configure speech to text
    speechToText.onResult((text) => {
      setCurrentText(text);
    });
    
    speechToText.onStatusChange((newStatus) => {
      setStatus(newStatus);
      
      if (newStatus === "denied") {
        toast.error("Microphone access is required for the interview");
      } else if (newStatus === "error") {
        toast.error("There was an error with speech recognition");
      }
    });
    
    // Check microphone permission
    speechToText.checkPermission().then((hasPermission) => {
      if (!hasPermission) {
        toast.error("Microphone permission is required for the interview");
      }
    });
    
    return () => {
      // Clean up
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (status === "listening") {
        speechToText.stop();
      }
    };
  }, []);
  
  const startRecording = async () => {
    const success = speechToText.start();
    
    if (success) {
      startTimeRef.current = Date.now();
      
      // Start a timer to track recording duration
      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setRecordingDuration(duration);
        }
      }, 1000);
    }
  };
  
  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    const finalText = speechToText.stop();
    const duration = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0;
    startTimeRef.current = null;
    
    return { text: finalText || currentText, duration };
  };
  
  const handleSubmit = () => {
    setIsSubmitting(true);
    
    const { text, duration } = stopRecording();
    
    // Simulate processing time for better UX
    setTimeout(() => {
      onComplete(text, duration);
      setIsSubmitting(false);
    }, 1000);
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <div className="animate-scale-in">
      <Card className="glass shadow-glass">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-muted-foreground">
              Question {questionNumber} of {totalQuestions}
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              {status === "listening" && (
                <div className="flex items-center text-primary animate-pulse-subtle">
                  <Mic className="mr-1 h-4 w-4" />
                  Recording {formatTime(recordingDuration)}
                </div>
              )}
            </div>
          </div>
          <Progress value={(questionNumber / totalQuestions) * 100} className="h-1 mb-6" />
          <h2 className="text-2xl font-medium leading-tight">{question.text}</h2>
        </CardHeader>
        
        <CardContent className="pt-2">
          <div 
            className={`
              min-h-32 p-4 rounded-md border transition-all duration-300 bg-background/50
              ${currentText ? 'border-primary/20' : 'border-border'}
              ${status === "listening" ? 'ring-1 ring-primary/20' : ''}
            `}
          >
            {currentText ? (
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {currentText}
              </p>
            ) : (
              <p className="text-muted-foreground text-center italic my-8">
                {status === "listening" 
                  ? "Speak now..." 
                  : "Your answer will appear here as you speak. Click 'Start Recording' to begin."}
              </p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {status === "listening" ? (
            <Button 
              variant="outline" 
              className="flex items-center" 
              onClick={() => stopRecording()}
            >
              <MicOff className="mr-2 h-4 w-4" />
              Stop Recording
            </Button>
          ) : (
            <Button 
              className="flex items-center" 
              onClick={startRecording}
              disabled={isSubmitting || status === "denied"}
            >
              <Mic className="mr-2 h-4 w-4" />
              Start Recording
            </Button>
          )}
          
          <Button 
            variant="default" 
            className="flex items-center"
            onClick={handleSubmit}
            disabled={isSubmitting || !currentText || status === "listening"}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Next Question
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuestionCard;

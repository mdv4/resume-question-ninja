
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Mic, MicOff, ChevronRight, Loader2, Clock } from "lucide-react";
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
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  
  const MIN_RECORDING_TIME = 10; // seconds
  const MAX_RECORDING_TIME = 30; // seconds
  
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Clear text when moving to a new question
    setCurrentText("");
    setTimeRemaining(null);
    
    // Configure speech to text
    speechToText.clearTranscript();
    
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
  }, [question.id]); // Re-run when the question changes
  
  const startRecording = async () => {
    // Clear previous transcript
    speechToText.clearTranscript();
    setCurrentText("");
    
    const success = speechToText.start();
    
    if (success) {
      startTimeRef.current = Date.now();
      setTimeRemaining(MAX_RECORDING_TIME);
      
      // Start a timer to track recording duration and enforce limits
      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setRecordingDuration(elapsedSeconds);
          
          // Update time remaining
          const remaining = MAX_RECORDING_TIME - elapsedSeconds;
          setTimeRemaining(remaining);
          
          // Auto-stop when max time is reached
          if (elapsedSeconds >= MAX_RECORDING_TIME) {
            toast.info("Maximum recording time reached");
            const { text, duration } = stopRecording();
            if (text) { // Only submit if there's content
              handleSubmit();
            }
          }
        }
      }, 1000);
    }
  };
  
  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    speechToText.stop();
    const duration = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0;
    startTimeRef.current = null;
    setTimeRemaining(null);
    
    return { text: currentText, duration };
  };
  
  const handleSubmit = () => {
    if (status === "listening") {
      const { text, duration } = stopRecording();
      
      // Check if recording duration is too short
      if (duration < MIN_RECORDING_TIME) {
        toast.error(`Please record for at least ${MIN_RECORDING_TIME} seconds`);
        return;
      }
      
      setIsSubmitting(true);
      
      // Simulate processing time for better UX
      setTimeout(() => {
        onComplete(text, duration);
        setIsSubmitting(false);
      }, 1000);
    } else {
      // If not recording, just submit the current text
      setIsSubmitting(true);
      
      // Get the duration if available
      const duration = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0;
      
      // Simulate processing time for better UX
      setTimeout(() => {
        onComplete(currentText, duration);
        setIsSubmitting(false);
      }, 1000);
    }
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
                <div className="flex items-center">
                  {timeRemaining !== null && timeRemaining <= 10 ? (
                    <div className="text-red-500 animate-pulse-subtle flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      {formatTime(timeRemaining)}
                    </div>
                  ) : (
                    <div className="text-primary animate-pulse-subtle flex items-center">
                      <Mic className="mr-1 h-4 w-4" />
                      Recording {formatTime(recordingDuration)}
                    </div>
                  )}
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
                  ? `Speak now... (${MIN_RECORDING_TIME}-${MAX_RECORDING_TIME} seconds)` 
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
              onClick={() => {
                const { text, duration } = stopRecording();
                if (duration < MIN_RECORDING_TIME) {
                  toast.error(`Please record for at least ${MIN_RECORDING_TIME} seconds`);
                }
              }}
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
            disabled={isSubmitting || !currentText || (status === "listening" && recordingDuration < MIN_RECORDING_TIME)}
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

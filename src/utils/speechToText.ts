
import { toast } from "sonner";

type SpeechRecognitionStatus = "inactive" | "listening" | "processing" | "error" | "denied";

class SpeechToTextService {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private onResultCallback: ((text: string) => void) | null = null;
  private onFinalResultCallback: ((text: string) => void) | null = null;
  private onStatusChangeCallback: ((status: SpeechRecognitionStatus) => void) | null = null;
  private interimResult: string = "";
  private finalResult: string = "";

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      // @ts-ignore - TypeScript doesn't recognize webkitSpeechRecognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        toast.error("Speech recognition is not supported in your browser");
        this.triggerStatusChange("error");
        return;
      }
      
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = "en-US";
      
      this.recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        this.interimResult = interimTranscript;
        
        if (finalTranscript) {
          this.finalResult += " " + finalTranscript;
          this.finalResult = this.finalResult.trim();
          
          if (this.onFinalResultCallback) {
            this.onFinalResultCallback(this.finalResult);
          }
        }
        
        const currentTranscript = this.finalResult + (this.interimResult ? " " + this.interimResult : "");
        
        if (this.onResultCallback) {
          this.onResultCallback(currentTranscript.trim());
        }
      };
      
      this.recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        
        if (event.error === "not-allowed") {
          toast.error("Microphone access denied");
          this.triggerStatusChange("denied");
        } else {
          toast.error(`Speech recognition error: ${event.error}`);
          this.triggerStatusChange("error");
        }
        
        this.isListening = false;
      };
      
      this.recognition.onend = () => {
        if (this.isListening) {
          // If still supposed to be listening, restart recognition
          this.recognition?.start();
        } else {
          this.triggerStatusChange("inactive");
        }
      };
      
    } catch (error) {
      console.error("Error initializing speech recognition:", error);
      toast.error("Failed to initialize speech recognition");
      this.triggerStatusChange("error");
    }
  }
  
  public start() {
    if (!this.recognition) {
      this.initialize();
      if (!this.recognition) {
        return false;
      }
    }
    
    try {
      this.recognition.start();
      this.isListening = true;
      this.interimResult = "";
      this.finalResult = "";
      this.triggerStatusChange("listening");
      return true;
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      toast.error("Failed to start speech recognition");
      this.triggerStatusChange("error");
      return false;
    }
  }
  
  public stop() {
    if (this.recognition && this.isListening) {
      this.isListening = false;
      this.recognition.stop();
      this.triggerStatusChange("processing");
      return this.finalResult;
    }
    return this.finalResult;
  }
  
  public reset() {
    this.interimResult = "";
    this.finalResult = "";
    if (this.onResultCallback) {
      this.onResultCallback("");
    }
  }
  
  public onResult(callback: (text: string) => void) {
    this.onResultCallback = callback;
  }
  
  public onFinalResult(callback: (text: string) => void) {
    this.onFinalResultCallback = callback;
  }
  
  public onStatusChange(callback: (status: SpeechRecognitionStatus) => void) {
    this.onStatusChangeCallback = callback;
  }
  
  private triggerStatusChange(status: SpeechRecognitionStatus) {
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback(status);
    }
  }
  
  public checkPermission(): Promise<boolean> {
    return new Promise((resolve) => {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          // Stop all tracks immediately after permission is granted
          stream.getTracks().forEach(track => track.stop());
          resolve(true);
        })
        .catch((error) => {
          console.error("Microphone permission error:", error);
          resolve(false);
        });
    });
  }
}

// Export a singleton instance
export const speechToText = new SpeechToTextService();
export type { SpeechRecognitionStatus };

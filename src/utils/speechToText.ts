
// Define SpeechRecognition with browser prefixes for TypeScript
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

// Define status type for speech recognition
export type SpeechRecognitionStatus = "inactive" | "listening" | "denied" | "error";

let recognition: typeof SpeechRecognition;

// Initialize SpeechRecognition with the appropriate browser prefix
if (typeof window !== 'undefined') {
  recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
}

// Callbacks for the speech recognition API
export type SpeechCallbacks = {
  onResult: (text: string) => void;
  onError: (error: string) => void;
  onStart: () => void;
  onEnd: () => void;
};

// Class to handle speech to text functionality
class SpeechToText {
  private recognitionInstance: SpeechRecognition | null = null;
  private resultCallback: ((text: string) => void) | null = null;
  private statusCallback: ((status: SpeechRecognitionStatus) => void) | null = null;
  private isListening: boolean = false;
  
  // Initialize the speech recognition
  private initRecognition() {
    if (!recognition) {
      console.error("Speech recognition not supported in this browser");
      return false;
    }
    
    try {
      this.recognitionInstance = new recognition();
      this.recognitionInstance.continuous = true;
      this.recognitionInstance.interimResults = true;
      this.recognitionInstance.lang = 'en-US';
      
      this.recognitionInstance.onresult = (event) => {
        if (!this.resultCallback) return;
        
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            // For interim results, pass the current result for real-time feedback
            this.resultCallback(transcript);
          }
        }
        
        if (finalTranscript !== '') {
          this.resultCallback(finalTranscript);
        }
      };
      
      this.recognitionInstance.onerror = (event) => {
        if (this.statusCallback) {
          this.statusCallback("error");
        }
        console.error("Speech recognition error:", event.error);
      };
      
      this.recognitionInstance.onstart = () => {
        this.isListening = true;
        if (this.statusCallback) {
          this.statusCallback("listening");
        }
      };
      
      this.recognitionInstance.onend = () => {
        this.isListening = false;
        if (this.statusCallback) {
          this.statusCallback("inactive");
        }
      };
      
      return true;
    } catch (error) {
      console.error("Error initializing speech recognition:", error);
      return false;
    }
  }
  
  // Set the result callback
  public onResult(callback: (text: string) => void) {
    this.resultCallback = callback;
  }
  
  // Set the status change callback
  public onStatusChange(callback: (status: SpeechRecognitionStatus) => void) {
    this.statusCallback = callback;
  }
  
  // Check microphone permission
  public async checkPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error("Error checking microphone permission:", error);
      if (this.statusCallback) {
        this.statusCallback("denied");
      }
      return false;
    }
  }
  
  // Start listening with the provided callbacks
  public start(): boolean {
    if (!this.recognitionInstance && !this.initRecognition()) {
      if (this.statusCallback) {
        this.statusCallback("error");
      }
      return false;
    }
    
    if (this.isListening) {
      this.stop();
    }
    
    try {
      this.recognitionInstance?.start();
      return true;
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      if (this.statusCallback) {
        this.statusCallback("error");
      }
      return false;
    }
  }
  
  // Stop listening and return the final text
  public stop(): string | null {
    let finalText = null;
    
    if (this.recognitionInstance && this.isListening) {
      try {
        // We can't directly get the final text from stop(), so we rely on the last result
        this.recognitionInstance.stop();
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      }
    }
    
    this.isListening = false;
    return finalText;
  }
  
  // Check if the browser supports speech recognition
  public isSupported(): boolean {
    return !!recognition;
  }
  
  // Check if currently listening
  public listening(): boolean {
    return this.isListening;
  }
}

export const speechToText = new SpeechToText();

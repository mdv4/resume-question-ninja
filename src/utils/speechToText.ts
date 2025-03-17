
// Define SpeechRecognition with browser prefixes for TypeScript
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

let SpeechRecognition: new () => SpeechRecognition;

// Initialize SpeechRecognition with the appropriate browser prefix
if (typeof window !== 'undefined') {
  SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
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
  private recognition: SpeechRecognition | null = null;
  private callbacks: SpeechCallbacks | null = null;
  private isListening: boolean = false;
  
  // Initialize the speech recognition
  private initRecognition() {
    if (!SpeechRecognition) {
      console.error("Speech recognition not supported in this browser");
      return false;
    }
    
    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      
      this.recognition.onresult = (event) => {
        if (!this.callbacks) return;
        
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            // For interim results, pass the current result for real-time feedback
            this.callbacks.onResult(transcript);
          }
        }
        
        if (finalTranscript !== '') {
          this.callbacks.onResult(finalTranscript);
        }
      };
      
      this.recognition.onerror = (event) => {
        if (!this.callbacks) return;
        this.callbacks.onError(event.error);
      };
      
      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.callbacks) this.callbacks.onStart();
      };
      
      this.recognition.onend = () => {
        this.isListening = false;
        if (this.callbacks) this.callbacks.onEnd();
      };
      
      return true;
    } catch (error) {
      console.error("Error initializing speech recognition:", error);
      return false;
    }
  }
  
  // Start listening with the provided callbacks
  public start(callbacks: SpeechCallbacks): boolean {
    this.callbacks = callbacks;
    
    if (!this.recognition && !this.initRecognition()) {
      if (this.callbacks) this.callbacks.onError("Speech recognition not supported");
      return false;
    }
    
    if (this.isListening) {
      this.stop();
    }
    
    try {
      this.recognition?.start();
      return true;
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      if (this.callbacks) this.callbacks.onError("Failed to start speech recognition");
      return false;
    }
  }
  
  // Stop listening
  public stop(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      }
    }
    this.isListening = false;
  }
  
  // Check if the browser supports speech recognition
  public isSupported(): boolean {
    return !!SpeechRecognition;
  }
  
  // Check if currently listening
  public listening(): boolean {
    return this.isListening;
  }
}

export const speechToText = new SpeechToText();

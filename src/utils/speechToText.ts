
// Define SpeechRecognition interface for TypeScript
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onstart: () => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

// Define SpeechRecognition with browser prefixes for TypeScript
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// Define status type for speech recognition
export type SpeechRecognitionStatus = "inactive" | "listening" | "denied" | "error";

// Use constructors for SpeechRecognition
let SpeechRecognitionConstructor: new () => SpeechRecognition;

// Initialize SpeechRecognition with the appropriate browser prefix
if (typeof window !== 'undefined') {
  SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
}

// Class to handle speech to text functionality
class SpeechToText {
  private recognitionInstance: SpeechRecognition | null = null;
  private resultCallback: ((text: string) => void) | null = null;
  private statusCallback: ((status: SpeechRecognitionStatus) => void) | null = null;
  private isListening: boolean = false;
  private transcriptBuffer: string = '';
  
  // Initialize the speech recognition
  private initRecognition() {
    if (!SpeechRecognitionConstructor) {
      console.error("Speech recognition not supported in this browser");
      return false;
    }
    
    try {
      this.recognitionInstance = new SpeechRecognitionConstructor();
      this.recognitionInstance.continuous = true;
      this.recognitionInstance.interimResults = true;
      this.recognitionInstance.lang = 'en-US';
      
      this.recognitionInstance.onresult = (event) => {
        if (!this.resultCallback) return;
        
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            // Add final transcript to our buffer
            this.transcriptBuffer += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript !== '') {
          // Send the complete text (buffer + current interim) to the callback
          this.resultCallback(this.transcriptBuffer + interimTranscript);
        } else if (interimTranscript !== '') {
          // Send the buffer plus current interim transcript
          this.resultCallback(this.transcriptBuffer + interimTranscript);
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
  
  // Clear the transcript buffer
  public clearTranscript() {
    this.transcriptBuffer = '';
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
  public stop(): void {
    if (this.recognitionInstance && this.isListening) {
      try {
        this.recognitionInstance.stop();
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      }
    }
    
    this.isListening = false;
  }
  
  // Get the current transcript
  public getTranscript(): string {
    return this.transcriptBuffer;
  }
  
  // Check if the browser supports speech recognition
  public isSupported(): boolean {
    return !!SpeechRecognitionConstructor;
  }
  
  // Check if currently listening
  public listening(): boolean {
    return this.isListening;
  }
}

export const speechToText = new SpeechToText();

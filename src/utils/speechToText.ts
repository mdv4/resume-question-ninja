
// Define the SpeechRecognition interface if it doesn't exist
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onerror: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

// Define the status types
export type SpeechRecognitionStatus = "inactive" | "listening" | "denied" | "error";

class SpeechToText {
  private recognition: SpeechRecognition | null = null;
  private transcript: string = "";
  private statusListeners: ((status: SpeechRecognitionStatus) => void)[] = [];
  private resultListeners: ((text: string) => void)[] = [];
  
  constructor() {
    try {
      // Try to get the SpeechRecognition constructor
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        
        this.recognition.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = this.transcript;

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
              finalTranscript += ' ' + transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          // Update transcript with any final results
          this.transcript = finalTranscript.trim();
          
          // Notify listeners with the complete text (final + interim)
          const completeText = (this.transcript + ' ' + interimTranscript).trim();
          this.resultListeners.forEach(listener => listener(completeText));
        };
        
        this.recognition.onend = () => {
          this.notifyStatusChange('inactive');
        };
        
        this.recognition.onerror = () => {
          this.notifyStatusChange('error');
        };
      }
    } catch (error) {
      console.error('Speech recognition not supported:', error);
    }
  }
  
  public start(): boolean {
    if (!this.recognition) {
      return false;
    }
    
    try {
      this.recognition.start();
      this.notifyStatusChange('listening');
      return true;
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      this.notifyStatusChange('error');
      return false;
    }
  }
  
  public stop(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
  }
  
  public clearTranscript(): void {
    this.transcript = '';
  }
  
  public onStatusChange(callback: (status: SpeechRecognitionStatus) => void): void {
    this.statusListeners.push(callback);
  }
  
  public onResult(callback: (text: string) => void): void {
    this.resultListeners.push(callback);
  }
  
  public async checkPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      this.notifyStatusChange('denied');
      return false;
    }
  }
  
  private notifyStatusChange(status: SpeechRecognitionStatus): void {
    this.statusListeners.forEach(listener => listener(status));
  }
}

// Create singleton instance
export const speechToText = new SpeechToText();

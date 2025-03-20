
import { toast } from "sonner";

type VideoRecorderStatus = "inactive" | "recording" | "error" | "denied";

class VideoRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private isRecording: boolean = false;
  private onStatusChangeCallback: ((status: VideoRecorderStatus) => void) | null = null;
  private videoElement: HTMLVideoElement | null = null;

  public async start(videoElement: HTMLVideoElement): Promise<boolean> {
    this.videoElement = videoElement;
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Video recording is not supported in your browser");
        this.triggerStatusChange("error");
        return false;
      }
      
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false // No audio needed for video preview
      });
      
      if (this.videoElement) {
        this.videoElement.srcObject = this.stream;
        this.videoElement.muted = true; // Mute to prevent feedback
        
        // Ensure video plays and is visible
        this.videoElement.style.display = "block";
        this.videoElement.style.width = "100%";
        this.videoElement.style.height = "100%";
        this.videoElement.style.objectFit = "cover";
        
        try {
          await this.videoElement.play();
          console.log("Video is now playing in element:", this.videoElement);
        } catch (error) {
          console.error("Error playing video:", error);
        }
      } else {
        console.error("Video element is null when trying to display stream");
      }
      
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.chunks = [];
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };
      
      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        this.triggerStatusChange("inactive");
      };
      
      this.mediaRecorder.start();
      this.isRecording = true;
      this.triggerStatusChange("recording");
      
      return true;
    } catch (error) {
      console.error("Error starting video recording:", error);
      if ((error as any).name === "NotAllowedError") {
        toast.error("Camera access denied");
        this.triggerStatusChange("denied");
      } else {
        toast.error("Failed to start video recording");
        this.triggerStatusChange("error");
      }
      return false;
    }
  }

  // New method to get video feed without recording
  public async startVideoOnly(videoElement: HTMLVideoElement): Promise<boolean> {
    this.videoElement = videoElement;
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Video is not supported in your browser");
        return false;
      }
      
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });
      
      if (this.videoElement) {
        this.videoElement.srcObject = this.stream;
        this.videoElement.muted = true;
        
        // Ensure video plays and is visible
        this.videoElement.style.display = "block";
        this.videoElement.style.width = "100%";
        this.videoElement.style.height = "100%";
        this.videoElement.style.objectFit = "cover";
        
        try {
          await this.videoElement.play();
          console.log("Video preview is now playing");
          return true;
        } catch (error) {
          console.error("Error playing video:", error);
          return false;
        }
      } else {
        console.error("Video element is null when trying to display stream");
        return false;
      }
    } catch (error) {
      console.error("Error starting video preview:", error);
      if ((error as any).name === "NotAllowedError") {
        toast.error("Camera access denied");
      } else {
        toast.error("Failed to start video preview");
      }
      return false;
    }
  }

  public stop(): Blob | null {
    if (!this.mediaRecorder || !this.isRecording) {
      return null;
    }
    
    this.mediaRecorder.stop();
    this.isRecording = false;
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
    
    if (this.chunks.length === 0) {
      return null;
    }
    
    const blob = new Blob(this.chunks, { type: "video/webm" });
    this.chunks = [];
    
    return blob;
  }
  
  // New method to only stop the video feed without stopping recording
  public stopVideoOnly(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
  }
  
  public getRecordingURL(): string | null {
    const blob = this.stop();
    if (!blob) {
      return null;
    }
    
    return URL.createObjectURL(blob);
  }
  
  public onStatusChange(callback: (status: VideoRecorderStatus) => void) {
    this.onStatusChangeCallback = callback;
  }
  
  private triggerStatusChange(status: VideoRecorderStatus) {
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback(status);
    }
  }
  
  public checkPermission(): Promise<boolean> {
    return new Promise((resolve) => {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          // Stop all tracks immediately after permission is granted
          stream.getTracks().forEach(track => track.stop());
          resolve(true);
        })
        .catch((error) => {
          console.error("Camera permission error:", error);
          resolve(false);
        });
    });
  }
}

// Export a singleton instance
export const videoRecorder = new VideoRecorderService();
export type { VideoRecorderStatus };

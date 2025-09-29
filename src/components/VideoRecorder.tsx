import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, Circle, Pause, Play, Video } from "lucide-react";

export type VideoRecorderHandle = {
  start: () => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isRecording: () => boolean;
};

type Props = {
  onRecordingReady?: (blob: Blob) => void;
  isAutoStart?: boolean;
  className?: string;
};

const VideoRecorder = forwardRef<VideoRecorderHandle, Props>(({ onRecordingReady, isAutoStart = false, className = "" }, ref) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const [isSupported, setIsSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setIsSupported(!!(navigator.mediaDevices && window.MediaRecorder));
  }, []);

  useEffect(() => {
    if (isAutoStart) {
      start();
    }
    return () => {
      cleanup();
    };
  }, []);

  const startTimer = () => {
    if (timerRef.current) return;
    timerRef.current = window.setInterval(() => setElapsed((s) => s + 1), 1000);
  };
  const stopTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const start = async () => {
    if (!isSupported || isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      const recorder = new MediaRecorder(stream, { mimeType: getPreferredMimeType() });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stopTimer();
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        onRecordingReady?.(blob);
      };
      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setIsPaused(false);
      setElapsed(0);
      startTimer();
    } catch (e) {
      alert("Camera/mic permission denied or unavailable.");
    }
  };

  const pause = () => {
    const rec = mediaRecorderRef.current;
    if (!rec) return;
    if (rec.state === "recording") {
      rec.pause();
      setIsPaused(true);
      stopTimer();
    }
  };

  const resume = () => {
    const rec = mediaRecorderRef.current;
    if (!rec) return;
    if (rec.state === "paused") {
      rec.resume();
      setIsPaused(false);
      startTimer();
    }
  };

  const stop = () => {
    const rec = mediaRecorderRef.current;
    if (rec && (rec.state === "recording" || rec.state === "paused")) {
      rec.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
    stopTimer();
    cleanupStreamOnly();
  };

  const cleanupStreamOnly = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const cleanup = () => {
    stopTimer();
    try { stop(); } catch {}
    cleanupStreamOnly();
  };

  const getPreferredMimeType = () => {
    const candidates = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4'
    ];
    const supported = candidates.find(type => MediaRecorder.isTypeSupported(type));
    return supported || '';
  };

  const formatTime = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const getBlob = (): Blob => {
    const type = mediaRecorderRef.current?.mimeType || 'video/webm';
    return new Blob(chunksRef.current, { type });
  };

  useImperativeHandle(ref, () => ({
    start,
    stop,
    pause,
    resume,
    isRecording: () => isRecording,
    getBlob,
  }), [isRecording]);

  if (!isSupported) {
    return (
      <div className="text-xs text-muted-foreground flex items-center gap-2">
        <CameraOff className="h-4 w-4" /> Camera recording not supported in this browser.
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative rounded-lg overflow-hidden border border-border bg-black">
        <video ref={videoRef} className="w-full h-48 object-cover" muted playsInline />
        {isRecording && (
          <div className="absolute top-2 left-2 px-2 py-1 text-xs bg-red-600 text-white rounded-full flex items-center gap-2">
            <span className="inline-flex w-2 h-2 bg-white rounded-full animate-pulse" /> REC {formatTime(elapsed)}
          </div>
        )}
      </div>
       <div className="mt-2 flex items-center gap-2">
        {!isRecording ? (
          <Button size="sm" onClick={start} className="bg-foreground text-background hover:bg-foreground/90">
            <Video className="h-4 w-4 mr-2" /> Start Camera
          </Button>
        ) : (
          <>
            {isPaused ? (
              <Button size="sm" variant="outline" onClick={resume}><Play className="h-4 w-4 mr-2" /> Resume</Button>
            ) : (
              <Button size="sm" variant="outline" onClick={pause}><Pause className="h-4 w-4 mr-2" /> Pause</Button>
            )}
            <Button size="sm" variant="destructive" onClick={stop}><Circle className="h-4 w-4 mr-2" /> Stop</Button>
          </>
        )}
      </div>
    </div>
  );
});

export default VideoRecorder;



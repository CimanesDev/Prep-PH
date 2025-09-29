import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
  disabled?: boolean;
  className?: string;
}

const VoiceInput = ({ onTranscript, disabled = false, className = "" }: VoiceInputProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  
  const {
    isListening,
    isSupported,
    transcript,
    error,
    confidence,
    toggleListening,
    resetTranscript
  } = useSpeechRecognition({
    continuous: true,
    interimResults: true,
    language: 'en-US',
    onResult: (transcript, isFinal) => {
      if (isFinal && transcript.trim()) {
        onTranscript(transcript);
        resetTranscript();
      }
    },
    onStart: () => {
      setIsRecording(true);
      // Simulate audio level for visual feedback
      const interval = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 100);
      
      return () => clearInterval(interval);
    },
    onEnd: () => {
      setIsRecording(false);
      setAudioLevel(0);
    },
    onError: (error) => {
      console.error('Speech recognition error:', error);
      setIsRecording(false);
      setAudioLevel(0);
      
      // Auto-retry for network errors (up to 3 times)
      if (error.includes('Network error') && retryCount < 3) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          if (!isListening) {
            toggleListening();
          }
        }, 2000);
      }
    }
  });

  // Handle transcript updates
  useEffect(() => {
    if (transcript && !isListening) {
      onTranscript(transcript);
    }
  }, [transcript, isListening, onTranscript]);

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-sm text-muted-foreground space-y-2">
        <VolumeX className="h-6 w-6" />
        <div className="text-center">
          <div className="font-medium">Voice input not supported</div>
          <div className="text-xs">Please use Chrome, Edge, or Safari for voice features</div>
        </div>
      </div>
    );
  }

  const handleToggleRecording = () => {
    if (!disabled) {
      toggleListening();
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Button
        type="button"
        variant={isListening ? "default" : "outline"}
        size="icon"
        onClick={handleToggleRecording}
        disabled={disabled}
        className={`relative transition-all duration-200 ${
          isListening 
            ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" 
            : "hover:bg-secondary/50"
        }`}
        aria-label={isListening ? "Stop recording" : "Start recording"}
      >
        {isListening ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
        
        {/* Audio level indicator */}
        {isListening && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
        )}
      </Button>

      {/* Recording status */}
      {isListening && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span>Recording...</span>
          </div>
          
          {/* Audio level bars */}
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4].map((bar) => (
              <div
                key={bar}
                className={`w-1 h-3 rounded-full transition-all duration-100 ${
                  audioLevel > bar * 20 ? 'bg-red-500' : 'bg-muted'
                }`}
                style={{
                  height: `${Math.max(4, (audioLevel / 100) * 12)}px`
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="flex flex-col items-center space-y-2 text-xs text-red-500 max-w-xs">
          <div className="text-center">{error}</div>
          {error.includes('Network error') && retryCount < 3 && (
            <div className="text-xs text-muted-foreground">
              Retrying... ({retryCount}/3)
            </div>
          )}
          {error.includes('Network error') && retryCount >= 3 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setRetryCount(0);
                toggleListening();
              }}
              className="text-xs"
            >
              Try Again
            </Button>
          )}
        </div>
      )}

      {/* Confidence indicator */}
      {confidence > 0 && (
        <div className="text-xs text-muted-foreground">
          {Math.round(confidence * 100)}% confident
        </div>
      )}
    </div>
  );
};

export default VoiceInput;

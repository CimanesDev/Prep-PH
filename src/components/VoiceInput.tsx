import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, VolumeX } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
  disabled?: boolean;
  className?: string;
  autoStart?: boolean;
  compact?: boolean; // compact mode keeps layout stable; shows fewer adornments
  size?: 'sm' | 'md' | 'lg';
}

const VoiceInput = ({ onTranscript, disabled = false, className = "", autoStart = false, compact = false, size = 'md' }: VoiceInputProps) => {
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
      // Simulate audio level for visual feedback
      const interval = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 100);
      
      return () => clearInterval(interval);
    },
    onEnd: () => {
      setAudioLevel(0);
    },
    onError: (error) => {
      console.error('Speech recognition error:', error);
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

  // Auto-start listening on mount if requested
  useEffect(() => {
    if (autoStart && !disabled && !isListening) {
      toggleListening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, disabled]);

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
        size={size === 'lg' ? 'default' : 'icon'}
        onClick={handleToggleRecording}
        disabled={disabled}
        className={`relative transition-none ${isListening ? "bg-red-500 hover:bg-red-600 text-white" : "hover:bg-secondary/50"} ${size === 'lg' ? 'px-4 py-6 rounded-xl' : ''}`}
        aria-label={isListening ? "Stop recording" : "Start recording"}
      >
        {isListening ? (
          <MicOff className={`${size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'}`} />
        ) : (
          <Mic className={`${size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'}`} />
        )}
        {!compact && isListening && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
        )}
      </Button>

      {isListening && (
        <div className={`flex items-center ${size === 'lg' ? 'text-base' : 'text-sm'} text-muted-foreground ${compact ? "ml-1" : "space-x-2"}`}>
          <div className="flex items-center space-x-1">
            <div className={`${size === 'lg' ? 'w-2.5 h-2.5' : 'w-2 h-2'} bg-red-500 rounded-full`} />
            {!compact && <span>Recording...</span>}
          </div>
          {!compact && (
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className={`w-1 h-3 rounded-full ${audioLevel > bar * 20 ? 'bg-red-500' : 'bg-muted'}`}
                  style={{ height: `${Math.max(4, (audioLevel / 100) * 12)}px` }}
                />
              ))}
            </div>
          )}
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

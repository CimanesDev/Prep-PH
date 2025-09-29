import { useState, useRef, useCallback, useEffect } from 'react';

interface SpeechRecognitionState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  error: string | null;
  confidence: number;
}

interface UseSpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export const useSpeechRecognition = (options: UseSpeechRecognitionOptions = {}) => {
  const {
    continuous = true,
    interimResults = true,
    language = 'en-US',
    onResult,
    onError,
    onStart,
    onEnd
  } = options;

  const [state, setState] = useState<SpeechRecognitionState>({
    isListening: false,
    isSupported: false,
    transcript: '',
    error: null,
    confidence: 0
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check for browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setState(prev => ({ ...prev, isSupported: !!SpeechRecognition }));
  }, []);

  const startListening = useCallback(() => {
    if (!state.isSupported || state.isListening) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;

    recognition.onstart = () => {
      setState(prev => ({ ...prev, isListening: true, error: null }));
      onStart?.();
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }

        setState(prev => ({ 
          ...prev, 
          confidence: confidence,
          transcript: finalTranscript + interimTranscript
        }));
      }

      onResult?.(finalTranscript + interimTranscript, !!finalTranscript);
    };

    recognition.onerror = (event) => {
      let errorMessage = `Speech recognition error: ${event.error}`;
      
      // Handle specific error types
      switch (event.error) {
        case 'network':
          errorMessage = 'Network error. Please check your internet connection and try again.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone permissions and refresh the page.';
          break;
        case 'no-speech':
          errorMessage = 'No speech detected. Please try speaking louder or closer to the microphone.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone found. Please connect a microphone and try again.';
          break;
        case 'service-not-allowed':
          errorMessage = 'Speech recognition service not available. Please try again later.';
          break;
        case 'bad-grammar':
          errorMessage = 'Speech recognition grammar error. Please try again.';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}. Please try again.`;
      }
      
      setState(prev => ({ ...prev, error: errorMessage, isListening: false }));
      onError?.(errorMessage);
      
      // Auto-retry for network errors after a delay
      if (event.error === 'network') {
        setTimeout(() => {
          setState(prev => ({ ...prev, error: null }));
        }, 3000);
      }
    };

    recognition.onend = () => {
      setState(prev => ({ ...prev, isListening: false }));
      onEnd?.();
    };

    recognitionRef.current = recognition;
    recognition.start();

    // Auto-stop after 30 seconds of silence
    timeoutRef.current = setTimeout(() => {
      stopListening();
    }, 30000);
  }, [state.isSupported, state.isListening, continuous, interimResults, language, onResult, onError, onStart, onEnd]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [state.isListening]);

  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  const resetTranscript = useCallback(() => {
    setState(prev => ({ ...prev, transcript: '' }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript
  };
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

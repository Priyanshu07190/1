import { useState, useEffect, useCallback } from 'react';
import { Language } from '@shared/schema';

// Map of language codes for the supported Indian languages
const languageCodes: Record<Language, string> = {
  english: 'en-IN',
  hindi: 'hi-IN',
  bengali: 'bn-IN',
  marathi: 'mr-IN',
  telugu: 'te-IN',
  tamil: 'ta-IN',
  gujarati: 'gu-IN',
  urdu: 'ur-IN',
  kannada: 'kn-IN',
  odia: 'or-IN',
  punjabi: 'pa-IN',
  malayalam: 'ml-IN',
  assamese: 'as-IN',
  maithili: 'mai',  // No specific BCP47 code, using ISO 639-3
  sanskrit: 'sa-IN',
  kashmiri: 'ks-IN',
  nepali: 'ne-IN',
  konkani: 'kok-IN',
  sindhi: 'sd-IN',
  bodo: 'brx',      // Using ISO 639-3 code
  dogri: 'doi',     // Using ISO 639-3 code
  manipuri: 'mni',  // Using ISO 639-3 code
  santhali: 'sat'   // Using ISO 639-3 code
};

interface SpeechRecognitionResult {
  transcript: string;
  isListening: boolean;
  startListening: (language?: Language) => void;
  stopListening: () => void;
  resetTranscript: () => void;
  hasRecognitionSupport: boolean;
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
}

export function useSpeechRecognition(): SpeechRecognitionResult {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [hasRecognitionSupport, setHasRecognitionSupport] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('english');

  // Check if browser supports speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setHasRecognitionSupport(true);
      const recognitionInstance = new SpeechRecognition();
      
      // Enable continuous mode for better experience
      recognitionInstance.continuous = true;
      
      // Enable interim results to see text as it's being recognized
      recognitionInstance.interimResults = true;
      
      // Set higher confidence threshold for better accuracy
      recognitionInstance.maxAlternatives = 1;
      
      // Set the language based on user selection
      recognitionInstance.lang = languageCodes[currentLanguage] || 'en-IN';
      
      setRecognition(recognitionInstance);
    }
  }, []);

  // Update language when it changes
  useEffect(() => {
    if (recognition) {
      recognition.lang = languageCodes[currentLanguage] || 'en-IN';
    }
  }, [currentLanguage, recognition]);

  // Configure event handlers when recognition instance is available
  useEffect(() => {
    if (!recognition) return;
    
    const handleResult = (event: any) => {
      // Show interim results for real-time feedback
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Update with final or interim transcript
      // This allows the user to see what they're saying in real-time
      if (finalTranscript) {
        setTranscript(finalTranscript);
      } else if (interimTranscript) {
        setTranscript(interimTranscript);
      }
    };

    const handleEnd = () => {
      setIsListening(false);
      
      // Restart if we're still set to be listening
      // This creates a more continuous listening experience
      if (isListening) {
        try {
          setTimeout(() => {
            recognition.start();
          }, 200);
        } catch (error) {
          console.error('Failed to restart speech recognition:', error);
        }
      }
    };

    const handleError = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onresult = handleResult;
    recognition.onend = handleEnd;
    recognition.onerror = handleError;

    return () => {
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
    };
  }, [recognition, isListening]);

  const startListening = useCallback((language?: Language) => {
    if (!recognition) return;
    
    if (language && language !== currentLanguage) {
      setCurrentLanguage(language);
      recognition.lang = languageCodes[language] || 'en-IN';
    }
    
    setTranscript('');
    setIsListening(true);
    
    try {
      recognition.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
    }
  }, [recognition, currentLanguage]);

  const stopListening = useCallback(() => {
    if (!recognition) return;
    
    setIsListening(false);
    
    try {
      recognition.stop();
    } catch (error) {
      console.error('Failed to stop speech recognition:', error);
    }
  }, [recognition]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  const setLanguage = useCallback((language: Language) => {
    setCurrentLanguage(language);
    if (recognition) {
      recognition.lang = languageCodes[language] || 'en-IN';
    }
  }, [recognition]);

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    hasRecognitionSupport,
    currentLanguage,
    setLanguage
  };
}

// Add TypeScript declarations
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

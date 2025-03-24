// Check if browser supports speech recognition
export const isRecognitionSupported = () => {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
};

// Check if browser supports speech synthesis
export const isSynthesisSupported = () => {
  return 'speechSynthesis' in window;
};

// Get speech recognition instance
export const getSpeechRecognition = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    return new SpeechRecognition();
  }
  return null;
};

// Get available voices
export const getVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    if (!isSynthesisSupported()) {
      resolve([]);
      return;
    }

    // Get voices
    let voices = window.speechSynthesis.getVoices();
    
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    // Chrome initializes voices asynchronously
    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices();
      resolve(voices);
    };
  });
};

// Get preferred voice (English, female if available)
export const getPreferredVoice = async (language = 'en'): Promise<SpeechSynthesisVoice | null> => {
  const voices = await getVoices();
  
  // Try to find a female voice in the specified language
  const femaleVoice = voices.find(
    voice => voice.lang.startsWith(language) && voice.name.includes('Female')
  );
  
  // If no female voice found, try any voice in the specified language
  const anyVoice = voices.find(voice => voice.lang.startsWith(language));
  
  // Fall back to the first voice
  return femaleVoice || anyVoice || voices[0] || null;
};

// Speak text using Web Speech API
export const speakText = async (
  text: string,
  options: {
    volume?: number;
    rate?: number;
    pitch?: number;
    voice?: SpeechSynthesisVoice;
    language?: string;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (e: any) => void;
  } = {}
): Promise<void> => {
  if (!isSynthesisSupported()) {
    console.error('Speech synthesis not supported');
    return;
  }
  
  // Create utterance
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set voice
  const voice = options.voice || await getPreferredVoice(options.language || 'en');
  if (voice) {
    utterance.voice = voice;
  }
  
  // Set other options
  utterance.volume = options.volume !== undefined ? options.volume : 1;
  utterance.rate = options.rate !== undefined ? options.rate : 1;
  utterance.pitch = options.pitch !== undefined ? options.pitch : 1;
  
  // Set event handlers
  if (options.onStart) {
    utterance.onstart = options.onStart;
  }
  
  if (options.onEnd) {
    utterance.onend = options.onEnd;
  }
  
  if (options.onError) {
    utterance.onerror = options.onError;
  }
  
  // Start speaking
  window.speechSynthesis.speak(utterance);
};

// Cancel any ongoing speech
export const cancelSpeech = (): void => {
  if (isSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
};

// Interface declarations for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

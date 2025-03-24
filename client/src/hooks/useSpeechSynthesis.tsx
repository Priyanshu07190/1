import { useState, useEffect, useCallback } from 'react';
import { Language } from '@shared/schema';
import { getPreferredVoice, getVoices } from '@/lib/speechUtils';

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

interface SpeechSynthesisResult {
  speak: (text: string, language?: Language) => void;
  cancel: () => void;
  speaking: boolean;
  supported: boolean;
  pause: () => void;
  resume: () => void;
  paused: boolean;
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
}

export function useSpeechSynthesis(): SpeechSynthesisResult {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [supported, setSupported] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('english');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSupported(true);
      
      // Get the list of voices
      const loadVoices = async () => {
        const voiceList = await getVoices();
        setVoices(voiceList);
      };
      
      loadVoices();
      
      // Chrome initializes voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => loadVoices();
      }
    }
  }, []);

  const speak = useCallback(async (text: string, language?: Language) => {
    if (!supported) return;
    
    const useLanguage = language || currentLanguage;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Get appropriate voice for the language
    const langCode = languageCodes[useLanguage] || 'en-IN';
    const languagePrefix = langCode.split('-')[0]; // Get the first part (e.g., 'hi' from 'hi-IN')
    
    // Find voice matching the language
    const voice = await getPreferredVoice(languagePrefix);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang; // Use the voice's language
    } else {
      // Fallback to default voice
      console.warn(`No voice found for language ${useLanguage}, using default voice`);
    }
    
    // Set options
    utterance.volume = 1;
    utterance.rate = 1;
    utterance.pitch = 1;
    
    // Event handlers
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      setSpeaking(false);
    };
    
    // Start speaking
    window.speechSynthesis.speak(utterance);
  }, [supported, voices, currentLanguage]);

  const cancel = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  const pause = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.pause();
    setPaused(true);
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.resume();
    setPaused(false);
  }, [supported]);

  const setLanguage = useCallback((language: Language) => {
    setCurrentLanguage(language);
  }, []);

  return {
    speak,
    cancel,
    speaking,
    supported,
    pause,
    resume,
    paused,
    currentLanguage,
    setLanguage
  };
}

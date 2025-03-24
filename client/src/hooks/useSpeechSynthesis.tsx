import { useState, useEffect, useCallback } from 'react';

interface SpeechSynthesisResult {
  speak: (text: string) => void;
  cancel: () => void;
  speaking: boolean;
  supported: boolean;
  pause: () => void;
  resume: () => void;
  paused: boolean;
}

export function useSpeechSynthesis(): SpeechSynthesisResult {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSupported(true);
      
      // Get the list of voices
      const getVoices = () => {
        const voiceList = window.speechSynthesis.getVoices();
        setVoices(voiceList);
      };
      
      getVoices();
      
      // Chrome initializes voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = getVoices;
      }
    }
  }, []);

  const speak = useCallback((text: string, options: any = {}) => {
    if (!supported) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set default voice (preferring a female English voice if available)
    if (voices.length > 0) {
      const femaleVoice = voices.find(
        voice => voice.lang.includes('en') && voice.name.includes('Female')
      );
      utterance.voice = femaleVoice || voices[0];
    }
    
    // Set other options
    utterance.volume = options.volume || 1;
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    
    // Event handlers
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      setSpeaking(false);
    };
    
    // Start speaking
    window.speechSynthesis.speak(utterance);
  }, [supported, voices]);

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

  return {
    speak,
    cancel,
    speaking,
    supported,
    pause,
    resume,
    paused
  };
}

// Web Speech API wrapper for JARVIS Voice Recognition and Speech Synthesis

// Speech Synthesis (Jarvis Voice)
let activeUtterance: SpeechSynthesisUtterance | null = null;

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    activeUtterance = null;
  }
}

export type VoiceChangerMode = 'normal' | 'deep' | 'robot' | 'female' | 'funny';

export function speakJarvis(
  text: string,
  options?: {
    lang?: 'hi-IN' | 'en-IN' | 'en-US';
    rate?: number;
    pitch?: number;
    voiceChanger?: VoiceChangerMode;
    onStart?: () => void;
    onEnd?: () => void;
  }
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options?.onEnd?.();
    return;
  }

  stopSpeaking();

  // Strip code blocks or bracket tags from voice output
  const cleanText = text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[*_#`[\]()]/g, '')
    .trim();

  if (!cleanText) {
    options?.onEnd?.();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleanText);
  activeUtterance = utterance;

  const targetLang = options?.lang || 'hi-IN';
  utterance.lang = targetLang;

  // Voice Changer Presets tuning (rate, pitch, timber)
  let calculatedRate = options?.rate ?? 1.0;
  let calculatedPitch = options?.pitch ?? 0.96;

  const voiceChanger = options?.voiceChanger || 'normal';
  if (voiceChanger === 'deep') {
    calculatedPitch = 0.55; // deep bass acoustic
    calculatedRate = 0.92;
  } else if (voiceChanger === 'robot') {
    calculatedPitch = 0.8;
    calculatedRate = 1.05;
  } else if (voiceChanger === 'female') {
    calculatedPitch = 1.35; // higher pitch feminine tone
    calculatedRate = 1.02;
  } else if (voiceChanger === 'funny') {
    calculatedPitch = 1.8; // quirky cartoonish pitch
    calculatedRate = 1.25;
  }

  utterance.rate = calculatedRate;
  utterance.pitch = calculatedPitch;

  // Try to pick the best voice available
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find((v) => {
    if (targetLang === 'hi-IN') {
      return (
        v.lang.toLowerCase().includes('hi') ||
        v.name.toLowerCase().includes('hindi') ||
        v.name.toLowerCase().includes('india')
      );
    }
    return (
      v.lang.toLowerCase().includes('en-in') ||
      v.name.toLowerCase().includes('india') ||
      v.name.toLowerCase().includes('uk') ||
      v.name.toLowerCase().includes('george') ||
      v.name.toLowerCase().includes('daniel')
    );
  });

  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onstart = () => {
    options?.onStart?.();
  };

  utterance.onend = () => {
    activeUtterance = null;
    options?.onEnd?.();
  };

  utterance.onerror = (e) => {
    console.warn('Speech synthesis error:', e);
    activeUtterance = null;
    options?.onEnd?.();
  };

  // Chrome on Android bug workaround: resume if suspended
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  window.speechSynthesis.speak(utterance);
}

// Speech Recognition (Web Speech API)
export interface SpeechRecognitionHandlers {
  onStart?: () => void;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export class JarvisSpeechRecognizer {
  private recognition: any = null;
  private isListening: boolean = false;
  private lang: string = 'hi-IN';
  private handlers: SpeechRecognitionHandlers = {};
  public isSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.isSupported = true;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
        this.setupListeners();
      }
    }
  }

  private setupListeners() {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.handlers.onStart?.();
    };

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (final.trim()) {
        this.handlers.onResult?.(final.trim(), true);
      } else if (interim.trim()) {
        this.handlers.onResult?.(interim.trim(), false);
      }
    };

    this.recognition.onerror = (event: any) => {
      // Don't treat simple silence / no-speech as fatal
      if (event.error === 'no-speech') return;
      console.warn('Speech recognition event:', event.error);
      this.handlers.onError?.(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.handlers.onEnd?.();
    };
  }

  public setLanguage(lang: 'hi-IN' | 'en-IN' | 'en-US') {
    this.lang = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  public start(handlers: SpeechRecognitionHandlers) {
    if (!this.recognition) {
      handlers.onError?.('Speech recognition not supported in this browser.');
      return;
    }

    this.handlers = handlers;
    this.recognition.lang = this.lang;

    try {
      this.recognition.start();
    } catch {
      // Already running
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
      this.isListening = false;
    }
  }

  public getListening(): boolean {
    return this.isListening;
  }
}

export const speechRecognizer = new JarvisSpeechRecognizer();

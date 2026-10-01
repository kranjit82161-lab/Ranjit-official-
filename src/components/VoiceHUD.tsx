import React, { useState } from 'react';
import { Mic, MicOff, Send, Volume2, Sparkles, Command } from 'lucide-react';
import { JarvisStatus } from '../types/jarvis.ts';

interface VoiceHUDProps {
  status: JarvisStatus;
  transcript: string;
  isListening: boolean;
  onToggleListening: () => void;
  onSubmitCommand: (command: string) => void;
  currentResponseText?: string;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
}

export const VoiceHUD: React.FC<VoiceHUDProps> = ({
  status,
  transcript,
  isListening,
  onToggleListening,
  onSubmitCommand,
  currentResponseText,
  isSpeaking,
  onStopSpeaking,
}) => {
  const [inputText, setInputText] = useState('');

  const quickCommands = [
    { label: '🎬 AI Talking Video Editor', query: 'Jarvis, AI Talking Video Editor खोलो और लाइव वीडियो एडिट करो' },
    { label: '🌐 Google पर नया ID बनाना है', query: 'Jarvis, Google पर नया ID बनाना है' },
    { label: '💬 WhatsApp Message Bhejo', query: 'Papa ko WhatsApp message bhejo: Hello kaise ho?' },
    { label: '🛡️ Google 2-Step Security', query: 'Google Security और 2-Step Verification कैसे करें' },
    { label: '⚡ Daily Video Automation', query: 'Jarvis, aaj ka daily video banao aur YouTube par post karo' },
    { label: '🔴 Start Active Mode', query: 'Start' },
    { label: '⏹️ Stop Active Mode', query: 'Stop' },
    { label: '👑 PhonePe Checkout (₹500)', query: 'Jarvis, JARVIS plans aur pricing dikhao' },
    { label: '🌸 Khushi Instagram ID', query: 'Jarvis, मेरे लिए Khushi नाम से Instagram ID बनाओ' },
    { label: '🔴 YouTube Upload', query: 'Jarvis, YouTube खोलो और यह वीडियो upload करो' },
    { label: '📞 Papa ko Call karo', query: 'Papa ko call karo' },
    { label: '🔦 Torch ON karo', query: 'Flashlight turn on karo' },
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSubmitCommand(inputText.trim());
    setInputText('');
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Speech / Live transcript bubble */}
      {(transcript || isListening) && (
        <div className="w-full bg-slate-900/90 border border-cyan-500/40 rounded-xl p-3 sm:p-4 backdrop-blur-md glow-cyan transition-all">
          <div className="flex items-center justify-between text-xs text-cyan-400 font-mono-tech mb-1.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              VOICE INPUT DETECTED
            </span>
            <span className="text-[10px] opacity-75">LIVE STREAM</span>
          </div>
          <p className="text-sm sm:text-base font-medium text-white italic">
            "{transcript || 'Listening to your command...'}"
          </p>

          {/* Sound wave visualizer bars */}
          {isListening && (
            <div className="flex items-center justify-center gap-1 mt-2.5 h-6">
              {[40, 75, 90, 60, 100, 45, 80, 50, 95, 30, 70, 85].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-cyan-400 rounded-full animate-pulse"
                  style={{
                    height: `${h}%`,
                    animationDuration: `${0.4 + (i % 5) * 0.15}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Jarvis Voice Speech Response Banner with Mascot Avatar */}
      {currentResponseText && (
        <div className="w-full bg-cyan-950/80 border border-cyan-400/50 rounded-xl p-3.5 sm:p-4 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between text-xs text-cyan-300 font-mono-tech mb-1.5">
            <span className="flex items-center gap-2 font-bold tracking-wider">
              <img
                src="/jarvis-mascot.jpg"
                alt="Jarvis"
                className="w-5 h-5 rounded-full border border-cyan-400 object-cover shadow-sm"
              />
              <span>Jarvis • Your Smart AI Assistant</span>
            </span>
            {isSpeaking && (
              <button
                onClick={onStopSpeaking}
                className="text-[10px] text-cyan-300 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-900/60 border border-cyan-500/30"
              >
                <Volume2 className="w-3 h-3 text-cyan-400 animate-bounce" />
                Mute Speech
              </button>
            )}
          </div>
          <p className="text-sm sm:text-base text-cyan-50 leading-relaxed font-sans">
            {currentResponseText}
          </p>
        </div>
      )}

      {/* Command Input Bar (Mic + Text) */}
      <form onSubmit={handleFormSubmit} className="relative flex items-center gap-2">
        {/* Main Microphone Button */}
        <button
          type="button"
          onClick={onToggleListening}
          className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-pulse'
              : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]'
          }`}
          title={isListening ? 'Stop listening' : 'Start voice command'}
          aria-label={isListening ? 'Stop listening' : 'Start voice command'}
        >
          {isListening ? (
            <MicOff className="w-6 h-6 animate-pulse" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </button>

        {/* Text Input Box */}
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or speak: 'Papa ko call karo'..."
            className="w-full h-12 pl-4 pr-12 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-white text-sm placeholder-cyan-500/50 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all font-sans"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-cyan-600/40 hover:bg-cyan-500 text-cyan-200 hover:text-white disabled:opacity-30 disabled:hover:bg-cyan-600/40 flex items-center justify-center transition-all"
            aria-label="Send command"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Quick Voice Chips */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-[11px] font-mono-tech text-cyan-400/80 uppercase tracking-wider">
          <Command className="w-3 h-3" />
          Quick Voice Directives:
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {quickCommands.map((cmd, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSubmitCommand(cmd.query)}
              className="flex-shrink-0 text-xs px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-cyan-950 border border-cyan-500/30 hover:border-cyan-400 text-cyan-200 hover:text-white transition-all whitespace-nowrap active:scale-95"
            >
              {cmd.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Volume2, Mic, Activity, Sparkles } from 'lucide-react';

interface TalkingAvatarProps {
  isSpeaking: boolean;
  isListening: boolean;
  currentTaskName: string;
  voiceChanger: 'normal' | 'deep' | 'robot' | 'female' | 'funny';
  speechVoiceLanguage: 'hi-IN' | 'en-IN' | 'en-US';
  onTapAvatar?: () => void;
}

export const TalkingAvatar: React.FC<TalkingAvatarProps> = ({
  isSpeaking,
  isListening,
  currentTaskName,
  voiceChanger,
  speechVoiceLanguage,
  onTapAvatar,
}) => {
  return (
    <div
      onClick={onTapAvatar}
      className="relative rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-cyan-500/50 p-4 flex flex-col items-center justify-between shadow-[0_0_30px_rgba(6,182,212,0.25)] select-none cursor-pointer group"
    >
      {/* Top Header Badge */}
      <div className="w-full flex items-center justify-between text-[10px] font-mono-tech mb-2">
        <div className="flex items-center gap-1.5 text-cyan-300">
          <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-cyan-400 animate-ping' : isListening ? 'bg-red-400 animate-ping' : 'bg-emerald-400'}`} />
          <span className="font-bold tracking-wider">JARVIS TALKING AI</span>
        </div>
        <span className="px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-400 uppercase">
          {voiceChanger} VOICE
        </span>
      </div>

      {/* Center 3D Mascot Talking Avatar */}
      <div className="relative my-2 flex items-center justify-center">
        {/* Animated Soundwave Ripple Rings when Speaking */}
        {isSpeaking && (
          <>
            <div className="absolute -inset-4 rounded-full border border-cyan-400/50 animate-ping pointer-events-none" />
            <div className="absolute -inset-8 rounded-full border border-cyan-500/20 animate-pulse pointer-events-none" />
          </>
        )}

        {/* Listening Red Pulse Ring */}
        {isListening && !isSpeaking && (
          <div className="absolute -inset-3 rounded-full border-2 border-red-500/60 animate-ping pointer-events-none" />
        )}

        {/* Mascot Avatar Container */}
        <div
          className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-500 shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-transform duration-300 ${
            isSpeaking ? 'scale-105' : isListening ? 'scale-95' : 'group-hover:scale-105'
          }`}
        >
          <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 border-2 border-cyan-300 relative">
            <img
              src="/jarvis-mascot.jpg"
              alt="Jarvis Talking Avatar"
              className={`w-full h-full object-cover transition-transform duration-300 ${
                isSpeaking ? 'animate-bounce-subtle' : ''
              }`}
            />
            {/* Hologram blue tint overlay */}
            <div
              className={`absolute inset-0 transition-opacity ${
                isSpeaking
                  ? 'bg-cyan-400/20'
                  : isListening
                  ? 'bg-red-500/20'
                  : 'bg-cyan-500/10'
              }`}
            />
          </div>

          {/* Animated Mouth Audio Visualizer when speaking */}
          {isSpeaking && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-950/90 border border-cyan-400/80 flex items-center gap-1 shadow-lg">
              {[4, 10, 16, 8, 14, 6].map((h, i) => (
                <span
                  key={i}
                  className="w-1 bg-cyan-400 rounded-full animate-pulse"
                  style={{
                    height: `${h}px`,
                    animationDuration: `${0.2 + (i % 3) * 0.1}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Real-time Status & Live Task Indicator */}
      <div className="w-full mt-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center flex flex-col gap-1">
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono-tech">
          {isSpeaking ? (
            <span className="text-cyan-300 font-bold flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              Jarvis bol raha hai...
            </span>
          ) : isListening ? (
            <span className="text-red-400 font-bold flex items-center gap-1">
              <Mic className="w-3.5 h-3.5 animate-pulse text-red-400" />
              Aapki aawaz sun raha hu...
            </span>
          ) : (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Live Conversation Ready
            </span>
          )}
        </div>

        {/* “क्या कर रहे हो?” answer prompt banner */}
        <div className="text-[10px] text-slate-300 font-sans border-t border-slate-800/80 pt-1 mt-0.5 truncate">
          <span className="text-amber-400 font-mono-tech">Action: </span>
          <span>{currentTaskName || 'Editing pipeline ready'}</span>
        </div>
      </div>

      <div className="text-[9px] text-slate-400 font-mono-tech text-center mt-2">
        Auto Language Detect (Hindi / Bhojpuri / English)
      </div>
    </div>
  );
};

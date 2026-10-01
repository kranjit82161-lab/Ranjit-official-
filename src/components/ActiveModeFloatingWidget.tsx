import React from 'react';
import { Mic, Square, Activity, Radio, Volume2 } from 'lucide-react';
import { JarvisStatus } from '../types/jarvis.ts';

interface ActiveModeFloatingWidgetProps {
  isActiveMode: boolean;
  status: JarvisStatus;
  isListening: boolean;
  isSpeaking: boolean;
  transcript?: string;
  onStopActiveMode: () => void;
  onToggleListening: () => void;
}

export const ActiveModeFloatingWidget: React.FC<ActiveModeFloatingWidgetProps> = ({
  isActiveMode,
  status,
  isListening,
  isSpeaking,
  transcript,
  onStopActiveMode,
  onToggleListening,
}) => {
  if (!isActiveMode) return null;

  return (
    <div className="fixed top-3 right-3 sm:top-4 sm:right-6 z-50 flex items-center gap-2 animate-bounce-subtle">
      {/* Android Screen-recording style pill */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/90 border border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.4)] backdrop-blur-md">
        {/* Pulsing Red Dot (Recording style) */}
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
        </span>

        {/* Status text */}
        <div className="flex items-center gap-1.5 font-mono-tech text-xs">
          <span className="font-bold text-red-400">Jarvis Active</span>
          <span className="text-[10px] text-slate-400 hidden sm:inline">•</span>
          <span className="text-[10px] text-slate-300 hidden sm:inline">
            {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Ready'}
          </span>
        </div>

        {/* Live small transcript hint if active */}
        {isListening && transcript && (
          <span className="text-[10px] text-amber-300 font-mono truncate max-w-[120px] hidden md:inline">
            "{transcript}"
          </span>
        )}

        {/* Quick Stop Button */}
        <button
          onClick={onStopActiveMode}
          title="Stop Jarvis Active Mode ('Jarvis band karo')"
          className="ml-1 px-2 py-0.5 rounded-full bg-red-600/90 hover:bg-red-500 text-white font-mono-tech text-[10px] font-bold flex items-center gap-1 active:scale-90 transition-all shadow-sm"
        >
          <Square className="w-2.5 h-2.5 fill-white" />
          <span>STOP</span>
        </button>
      </div>
    </div>
  );
};

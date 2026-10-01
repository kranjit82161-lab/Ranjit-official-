import React from 'react';
import { JarvisStatus } from '../types/jarvis.ts';

interface ArcReactorProps {
  status: JarvisStatus;
  onClick: () => void;
  isListening: boolean;
}

export const ArcReactor: React.FC<ArcReactorProps> = ({
  status,
  onClick,
  isListening,
}) => {
  // Determine color themes based on status
  let ringColor = '#06b6d4'; // Cyan default
  let coreColor = '#38bdf8';
  let glowClass = 'glow-arc';
  let statusText = 'JARVIS ONLINE';

  if (status === 'listening' || isListening) {
    ringColor = '#38bdf8';
    coreColor = '#67e8f9';
    glowClass = 'glow-blue';
    statusText = 'LISTENING...';
  } else if (status === 'thinking') {
    ringColor = '#a855f7';
    coreColor = '#c084fc';
    glowClass = 'glow-blue';
    statusText = 'PROCESSING...';
  } else if (status === 'speaking') {
    ringColor = '#06b6d4';
    coreColor = '#a5f3fc';
    glowClass = 'glow-arc';
    statusText = 'SPEAKING';
  } else if (status === 'executing') {
    ringColor = '#10b981';
    coreColor = '#34d399';
    glowClass = 'glow-cyan';
    statusText = 'EXECUTING ACTION';
  } else if (status === 'alarm') {
    ringColor = '#ef4444';
    coreColor = '#f87171';
    glowClass = 'glow-red';
    statusText = 'ALERT ACTIVE';
  }

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-2">
      {/* Outer Hologram Halo */}
      <div
        onClick={onClick}
        className={`relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full cursor-pointer transition-all duration-500 flex items-center justify-center ${glowClass}`}
        role="button"
        tabIndex={0}
        aria-label="Tap to speak with Jarvis"
      >
        {/* Rotating Outer Reticle Rings */}
        <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-spin-slow pointer-events-none" />
        <div className="absolute inset-2 sm:inset-3 rounded-full border border-dashed border-cyan-400/40 animate-spin-reverse pointer-events-none" />

        {/* Outer tick marks */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none animate-spin-slow"
          viewBox="0 0 200 200"
        >
          <circle
            cx="100"
            cy="100"
            r="92"
            fill="none"
            stroke={ringColor}
            strokeWidth="1.5"
            strokeDasharray="4 8"
            opacity="0.6"
          />
          <circle
            cx="100"
            cy="100"
            r="82"
            fill="none"
            stroke={ringColor}
            strokeWidth="2"
            strokeDasharray="16 24"
            opacity="0.8"
          />
        </svg>

        {/* Segmented Housing */}
        <div className="absolute inset-5 sm:inset-6 rounded-full bg-slate-950/80 border-2 border-cyan-500/50 backdrop-blur-md flex items-center justify-center shadow-inner">
          {/* Inner Gear Ring */}
          <div
            className={`absolute inset-3 sm:inset-4 rounded-full border-2 border-dashed border-cyan-300/30 ${
              isListening ? 'animate-spin' : 'animate-spin-slow'
            }`}
          />

          {/* Glowing Center Arc Reactor with Jarvis Robot Avatar */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-cyan-950 via-slate-900 to-cyan-900 flex items-center justify-center border-2 border-cyan-400/80 shadow-[0_0_30px_rgba(6,182,212,0.8)] overflow-hidden">
            {/* Glowing Core Mascot */}
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-transform duration-300 relative ${
                isListening
                  ? 'scale-110 shadow-[0_0_40px_#38bdf8]'
                  : 'shadow-[0_0_25px_#06b6d4]'
              }`}
            >
              <img
                src="/jarvis-mascot.jpg"
                alt="Jarvis Core"
                className="w-full h-full object-cover rounded-full border border-cyan-300/80"
              />
              {/* Pulsing Visor Overlay */}
              <div
                className={`absolute inset-0 rounded-full transition-opacity ${
                  isListening ? 'bg-cyan-400/20' : 'bg-transparent'
                }`}
              />
            </div>

            {/* Glowing Ring Border Overlay */}
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400/40 pointer-events-none" />
          </div>
        </div>

        {/* Pulse Ripple Waves when listening or speaking */}
        {(isListening || status === 'speaking') && (
          <>
            <div className="absolute -inset-3 rounded-full border border-cyan-400/40 animate-ping pointer-events-none" />
            <div className="absolute -inset-6 rounded-full border border-cyan-500/20 animate-pulse pointer-events-none" />
          </>
        )}
      </div>

      {/* Status Label & Click Guide */}
      <div className="mt-3 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs tracking-widest font-mono-tech text-cyan-300">
          <span
            className="w-2 h-2 rounded-full animate-ping"
            style={{ backgroundColor: coreColor }}
          />
          <span className="font-bold">{statusText}</span>
        </div>
        <p className="text-[11px] text-cyan-400/70 font-mono-tech mt-1 tracking-wider uppercase">
          {isListening
            ? 'Jarvis is listening... Speak now'
            : 'Tap Core or Mic to speak in Hindi / English'}
        </p>
      </div>
    </div>
  );
};

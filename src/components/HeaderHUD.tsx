import React, { useEffect, useState } from 'react';
import {
  Shield,
  Clock,
  Battery,
  BatteryCharging,
  Wifi,
  Volume2,
  VolumeX,
  HelpCircle,
  Download,
  Flame,
  Globe,
  MessageSquare,
} from 'lucide-react';
import { DeviceState } from '../types/jarvis.ts';

interface HeaderHUDProps {
  deviceState: DeviceState;
  onToggleSound: () => void;
  onOpenBridgeGuide: () => void;
  onInstallPwa: () => void;
  canInstallPwa: boolean;
  youtubeConnected?: boolean;
  onOpenYouTube?: () => void;
  dailyActive?: boolean;
  onOpenAutomation?: () => void;
  onOpenVideoEditor?: () => void;
  onOpenInstagram?: () => void;
  onOpenPlans?: () => void;
  onOpenGoogleGuide?: () => void;
  onOpenMessages?: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  deviceState,
  onToggleSound,
  onOpenBridgeGuide,
  onInstallPwa,
  canInstallPwa,
  youtubeConnected,
  onOpenYouTube,
  dailyActive,
  onOpenAutomation,
  onOpenVideoEditor,
  onOpenInstagram,
  onOpenPlans,
  onOpenGoogleGuide,
  onOpenMessages,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full border-b border-cyan-500/30 bg-slate-950/80 backdrop-blur-md px-3 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Stark Status */}
      <div className="flex items-center gap-2.5">
        <div className="relative w-8 h-8 rounded-lg bg-slate-900 border border-cyan-400/80 p-0.5 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.6)] overflow-hidden">
          <img
            src="/jarvis-mascot.jpg"
            alt="Jarvis"
            className="w-full h-full object-cover rounded-md"
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-orbitron font-extrabold text-sm sm:text-base tracking-wider text-white">
              Jarvis
            </h1>
            <span className="hidden xs:inline-block text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono-tech uppercase">
              AI ASSISTANT
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 font-mono-tech">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="tracking-wide">AI CORE ONLINE • सोचो मत... बस पूछो!</span>
          </div>
        </div>
      </div>

      {/* Clock & Telemetry */}
      <div className="hidden md:flex items-center gap-4 text-xs font-mono-tech text-cyan-300">
        <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-cyan-500/20">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{timeStr || 'SYSTEM TIME'}</span>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-cyan-500/20">
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span>NET: ACTIVE</span>
        </div>
      </div>

      {/* Actions & Toggles */}
      <div className="flex items-center gap-2">
        {/* Plans & Pricing Quick Button */}
        {onOpenPlans && (
          <button
            onClick={onOpenPlans}
            className="px-2.5 py-1 rounded-lg text-xs font-mono-tech flex items-center gap-1.5 transition-all shadow-sm active:scale-95 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/60 text-amber-300 hover:border-amber-400"
            title="JARVIS Subscription Plans & Pricing"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-bold">Plans</span>
          </button>
        )}

        {/* Google Guide Quick Switch - Cybersecurity / SEC-OPS theme */}
        {onOpenGoogleGuide && (
          <button
            onClick={onOpenGoogleGuide}
            className="px-2.5 py-1 rounded-lg text-xs font-mono-tech flex items-center gap-1.5 transition-all shadow-sm active:scale-95 bg-black/90 border border-green-500/60 text-green-300 hover:bg-green-950/80 hover:border-green-400"
            title="SEC-OPS: Google Protocol & Screen Guide"
          >
            <Globe className="w-3.5 h-3.5 text-green-400" />
            <span className="font-bold">SEC-OPS Guide</span>
          </button>
        )}

        {/* Message Support Quick Switch */}
        {onOpenMessages && (
          <button
            onClick={onOpenMessages}
            className="px-2.5 py-1 rounded-lg text-xs font-mono-tech flex items-center gap-1.5 transition-all shadow-sm active:scale-95 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/80"
            title="AI Message & Dispatch Support"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold">Messages</span>
          </button>
        )}

        {/* Instagram Setup Quick Switch */}
        {onOpenInstagram && (
          <button
            onClick={onOpenInstagram}
            className="px-2.5 py-1 rounded-lg text-xs font-mono-tech flex items-center gap-1.5 transition-all shadow-sm active:scale-95 bg-pink-950/80 border border-pink-500/50 text-pink-300 hover:bg-pink-900/80"
            title="Instagram Setup Assistant"
          >
            <span className="w-2 h-2 rounded-full bg-pink-400" />
            <span className="font-bold">Instagram</span>
          </button>
        )}

        {/* Video Editor / CapCut Quick Switch */}
        {onOpenVideoEditor && (
          <button
            onClick={onOpenVideoEditor}
            className="px-2.5 py-1 rounded-lg text-xs font-mono-tech flex items-center gap-1.5 transition-all shadow-sm active:scale-95 bg-purple-950/80 border border-purple-500/50 text-purple-300 hover:bg-purple-900/80"
            title="CapCut & Video Editing Assistant"
          >
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="font-bold">CapCut</span>
          </button>
        )}

        {/* Daily Automation Quick Switch */}
        {onOpenAutomation && (
          <button
            onClick={onOpenAutomation}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono-tech flex items-center gap-1.5 transition-all shadow-sm active:scale-95 ${
              dailyActive
                ? 'bg-amber-950/80 border border-amber-500/50 text-amber-300 hover:bg-amber-900/80'
                : 'bg-slate-900 border border-slate-700 text-slate-300 hover:border-amber-500/50 hover:text-amber-300'
            }`}
            title="Daily AI Video Automation"
          >
            <span className={`w-2 h-2 rounded-full ${dailyActive ? 'bg-amber-400 animate-ping' : 'bg-slate-500'}`} />
            <span className="font-bold">Daily 6PM</span>
          </button>
        )}

        {/* YouTube Assistant Quick Switch */}
        {onOpenYouTube && (
          <button
            onClick={onOpenYouTube}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono-tech flex items-center gap-1.5 transition-all shadow-sm active:scale-95 ${
              youtubeConnected
                ? 'bg-red-950/80 border border-red-500/50 text-red-300 hover:bg-red-900/80'
                : 'bg-slate-900 border border-slate-700 text-slate-300 hover:border-red-500/50 hover:text-red-300'
            }`}
            title="YouTube Upload Assistant"
          >
            <span className={`w-2 h-2 rounded-full ${youtubeConnected ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`} />
            <span className="font-bold">YT Upload</span>
          </button>
        )}

        {/* PWA Install */}
        {canInstallPwa && (
          <button
            onClick={onInstallPwa}
            className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold font-mono-tech flex items-center gap-1 shadow-md transition-all active:scale-95"
            title="Install as Android App"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Install App</span>
          </button>
        )}

        {/* Full Android Guide */}
        <button
          onClick={onOpenBridgeGuide}
          className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-mono-tech flex items-center gap-1 transition-all"
          title="Android Automation Guide"
        >
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">Phone Setup</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          className="p-1.5 sm:p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 hover:text-white transition-all"
          title={deviceState.soundEffects ? 'Mute Sounds' : 'Unmute Sounds'}
        >
          {deviceState.soundEffects ? (
            <Volume2 className="w-4 h-4 text-cyan-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-500" />
          )}
        </button>
      </div>
    </header>
  );
};

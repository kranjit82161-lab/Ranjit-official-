import React, { useEffect, useState } from 'react';
import { Phone, MessageSquare, ExternalLink, Bell, Smartphone, X, Check, Zap, Scissors, Instagram, Crown, Globe } from 'lucide-react';
import { JarvisAction } from '../types/jarvis.ts';

interface ActionCardProps {
  action: JarvisAction;
  onExecuteNow: (action: JarvisAction) => void;
  onCancel: () => void;
  autoExecuteCountdownSeconds?: number;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  action,
  onExecuteNow,
  onCancel,
  autoExecuteCountdownSeconds = 3,
}) => {
  const [countdown, setCountdown] = useState<number>(autoExecuteCountdownSeconds);
  const [isCancelled, setIsCancelled] = useState(false);

  useEffect(() => {
    if (isCancelled) return;
    if (countdown <= 0) {
      onExecuteNow(action);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, isCancelled, action, onExecuteNow]);

  const handleAbort = () => {
    setIsCancelled(true);
    onCancel();
  };

  const getActionDetails = () => {
    switch (action.type) {
      case 'CALL':
        return {
          title: 'Direct Phone Call',
          subtitle: `Calling ${action.payload?.contactName || 'Contact'} (${action.payload?.phoneNumber || ''})`,
          icon: <Phone className="w-6 h-6 text-green-400 animate-pulse" />,
          color: 'border-green-500/50 bg-green-950/40 text-green-300',
          btnText: 'Call Immediately',
          btnClass: 'bg-green-600 hover:bg-green-500 text-white',
        };
      case 'WHATSAPP':
        return {
          title: 'WhatsApp Dispatch',
          subtitle: `Message to ${action.payload?.contactName || 'Recipient'}: "${action.payload?.message || ''}"`,
          icon: <MessageSquare className="w-6 h-6 text-emerald-400" />,
          color: 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300',
          btnText: 'Open WhatsApp',
          btnClass: 'bg-emerald-600 hover:bg-emerald-500 text-white',
        };
      case 'SMS':
        return {
          title: 'SMS Message',
          subtitle: `Send to ${action.payload?.phoneNumber || 'Number'}: "${action.payload?.message || ''}"`,
          icon: <MessageSquare className="w-6 h-6 text-cyan-400" />,
          color: 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300',
          btnText: 'Send SMS',
          btnClass: 'bg-cyan-600 hover:bg-cyan-500 text-white',
        };
      case 'OPEN_APP':
        return {
          title: `Launch App: ${action.payload?.appName || 'App'}`,
          subtitle: `Executing Android intent for ${action.payload?.appName}`,
          icon: <ExternalLink className="w-6 h-6 text-blue-400" />,
          color: 'border-blue-500/50 bg-blue-950/40 text-blue-300',
          btnText: 'Launch Now',
          btnClass: 'bg-blue-600 hover:bg-blue-500 text-white',
        };
      case 'ADD_REMINDER':
        return {
          title: 'Schedule Alert / Reminder',
          subtitle: `"${action.payload?.title}" at ${action.payload?.time || 'today'}`,
          icon: <Bell className="w-6 h-6 text-amber-400" />,
          color: 'border-amber-500/50 bg-amber-950/40 text-amber-300',
          btnText: 'Confirm Reminder',
          btnClass: 'bg-amber-600 hover:bg-amber-500 text-white',
        };
      case 'YOUTUBE_UPLOAD':
        return {
          title: 'YouTube Video Upload',
          subtitle: 'Opening Android video picker & generating Title/Description...',
          icon: <ExternalLink className="w-6 h-6 text-red-400 animate-pulse" />,
          color: 'border-red-500/50 bg-red-950/40 text-red-300',
          btnText: 'Open Upload Assistant',
          btnClass: 'bg-red-600 hover:bg-red-500 text-white',
        };
      case 'DAILY_AUTOMATION':
        return {
          title: 'Daily AI Video Automation',
          subtitle: 'Synthesizing topic, 9:16 Shorts video & YouTube OAuth upload...',
          icon: <Zap className="w-6 h-6 text-amber-400 animate-bounce" />,
          color: 'border-amber-500/50 bg-amber-950/40 text-amber-300',
          btnText: 'Execute Daily Post',
          btnClass: 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white',
        };
      case 'VIDEO_EDIT':
        return {
          title: 'Video Editing & CapCut Control',
          subtitle: `Configuring ${action.payload?.app === 'capcut' ? 'CapCut' : 'Video Editor'} with 9:16 format, captions & audio trim...`,
          icon: <Scissors className="w-6 h-6 text-purple-400 animate-pulse" />,
          color: 'border-purple-500/50 bg-purple-950/40 text-purple-300',
          btnText: 'Open Video Editor',
          btnClass: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white',
        };
      case 'INSTAGRAM_SETUP':
        return {
          title: 'Instagram ID Setup Assistant',
          subtitle: `Preparing Instagram profile setup for "${action.payload?.targetName || 'Khushi'}" with username suggestions...`,
          icon: <Instagram className="w-6 h-6 text-pink-400 animate-pulse" />,
          color: 'border-pink-500/50 bg-pink-950/40 text-pink-300',
          btnText: 'Open Instagram Setup',
          btnClass: 'bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:from-pink-500 hover:to-amber-500 text-white',
        };
      case 'VIEW_PLANS':
        return {
          title: 'JARVIS Subscription Plans',
          subtitle: 'FREE (₹0), PRO (₹360/mo) & CREATOR (₹500/mo) Plans ready...',
          icon: <Crown className="w-6 h-6 text-amber-400 animate-bounce" />,
          color: 'border-amber-500/50 bg-amber-950/40 text-amber-300',
          btnText: 'View Pricing & Plans',
          btnClass: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold',
        };
      case 'DEVICE_CONTROL':
        return {
          title: 'Device Setting Control',
          subtitle: `Command: ${action.payload?.command}`,
          icon: <Smartphone className="w-6 h-6 text-cyan-400" />,
          color: 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300',
          btnText: 'Apply Control',
          btnClass: 'bg-cyan-600 hover:bg-cyan-500 text-white',
        };
      case 'GOOGLE_GUIDE':
        return {
          title: 'SEC-OPS: Google Protocol Guide',
          subtitle: 'Google ID Creation & 2-Step Security Hardening screen navigation...',
          icon: <Globe className="w-6 h-6 text-green-400 animate-pulse" />,
          color: 'border-green-500/60 bg-black/90 text-green-300 shadow-[0_0_20px_rgba(34,197,94,0.3)]',
          btnText: 'Launch Terminal Guide',
          btnClass: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-black font-bold',
        };
      default:
        return {
          title: 'Jarvis System Action',
          subtitle: 'Executing directive...',
          icon: <Zap className="w-6 h-6 text-cyan-400" />,
          color: 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300',
          btnText: 'Execute',
          btnClass: 'bg-cyan-600 hover:bg-cyan-500 text-white',
        };
    }
  };

  const details = getActionDetails();

  return (
    <div
      className={`w-full rounded-2xl border p-4 backdrop-blur-md transition-all shadow-2xl ${details.color}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-current shadow-md">
            {details.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-orbitron font-bold text-sm sm:text-base text-white">
                {details.title}
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900/80 font-mono-tech border border-current">
                JARVIS DIRECTIVE
              </span>
            </div>
            <p className="text-xs sm:text-sm mt-1 text-slate-200 line-clamp-2">
              {details.subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={handleAbort}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          title="Abort action"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Progress & Countdown bar */}
      <div className="mt-3.5 pt-3 border-t border-current/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-mono-tech">
          <span className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center font-bold text-cyan-300">
            {countdown}
          </span>
          <span className="text-slate-300">
            Auto-executing on phone in {countdown}s...
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAbort}
            className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition-all font-mono-tech flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onExecuteNow(action)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-all font-mono-tech flex items-center gap-1.5 active:scale-95 ${details.btnClass}`}
          >
            <Check className="w-3.5 h-3.5" />
            {details.btnText}
          </button>
        </div>
      </div>
    </div>
  );
};

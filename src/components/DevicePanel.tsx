import React from 'react';
import {
  Smartphone,
  Flashlight,
  Volume2,
  VolumeX,
  Battery,
  BatteryCharging,
  Eye,
  Wifi,
  Radio,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { DeviceState } from '../types/jarvis.ts';

interface DevicePanelProps {
  deviceState: DeviceState;
  onToggleTorch: () => void;
  onTestVibration: () => void;
  onToggleWakeLock: () => void;
  onToggleAudioEffects: () => void;
  onChangeLanguage: (lang: 'hi-IN' | 'en-IN' | 'en-US') => void;
  onOpenApp: (appKey: string) => void;
  onOpenAndroidBridge: () => void;
}

export const DevicePanel: React.FC<DevicePanelProps> = ({
  deviceState,
  onToggleTorch,
  onTestVibration,
  onToggleWakeLock,
  onToggleAudioEffects,
  onChangeLanguage,
  onOpenApp,
  onOpenAndroidBridge,
}) => {
  const apps = [
    { key: 'whatsapp', name: 'WhatsApp', icon: '💬', color: 'bg-emerald-950/60 border-emerald-500/30' },
    { key: 'youtube', name: 'YouTube', icon: '▶️', color: 'bg-red-950/60 border-red-500/30' },
    { key: 'camera', name: 'Camera', icon: '📷', color: 'bg-cyan-950/60 border-cyan-500/30' },
    { key: 'maps', name: 'Google Maps', icon: '🗺️', color: 'bg-blue-950/60 border-blue-500/30' },
    { key: 'settings', name: 'Settings', icon: '⚙️', color: 'bg-slate-900 border-slate-500/30' },
    { key: 'chrome', name: 'Chrome', icon: '🌐', color: 'bg-amber-950/60 border-amber-500/30' },
    { key: 'spotify', name: 'Spotify', icon: '🎵', color: 'bg-green-950/60 border-green-500/30' },
    { key: 'gmail', name: 'Gmail', icon: '✉️', color: 'bg-red-950/60 border-red-500/30' },
    { key: 'clock', name: 'Alarms', icon: '⏰', color: 'bg-purple-950/60 border-purple-500/30' },
    { key: 'calculator', name: 'Calculator', icon: '🔢', color: 'bg-cyan-950/60 border-cyan-500/30' },
    { key: 'playstore', name: 'Play Store', icon: '🛍️', color: 'bg-blue-950/60 border-blue-500/30' },
  ];

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Hardware Toggles Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-cyan-400" />
            <h3 className="font-orbitron font-bold text-base text-white">
              Device Diagnostics & Controls
            </h3>
          </div>
          <button
            onClick={onOpenAndroidBridge}
            className="text-xs px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono-tech flex items-center gap-1 hover:bg-cyan-900 transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Full Android Bridge
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Flashlight / Torch */}
          <button
            type="button"
            onClick={onToggleTorch}
            className={`p-3 rounded-xl border flex flex-col items-start gap-1 transition-all ${
              deviceState.flashlightOn
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                : 'bg-slate-900/80 border-cyan-500/20 text-slate-300 hover:border-cyan-400/40'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <Flashlight className="w-5 h-5" />
              <span
                className={`text-[10px] font-mono-tech px-1.5 py-0.5 rounded ${
                  deviceState.flashlightOn
                    ? 'bg-amber-500/30 text-amber-200'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {deviceState.flashlightOn ? 'ON' : 'OFF'}
              </span>
            </div>
            <span className="text-xs font-semibold mt-1">Torch / Flashlight</span>
            <span className="text-[10px] text-slate-400 font-mono-tech">
              Rear Camera LED
            </span>
          </button>

          {/* Wake Lock */}
          <button
            type="button"
            onClick={onToggleWakeLock}
            className={`p-3 rounded-xl border flex flex-col items-start gap-1 transition-all ${
              deviceState.wakeLockActive
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                : 'bg-slate-900/80 border-cyan-500/20 text-slate-300 hover:border-cyan-400/40'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <Eye className="w-5 h-5" />
              <span
                className={`text-[10px] font-mono-tech px-1.5 py-0.5 rounded ${
                  deviceState.wakeLockActive
                    ? 'bg-cyan-500/30 text-cyan-200'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {deviceState.wakeLockActive ? 'ACTIVE' : 'OFF'}
              </span>
            </div>
            <span className="text-xs font-semibold mt-1">Screen Wake-Lock</span>
            <span className="text-[10px] text-slate-400 font-mono-tech">
              Always-On Display
            </span>
          </button>

          {/* Haptic Vibration */}
          <button
            type="button"
            onClick={onTestVibration}
            className="p-3 rounded-xl border bg-slate-900/80 border-cyan-500/20 text-slate-300 hover:border-cyan-400/40 flex flex-col items-start gap-1 transition-all active:scale-95"
          >
            <div className="flex items-center justify-between w-full">
              <Radio className="w-5 h-5 text-purple-400" />
              <span className="text-[10px] font-mono-tech px-1.5 py-0.5 rounded bg-slate-800 text-purple-300">
                TAP
              </span>
            </div>
            <span className="text-xs font-semibold mt-1">Haptic Feedback</span>
            <span className="text-[10px] text-slate-400 font-mono-tech">
              Vibrate Motor Test
            </span>
          </button>

          {/* Sound FX Toggle */}
          <button
            type="button"
            onClick={onToggleAudioEffects}
            className={`p-3 rounded-xl border flex flex-col items-start gap-1 transition-all ${
              deviceState.soundEffects
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-slate-900/80 border-cyan-500/20 text-slate-300 hover:border-cyan-400/40'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              {deviceState.soundEffects ? (
                <Volume2 className="w-5 h-5 text-cyan-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-500" />
              )}
              <span
                className={`text-[10px] font-mono-tech px-1.5 py-0.5 rounded ${
                  deviceState.soundEffects
                    ? 'bg-cyan-500/30 text-cyan-200'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {deviceState.soundEffects ? 'ON' : 'OFF'}
              </span>
            </div>
            <span className="text-xs font-semibold mt-1">Stark Sound FX</span>
            <span className="text-[10px] text-slate-400 font-mono-tech">
              Sci-Fi Audio Cues
            </span>
          </button>
        </div>
      </div>

      {/* Battery & Network Status Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300">
            {deviceState.isCharging ? (
              <BatteryCharging className="w-5 h-5 text-emerald-400 animate-pulse" />
            ) : (
              <Battery className="w-5 h-5 text-cyan-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono-tech text-slate-400 uppercase">
                Battery Level
              </span>
              <span className="text-xs font-bold font-mono-tech text-cyan-300">
                {deviceState.batteryLevel !== null
                  ? `${deviceState.batteryLevel}%`
                  : 'Hardware Linked'}
              </span>
              {deviceState.isCharging && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono-tech">
                  CHARGING
                </span>
              )}
            </div>
            <div className="w-36 h-2 rounded-full bg-slate-800 overflow-hidden mt-1">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all"
                style={{
                  width: `${deviceState.batteryLevel ?? 88}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Voice Language Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono-tech text-slate-400">Jarvis Voice:</span>
          <select
            value={deviceState.speechVoiceLanguage}
            onChange={(e: any) => onChangeLanguage(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-cyan-500/40 text-xs text-cyan-300 font-mono-tech focus:outline-none"
          >
            <option value="hi-IN">Hindi / Hinglish (भारत)</option>
            <option value="en-IN">Indian English (IN)</option>
            <option value="en-US">US English (Stark)</option>
          </select>
        </div>
      </div>

      {/* App Launcher Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h3 className="font-orbitron font-bold text-base text-white">
              App Launcher & Android Package Intents
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono-tech">
            Voice command: "YouTube kholo"
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {apps.map((app) => (
            <button
              key={app.key}
              type="button"
              onClick={() => onOpenApp(app.key)}
              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all hover:scale-[1.02] active:scale-95 text-left ${app.color}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{app.icon}</span>
                <span className="text-xs font-semibold text-white">
                  {app.name}
                </span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

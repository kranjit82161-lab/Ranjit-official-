import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Play,
  Clock,
  Settings,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Film,
  Zap,
  Shield,
  Layers,
  History,
  Copy,
  Check,
  Video,
  Power,
  ChevronRight,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  AutomationConfig,
  AutomationLog,
  loadAutomationConfig,
  saveAutomationConfig,
  loadAutomationLogs,
  saveAutomationLogs,
  runFullVideoAutomation,
} from '../utils/dailyScheduler.ts';
import { RenderedVideoResult } from '../utils/videoRenderer.ts';
import {
  signInWithGoogleYouTube,
  getCachedAccessToken,
  logoutYouTube,
} from '../utils/firebaseAuth.ts';
import { soundEffects } from '../utils/audioEffects.ts';
import { speakJarvis } from '../utils/speech.ts';

interface DailyAutomationPanelProps {
  currentUser: User | null;
  onUserChange: (user: User | null) => void;
  speechVoiceLanguage: 'hi-IN' | 'en-IN' | 'en-US';
}

export const DailyAutomationPanel: React.FC<DailyAutomationPanelProps> = ({
  currentUser,
  onUserChange,
  speechVoiceLanguage,
}) => {
  // Config & Logs
  const [config, setConfig] = useState<AutomationConfig>(loadAutomationConfig);
  const [logs, setLogs] = useState<AutomationLog[]>(loadAutomationLogs);

  // Active Pipeline State
  const [isRunning, setIsRunning] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<'idle' | 'script' | 'render' | 'preview' | 'upload' | 'done' | 'error'>('idle');
  const [progressPercent, setProgressPercent] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [latestVideoResult, setLatestVideoResult] = useState<RenderedVideoResult | null>(null);
  const [latestLog, setLatestLog] = useState<AutomationLog | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Categories
  const categories = [
    'Tech & AI Breakthroughs',
    'Tony Stark / Jarvis Labs & Science',
    'Space, Universe & Quantum Mysteries',
    'Future Robotics & Humanoids',
    'Mindset & High Performance Motivation',
  ];

  // Save config on changes
  const updateConfig = (updates: Partial<AutomationConfig>) => {
    const updated = { ...config, ...updates };
    setConfig(updated);
    saveAutomationConfig(updated);
    soundEffects.playClick();
  };

  // Google Sign In
  const handleConnectChannel = async () => {
    try {
      const res = await signInWithGoogleYouTube();
      onUserChange(res.user);
      soundEffects.playJarvisConfirm();
      speakJarvis('YouTube channel connected, Sir.', { lang: speechVoiceLanguage });
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setErrorMessage(err?.message || 'Failed to authenticate channel');
    }
  };

  // Run the full automation sequence immediately
  const handlePostNow = async () => {
    // 1. Verify channel
    let token = getCachedAccessToken();
    if (!currentUser || !token) {
      speakJarvis('पहले अपना YouTube account connect करें', {
        lang: speechVoiceLanguage,
      });
      try {
        const signResult = await signInWithGoogleYouTube();
        onUserChange(signResult.user);
        token = signResult.accessToken;
      } catch {
        setErrorMessage('YouTube channel not connected. Please connect Google account.');
        return;
      }
    }

    setIsRunning(true);
    setErrorMessage(null);
    setPipelineStep('script');
    setProgressPercent(5);
    setStatusMessage('Initializing J.A.R.V.I.S. Daily Automation sequence...');

    try {
      const { log, videoResult } = await runFullVideoAutomation(config, {
        onStepChange: (step, details) => {
          setPipelineStep(step);
          if (step === 'preview' && details) {
            setLatestVideoResult(details);
          }
        },
        onProgress: (pct, desc) => {
          setProgressPercent(pct);
          setStatusMessage(desc);
        },
        onSuccess: (completedLog, res) => {
          setLatestLog(completedLog);
          setLatestVideoResult(res);
          setLogs(loadAutomationLogs());
          setIsRunning(false);
          setPipelineStep('done');
        },
        onError: (err) => {
          setIsRunning(false);
          setPipelineStep('error');
          setErrorMessage(err.message);
          soundEffects.playJarvisAlarm();
        },
      });
    } catch (err: any) {
      console.error('Daily automation pipeline error:', err);
      setIsRunning(false);
      setPipelineStep('error');
      setErrorMessage(err?.message || 'Automation failed during execution.');
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    soundEffects.playClick();
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top Futuristic Header */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/70 via-slate-900 to-cyan-950/70 border border-red-500/40 glow-red flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-orbitron font-extrabold text-base sm:text-lg text-white">
                Daily AI Video Automation
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950 border border-red-500/50 text-red-300 font-mono-tech">
                AUTONOMOUS 6:00 PM
              </span>
            </div>
            <p className="text-xs text-slate-300 font-sans">
              Daily automated 9:16 YouTube Shorts generation, voiceover & OAuth publishing.
            </p>
          </div>
        </div>

        {/* Master ON/OFF Switch */}
        <div className="flex items-center gap-2.5 bg-slate-950/80 px-3 py-2 rounded-xl border border-cyan-500/30">
          <span className="text-xs font-mono-tech text-slate-300 font-semibold">
            AUTOMATION:
          </span>
          <button
            onClick={() => updateConfig({ enabled: !config.enabled })}
            className={`px-3 py-1 rounded-lg text-xs font-mono-tech font-bold flex items-center gap-1.5 transition-all ${
              config.enabled
                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{config.enabled ? 'ACTIVE (ON)' : 'PAUSED (OFF)'}</span>
          </button>
        </div>
      </div>

      {/* Instant Action Hero: "POST NOW" */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 glow-cyan flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs font-mono-tech text-cyan-400 font-bold mb-1">
            <Sparkles className="w-4 h-4" />
            ON-DEMAND EXECUTION ENGINE
          </div>
          <h4 className="text-base sm:text-lg font-orbitron font-bold text-white">
            Want to post today's AI video right now?
          </h4>
          <p className="text-xs text-slate-300 font-sans mt-0.5">
            Jarvis will automatically generate the topic, script, 9:16 video frames with audio, and upload to your YouTube channel with Title & Tags.
          </p>
        </div>

        <button
          onClick={handlePostNow}
          disabled={isRunning}
          className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-cyan-600 hover:from-red-500 hover:to-cyan-500 text-white font-orbitron font-extrabold text-sm tracking-wider shadow-[0_0_25px_rgba(239,68,68,0.6)] flex items-center justify-center gap-2.5 transition-all active:scale-95 disabled:opacity-50"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>RUNNING PIPELINE...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>POST NOW (RUN PIPELINE)</span>
            </>
          )}
        </button>
      </div>

      {/* Pipeline Status Progress (when active or just finished) */}
      {(isRunning || pipelineStep === 'done') && (
        <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-400/50 glow-arc flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-mono-tech">
            <span className="flex items-center gap-2 font-bold text-cyan-300">
              <RefreshCw className={`w-4 h-4 text-cyan-400 ${isRunning ? 'animate-spin' : ''}`} />
              PIPELINE PROGRESS: {statusMessage}
            </span>
            <span className="text-base font-extrabold text-cyan-300">
              {progressPercent}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 rounded-full bg-slate-900 border border-cyan-500/30 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-red-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Step Badges */}
          <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono-tech mt-1">
            <div
              className={`p-2 rounded-lg border ${
                progressPercent >= 25
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500'
              }`}
            >
              1. AI SCRIPT
            </div>
            <div
              className={`p-2 rounded-lg border ${
                progressPercent >= 75
                  ? 'bg-blue-950/80 border-blue-400 text-blue-200'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500'
              }`}
            >
              2. 9:16 RENDER
            </div>
            <div
              className={`p-2 rounded-lg border ${
                progressPercent >= 90
                  ? 'bg-red-950/80 border-red-400 text-red-200'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500'
              }`}
            >
              3. YT UPLOAD
            </div>
            <div
              className={`p-2 rounded-lg border ${
                progressPercent === 100
                  ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500'
              }`}
            >
              4. PUBLISHED
            </div>
          </div>
        </div>
      )}

      {/* Success Banner & Video Preview */}
      {latestLog && latestLog.status === 'success' && (
        <div className="p-4 rounded-2xl bg-emerald-950/70 border-2 border-emerald-400 glow-cyan flex flex-col md:flex-row items-center gap-4">
          {latestVideoResult?.previewUrl && (
            <div className="w-36 h-64 rounded-xl overflow-hidden bg-black border border-emerald-400/50 flex-shrink-0 shadow-lg">
              <video
                src={latestVideoResult.previewUrl}
                controls
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span className="text-xs font-mono-tech text-emerald-400 font-bold uppercase tracking-wider">
                VIDEO UPLOADED TO YOUTUBE
              </span>
            </div>

            <h4 className="text-base font-orbitron font-bold text-white">
              {latestLog.youtubeTitle}
            </h4>

            <p className="text-xs text-slate-300 font-sans">
              Sir, आज का वीडियो YouTube पर पोस्ट हो गया है। Your audience can now watch it as a 9:16 YouTube Short!
            </p>

            {/* Video Link */}
            {latestLog.videoUrl && (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-emerald-500/40 text-xs font-mono-tech text-emerald-300 mt-1">
                <span className="flex-1 truncate">{latestLog.videoUrl}</span>
                <button
                  onClick={() => copyUrl(latestLog.videoUrl!)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold flex items-center gap-1"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
                <a
                  href={latestLog.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Watch</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message with Retry */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/50 flex items-start justify-between gap-3 text-xs text-red-200 glow-red">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold font-mono-tech uppercase">Automation Error:</span>
              <p className="mt-0.5 text-slate-200">{errorMessage}</p>
            </div>
          </div>
          <button
            onClick={handlePostNow}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold font-mono-tech flex items-center gap-1 active:scale-95 flex-shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Automation Configuration Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Schedule Time & YouTube Channel */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h5 className="font-orbitron font-bold text-xs sm:text-sm text-white">
              Daily Automation Schedule
            </h5>
          </div>

          {/* Time Picker */}
          <div>
            <label className="block text-xs font-mono-tech text-slate-300 mb-1">
              Trigger Time (Everyday)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={config.scheduledTime}
                onChange={(e) => updateConfig({ scheduledTime: e.target.value })}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-cyan-500/40 text-cyan-300 font-mono-tech text-sm focus:outline-none focus:border-cyan-400"
              />
              <span className="text-xs text-slate-400 font-mono-tech">
                Default: 18:00 (6:00 PM)
              </span>
            </div>
          </div>

          {/* Connected YouTube Account */}
          <div className="pt-2 border-t border-slate-800/80">
            <label className="block text-xs font-mono-tech text-slate-300 mb-1">
              Target YouTube Channel
            </label>
            {currentUser ? (
              <div className="p-2.5 rounded-xl bg-slate-950 border border-emerald-500/40 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs text-white truncate font-semibold">
                    {currentUser.displayName || currentUser.email}
                  </span>
                </div>
                <button
                  onClick={async () => {
                    await logoutYouTube();
                    onUserChange(null);
                  }}
                  className="text-[11px] text-slate-400 hover:text-red-400 font-mono-tech"
                >
                  Change Account
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectChannel}
                className="w-full py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold font-mono-tech flex items-center justify-center gap-2"
              >
                <Film className="w-4 h-4 text-red-600" />
                Connect YouTube Account
              </button>
            )}
          </div>
        </div>

        {/* Card 2: Niche, Format & Privacy */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Settings className="w-4 h-4 text-cyan-400" />
            <h5 className="font-orbitron font-bold text-xs sm:text-sm text-white">
              Content & Video Settings
            </h5>
          </div>

          {/* Topic Category */}
          <div>
            <label className="block text-xs font-mono-tech text-slate-300 mb-1">
              AI Topic / Niche
            </label>
            <select
              value={config.category}
              onChange={(e) => updateConfig({ category: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-cyan-500/40 text-xs text-cyan-200 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Format & Privacy Row */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* Format */}
            <div>
              <label className="block text-xs font-mono-tech text-slate-300 mb-1">
                Video Format
              </label>
              <select
                value={config.aspectRatio}
                onChange={(e: any) => updateConfig({ aspectRatio: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-cyan-500/40 text-xs text-cyan-200 font-mono-tech focus:outline-none"
              >
                <option value="9:16">9:16 (YouTube Shorts)</option>
                <option value="16:9">16:9 (Standard 1080p)</option>
              </select>
            </div>

            {/* Privacy */}
            <div>
              <label className="block text-xs font-mono-tech text-slate-300 mb-1">
                Upload Privacy
              </label>
              <select
                value={config.privacy}
                onChange={(e: any) => updateConfig({ privacy: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-cyan-500/40 text-xs text-cyan-200 font-mono-tech focus:outline-none"
              >
                <option value="public">Public</option>
                <option value="unlisted">Unlisted</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Automation History Logs */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <h5 className="font-orbitron font-bold text-xs sm:text-sm text-white">
              Automation Execution Logs
            </h5>
          </div>
          <span className="text-[11px] font-mono-tech text-slate-400">
            {logs.length} runs recorded
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-6 text-slate-500 font-mono-tech text-xs bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
            No automated posts yet. Tap "POST NOW" or wait for 6:00 PM schedule.
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      log.status === 'success' ? 'bg-emerald-400' : 'bg-red-400'
                    }`}
                  />
                  <div className="min-w-0">
                    <h6 className="font-semibold text-white truncate">
                      {log.youtubeTitle || log.topic}
                    </h6>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono-tech mt-0.5">
                      <span>{log.timestamp}</span>
                      <span>•</span>
                      <span className="text-cyan-400">{log.topic}</span>
                    </div>
                  </div>
                </div>

                {log.videoUrl && (
                  <a
                    href={log.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-shrink-0 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-mono-tech flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>View</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

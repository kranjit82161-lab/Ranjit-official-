import { GeneratedVideoScript } from '../../server/videoAutomationService.ts';
import { renderShortsVideo, RenderedVideoResult } from './videoRenderer.ts';
import { uploadVideoToYouTube } from './youtubeUploader.ts';
import { getCachedAccessToken } from './firebaseAuth.ts';
import { soundEffects } from './audioEffects.ts';
import { speakJarvis } from './speech.ts';

export interface AutomationLog {
  id: string;
  timestamp: string;
  topic: string;
  youtubeTitle: string;
  videoUrl?: string;
  videoId?: string;
  status: 'running' | 'success' | 'failed';
  error?: string;
}

export interface AutomationConfig {
  enabled: boolean;
  scheduledTime: string; // "18:00" default (6:00 PM)
  category: string;
  privacy: 'public' | 'unlisted' | 'private';
  aspectRatio: '9:16' | '16:9';
  lastRunDate?: string; // YYYY-MM-DD
}

const STORAGE_CONFIG_KEY = 'jarvis_daily_automation_config_v1';
const STORAGE_LOGS_KEY = 'jarvis_daily_automation_logs_v1';

export const DEFAULT_CONFIG: AutomationConfig = {
  enabled: true,
  scheduledTime: '18:00', // 6:00 PM
  category: 'Tech & AI Breakthroughs',
  privacy: 'public',
  aspectRatio: '9:16',
};

export function loadAutomationConfig(): AutomationConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_CONFIG;
}

export function saveAutomationConfig(config: AutomationConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config));
  } catch {}
}

export function loadAutomationLogs(): AutomationLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_LOGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveAutomationLogs(logs: AutomationLog[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(logs.slice(0, 25))); // keep last 25 runs
  } catch {}
}

export interface AutomationRunCallbacks {
  onStepChange?: (step: 'script' | 'render' | 'preview' | 'upload' | 'done' | 'error', details?: any) => void;
  onProgress?: (percent: number, description: string) => void;
  onSuccess?: (log: AutomationLog, videoResult: RenderedVideoResult) => void;
  onError?: (err: Error) => void;
}

/**
 * Executes the Complete Daily Video Automation Pipeline:
 * 1. AI Script & Scene generation (Gemini)
 * 2. Real Canvas & Audio 9:16 Video Rendering
 * 3. YouTube OAuth & Resumable Upload
 * 4. Voice Announcement & Logging
 */
export async function runFullVideoAutomation(
  config: AutomationConfig,
  callbacks?: AutomationRunCallbacks
): Promise<{ log: AutomationLog; videoResult: RenderedVideoResult }> {
  const token = getCachedAccessToken();
  if (!token) {
    const err = new Error('YouTube account is not connected. Please click "Connect YouTube" in JARVIS.');
    callbacks?.onError?.(err);
    throw err;
  }

  const logId = 'log_' + Date.now();
  const dateStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Generate Script
  callbacks?.onStepChange?.('script');
  callbacks?.onProgress?.(10, 'Jarvis AI is selecting topic & writing scene script...');
  soundEffects.playJarvisWake();

  const scriptRes = await fetch('/api/video-automation/generate-script', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category: config.category,
      aspectRatio: config.aspectRatio,
    }),
  });

  if (!scriptRes.ok) {
    throw new Error('Failed to generate automated video script from server.');
  }

  const script = (await scriptRes.json()) as GeneratedVideoScript;
  callbacks?.onProgress?.(25, `Topic selected: "${script.topic}"`);

  // 2. Render Video
  callbacks?.onStepChange?.('render');
  callbacks?.onProgress?.(30, 'Rendering 9:16 Shorts video frames, audio synthesizer & captions...');

  const videoResult = await renderShortsVideo(
    script,
    config.aspectRatio,
    (pct, stage) => {
      // Map render progress from 30% to 75%
      const mapped = 30 + Math.round((pct / 100) * 45);
      callbacks?.onProgress?.(mapped, `Rendering Video (${pct}%): ${stage}`);
    }
  );

  callbacks?.onStepChange?.('preview', videoResult);
  callbacks?.onProgress?.(75, 'Video check complete. Preparing YouTube upload pipeline...');

  // 3. Upload to YouTube Data API v3
  callbacks?.onStepChange?.('upload');
  soundEffects.playAppLaunch();

  const uploadResult = await uploadVideoToYouTube({
    accessToken: token,
    file: videoResult.file,
    title: script.youtubeTitle,
    description: script.youtubeDescription,
    tags: script.tags,
    privacy: config.privacy,
    onProgress: (percent) => {
      // Map upload progress from 75% to 100%
      const mapped = 75 + Math.round((percent / 100) * 25);
      callbacks?.onProgress?.(mapped, `Uploading to YouTube (${percent}%)...`);
    },
  });

  // 4. Finalize & Voice Announcement
  const completedLog: AutomationLog = {
    id: logId,
    timestamp: `${dateStr} ${timeStr}`,
    topic: script.topic,
    youtubeTitle: uploadResult.title || script.youtubeTitle,
    videoUrl: uploadResult.videoUrl,
    videoId: uploadResult.videoId,
    status: 'success',
  };

  // Update config lastRunDate
  config.lastRunDate = dateStr;
  saveAutomationConfig(config);

  // Update logs
  const logs = loadAutomationLogs();
  saveAutomationLogs([completedLog, ...logs]);

  callbacks?.onStepChange?.('done', completedLog);
  callbacks?.onProgress?.(100, 'Automation sequence completed successfully!');
  soundEffects.playJarvisConfirm();

  // Jarvis spoken confirmation
  speakJarvis('Sir, आज का वीडियो YouTube पर पोस्ट हो गया है।', {
    lang: 'hi-IN',
  });

  callbacks?.onSuccess?.(completedLog, videoResult);
  return { log: completedLog, videoResult };
}

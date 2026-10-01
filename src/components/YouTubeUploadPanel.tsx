import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  Lock,
  Globe,
  Film,
  X,
  LogOut,
  Play,
  Share2,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  signInWithGoogleYouTube,
  getCachedAccessToken,
  logoutYouTube,
} from '../utils/firebaseAuth.ts';
import { uploadVideoToYouTube, YouTubeUploadResult } from '../utils/youtubeUploader.ts';
import { soundEffects } from '../utils/audioEffects.ts';
import { speakJarvis } from '../utils/speech.ts';

interface YouTubeUploadPanelProps {
  currentUser: User | null;
  onUserChange: (user: User | null) => void;
  speechVoiceLanguage: 'hi-IN' | 'en-IN' | 'en-US';
  autoOpenFilePickerTrigger?: boolean;
  initialVideoFile?: File | null;
}

export const YouTubeUploadPanel: React.FC<YouTubeUploadPanelProps> = ({
  currentUser,
  onUserChange,
  speechVoiceLanguage,
  autoOpenFilePickerTrigger,
  initialVideoFile,
}) => {
  // Video & Preview State
  const [selectedFile, setSelectedFile] = useState<File | null>(initialVideoFile || null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Metadata State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'unlisted' | 'private'>('public');

  // AI & Upload Status
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [uploadResult, setUploadResult] = useState<YouTubeUploadResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Auto trigger file picker if voice command requested it
  useEffect(() => {
    if (autoOpenFilePickerTrigger && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [autoOpenFilePickerTrigger]);

  // Handle passed initialVideoFile from editor
  useEffect(() => {
    if (initialVideoFile) {
      setSelectedFile(initialVideoFile);
      const url = URL.createObjectURL(initialVideoFile);
      setVideoPreviewUrl(url);
      generateAiMetadata(initialVideoFile);
    }
  }, [initialVideoFile]);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
    };
  }, [videoPreviewUrl]);

  // Handle Google OAuth Sign In
  const handleConnectGoogle = async () => {
    setIsConnecting(true);
    setErrorMessage(null);
    try {
      const res = await signInWithGoogleYouTube();
      onUserChange(res.user);
      soundEffects.playJarvisConfirm();
      speakJarvis('YouTube account successfully connected, Sir.', {
        lang: speechVoiceLanguage,
      });
    } catch (err: any) {
      console.error('Sign-in error:', err);
      const msg = err?.message || 'Failed to authenticate with Google';
      setErrorMessage(msg);
      speakJarvis('Authentication error, Sir.', { lang: speechVoiceLanguage });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await logoutYouTube();
    onUserChange(null);
    soundEffects.playClick();
  };

  // Handle Video File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setErrorMessage('Please select a valid video file (MP4, WebM, MOV, etc.)');
      return;
    }

    setErrorMessage(null);
    setUploadResult(null);
    setUploadProgress(0);
    setSelectedFile(file);

    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    const url = URL.createObjectURL(file);
    setVideoPreviewUrl(url);

    soundEffects.playJarvisConfirm();

    // Auto-generate AI Metadata for seamless experience
    generateAiMetadata(file);
  };

  // Call Server-Side Gemini API for Title, Description & Tags
  const generateAiMetadata = async (fileToUse?: File) => {
    const file = fileToUse || selectedFile;
    if (!file) return;

    setIsGeneratingAi(true);
    soundEffects.playJarvisWake();

    try {
      const fileSizeMb = file.size / (1024 * 1024);
      const res = await fetch('/api/youtube/generate-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileSizeMb,
          language: speechVoiceLanguage,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate AI metadata.');
      }

      const data = await res.json();
      setTitle(data.title || file.name.replace(/\.[^/.]+$/, ''));
      setDescription(data.description || '');
      setTags(Array.isArray(data.tags) ? data.tags : ['JARVIS', 'YouTube', 'MobileUpload']);
      soundEffects.playJarvisConfirm();
    } catch (err) {
      console.warn('AI metadata generation error:', err);
      const defaultTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(defaultTitle);
      setDescription(`Uploaded with JARVIS AI Mobile Assistant.\n\n#Jarvis #YouTube #Video`);
      setTags(['JARVIS', 'MobileAssistant', 'Android']);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Add a tag chip
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const clean = tagInput.trim().replace(/^#/, '');
    if (!tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Perform Real YouTube Upload
  const handleConfirmUpload = async () => {
    setErrorMessage(null);

    // 1. Check Auth
    let token = getCachedAccessToken();
    if (!currentUser || !token) {
      speakJarvis('पहले अपना YouTube account connect करें', {
        lang: speechVoiceLanguage,
      });
      // Try prompt login
      try {
        const signResult = await signInWithGoogleYouTube();
        onUserChange(signResult.user);
        token = signResult.accessToken;
      } catch {
        setErrorMessage('YouTube account is not connected. Please click Connect YouTube Channel.');
        return;
      }
    }

    // 2. Check File
    if (!selectedFile) {
      setErrorMessage('Please select a video file first.');
      speakJarvis('Sir, video file chunein.', { lang: speechVoiceLanguage });
      return;
    }

    if (!title.trim()) {
      setErrorMessage('Video title cannot be empty.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadedBytes(0);
    setTotalBytes(selectedFile.size);
    soundEffects.playAppLaunch();

    try {
      const result = await uploadVideoToYouTube({
        accessToken: token,
        file: selectedFile,
        title,
        description,
        tags,
        privacy,
        onProgress: (percent, loaded, total) => {
          setUploadProgress(percent);
          setUploadedBytes(loaded);
          setTotalBytes(total);
        },
      });

      setUploadResult(result);
      setIsUploading(false);
      soundEffects.playJarvisConfirm();

      // Required voice completion announcement in Hindi
      speakJarvis('Sir, आपका वीडियो YouTube पर upload हो गया है', {
        lang: speechVoiceLanguage,
      });
    } catch (err: any) {
      console.error('YouTube upload failed:', err);
      setIsUploading(false);
      const msg = err?.message || 'Video upload failed. Please try again.';
      setErrorMessage(msg);
      soundEffects.playJarvisAlarm();
      speakJarvis('Sir, video upload fail ho gaya hai. Kripya retry karein.', {
        lang: speechVoiceLanguage,
      });
    }
  };

  const copyVideoUrl = () => {
    if (!uploadResult?.videoUrl) return;
    navigator.clipboard.writeText(uploadResult.videoUrl);
    setCopiedLink(true);
    soundEffects.playClick();
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const resetForNewUpload = () => {
    setSelectedFile(null);
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoPreviewUrl(null);
    setTitle('');
    setDescription('');
    setTags([]);
    setUploadResult(null);
    setUploadProgress(0);
    setErrorMessage(null);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Hidden File Picker Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="video/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-red-950/60 via-slate-900 to-cyan-950/60 border border-red-500/40 glow-red">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-red-600/90 border border-red-400 flex items-center justify-center text-white shadow-lg">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-orbitron font-bold text-sm sm:text-base text-white">
                YouTube Upload Assistant
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-900/60 text-red-300 font-mono-tech border border-red-500/30">
                DATA API v3
              </span>
            </div>
            <p className="text-xs text-slate-300 font-sans">
              Voice Directives: <span className="text-red-300 font-mono-tech">"Jarvis, यह वीडियो YouTube पर पोस्ट करो"</span>
            </p>
          </div>
        </div>

        {/* Channel Auth State */}
        {currentUser ? (
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-emerald-400 font-mono-tech flex items-center gap-1 justify-end">
                <CheckCircle2 className="w-3.5 h-3.5" />
                CHANNEL CONNECTED
              </div>
              <div className="text-[11px] text-slate-400 font-sans truncate max-w-[140px]">
                {currentUser.displayName || currentUser.email}
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-300 transition-colors"
              title="Disconnect YouTube Channel"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnectGoogle}
            disabled={isConnecting}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-semibold flex items-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{isConnecting ? 'Connecting...' : 'Connect YouTube'}</span>
          </button>
        )}
      </div>

      {/* Disconnected Warning Alert */}
      {!currentUser && (
        <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <span>
              पहले अपना YouTube account connect करें taaki Jarvis Data API se video post kar sake.
            </span>
          </div>
          <button
            onClick={handleConnectGoogle}
            className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono-tech whitespace-nowrap active:scale-95 transition-all"
          >
            Connect Now
          </button>
        </div>
      )}

      {/* Upload Success View */}
      {uploadResult && (
        <div className="p-5 rounded-2xl bg-emerald-950/80 border-2 border-emerald-400 flex flex-col items-center text-center gap-3 glow-cyan animate-pulse-glow">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[11px] font-mono-tech text-emerald-400 uppercase tracking-widest font-bold">
              JARVIS BROADCAST COMPLETE
            </span>
            <h4 className="text-lg font-orbitron font-bold text-white mt-0.5">
              Sir, आपका वीडियो YouTube पर upload हो गया है!
            </h4>
            <p className="text-xs text-slate-300 mt-1 max-w-md font-sans">
              "{uploadResult.title}" has been successfully encoded and stored on your YouTube Channel.
            </p>
          </div>

          {/* Video Link Box */}
          <div className="w-full max-w-md flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-emerald-500/40 font-mono-tech text-xs text-emerald-300">
            <span className="flex-1 truncate text-left pl-2 select-all">
              {uploadResult.videoUrl}
            </span>
            <button
              onClick={copyVideoUrl}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold flex items-center gap-1 transition-all"
              title="Copy URL"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-1">
            <a
              href={uploadResult.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs font-mono-tech flex items-center gap-2 shadow-lg active:scale-95 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Watch on YouTube
            </a>

            <button
              onClick={resetForNewUpload}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono-tech flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Another Video
            </button>
          </div>
        </div>
      )}

      {/* Upload Progress Bar (when uploading) */}
      {isUploading && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/50 glow-cyan flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs font-mono-tech">
            <span className="flex items-center gap-2 text-cyan-300 font-bold">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
              UPLOADING TO YOUTUBE RESUMABLE STREAM...
            </span>
            <span className="text-base font-extrabold text-cyan-300">
              {uploadProgress}%
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-950 border border-cyan-500/30 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-red-500 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono-tech text-slate-400">
            <span>
              {(uploadedBytes / (1024 * 1024)).toFixed(1)} MB / {(totalBytes / (1024 * 1024)).toFixed(1)} MB transferred
            </span>
            <span>Target: YouTube Servers (Encrypted)</span>
          </div>
        </div>
      )}

      {/* Error Message with Retry */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/50 flex items-start justify-between gap-3 text-xs text-red-200 glow-red">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold font-mono-tech uppercase">Upload Directive Error:</span>
              <p className="mt-0.5 text-slate-200">{errorMessage}</p>
            </div>
          </div>
          <button
            onClick={handleConfirmUpload}
            className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold font-mono-tech flex items-center gap-1 flex-shrink-0 active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Video Selection Card */}
      {!uploadResult && (
        <div className="flex flex-col gap-4">
          {!selectedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-950/50 hover:bg-cyan-950/20 transition-all group"
            >
              <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform mb-3 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <Video className="w-8 h-8" />
              </div>
              <h4 className="font-orbitron font-bold text-sm sm:text-base text-white">
                Choose Video from Android Device
              </h4>
              <p className="text-xs text-slate-400 font-sans mt-1 max-w-sm">
                Tap to pick video from phone Gallery, Camera, or Files. Jarvis will automatically generate Title, Description & Tags using Gemini AI!
              </p>
              <button
                type="button"
                className="mt-4 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono-tech font-bold flex items-center gap-2 shadow-lg active:scale-95"
              >
                <Upload className="w-4 h-4" />
                Select Video File
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Video Preview */}
              <div className="flex flex-col gap-3">
                <div className="relative rounded-2xl overflow-hidden bg-black border border-cyan-500/40 shadow-xl aspect-video flex items-center justify-center">
                  {videoPreviewUrl ? (
                    <video
                      src={videoPreviewUrl}
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-slate-500 text-xs">Video Preview Unavailable</div>
                  )}

                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
                      setVideoPreviewUrl(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-red-600 text-white transition-colors"
                    title="Change video"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Video File Specs */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs font-mono-tech text-slate-300">
                  <div className="truncate mr-2">
                    <span className="text-slate-400">File: </span>
                    <span className="text-cyan-300 font-bold">{selectedFile.name}</span>
                  </div>
                  <span className="flex-shrink-0 text-cyan-400">
                    {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                  </span>
                </div>

                {/* AI Regenerate Button */}
                <button
                  type="button"
                  onClick={() => generateAiMetadata()}
                  disabled={isGeneratingAi}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-900/80 to-blue-900/80 hover:from-cyan-800 hover:to-blue-800 border border-cyan-400/40 text-cyan-200 text-xs font-mono-tech font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 text-cyan-400 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingAi ? 'Jarvis AI Generating Metadata...' : 'Re-generate Title & Description with AI'}</span>
                </button>
              </div>

              {/* Right Column: Title, Description, Tags & Privacy */}
              <div className="flex flex-col gap-3">
                {/* Title */}
                <div>
                  <div className="flex items-center justify-between text-xs font-mono-tech text-slate-300 mb-1">
                    <label className="font-semibold">YouTube Video Title</label>
                    <span className={title.length > 90 ? 'text-amber-400' : 'text-slate-500'}>
                      {title.length}/100
                    </span>
                  </div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter YouTube title..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-cyan-500/30 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-400 transition-colors font-sans"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-mono-tech font-semibold text-slate-300 mb-1">
                    Description & Hashtags
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Video description, hashtags, timestamps..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-cyan-500/30 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-400 transition-colors font-sans resize-none"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-mono-tech font-semibold text-slate-300 mb-1">
                    Tags & Keywords
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="Add tag and press Enter..."
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono-tech"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono-tech text-cyan-300 border border-slate-700"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-mono-tech"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Privacy Setting */}
                <div>
                  <label className="block text-xs font-mono-tech font-semibold text-slate-300 mb-1">
                    Visibility & Privacy
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Public */}
                    <button
                      type="button"
                      onClick={() => setPrivacy('public')}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                        privacy === 'public'
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Globe className="w-4 h-4" />
                      <span className="text-[11px] font-mono-tech font-bold">Public</span>
                    </button>

                    {/* Unlisted */}
                    <button
                      type="button"
                      onClick={() => setPrivacy('unlisted')}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                        privacy === 'unlisted'
                          ? 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <EyeOff className="w-4 h-4" />
                      <span className="text-[11px] font-mono-tech font-bold">Unlisted</span>
                    </button>

                    {/* Private */}
                    <button
                      type="button"
                      onClick={() => setPrivacy('private')}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                        privacy === 'private'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Lock className="w-4 h-4" />
                      <span className="text-[11px] font-mono-tech font-bold">Private</span>
                    </button>
                  </div>
                </div>

                {/* Confirm Upload Button */}
                <div className="mt-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handleConfirmUpload}
                    disabled={isUploading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-orbitron font-bold text-sm tracking-wider shadow-[0_0_25px_rgba(225,29,72,0.5)] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Confirm & Upload to YouTube</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

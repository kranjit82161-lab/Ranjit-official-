import React, { useState, useRef, useEffect } from 'react';
import {
  Scissors,
  Type,
  Music,
  Mic,
  MicOff,
  Sparkles,
  ExternalLink,
  Play,
  Pause,
  Upload,
  Download,
  Share2,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Layers,
  Wand2,
  RefreshCw,
  Film,
  X,
  Volume2,
  Send,
  Sliders,
  Image as ImageIcon,
  Palette,
  Radio,
  Clock,
} from 'lucide-react';
import { executeOpenApp } from '../utils/deviceControls.ts';
import {
  VideoEditOptions,
  VideoExportResult,
  processAndExportVideo,
} from '../utils/videoEditorEngine.ts';
import { soundEffects } from '../utils/audioEffects.ts';
import {
  speakJarvis,
  stopSpeaking,
  speechRecognizer,
  VoiceChangerMode,
} from '../utils/speech.ts';
import { TalkingAvatar } from './TalkingAvatar.tsx';

interface VideoEditingPanelProps {
  onSendToYouTubeUpload: (exportedFile: File) => void;
  speechVoiceLanguage: 'hi-IN' | 'en-IN' | 'en-US';
  autoOpenFilePicker?: boolean;
  initialActionPayload?: Record<string, any> | null;
}

export const VideoEditingPanel: React.FC<VideoEditingPanelProps> = ({
  onSendToYouTubeUpload,
  speechVoiceLanguage,
  autoOpenFilePicker,
  initialActionPayload,
}) => {
  // Video Source
  const [sourceVideoFile, setSourceVideoFile] = useState<File | null>(null);
  const [sourcePreviewUrl, setSourcePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);

  // Video Playing status & Timeline
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(10);
  const [currentTime, setCurrentTime] = useState(0);

  // Edit Options
  const [editOptions, setEditOptions] = useState<VideoEditOptions>({
    trimStartPercent: 10,
    trimEndPercent: 90,
    aspectRatio: '9:16',
    captionsText: '🔥 AI REVOLUTION IS HERE! #Shorts',
    captionLanguage: 'hindi',
    backgroundMusic: 'energetic',
    transitionEffect: 'cyber_glitch',
    colorFilter: 'vibrant_stark',
  });

  // Export & Processing
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatusText, setExportStatusText] = useState('');
  const [exportedResult, setExportedResult] = useState<VideoExportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Post-Export Destination Prompt
  const [showDestinationChoice, setShowDestinationChoice] = useState(false);

  // Voice Changer Settings (Normal, Deep, Robot, Female, Funny)
  const [voiceChanger, setVoiceChanger] = useState<VoiceChangerMode>('normal');

  // Live Two-Way Voice Conversation State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [jarvisFeedback, setJarvisFeedback] = useState(
    'नमस्ते सर! मैं Jarvis Video Editor हूँ। आप मुझसे बात करते रहिए, मैं आपकी वीडियो एडिट करता रहूँगा।'
  );
  const [currentTaskName, setCurrentTaskName] = useState('Idle - Waiting for commands');
  const [textCommandInput, setTextCommandInput] = useState('');
  const [selectedPhotoName, setSelectedPhotoName] = useState<string | null>(null);

  // Live Editing Task Pipeline
  const isEditingPausedRef = useRef(false);

  // Apply voice directive payload parameters (e.g. 9:16, trim, captions, capcut)
  useEffect(() => {
    if (initialActionPayload) {
      const p = initialActionPayload;
      setEditOptions((prev) => ({
        ...prev,
        aspectRatio: p.aspectRatio || prev.aspectRatio,
        trimStartPercent: p.trimStart ? 15 : prev.trimStartPercent,
        captionsText: p.addCaption ? prev.captionsText : prev.captionsText,
        backgroundMusic: p.addMusic ? 'energetic' : prev.backgroundMusic,
      }));
      setCurrentTaskName('Applying initial AI directives from voice');
    }
  }, [initialActionPayload]);

  useEffect(() => {
    if (autoOpenFilePicker && !sourceVideoFile) {
      fileInputRef.current?.click();
    }
  }, [autoOpenFilePicker, sourceVideoFile]);

  // Handle Video File Selection
  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (sourcePreviewUrl) {
      URL.revokeObjectURL(sourcePreviewUrl);
    }

    setSourceVideoFile(file);
    const url = URL.createObjectURL(file);
    setSourcePreviewUrl(url);
    setExportedResult(null);
    setShowDestinationChoice(false);
    setErrorMessage(null);
    setCurrentTaskName(`Loaded: ${file.name}`);
    soundEffects.playJarvisConfirm();

    respondWithVoice(
      'वीडियो लोड हो गया है मालिक! रउआ आदेश दीं—Cut, Trim, 9:16 Shorts, Music, या Text का करे के बा?',
      'Video file loaded. Ready for live conversational editing, Sir.'
    );
  };

  // Helper: Speak response with auto language & voice changer
  const respondWithVoice = (hindiText: string, fallbackEng: string = '') => {
    const textToSpeak = hindiText || fallbackEng;
    setJarvisFeedback(textToSpeak);
    setIsSpeaking(true);

    speakJarvis(textToSpeak, {
      lang: speechVoiceLanguage,
      voiceChanger,
      onStart: () => setIsSpeaking(true),
      onEnd: () => {
        setIsSpeaking(false);
        // Automatically re-arm listening so conversation never stops!
        if (isListening) {
          restartRecognition();
        }
      },
    });
  };

  // Command Parser for Live Conversation while Editing
  const processVoiceOrTextCommand = async (rawInput: string) => {
    if (!rawInput.trim()) return;
    const input = rawInput.toLowerCase().trim();
    soundEffects.playClick();

    // 1. “क्या कर रहे हो?” / Status Check
    if (
      input.includes('kya kar rahe ho') ||
      input.includes('क्या कर रहे हो') ||
      input.includes('का करत बानी') ||
      input.includes('status') ||
      input.includes('ka karat baada')
    ) {
      const resp = `अभी मैं ${currentTaskName} पर काम कर रहा हूँ, सर! आप बताइए, आगे क्या करना है?`;
      respondWithVoice(resp);
      return;
    }

    // 2. “रुक जाओ” / Pause
    if (
      input.includes('ruk jao') ||
      input.includes('रुक जाओ') ||
      input.includes('pause') ||
      input.includes('रुका') ||
      input.includes('thahar jao')
    ) {
      isEditingPausedRef.current = true;
      if (videoPlayerRef.current) {
        videoPlayerRef.current.pause();
        setIsPlaying(false);
      }
      setCurrentTaskName('Editing Paused (रुक गया है)');
      respondWithVoice('जी सर, एडिटिंग रोक दी गई है। जब भी तैयार हों, "फिर से शुरू करो" कहें।');
      return;
    }

    // 3. “फिर से शुरू करो” / Resume
    if (
      input.includes('phir se shuru') ||
      input.includes('फिर से शुरू') ||
      input.includes('resume') ||
      input.includes('chalu karo') ||
      input.includes('जारी रखो')
    ) {
      isEditingPausedRef.current = false;
      if (videoPlayerRef.current) {
        videoPlayerRef.current.play();
        setIsPlaying(true);
      }
      setCurrentTaskName('Editing Active & Timeline Running');
      respondWithVoice('एडिटिंग फिर से शुरू कर दी गई है मालिक!');
      return;
    }

    // 4. “वीडियो तैयार करके सेव करो” / Export
    if (
      input.includes('save karo') ||
      input.includes('तैयार करके सेव') ||
      input.includes('export') ||
      input.includes('render') ||
      input.includes('download karo')
    ) {
      respondWithVoice('जी सर! फाइनल वीडियो रेंडर करके सेव कर रहा हूँ।');
      handleStartExport();
      return;
    }

    // 5. 9:16 Shorts / Aspect Ratio
    if (
      input.includes('9:16') ||
      input.includes('shorts') ||
      input.includes('reels') ||
      input.includes('vertical')
    ) {
      setEditOptions((prev) => ({ ...prev, aspectRatio: '9:16' }));
      setCurrentTaskName('Aspect Ratio set to 9:16 (Shorts/Reels)');
      respondWithVoice('वीडियो को 9:16 Shorts फॉर्मेट में सेट कर दिया गया है।');
      return;
    }

    if (input.includes('16:9') || input.includes('horizontal') || input.includes('landscape')) {
      setEditOptions((prev) => ({ ...prev, aspectRatio: '16:9' }));
      setCurrentTaskName('Aspect Ratio set to 16:9 (Landscape)');
      respondWithVoice('वीडियो को 16:9 Landscape फॉर्मेट में सेट कर दिया गया है।');
      return;
    }

    // 6. Cut / Trim
    if (
      input.includes('cut') ||
      input.includes('trim') ||
      input.includes('काटो') ||
      input.includes('छांटो')
    ) {
      setEditOptions((prev) => ({
        ...prev,
        trimStartPercent: 15,
        trimEndPercent: 85,
      }));
      setCurrentTaskName('Cut & Trim applied (15% - 85%)');
      respondWithVoice('सर, वीडियो के शुरू और आखिर के गैर-जरूरी हिस्से को ट्रिम कर दिया गया है।');
      return;
    }

    // 7. Music / Background Audio
    if (
      input.includes('music') ||
      input.includes('gana') ||
      input.includes('संगीत') ||
      input.includes('गाना') ||
      input.includes('soundtrack')
    ) {
      setEditOptions((prev) => ({
        ...prev,
        backgroundMusic: prev.backgroundMusic === 'energetic' ? 'lofi' : 'energetic',
      }));
      setCurrentTaskName('Background Music added & synced');
      respondWithVoice('बैकग्राउंड म्यूजिक जोड़ दिया गया है, सर!');
      return;
    }

    // 8. Text / Captions
    if (
      input.includes('text') ||
      input.includes('caption') ||
      input.includes('subtitles') ||
      input.includes('लिखो')
    ) {
      const newCap = '🔥 AI REVOLUTION IS HERE! #JarvisShorts';
      setEditOptions((prev) => ({
        ...prev,
        captionsText: newCap,
      }));
      setCurrentTaskName(`Captions Generated: "${newCap}"`);
      respondWithVoice('वीडियो पर ऑटोमैटिक हिंदी सबटाइटल्स और टेक्स्ट कैप्शन लगा दिया गया है।');
      return;
    }

    // 9. Photo / Overlay
    if (
      input.includes('photo') ||
      input.includes('तस्वीर') ||
      input.includes('image') ||
      input.includes('फोटो')
    ) {
      photoInputRef.current?.click();
      setCurrentTaskName('Waiting for photo selection');
      respondWithVoice('सर, फोटो चुनें जिसे वीडियो में ओवरले करना है।');
      return;
    }

    // 10. Transition & Filters
    if (
      input.includes('transition') ||
      input.includes('filter') ||
      input.includes('इफेक्ट') ||
      input.includes('रंग')
    ) {
      setEditOptions((prev) => ({
        ...prev,
        transitionEffect: 'cyber_glitch',
        colorFilter: 'vibrant_stark',
      }));
      setCurrentTaskName('Cyber Glitch Transition & Vibrant Filter applied');
      respondWithVoice('साइबर ग्लिच ट्रांजीशन और स्टार्क वाइब्रेंट कलर फिल्टर अप्लाई कर दिया गया है।');
      return;
    }

    // 11. Voice Changer Switch via Voice
    if (input.includes('deep voice') || input.includes('भारी आवाज')) {
      setVoiceChanger('deep');
      respondWithVoice('अब मेरी आवाज़ डीप बेस मोड में सेट हो गई है, मालिक।');
      return;
    }
    if (input.includes('robot voice') || input.includes('रोबोट आवाज')) {
      setVoiceChanger('robot');
      respondWithVoice('रोबोटिक वोकल सिंथेसाइज़र सक्रिय हो चुका है।');
      return;
    }
    if (input.includes('female voice') || input.includes('महिला आवाज')) {
      setVoiceChanger('female');
      respondWithVoice('हेलो सर! फीमेल वॉइस मोड सक्रिय हो चुका है।');
      return;
    }
    if (input.includes('funny voice') || input.includes('फनी आवाज')) {
      setVoiceChanger('funny');
      respondWithVoice('हे हे हे! फनी वॉइस एक्टिवेट हो गई है सर जी!');
      return;
    }
    if (input.includes('normal voice') || input.includes('नॉर्मल आवाज')) {
      setVoiceChanger('normal');
      respondWithVoice('नॉर्मल जार्विस नेचुरल आवाज़ रीसेट कर दी गई है।');
      return;
    }

    // Default conversational AI fallback (General chat while editing!)
    try {
      const res = await fetch('/api/jarvis/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: rawInput }),
      });
      const data = await res.json();
      if (data && data.replyText) {
        respondWithVoice(data.replyText);
      } else {
        respondWithVoice(`जी सर, मैंने सुना: "${rawInput}"। एडिटिंग बैकग्राउंड में जारी है!`);
      }
    } catch {
      respondWithVoice(`जी सर, बैकग्राउंड एडिटिंग जारी है। आप बात करते रहें!`);
    }
  };

  // Toggle Continuous Hands-free Voice Listening
  const toggleContinuousVoice = () => {
    if (isListening) {
      speechRecognizer.stop();
      setIsListening(false);
      soundEffects.playJarvisSleep();
    } else {
      setIsListening(true);
      soundEffects.playJarvisWake();
      restartRecognition();
    }
  };

  const restartRecognition = () => {
    try {
      speechRecognizer.start({
        onResult: (text, isFinal) => {
          setVoiceTranscript(text);
          if (isFinal && text.trim()) {
            processVoiceOrTextCommand(text);
          }
        },
        onError: (err) => {
          console.warn('Speech recognizer error:', err);
        },
      });
    } catch (e) {
      console.warn('Speech start error:', e);
    }
  };

  // Handle Export Rendering
  const handleStartExport = async () => {
    if (!sourceVideoFile) {
      setErrorMessage('Please select a video file first.');
      respondWithVoice('मालिक, पहले एक वीडियो फाइल चुन लीजिए।');
      return;
    }

    setIsExporting(true);
    setExportProgress(5);
    setExportStatusText('Initializing Video Rendering Engine...');
    setCurrentTaskName('Rendering & Exporting Video (प्रक्रिया जारी है)');
    setErrorMessage(null);
    soundEffects.playAppLaunch();

    try {
      const result = await processAndExportVideo(sourceVideoFile, editOptions, (pct, status) => {
        setExportProgress(pct);
        setExportStatusText(status);
      });

      setExportedResult(result);
      setIsExporting(false);
      setShowDestinationChoice(true);
      setCurrentTaskName('Video Successfully Exported');
      soundEffects.playJarvisConfirm();

      respondWithVoice(
        'बधाई हो सर! आपका वीडियो सफलता से तैयार होकर सेव हो चुका है। क्या मैं इसे सीधे यूट्यूब पर अपलोड कर दूँ?'
      );
    } catch (err: any) {
      console.error('Video export error:', err);
      setIsExporting(false);
      setErrorMessage(err?.message || 'Video export failed.');
      soundEffects.playJarvisAlarm();
      respondWithVoice('मालिक, वीडियो एक्सपोर्ट में कोई तकनीकी रुकावट आई है।');
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Hidden File Pickers */}
      <input
        type="file"
        ref={fileInputRef}
        accept="video/*"
        onChange={handleSelectFile}
        className="hidden"
      />
      <input
        type="file"
        ref={photoInputRef}
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setSelectedPhotoName(file.name);
            setCurrentTaskName(`Photo Overlay added: ${file.name}`);
            respondWithVoice(`फोटो "${file.name}" वीडियो पर लगा दी गई है, सर!`);
          }
        }}
        className="hidden"
      />

      {/* Top Banner: AI Talking Video Editor */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-cyan-950/80 border border-purple-500/50 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]">
            <Film className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-orbitron font-extrabold text-base sm:text-lg text-white">
                🎬 AI Talking Video Editor
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-300 font-mono-tech">
                LIVE VOICE CONVERSATION
              </span>
            </div>
            <p className="text-xs text-slate-300 font-sans">
              एक तरफ वीडियो एडिटिंग चालू, दूसरी तरफ Jarvis से लगातार लाइव बातचीत (हिंदी / भोजपुरी / English)
            </p>
          </div>
        </div>

        {/* Voice Changer Selector */}
        <div className="flex items-center gap-2 bg-slate-950/90 px-3 py-1.5 rounded-xl border border-purple-400/40 text-xs font-mono-tech">
          <Sliders className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-slate-400">Voice:</span>
          <select
            value={voiceChanger}
            onChange={(e) => {
              const mode = e.target.value as VoiceChangerMode;
              setVoiceChanger(mode);
              speakJarvis(`Voice changed to ${mode} mode`, {
                lang: speechVoiceLanguage,
                voiceChanger: mode,
              });
            }}
            className="bg-slate-900 border border-purple-500/40 text-cyan-300 rounded px-2 py-1 text-xs focus:outline-none"
          >
            <option value="normal">Normal (Natural)</option>
            <option value="deep">Deep (Bass)</option>
            <option value="robot">Robot (Sci-Fi)</option>
            <option value="female">Female (Higher)</option>
            <option value="funny">Funny (Cartoon)</option>
          </select>
        </div>
      </div>

      {/* Main Two-Column Layout: Left Video Workbench + Right Talking Avatar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT (8 Cols): Video Preview + Timeline + Controls */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Video Preview Card */}
          <div className="rounded-2xl overflow-hidden bg-black border border-purple-500/40 shadow-xl flex flex-col">
            <div className="relative aspect-video sm:aspect-[16/9] flex items-center justify-center bg-slate-950">
              {sourcePreviewUrl ? (
                <video
                  ref={videoPlayerRef}
                  src={sourcePreviewUrl}
                  controls
                  playsInline
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 10)}
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  className={`w-full h-full object-contain ${
                    editOptions.aspectRatio === '9:16' ? 'max-w-[50%] mx-auto' : ''
                  }`}
                />
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-full flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-purple-950/20 transition-all group"
                >
                  <Upload className="w-12 h-12 text-purple-400 group-hover:scale-110 transition-transform mb-2" />
                  <span className="font-orbitron font-bold text-white text-sm">
                    Select Raw Video to Edit with Jarvis
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    MP4, WebM or Phone recording
                  </span>
                </div>
              )}

              {/* Photo Overlay Badge if chosen */}
              {selectedPhotoName && (
                <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/80 border border-cyan-400 text-cyan-300 text-[10px] font-mono-tech flex items-center gap-1 shadow-md">
                  <ImageIcon className="w-3 h-3" />
                  <span>Overlay: {selectedPhotoName}</span>
                </div>
              )}

              {/* Active Format Badge */}
              <div className="absolute top-3 right-3 px-2 py-1 rounded bg-purple-950/90 border border-purple-400 text-purple-200 text-[10px] font-mono-tech font-bold shadow-md">
                {editOptions.aspectRatio} • {editOptions.backgroundMusic} music
              </div>
            </div>

            {/* Video Controls & Scrub Timeline */}
            {sourcePreviewUrl && (
              <div className="p-3 bg-slate-900 border-t border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-mono-tech text-slate-400">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (videoPlayerRef.current) {
                          if (isPlaying) {
                            videoPlayerRef.current.pause();
                            setIsPlaying(false);
                          } else {
                            videoPlayerRef.current.play();
                            setIsPlaying(true);
                          }
                        }
                      }}
                      className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1"
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isPlaying ? 'Pause' : 'Play'}</span>
                    </button>
                    <span>
                      {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
                    </span>
                  </div>

                  <span className="text-[11px] text-amber-300 font-bold">
                    Trim Range: {editOptions.trimStartPercent}% - {editOptions.trimEndPercent}%
                  </span>
                </div>

                {/* Timeline Sliders */}
                <div className="relative w-full h-4 flex items-center">
                  <input
                    type="range"
                    min={0}
                    max={duration}
                    step={0.1}
                    value={currentTime}
                    onChange={(e) => {
                      const t = parseFloat(e.target.value);
                      setCurrentTime(t);
                      if (videoPlayerRef.current) videoPlayerRef.current.currentTime = t;
                    }}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Voice Editing Actions Bar */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2.5">
            <span className="text-[10px] font-mono-tech uppercase text-slate-400 tracking-wider">
              Quick Voice Directives (Or say them aloud):
            </span>
            <div className="flex flex-wrap gap-2 text-xs font-mono-tech">
              <button
                onClick={() => processVoiceOrTextCommand('9:16 Shorts me convert karo')}
                className="px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-500/40 hover:bg-purple-900 text-purple-200"
              >
                📱 9:16 Shorts
              </button>
              <button
                onClick={() => processVoiceOrTextCommand('Video cut and trim karo')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200"
              >
                ✂️ Cut / Trim
              </button>
              <button
                onClick={() => processVoiceOrTextCommand('Energetic background music lagao')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200"
              >
                🎵 Add Music
              </button>
              <button
                onClick={() => processVoiceOrTextCommand('Hindi text caption add karo')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200"
              >
                ✍️ Auto Subtitles
              </button>
              <button
                onClick={() => processVoiceOrTextCommand('Photo overlay karo')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200"
              >
                🖼️ Add Photo
              </button>
              <button
                onClick={() => processVoiceOrTextCommand('Transition and filter apply karo')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200"
              >
                ✨ Cyber Transition
              </button>
              <button
                onClick={() => processVoiceOrTextCommand('Kya kar rahe ho?')}
                className="px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 hover:bg-cyan-900"
              >
                👤 "क्या कर रहे हो?"
              </button>
              <button
                onClick={() => processVoiceOrTextCommand('Ruk jao')}
                className="px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-400/40 text-amber-300 hover:bg-amber-900"
              >
                ⏸️ "रुक जाओ"
              </button>
              <button
                onClick={() => processVoiceOrTextCommand('Phir se shuru karo')}
                className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-400/40 text-emerald-300 hover:bg-emerald-900"
              >
                ▶️ "फिर से शुरू करो"
              </button>
              <button
                onClick={() => processVoiceOrTextCommand('Video taiyar karke save karo')}
                className="px-3 py-1.5 rounded-xl bg-red-950/80 border border-red-400/50 text-red-300 hover:bg-red-900 font-bold"
              >
                💾 "तैयार करके सेव करो"
              </button>
            </div>
          </div>

          {/* Export Progress Bar */}
          {isExporting && (
            <div className="p-4 rounded-xl bg-slate-900 border border-purple-500/40 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono-tech">
                <span className="text-purple-300 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                  {exportStatusText}
                </span>
                <span className="font-bold text-purple-300">{exportProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full transition-all"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Export Done Modal */}
          {exportedResult && showDestinationChoice && (
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-400 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-bounce" />
                  <h4 className="font-orbitron font-bold text-white text-sm">
                    Video Ready & Exported!
                  </h4>
                </div>
                <button
                  onClick={() => setShowDestinationChoice(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                <button
                  onClick={() => onSendToYouTubeUpload(exportedResult.file)}
                  className="p-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-orbitron font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <Upload className="w-4 h-4" />
                  <span>Send to YouTube Upload</span>
                </button>
                <a
                  href={exportedResult.previewUrl}
                  download={exportedResult.file.name}
                  className="p-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-orbitron font-bold text-xs flex items-center justify-center gap-2 shadow-lg text-center"
                >
                  <Download className="w-4 h-4" />
                  <span>Download MP4 File</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT (4 Cols): Talking Avatar & Live Two-Way Conversation */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Jarvis Talking Avatar Widget */}
          <TalkingAvatar
            isSpeaking={isSpeaking}
            isListening={isListening}
            currentTaskName={currentTaskName}
            voiceChanger={voiceChanger}
            speechVoiceLanguage={speechVoiceLanguage}
            onTapAvatar={() => {
              respondWithVoice(
                'जी सर! मैं आपके आदेश का इंतज़ार कर रहा हूँ। वीडियो में क्या बदलाव करना है?'
              );
            }}
          />

          {/* Live Voice Speech Bubble */}
          <div className="p-4 rounded-2xl bg-cyan-950/60 border border-cyan-400/40 shadow-lg flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-cyan-300 font-mono-tech">
              <span className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                JARVIS LIVE CONVERSATION
              </span>
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="text-[10px] text-cyan-300 hover:text-white px-2 py-0.5 rounded bg-cyan-900/60 border border-cyan-400/30"
                >
                  Mute
                </button>
              )}
            </div>

            <p className="text-xs sm:text-sm text-cyan-50 font-sans leading-relaxed min-h-[48px]">
              “{jarvisFeedback}”
            </p>

            {voiceTranscript && isListening && (
              <div className="text-[11px] text-amber-300 font-mono border-t border-cyan-500/20 pt-1.5 truncate">
                Hearing: "{voiceTranscript}"
              </div>
            )}
          </div>

          {/* Voice & Text Command Input Form (Bottom of Right Col) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (textCommandInput.trim()) {
                processVoiceOrTextCommand(textCommandInput.trim());
                setTextCommandInput('');
              }
            }}
            className="flex items-center gap-2"
          >
            {/* Live Continuous Mic Button */}
            <button
              type="button"
              onClick={toggleContinuousVoice}
              className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                isListening
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-pulse'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]'
              }`}
              title={isListening ? 'Stop listening' : 'Start live voice conversation'}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {/* Text input */}
            <input
              type="text"
              value={textCommandInput}
              onChange={(e) => setTextCommandInput(e.target.value)}
              placeholder="बोलिए या टाइप करें: 'काट के 9:16 करो'..."
              className="flex-1 h-12 px-3 rounded-xl bg-slate-900 border border-cyan-500/40 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
            />

            <button
              type="submit"
              className="w-12 h-12 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center flex-shrink-0 transition-all shadow-md active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};

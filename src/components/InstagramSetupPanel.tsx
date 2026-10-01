import React, { useState } from 'react';
import {
  Instagram,
  User,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Shield,
  Lock,
  Eye,
  Copy,
  Check,
  ChevronRight,
  AlertCircle,
  Camera,
  FileText,
  Tag,
  Key,
  HelpCircle,
  Share2,
} from 'lucide-react';
import { executeOpenApp } from '../utils/deviceControls.ts';
import { soundEffects } from '../utils/audioEffects.ts';
import { speakJarvis } from '../utils/speech.ts';

interface InstagramSetupPanelProps {
  initialDisplayName?: string;
  speechVoiceLanguage: 'hi-IN' | 'en-IN' | 'en-US';
}

export const InstagramSetupPanel: React.FC<InstagramSetupPanelProps> = ({
  initialDisplayName = 'Khushi',
  speechVoiceLanguage,
}) => {
  // Step 1: Identity & Username
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [selectedUsername, setSelectedUsername] = useState('khushi_official');
  const [customUsername, setCustomUsername] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Username suggestions generated based on display name
  const cleanBase = displayName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'khushi';
  const usernameSuggestions = [
    `${cleanBase}_official`,
    `${cleanBase}_creator`,
    `${cleanBase}_01`,
    `the_${cleanBase}`,
    `${cleanBase}_vibes`,
  ];

  // Step 2: Terms & Security Confirmation
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [manualCredentialsAcknowledged, setManualCredentialsAcknowledged] = useState(false);
  const [finalConsentConfirmed, setFinalConsentConfirmed] = useState(false);

  // Step 3: Post-Signup Profile Setup Assistant
  const [category, setCategory] = useState('Digital Creator');
  const [bioText, setBioText] = useState(
    `✨ Welcome to my official Instagram\n🌸 Living my dreams\n⚡ Content Creator & Tech Enthusiast\n📩 DM for collaborations`
  );
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);

  const categories = [
    'Digital Creator',
    'Video Creator',
    'Personal Blog',
    'Artist',
    'Entrepreneur',
    'Education',
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    soundEffects.playClick();
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Launch official Instagram Signup
  const handleOpenInstagramSignup = () => {
    soundEffects.playAppLaunch();
    executeOpenApp('instagram_signup');
    speakJarvis(
      'Instagram official signup page khol diya hai, Sir. Username aur display name paste karein. Password aur OTP aapko khud enter karna hai.',
      { lang: speechVoiceLanguage }
    );
  };

  // AI Bio Generator
  const generateNewBio = () => {
    setIsGeneratingBio(true);
    soundEffects.playClick();
    setTimeout(() => {
      const bios = [
        `✨ ${displayName} | Digital Creator\n🌟 Spreading smiles & positivity\n🚀 New reels every day\n📍 Mumbai, India`,
        `👑 ${displayName} Official\n🌸 Dreamer • Believer • Achiever\n🎥 Tech, Lifestyle & Fun\n💌 Inquiries: dm me`,
        `💫 ${displayName} ✨\nCreating moments into memories 🎬\nCheck out my daily stories & videos 👇`,
      ];
      const randomBio = bios[Math.floor(Math.random() * bios.length)];
      setBioText(randomBio);
      setIsGeneratingBio(false);
      soundEffects.playJarvisConfirm();
    }, 400);
  };

  const activeUsername = customUsername.trim() || selectedUsername;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top Gradient Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-950/70 via-purple-950/70 to-slate-900 border border-pink-500/40 glow-arc flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(244,63,94,0.5)]">
            <Instagram className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-orbitron font-extrabold text-base sm:text-lg text-white">
                Instagram Account Setup Assistant
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-950 border border-pink-500/40 text-pink-300 font-mono-tech">
                OFFICIAL SIGNUP • ZERO DATA RETENTION
              </span>
            </div>
            <p className="text-xs text-slate-300 font-sans">
              Voice Directive: <span className="text-pink-300 font-mono-tech">"Jarvis, mere liye Khushi naam se Instagram ID banao"</span>
            </p>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-emerald-500/30 text-emerald-300 text-xs font-mono-tech">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>OTP & Password Private</span>
        </div>
      </div>

      {/* Security & Strict Privacy Shield Rules (User fills password/OTP manually) */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-pink-500/30 text-xs text-slate-300 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-pink-400 font-bold font-mono-tech">
          <Lock className="w-4 h-4" />
          <span>SECURITY & COMPLIANCE PROTOCOL (READ BEFORE PROCEEDING):</span>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] text-slate-300 list-disc list-inside">
          <li>
            <strong className="text-white">Credentials Protection:</strong> Email/Phone, Password, OTP aur CAPTCHA aap khud Instagram page par enter karenge. Jarvis inhe store ya intercept nahi karta.
          </li>
          <li>
            <strong className="text-white">Official App / Web:</strong> Signup official Instagram secure portal par hota hai.
          </li>
          <li>
            <strong className="text-white">Zero Unauthorized Action:</strong> Bina aapki confirmation ke koi account create ya public post publish nahi hoga.
          </li>
        </ul>
      </div>

      {/* Grid: Setup Workflow */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Step 1: Display Name & Username Selection */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-pink-400" />
              <h4 className="font-orbitron font-bold text-xs sm:text-sm text-white">
                1. Display Name & Username Options
              </h4>
            </div>
            <span className="text-[10px] font-mono-tech text-pink-400 bg-pink-950/60 px-2 py-0.5 rounded-full border border-pink-500/30">
              CONFIRMATION REQUIRED
            </span>
          </div>

          {/* Display Name Input */}
          <div>
            <label className="block text-xs font-mono-tech text-slate-300 mb-1">
              Display Name (Full Name)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Khushi"
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-pink-500/30 text-white text-xs sm:text-sm focus:outline-none focus:border-pink-400"
              />
              <button
                onClick={() => handleCopy(displayName)}
                className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-mono-tech flex items-center gap-1"
                title="Copy Name"
              >
                {copiedText === displayName ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            </div>
          </div>

          {/* Suggested Usernames List */}
          <div>
            <label className="block text-xs font-mono-tech text-slate-300 mb-1.5">
              Select Your Preferred Username (Click to select & copy):
            </label>
            <div className="flex flex-col gap-1.5">
              {usernameSuggestions.map((uname) => (
                <div
                  key={uname}
                  onClick={() => {
                    setSelectedUsername(uname);
                    setCustomUsername('');
                    soundEffects.playClick();
                    speakJarvis(`Selected username ${uname}`, { lang: speechVoiceLanguage });
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    activeUsername === uname
                      ? 'bg-pink-950/70 border-pink-400 text-pink-200 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                        activeUsername === uname
                          ? 'border-pink-400 bg-pink-500'
                          : 'border-slate-600'
                      }`}
                    />
                    <span className="font-mono-tech font-bold text-xs">@{uname}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(uname);
                    }}
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-[10px] font-mono-tech text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedText === uname ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedText === uname ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Username Input */}
          <div>
            <label className="block text-[11px] font-mono-tech text-slate-400 mb-1">
              Or type a custom username:
            </label>
            <input
              type="text"
              value={customUsername}
              onChange={(e) => setCustomUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
              placeholder="e.g. khushi_custom"
              className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono-tech text-pink-300 focus:outline-none focus:border-pink-400"
            />
          </div>
        </div>

        {/* Step 2: Terms, Permissions & Official Signup Launch */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h4 className="font-orbitron font-bold text-xs sm:text-sm text-white">
                2. Terms & Official Signup
              </h4>
            </div>
          </div>

          {/* Selected Summary Card */}
          <div className="p-3 rounded-xl bg-slate-950 border border-pink-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-mono-tech uppercase block">
                Target Profile
              </span>
              <span className="font-bold text-white text-sm">{displayName}</span>
              <span className="text-pink-400 font-mono-tech text-xs block">
                @{activeUsername}
              </span>
            </div>
            <button
              onClick={() => handleCopy(`Name: ${displayName}, Username: ${activeUsername}`)}
              className="px-2.5 py-1.5 rounded-lg bg-pink-950 border border-pink-500/40 text-pink-300 hover:text-white text-xs font-mono-tech flex items-center gap-1"
            >
              {copiedText?.includes('Name') ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Both</span>
            </button>
          </div>

          {/* Checkbox Confirmations */}
          <div className="flex flex-col gap-2 mt-1">
            <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={manualCredentialsAcknowledged}
                onChange={(e) => setManualCredentialsAcknowledged(e.target.checked)}
                className="mt-0.5 accent-pink-500 rounded"
              />
              <span>
                Main apna Email/Phone, Password aur OTP/CAPTCHA khud Instagram par securely enter karunga/karungi.
              </span>
            </label>

            <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-0.5 accent-pink-500 rounded"
              />
              <span>
                Maine Instagram Terms of Use & Data Policy ko review aur acknowledge kar liya hai.
              </span>
            </label>

            <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={finalConsentConfirmed}
                onChange={(e) => setFinalConsentConfirmed(e.target.checked)}
                className="mt-0.5 accent-pink-500 rounded"
              />
              <span className="text-emerald-300 font-semibold">
                Yes, main final signup ke liye Instagram official page kholne ki anumati deta/deti hu.
              </span>
            </label>
          </div>

          {/* Launch Official Instagram Button */}
          <button
            onClick={handleOpenInstagramSignup}
            disabled={!manualCredentialsAcknowledged || !agreedTerms || !finalConsentConfirmed}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:from-pink-500 hover:to-amber-500 text-white font-orbitron font-bold text-xs sm:text-sm tracking-wider shadow-[0_0_20px_rgba(244,63,94,0.5)] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Official Instagram Signup</span>
          </button>
        </div>
      </div>

      {/* Step 3: Profile Setup Assistant (Post Signup Kit) */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h4 className="font-orbitron font-bold text-xs sm:text-sm text-white">
              3. Profile Setup Assistant (Bio, Category & Photo Kit)
            </h4>
          </div>
          <button
            onClick={generateNewBio}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-mono-tech flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGeneratingBio ? 'Generating...' : 'Regenerate Bio'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bio Editor */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono-tech text-slate-300 mb-1">
              <span>Ready-To-Paste Bio:</span>
              <button
                onClick={() => handleCopy(bioText)}
                className="text-pink-400 hover:text-pink-300 flex items-center gap-1 font-bold"
              >
                {copiedText === bioText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText === bioText ? 'Copied' : 'Copy Bio'}</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={bioText}
              onChange={(e) => setBioText(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-sans focus:outline-none focus:border-pink-400 leading-relaxed"
            />
          </div>

          {/* Profile Details & Category */}
          <div className="flex flex-col gap-2.5">
            <div>
              <label className="block text-xs font-mono-tech text-slate-300 mb-1">
                Account Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-pink-300 font-mono-tech focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-950 border border-pink-500/40 flex items-center justify-center text-pink-400 flex-shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="font-bold text-white block">Profile Picture Tip:</span>
                <span className="text-[11px] text-slate-400">
                  Phone gallery se direct HD photo chunein aur Instagram profile me upload karein.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

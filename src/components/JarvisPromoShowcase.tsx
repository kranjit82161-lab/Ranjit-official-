import React, { useState } from 'react';
import {
  Sparkles,
  Crown,
  CheckCircle2,
  Zap,
  Star,
  ExternalLink,
  MessageSquare,
  Smartphone,
  Eye,
  X,
  Volume2,
  ShieldCheck,
} from 'lucide-react';

interface JarvisPromoShowcaseProps {
  onExplorePlans?: () => void;
  onStartVoice?: () => void;
}

export const JarvisPromoShowcase: React.FC<JarvisPromoShowcaseProps> = ({
  onExplorePlans,
  onStartVoice,
}) => {
  const [showFullModal, setShowFullModal] = useState(false);

  return (
    <>
      {/* Responsive Promotional Banner Card inside About / Plans */}
      <div className="w-full rounded-2xl overflow-hidden border border-cyan-500/40 bg-gradient-to-b from-slate-900/90 via-slate-950 to-black shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col md:flex-row items-stretch">
        
        {/* Left: Mobile-Responsive Image Preview with Clean Aspect-Ratio */}
        <div className="relative md:w-5/12 bg-slate-950 flex items-center justify-center p-3 sm:p-4 group">
          <div className="relative w-full max-w-[340px] md:max-w-none rounded-xl overflow-hidden border border-cyan-400/30 shadow-2xl bg-black aspect-square flex items-center justify-center">
            <img
              src="/jarvis-promo-banner.jpg"
              alt="Jarvis Your Smart AI Assistant - सोचो मत... बस पूछो!"
              className="w-full h-full object-contain sm:object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {/* Subtle Gradient Glow Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

            {/* Click to Expand Overlay Button */}
            <button
              onClick={() => setShowFullModal(true)}
              className="absolute bottom-2.5 right-2.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-cyan-950 border border-cyan-400/50 text-cyan-300 text-[11px] font-mono-tech flex items-center gap-1.5 shadow-lg backdrop-blur-sm transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Full View</span>
            </button>
          </div>
        </div>

        {/* Right: Promotional Text & Features in matching Hindi / English Branding */}
        <div className="md:w-7/12 p-4 sm:p-6 flex flex-col justify-between gap-4">
          <div>
            {/* Badge & Branding Header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 font-mono-tech font-bold uppercase tracking-wider">
                Official Assistant Edition
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-mono-tech">
                ⭐ Smarter • Faster • Easier
              </span>
            </div>

            <h3 className="font-orbitron font-black text-xl sm:text-2xl text-white tracking-wide flex items-center gap-2">
              <span>Jarvis</span>
              <span className="text-cyan-400 font-light text-base sm:text-lg">Your Smart AI Assistant</span>
            </h3>

            {/* Catchphrase in Hindi */}
            <p className="text-amber-300 font-sans font-semibold text-sm sm:text-base mt-1">
              “सोचो मत... बस पूछो!”
            </p>

            {/* 4 Core Pillars from Poster */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 font-mono-tech">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center flex flex-col items-center">
                <MessageSquare className="w-4 h-4 text-cyan-400 mb-1" />
                <span className="text-[11px] font-bold text-white">Chat करें</span>
                <span className="text-[9px] text-slate-400">तुरंत सवाल-जवाब</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center flex flex-col items-center">
                <Sparkles className="w-4 h-4 text-amber-400 mb-1" />
                <span className="text-[11px] font-bold text-white">Ideas पाएं</span>
                <span className="text-[9px] text-slate-400">क्रिएटिव सोच</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center flex flex-col items-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-1" />
                <span className="text-[11px] font-bold text-white">काम आसान</span>
                <span className="text-[9px] text-slate-400">ऑटोमेशन और टूल्स</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center flex flex-col items-center">
                <Zap className="w-4 h-4 text-purple-400 mb-1" />
                <span className="text-[11px] font-bold text-white">24/7 एक्टिव</span>
                <span className="text-[9px] text-slate-400">हर समय आपके साथ</span>
              </div>
            </div>

            {/* Feature Bullets in Hindi */}
            <div className="mt-4 space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span><strong>आवाज़ से भी चलाएं Jarvis:</strong> बोलिए... और Jarvis आपकी मदद करेगा (हिंदी, भोजपुरी, Hinglish)।</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span><strong>Pro & Creator Plans:</strong> CapCut 9:16 Shorts, Daily YouTube Posting और Smart Automation।</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <img
                src="/jarvis-mascot.jpg"
                alt="Jarvis Mascot"
                className="w-7 h-7 rounded-full border border-cyan-400 shadow-md object-cover"
              />
              <span className="text-xs font-mono-tech text-slate-400">
                Official AI Assistant Core
              </span>
            </div>

            <div className="flex items-center gap-2">
              {onStartVoice && (
                <button
                  onClick={onStartVoice}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-400 text-cyan-300 text-xs font-mono-tech flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Start Voice</span>
                </button>
              )}

              {onExplorePlans && (
                <button
                  onClick={onExplorePlans}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-orbitron font-extrabold text-xs tracking-wider shadow-md flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>View Plans (₹0 - ₹500)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full Resolution Modal when user clicks to inspect poster */}
      {showFullModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-2xl w-full max-h-[90vh] bg-slate-950 border border-cyan-500/50 rounded-2xl overflow-hidden flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.4)]">
            
            {/* Modal Header */}
            <div className="p-3 sm:p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src="/jarvis-mascot.jpg"
                  alt="Jarvis Mascot"
                  className="w-6 h-6 rounded-full border border-cyan-400"
                />
                <span className="font-orbitron font-bold text-xs sm:text-sm text-white">
                  Jarvis - Official Promotional Showcase
                </span>
              </div>
              <button
                onClick={() => setShowFullModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Image Display with natural aspect ratio */}
            <div className="flex-1 overflow-auto p-2 sm:p-4 flex items-center justify-center bg-black">
              <img
                src="/jarvis-promo-banner.jpg"
                alt="Jarvis Promotional Poster Full View"
                className="max-h-[75vh] w-auto object-contain rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

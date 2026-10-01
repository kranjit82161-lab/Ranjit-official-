import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Phone,
  Video,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  Globe,
  Share2,
  Smile,
  Zap,
} from 'lucide-react';
import { soundEffects } from '../utils/audioEffects.ts';
import { speakJarvis } from '../utils/speech.ts';
import { executeWhatsAppMessage, executeSms, executePhoneCall } from '../utils/deviceControls.ts';

interface MessageSupportPanelProps {
  speechVoiceLanguage: 'hi-IN' | 'en-IN' | 'en-US';
  onTriggerVoiceQuery?: (query: string) => void;
}

interface SmartMessageTemplate {
  category: string;
  hindi: string;
  english: string;
  bhojpuri: string;
}

export const MessageSupportPanel: React.FC<MessageSupportPanelProps> = ({
  speechVoiceLanguage,
  onTriggerVoiceQuery,
}) => {
  const [recipientNumber, setRecipientNumber] = useState('+919876543210');
  const [recipientName, setRecipientName] = useState('Papa');
  const [messageText, setMessageText] = useState('नमस्ते! मैं थोड़ा व्यस्त हूँ, 10 मिनट में कॉल करता हूँ।');
  const [platform, setPlatform] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const smartTemplates: SmartMessageTemplate[] = [
    {
      category: 'Busy / Call Later',
      hindi: 'नमस्ते! मैं अभी मीटिंग में हूँ, थोड़ी देर में आपसे बात करता हूँ।',
      english: 'Hello! I am currently in a meeting, will call you back shortly.',
      bhojpuri: 'प्रणाम! हम अभी मीटिंग में बानी, तनी देर में रउरा के कॉल करब।',
    },
    {
      category: 'Reach Home Safe',
      hindi: 'मैं सही-सलामत घर पहुँच गया हूँ। आप चिंता न करें।',
      english: 'I have reached home safely. Please do not worry.',
      bhojpuri: 'हम ठीक-ठाक घरे पहुंच गईनी। चिंता मत करीं।',
    },
    {
      category: 'YouTube Video Uploaded',
      hindi: '🔥 नया वीडियो YouTube पर आ चुका है! अभी देखिए और लाइक कीजिए।',
      english: '🔥 New video is now live on YouTube! Check it out and like.',
      bhojpuri: '🔥 नया वीडियो YouTube पर आ गईल बा! अभी देखीं आ लाइक करीं।',
    },
    {
      category: 'Emergency / Urgent',
      hindi: 'जरूरी काम है! कृपया देखते ही मुझे तुरंत कॉल करें।',
      english: 'Urgent matter! Please call me back as soon as you see this.',
      bhojpuri: 'बड़ा जरूरी काम बा! ई देखतें तुरंते फोन करीं।',
    },
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    soundEffects.playClick();
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSend = () => {
    soundEffects.playAppLaunch();
    if (platform === 'whatsapp') {
      executeWhatsAppMessage(recipientNumber, messageText);
      speakJarvis(`${recipientName} को WhatsApp मैसेज भेजा जा रहा है।`, {
        lang: speechVoiceLanguage,
      });
    } else {
      executeSms(recipientNumber, messageText);
      speakJarvis(`${recipientName} को SMS भेजा जा रहा है।`, {
        lang: speechVoiceLanguage,
      });
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 animate-fade-in">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-cyan-950/80 border border-emerald-500/50 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]">
            <MessageSquare className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-orbitron font-extrabold text-base sm:text-lg text-white">
                💬 AI Message & Dispatch Support
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-400 text-emerald-300 font-mono-tech">
                VOICE DIRECTED
              </span>
            </div>
            <p className="text-xs text-slate-300 font-sans mt-0.5">
              WhatsApp & SMS पर तुरंत मैसेज तैयार करें, AI टेम्पलेट्स चुनें या आवाज़ से सीधे भेजें।
            </p>
          </div>
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950/90 p-1.5 rounded-xl border border-emerald-500/40 text-xs font-mono-tech self-start sm:self-auto">
          <button
            onClick={() => {
              setPlatform('whatsapp');
              soundEffects.playClick();
            }}
            className={`px-3 py-1 rounded-lg transition-all ${
              platform === 'whatsapp'
                ? 'bg-emerald-600 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            WhatsApp
          </button>
          <button
            onClick={() => {
              setPlatform('sms');
              soundEffects.playClick();
            }}
            className={`px-3 py-1 rounded-lg transition-all ${
              platform === 'sms'
                ? 'bg-cyan-600 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Direct SMS
          </button>
        </div>
      </div>

      {/* Main Composer Card */}
      <div className="rounded-2xl bg-slate-900/90 border border-emerald-500/30 p-4 sm:p-5 shadow-xl flex flex-col gap-4">
        {/* Recipient Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-mono-tech text-slate-400 block mb-1">
              प्राप्तकर्ता (Name):
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-400 font-sans"
              placeholder="उदा. Papa, Mummy, Rahul"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono-tech text-slate-400 block mb-1">
              फ़ोन नंबर (Phone):
            </label>
            <input
              type="text"
              value={recipientNumber}
              onChange={(e) => setRecipientNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-400 font-mono"
              placeholder="+91..."
            />
          </div>
        </div>

        {/* Message Input Box */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-mono-tech text-slate-400">
              संदेश (Message Text):
            </label>
            <span className="text-[10px] text-slate-500 font-mono">
              {messageText.length} characters
            </span>
          </div>
          <textarea
            rows={3}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-400 font-sans leading-relaxed"
            placeholder="मैसेज टाइप करें या नीचे दिए गए AI टेम्पलेट में से चुनें..."
          />
        </div>

        {/* Dispatch Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="text-[11px] text-slate-400 font-mono-tech">
            Jarvis वॉइस कमांड: <span className="text-emerald-300 font-bold">"{recipientName} ko WhatsApp message bhejo"</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(messageText)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono-tech flex items-center gap-1.5 transition-all"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedText ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleSend}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-orbitron font-bold text-xs tracking-wider flex items-center gap-2 shadow-lg active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{platform === 'whatsapp' ? 'Send WhatsApp' : 'Send SMS'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Smart Message Templates */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 sm:p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono-tech text-slate-300">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="font-bold uppercase tracking-wider">
              AI Smart Templates (1-Click Fill)
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono-tech">
            Hindi • Bhojpuri • English
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {smartTemplates.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between gap-2.5 group"
            >
              <div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-300 font-mono-tech font-bold uppercase inline-block mb-1.5">
                  {item.category}
                </span>
                <p className="text-xs text-slate-200 font-sans leading-relaxed">
                  "{item.hindi}"
                </p>
                <p className="text-[11px] text-cyan-300/80 font-sans mt-1 italic">
                  🗣️ भोजपुरी: "{item.bhojpuri}"
                </p>
              </div>

              <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-900">
                <button
                  onClick={() => {
                    setMessageText(item.bhojpuri);
                    soundEffects.playClick();
                  }}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-[10px] font-mono-tech text-cyan-300"
                >
                  Bhojpuri Use
                </button>
                <button
                  onClick={() => {
                    setMessageText(item.hindi);
                    soundEffects.playClick();
                  }}
                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-mono-tech font-bold"
                >
                  Hindi Use
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

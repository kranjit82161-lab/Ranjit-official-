import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Terminal,
  Cpu,
  Smartphone,
  ShieldCheck,
  Download,
  ExternalLink,
} from 'lucide-react';

interface AndroidBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidBridgeModal: React.FC<AndroidBridgeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedScript, setCopiedScript] = useState(false);
  const [activeTab, setActiveTab] = useState<'pwa' | 'termux' | 'tasker'>('pwa');

  if (!isOpen) return null;

  const termuxScript = `#!/data/data/com.termux/files/usr/bin/bash
# ========================================================
# JARVIS Android Background Automation Bridge
# Run this inside Termux app on your Android phone!
# ========================================================

pkg update -y && pkg install python termux-api -y
pip install flask

cat << 'EOF' > jarvis_server.py
from flask import Flask, request, jsonify
import subprocess

app = Flask(__name__)

@app.route('/action', methods=['POST'])
def handle_action():
    data = request.json or {}
    cmd_type = data.get('type')
    payload = data.get('payload', {})
    
    if cmd_type == 'CALL':
        phone = payload.get('phoneNumber', '')
        subprocess.run(['termux-telephony-call', phone])
    elif cmd_type == 'TORCH':
        state = payload.get('state', 'on')
        subprocess.run(['termux-torch', state])
    elif cmd_type == 'VOLUME':
        vol = payload.get('volume', '10')
        subprocess.run(['termux-volume', 'music', str(vol)])
    elif cmd_type == 'SMS':
        phone = payload.get('phoneNumber', '')
        msg = payload.get('message', '')
        subprocess.run(['termux-sms-send', '-n', phone, msg])
        
    return jsonify({"status": "SUCCESS", "executed": cmd_type})

if __name__ == '__main__':
    print("[JARVIS] Android Bridge listening on http://localhost:8080")
    app.run(host='0.0.0.0', port=8080)
EOF

python jarvis_server.py
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(termuxScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-cyan-500/50 rounded-2xl shadow-2xl p-4 sm:p-6 glow-cyan">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-400/40 text-cyan-300">
              <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-base sm:text-lg text-white">
                JARVIS Android Phone Control Guide
              </h3>
              <p className="text-xs text-cyan-400 font-mono-tech">
                Seamless Mobile Integration (PWA, Intents & Termux Bridge)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech transition-all flex items-center gap-1.5 ${
              activeTab === 'pwa'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            1. Install as Android App (Zero Setup)
          </button>
          <button
            onClick={() => setActiveTab('termux')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech transition-all flex items-center gap-1.5 ${
              activeTab === 'termux'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4" />
            2. Termux Super-Bridge (Full OS Access)
          </button>
          <button
            onClick={() => setActiveTab('tasker')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech transition-all flex items-center gap-1.5 ${
              activeTab === 'tasker'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            3. Tasker / MacroDroid
          </button>
        </div>

        {/* Tab 1: PWA Install */}
        {activeTab === 'pwa' && (
          <div className="flex flex-col gap-3 text-sm text-slate-200">
            <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30">
              <h4 className="font-orbitron font-bold text-cyan-300 text-sm mb-1">
                ⭐ Fastest & Most Seamless Way (Hindi / English)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Aapko koi extra app install karne ki zaroorat nahi hai! Ye web app already
                direct Android system intents ke sath configured hai:
              </p>
            </div>

            <ol className="list-decimal pl-5 space-y-2 text-xs text-slate-300">
              <li>
                <strong className="text-white">Install on Home Screen:</strong> Chrome browser me 3 dots menu (<span className="text-cyan-300">⋮</span>) par tap karein aur <strong className="text-cyan-300">"Add to Home Screen"</strong> ya <strong className="text-cyan-300">"Install App"</strong> select karein.
              </li>
              <li>
                <strong className="text-white">Direct Calling:</strong> Bolen <em>"Papa ko call karo"</em> - Jarvis turant aapke phone ke default phone dialer me call laga dega.
              </li>
              <li>
                <strong className="text-white">WhatsApp & SMS:</strong> Bolen <em>"Rahul ko WhatsApp bhejo"</em> - direct WhatsApp chat khul jayega typed message ke sath.
              </li>
              <li>
                <strong className="text-white">Apps & Flashlight:</strong> Bolen <em>"YouTube kholo"</em> ya <em>"Torch On karo"</em> - real camera flash aur apps trigger honge!
              </li>
            </ol>
          </div>
        )}

        {/* Tab 2: Termux Bridge */}
        {activeTab === 'termux' && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-slate-300">
              Agar aap chahte hain ki Jarvis bina kisi confirmation prompt ke
              background me silent calls kare, WiFi/Bluetooth toggle kare aur
              pura Android phone control kare, to Termux companion server run karein:
            </p>

            <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-3 font-mono-tech text-xs text-cyan-300 overflow-x-auto max-h-56">
              <button
                onClick={copyToClipboard}
                className="absolute top-2 right-2 px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow-md transition-all active:scale-95"
              >
                {copiedScript ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Script
                  </>
                )}
              </button>
              <pre>{termuxScript}</pre>
            </div>

            <div className="text-[11px] text-slate-400 font-sans space-y-1">
              <p><strong>Step 1:</strong> F-Droid ya GitHub se <em>Termux</em> aur <em>Termux:API</em> install karein.</p>
              <p><strong>Step 2:</strong> Upar diya gaya script Termux terminal me paste karke Enter dabayein.</p>
              <p><strong>Step 3:</strong> Jarvis ab aapke phone par complete silent background access rakhega!</p>
            </div>
          </div>
        )}

        {/* Tab 3: Tasker / MacroDroid */}
        {activeTab === 'tasker' && (
          <div className="flex flex-col gap-3 text-xs text-slate-300">
            <p>
              Aap <strong>MacroDroid</strong> (Play Store) ya <strong>Tasker</strong> ke
              WebHook feature ka use karke bhi Jarvis ke commands ko Android hardware
              settings (e.g. WiFi On/Off, Mobile Data, Airplane Mode, Silent Mode)
              se link kar sakte hain:
            </p>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono-tech text-cyan-400">
              Trigger URL: https://trigger.macrodroid.com/YOUR_DEVICE_ID/jarvis_action
            </div>
            <p className="text-[11px] text-slate-400">
              Jarvis webhook payloads ko instantly send kar sakta hai, jisse aapke
              MacroDroid triggers hardware settings ko turn on/off kar denge!
            </p>
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-orbitron font-bold text-xs transition-all shadow-md"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};

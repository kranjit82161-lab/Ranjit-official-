import React, { useState } from 'react';
import {
  ShieldCheck,
  Terminal,
  Lock,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Smartphone,
  EyeOff,
  Cpu,
  Fingerprint,
  Radio,
  FileCode2,
} from 'lucide-react';
import { soundEffects } from '../utils/audioEffects.ts';
import { speakJarvis } from '../utils/speech.ts';

interface GoogleGuidePanelProps {
  speechVoiceLanguage: 'hi-IN' | 'en-IN' | 'en-US';
  initialTask?: string;
  onClose?: () => void;
}

export type GoogleTaskId = 'create_account' | 'manage_security' | 'recover_account' | 'privacy_checkup';

interface StepDetail {
  stepNumber: number;
  titleHindi: string;
  titleEnglish: string;
  commandSnippet: string;
  instructionHindi: string;
  instructionBhojpuri: string;
  actionButtonLabel: string;
  targetUrl: string;
  highlightButtonHint: string;
  inputFieldsHint: string[];
  securityNote: string;
}

export const GoogleGuidePanel: React.FC<GoogleGuidePanelProps> = ({
  speechVoiceLanguage,
  initialTask = 'create_account',
  onClose,
}) => {
  const [selectedTask, setSelectedTask] = useState<GoogleTaskId>('create_account');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Guide Steps definition for Google Tasks with Cybersecurity / Security-Dashboard style
  const taskGuides: Record<GoogleTaskId, { title: string; protocolCode: string; desc: string; steps: StepDetail[] }> = {
    create_account: {
      title: 'Google ID Creation Protocol',
      protocolCode: 'AUTH_INIT_V4',
      desc: 'Authorized User Provisioning Pipeline & Official Google Sign-up Guidance',
      steps: [
        {
          stepNumber: 1,
          titleHindi: '1. बुनियादी पहचान (First & Last Name)',
          titleEnglish: 'Identity Verification: First & Last Name',
          commandSnippet: 'sec-client --provision=user --mode=personal_use',
          instructionHindi: 'Google के आधिकारिक "Create Account" पेज पर जाएं। "For my personal use" चुनें और अपना First Name और Last Name दर्ज करें।',
          instructionBhojpuri: 'पहिले आधिकारिक Google पन्ना खोलीं। ओहिजा "For my personal use" चुनीं आ आपन नाम दर्ज करीं।',
          actionButtonLabel: 'EXECUTE: Open accounts.google.com/signup',
          targetUrl: 'https://accounts.google.com/signup',
          highlightButtonHint: 'स्क्रीन पर खोजें: नीले रंग का "Next" / "आगे बढ़ें" बटन',
          inputFieldsHint: ['First Name (पहला नाम)', 'Last Name (उपनाम - ऐच्छिक)'],
          securityNote: '🛡️ STRICT LEGAL COMPLIANCE: AI डमी या नकली पहचान नहीं बनाता; सभी विवरण केवल अधिकृत यूज़र के हैं।',
        },
        {
          stepNumber: 2,
          titleHindi: '2. जन्मतिथि और लिंग सत्यापन (DOB & Gender)',
          titleEnglish: 'Age & Compliance Validation',
          commandSnippet: 'audit-log --check-age-compliance --region=IN',
          instructionHindi: 'अपनी जन्मतिथि (दिन, महीना, साल) और लिंग (Gender) चुनें। यह उम्र की कानूनी पुष्टि और अकाउंट रिकवरी के लिए आवश्यक है।',
          instructionBhojpuri: 'आपन जनम तिथि (तारीख, महीना, साल) आ लिंग चुनीं। ई कानूनी सुरक्षा खातिर जरूरी बा।',
          actionButtonLabel: 'NAVIGATE: Google Compliance Step',
          targetUrl: 'https://accounts.google.com/signup',
          highlightButtonHint: '"Next" बटन दबाकर अगले सुरक्षा चरण पर जाएं',
          inputFieldsHint: ['Day (दिन)', 'Month (महीना)', 'Year (साल)', 'Gender (लिंग)'],
          securityNote: '🔐 END-TO-END TLS ENCRYPTED: यह डेटा सीधे Google के सुरक्षित HTTPS सर्वर पर प्रेषित होता है।',
        },
        {
          stepNumber: 3,
          titleHindi: '3. नया Gmail पता चयन (Unique Handle)',
          titleEnglish: 'Unique Handle Allocation',
          commandSnippet: 'dns-check --verify-availability --domain=gmail.com',
          instructionHindi: 'सुझाए गए ईमेल में से चुनें या "Create your own Gmail address" चुनकर अपनी पसंद का यूजरनेम लिखें (उदा. ranjit.kumar8216@gmail.com)।',
          instructionBhojpuri: 'आपन पसंद के यूनिक Gmail आईडी लिखीं, जइसे rahul.official@gmail.com।',
          actionButtonLabel: 'INSPECT: Gmail Handle Selection',
          targetUrl: 'https://accounts.google.com/signup',
          highlightButtonHint: 'यूनिक यूजरनेम चुनकर "Next" बटन दबाएं',
          inputFieldsHint: ['Username (जैसे: ranjit.kumar8216)'],
          securityNote: '⚠️ यूनिक नाम चुनें। पहले से बुक होने पर Google विकल्प सुझाएगा।',
        },
        {
          stepNumber: 4,
          titleHindi: '4. क्रिप्टोग्राफिक पासवर्ड निर्माण (स्वयं दर्ज करें 🔒)',
          titleEnglish: 'User-Only High-Entropy Password Generation',
          commandSnippet: 'crypto-shield --enforce-zero-knowledge-rule',
          instructionHindi: '⚠️ सख्त सुरक्षा नियम: पासवर्ड आप स्वयं डालें। इसमें अक्षर (Letters), संख्याएं (Numbers) और सिंबल (@, #, $) मिलाकर कम से कम 8 अक्षर का बनाएं।',
          instructionBhojpuri: '⚠️ पासवर्ड रउआ खुद डालीं। AI या केहू दोसर के मत बताईं। मजबूत पासवर्ड बनाईं।',
          actionButtonLabel: 'SECURE: Open Official Password Prompt',
          targetUrl: 'https://accounts.google.com/signup',
          highlightButtonHint: 'पासवर्ड 2 बार स्वयं दर्ज करके "Next" दबाएं',
          inputFieldsHint: ['Password (गोपनीय)', 'Confirm Password (दोबारा)'],
          securityNote: '🛡️ ZERO-CREDENTIAL CHARTER: Jarvis पासवर्ड कभी नहीं मांगता, न देखता है और न स्टोर करता है।',
        },
        {
          stepNumber: 5,
          titleHindi: '5. टू-फैक्टर मोबाइल OTP सत्यापन (स्वयं भरें)',
          titleEnglish: 'Out-of-Band 2FA OTP Authentication',
          commandSnippet: '2fa-verify --channel=sms_otp --status=pending_user_input',
          instructionHindi: 'Google आपके फोन पर SMS के जरिए 6-अंकों का G-कोड (OTP) भेजेगा। कोड को स्वयं स्क्रीन पर डालें। इसे किसी से साझा न करें।',
          instructionBhojpuri: 'Google रउरा मोबाइल पर 6 अंक के OTP भेजि। ओकरा के खुद स्क्रीन पर दर्ज करीं।',
          actionButtonLabel: 'VERIFY: Google 2FA Screen',
          targetUrl: 'https://accounts.google.com/signup',
          highlightButtonHint: 'SMS से आया 6-अंकीय कोड दर्ज करके "Verify" दबाएं',
          inputFieldsHint: ['Mobile Number', 'Enter 6-digit Code (G-XXXXXX)'],
          securityNote: '🔒 ANTI-PHISHING: OTP किसी को भी फोन, मैसेज या चैट में न बताएं। केवल Google स्क्रीन पर भरें।',
        },
        {
          stepNumber: 6,
          titleHindi: '6. कानूनी सेवा शर्तें और अकाउंट एक्टिवेशन',
          titleEnglish: 'Terms Acceptance & Final Authorization',
          commandSnippet: 'auth-complete --session=authorized --audit=passed',
          instructionHindi: 'Privacy & Terms पेज को स्क्रॉल करके "I agree" / "मैं सहमत हूँ" बटन दबाएं। आपका नया Google ID सफलतापूर्वक सक्रिय हो जाएगा!',
          instructionBhojpuri: 'नीचे जाके "I agree" बटन दबाईं। रउरा Google आईडी सफलता से बन जाई!',
          actionButtonLabel: 'ACCESS: Google Account Dashboard',
          targetUrl: 'https://myaccount.google.com/',
          highlightButtonHint: 'नीले रंग का "I agree" बटन दबाएं',
          inputFieldsHint: ['I Agree (सहमति)'],
          securityNote: '✅ वैध और अधिकृत Google ID सफलतापूर्वक तैयार है।',
        },
      ],
    },
    manage_security: {
      title: 'Google 2-Step Security Hardening',
      protocolCode: 'SEC_HARDEN_M2',
      desc: 'Multi-Factor Defense, Session Monitoring & Authorized Device Control',
      steps: [
        {
          stepNumber: 1,
          titleHindi: '1. Google Security Audit Hub',
          titleEnglish: 'Security Baseline Inspection',
          commandSnippet: 'sec-audit --scan=active-sessions --target=google_account',
          instructionHindi: 'अपने Google खाते की सुरक्षा सेटिंग्स देखने के लिए "Google Security" पेज खोलें। यहाँ आपके सभी सक्रिय डिवाइसेस दिखेंगे।',
          instructionBhojpuri: 'Google सुरक्षा पन्ना खोलीं आ सक्रिय डिवाइसेस जांचीं।',
          actionButtonLabel: 'OPEN: Security Console',
          targetUrl: 'https://myaccount.google.com/security',
          highlightButtonHint: '"2-Step Verification" विकल्प पर क्लिक करें',
          inputFieldsHint: ['Security Overview'],
          securityNote: 'यह डैशबोर्ड अनधिकृत लॉगिन रोकने के लिए वास्तविक समय में चेतावनी देता है।',
        },
        {
          stepNumber: 2,
          titleHindi: '2. टू-स्टेप वेरिफिकेशन (2FA Defense)',
          titleEnglish: '2FA Activation Protocol',
          commandSnippet: 'enforce-mfa --policy=strict --device-prompt=enabled',
          instructionHindi: '"Turn on 2-Step Verification" चुनें। अपना फोन नंबर जोड़ें ताकि हर नए लॉगिन पर आपके पास अलर्ट और कोड आए।',
          instructionBhojpuri: '2-Step Verification चालू करीं। पासवर्ड लीक होने पर भी कोई हैक नहीं कर सकेगा।',
          actionButtonLabel: 'ACTIVATE: 2-Step Verification',
          targetUrl: 'https://myaccount.google.com/signinoptions/two-step-verification',
          highlightButtonHint: '"Get Started" पर क्लिक करें और फोन जोड़ें',
          inputFieldsHint: ['Phone prompt / Authenticator App'],
          securityNote: '🛡️ DEFENSE-IN-DEPTH: 99.9% स्वचालित अकाउंट टेकओवर हमलों को रोकता है।',
        },
      ],
    },
    recover_account: {
      title: 'Authorized Account Recovery Protocol',
      protocolCode: 'RECOVERY_SYS_R1',
      desc: 'Official Google Recovery for Forgotten Passwords and Authorized Restoration',
      steps: [
        {
          stepNumber: 1,
          titleHindi: '1. आधिकारिक रिकवरी गेटवे खोलें',
          titleEnglish: 'Official Recovery Gateway',
          commandSnippet: 'recovery-handshake --target=accounts.google.com/recovery',
          instructionHindi: 'Google के आधिकारिक अकाउंट रिकवरी पेज पर अपना पंजीकृत ईमेल या फोन नंबर डालें और "Next" दबाएं।',
          instructionBhojpuri: 'Google रिकवरी पन्ना पर आपन ईमेल आईडी या फोन नंबर दर्ज करीं।',
          actionButtonLabel: 'LAUNCH: Official Recovery Portal',
          targetUrl: 'https://accounts.google.com/signin/recovery',
          highlightButtonHint: 'ईमेल भरकर "Next" बटन दबाएं',
          inputFieldsHint: ['Email or Phone Number'],
          securityNote: '⚠️ ANTI-FRAUD WARNING: केवल accounts.google.com पर ही रिकवरी करें। किसी अन्य लिंक पर नहीं।',
        },
        {
          stepNumber: 2,
          titleHindi: '2. सुरक्षित बैकअप डिवाइस पर OTP सत्यापन',
          titleEnglish: 'Verified Ownership Challenge',
          commandSnippet: 'challenge-response --factor=registered_sms --verify=user_direct',
          instructionHindi: 'Google आपके लिंक किए गए फोन या बैकअप ईमेल पर कोड भेजेगा। उसे दर्ज करें और नया सुरक्षित पासवर्ड बनाएं।',
          instructionBhojpuri: 'फोन पर आइल कोड दर्ज करके नया पासवर्ड बनाईं।',
          actionButtonLabel: 'SUBMIT: Complete Recovery Verification',
          targetUrl: 'https://accounts.google.com/signin/recovery',
          highlightButtonHint: 'OTP डालने के बाद "Create New Password" चुनें',
          inputFieldsHint: ['Recovery Code (स्वयं दर्ज करें)'],
          securityNote: '🔒 नया पासवर्ड कम से कम 10 अक्षरों का बनाएं और किसी से शेयर न करें।',
        },
      ],
    },
    privacy_checkup: {
      title: 'Privacy & Telemetry Telemetry Guard',
      protocolCode: 'PRIVACY_SHIELD_P0',
      desc: 'Data Retention Control, YouTube History & Web Activity Privacy Audit',
      steps: [
        {
          stepNumber: 1,
          titleHindi: '1. Privacy Checkup शुरू करें',
          titleEnglish: 'Data Governance Audit',
          commandSnippet: 'privacy-audit --inspect=retention_policy --service=google',
          instructionHindi: 'देखें कि Google आपके कौन से डेटा को सुरक्षित रखता है। Web & App Activity और YouTube History की समीक्षा करें।',
          instructionBhojpuri: 'आपन प्राइवेसी चेकअप खोलीं आ सेटिंग्स देख लीं।',
          actionButtonLabel: 'INSPECT: Privacy Checkup Tool',
          targetUrl: 'https://myaccount.google.com/privacycheckup',
          highlightButtonHint: '"Start Now" दबाएं और ऑटो-डिलीट सेट करें',
          inputFieldsHint: ['Privacy Preferences'],
          securityNote: '🛡️ डेटा को 3 महीने या 18 महीने बाद ऑटो-डिलीट करने का विकल्प चुनें।',
        },
      ],
    },
  };

  const currentTask = taskGuides[selectedTask];
  const currentStep = currentTask.steps[currentStepIndex] || currentTask.steps[0];

  const handleNextStep = () => {
    if (currentStepIndex < currentTask.steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      const nextStep = currentTask.steps[nextIdx];
      soundEffects.playClick();
      speakJarvis(`अगला कदम: ${nextStep.titleHindi}। ${nextStep.instructionHindi}`, {
        lang: speechVoiceLanguage,
      });
    } else {
      speakJarvis('मालिक, सभी चरण पूरे हो चुके हैं। सुरक्षा प्रक्रिया सफलतापूर्वक समाप्त!', {
        lang: speechVoiceLanguage,
      });
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      soundEffects.playClick();
    }
  };

  const handleOpenGooglePage = (url: string) => {
    soundEffects.playAppLaunch();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSpeakCurrentStep = () => {
    speakJarvis(
      `कदम संख्या ${currentStep.stepNumber}: ${currentStep.titleHindi}। ${currentStep.instructionHindi}। स्क्रीन पर ध्यान दें: ${currentStep.highlightButtonHint}।`,
      { lang: speechVoiceLanguage }
    );
  };

  return (
    <div className="w-full flex flex-col gap-4 animate-fade-in font-mono-tech select-none">
      {/* Cybersecurity / Hacker Terminal Top Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-black/90 border border-green-500/60 shadow-[0_0_25px_rgba(34,197,94,0.25)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden">
        {/* Terminal Scanline Background */}
        <div className="absolute inset-0 bg-cyber-circuit opacity-40 pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-slate-950 border border-green-400/80 flex items-center justify-center text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.5)]">
            <Terminal className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-orbitron font-extrabold text-base sm:text-lg text-green-300 tracking-wider flex items-center gap-1.5">
                <span>SEC-OPS</span>
                <span className="text-white text-xs px-1.5 py-0.5 rounded bg-green-950/80 border border-green-500/50">
                  LEGAL & DEFENSE ONLY
                </span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 border border-green-500 text-green-400 font-mono-tech">
                PROTOCOL: {currentTask.protocolCode}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-sans mt-0.5">
              Google ID निर्माण, सुरक्षा दृढ़ीकरण और स्क्रीन नेविगेशन गाइड (100% अधिकृत व कानूनी मार्गदर्शन)।
            </p>
          </div>
        </div>

        {/* Terminal Voice Listen Trigger */}
        <button
          onClick={handleSpeakCurrentStep}
          className="relative z-10 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-green-950 border border-green-400/80 text-green-300 text-xs font-mono-tech flex items-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.3)] self-start sm:self-auto transition-all active:scale-95"
        >
          <Volume2 className="w-4 h-4 text-green-400 animate-pulse" />
          <span>VOICE GUIDE (आवाज़ में सुनें)</span>
        </button>
      </div>

      {/* Strict Legal Policy & Zero-Hacking Charter Banner */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-green-500/40 flex items-start gap-3 text-xs text-slate-300 shadow-md">
        <Lock className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 font-sans">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-green-400 font-mono-tech tracking-wider uppercase text-xs">
              🛡️ CYBERSECURITY COMPLIANCE & ZERO-EXPLOIT POLICY:
            </span>
            <span className="px-1.5 py-0.2 rounded bg-green-950 border border-green-500/40 text-[9px] text-green-300 font-mono-tech">
              STRICTLY AUTHORIZED
            </span>
          </div>
          <p className="text-[11px] text-slate-300/90 leading-relaxed font-sans">
            यह ऐप केवल <strong>अधिकृत, वैध और सुरक्षा-मार्गदर्शन</strong> के लिए है। इसमें कोई अनधिकृत एक्सेस, पासवर्ड चोरी, हैकिंग या किसी अन्य के खाते में दखल देने वाला फीचर नहीं है। पासवर्ड और OTP आप सीधे Google के आधिकारिक पोर्टल पर स्वयं भरते हैं।
          </p>
        </div>
      </div>

      {/* Cyber Security Module Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono-tech text-xs">
        <button
          onClick={() => {
            setSelectedTask('create_account');
            setCurrentStepIndex(0);
            soundEffects.playClick();
          }}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedTask === 'create_account'
              ? 'bg-slate-950 border-green-400 text-green-300 shadow-[0_0_20px_rgba(34,197,94,0.4)]'
              : 'bg-black/80 border-slate-800 text-slate-400 hover:border-green-500/40 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
            <span>MOD_01</span>
            <Fingerprint className="w-3.5 h-3.5 text-green-400" />
          </div>
          <span className="font-bold block text-sm">नया ID बनाएं</span>
          <span className="text-[10px] text-slate-400">Google User Provisioning</span>
        </button>

        <button
          onClick={() => {
            setSelectedTask('manage_security');
            setCurrentStepIndex(0);
            soundEffects.playClick();
          }}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedTask === 'manage_security'
              ? 'bg-slate-950 border-green-400 text-green-300 shadow-[0_0_20px_rgba(34,197,94,0.4)]'
              : 'bg-black/80 border-slate-800 text-slate-400 hover:border-green-500/40 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
            <span>MOD_02</span>
            <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
          </div>
          <span className="font-bold block text-sm">2-Step Security</span>
          <span className="text-[10px] text-slate-400">MFA & Account Defense</span>
        </button>

        <button
          onClick={() => {
            setSelectedTask('recover_account');
            setCurrentStepIndex(0);
            soundEffects.playClick();
          }}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedTask === 'recover_account'
              ? 'bg-slate-950 border-green-400 text-green-300 shadow-[0_0_20px_rgba(34,197,94,0.4)]'
              : 'bg-black/80 border-slate-800 text-slate-400 hover:border-green-500/40 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
            <span>MOD_03</span>
            <Cpu className="w-3.5 h-3.5 text-green-400" />
          </div>
          <span className="font-bold block text-sm">पासवर्ड रिकवरी</span>
          <span className="text-[10px] text-slate-400">Authorized Recovery</span>
        </button>

        <button
          onClick={() => {
            setSelectedTask('privacy_checkup');
            setCurrentStepIndex(0);
            soundEffects.playClick();
          }}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedTask === 'privacy_checkup'
              ? 'bg-slate-950 border-green-400 text-green-300 shadow-[0_0_20px_rgba(34,197,94,0.4)]'
              : 'bg-black/80 border-slate-800 text-slate-400 hover:border-green-500/40 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
            <span>MOD_04</span>
            <Radio className="w-3.5 h-3.5 text-green-400" />
          </div>
          <span className="font-bold block text-sm">Privacy Audit</span>
          <span className="text-[10px] text-slate-400">Data Telemetry Guard</span>
        </button>
      </div>

      {/* Terminal Workstation / Security Dashboard Card */}
      <div className="rounded-2xl bg-black border border-green-500/50 shadow-[0_0_35px_rgba(34,197,94,0.18)] overflow-hidden flex flex-col">
        {/* Terminal Title Bar */}
        <div className="terminal-header px-4 py-2.5 flex items-center justify-between border-b border-green-500/30">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
            <span className="text-xs text-green-400 font-bold ml-2 tracking-wider">
              bash — jarvis@security-terminal:~/{selectedTask}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="text-green-400 font-bold">STATUS: READY</span>
            <span>•</span>
            <span>STEP {currentStep.stepNumber}/{currentTask.steps.length}</span>
          </div>
        </div>

        {/* Code / Command Prompt Line */}
        <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-green-400 font-mono-tech">
            <span className="text-slate-500">$</span>
            <span className="text-green-300 font-bold">{currentStep.commandSnippet}</span>
            <span className="terminal-cursor" />
          </div>
          <span className="text-[10px] text-slate-500">TLS 1.3 / AUTH</span>
        </div>

        {/* Step Content Workspace */}
        <div className="p-4 sm:p-6 flex flex-col gap-4">
          
          {/* Step Header */}
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-green-950 border border-green-400 flex items-center justify-center font-orbitron font-extrabold text-green-300 text-sm shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                {currentStep.stepNumber}
              </span>
              <div>
                <h4 className="font-orbitron font-bold text-sm sm:text-base text-white">
                  {currentStep.titleHindi}
                </h4>
                <span className="text-[11px] text-green-400/80 font-mono-tech">
                  {currentStep.titleEnglish} • (चरण {currentStepIndex + 1} of {currentTask.steps.length})
                </span>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="flex items-center gap-1.5">
              {currentTask.steps.map((_, i) => (
                <span
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i === currentStepIndex
                      ? 'bg-green-400 w-8 shadow-[0_0_10px_rgba(34,197,94,0.8)]'
                      : i < currentStepIndex
                      ? 'bg-green-700 w-3'
                      : 'bg-slate-800 w-3'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Two-Column Grid: Instructions + Action Trigger */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Left: Terminal Voice Instructions in Hindi & Bhojpuri */}
            <div className="p-4 rounded-xl bg-slate-950 border border-green-500/20 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-2 text-green-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-green-400" />
                  <span>Jarvis Voice Guidance:</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed mb-3">
                  {currentStep.instructionHindi}
                </p>

                {/* Bhojpuri Guidance */}
                <div className="p-2.5 rounded-lg bg-green-950/20 border border-green-500/20 text-xs text-green-200 font-sans">
                  <span className="font-mono-tech text-[10px] text-green-400 font-bold block mb-0.5">
                    🗣️ भोजपुरी में निर्देश:
                  </span>
                  {currentStep.instructionBhojpuri}
                </div>
              </div>

              {/* Input Fields to Fill Hint */}
              <div className="pt-2 border-t border-slate-900">
                <span className="text-[10px] font-mono-tech text-slate-400 uppercase tracking-wider block mb-1.5">
                  स्क्रीन पर ये बॉक्स/फील्ड्स भरनी होंगी:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentStep.inputFieldsHint.map((hint, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-green-500/30 text-green-300 text-[11px] font-mono-tech"
                    >
                      ⌨️ {hint}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Screen Navigator & Action Trigger */}
            <div className="p-4 rounded-xl bg-slate-950 border border-green-500/30 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-2 text-green-400 text-xs font-bold uppercase tracking-wider">
                  <Smartphone className="w-4 h-4 text-green-400" />
                  <span>Visual Button Navigator (स्क्रीन गाइड):</span>
                </div>

                {/* Highlight Button Notice */}
                <div className="p-3 rounded-lg bg-green-950/30 border border-green-400/50 flex items-center gap-2.5 text-xs text-green-200 font-sans mb-3 shadow-[0_0_15px_rgba(34,197,94,0.15)]">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-white block">स्क्रीन पर यह खोजें व दबाएं:</span>
                    <span className="text-green-300 font-bold">{currentStep.highlightButtonHint}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 font-sans italic">
                  {currentStep.securityNote}
                </p>
              </div>

              {/* Direct Official Google Page Execution Button */}
              <button
                onClick={() => handleOpenGooglePage(currentStep.targetUrl)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-black font-orbitron font-extrabold text-xs tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.5)] active:scale-95 transition-all"
              >
                <span>{currentStep.actionButtonLabel}</span>
                <ExternalLink className="w-4 h-4 text-black" />
              </button>
            </div>

          </div>

          {/* Stepper Navigation: Previous vs Next */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-900">
            <button
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className={`px-4 py-2 rounded-xl text-xs font-mono-tech flex items-center gap-1.5 transition-all ${
                currentStepIndex === 0
                  ? 'opacity-30 cursor-not-allowed bg-slate-900 text-slate-600'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>पिछला कदम (Previous)</span>
            </button>

            <span className="text-xs font-mono-tech text-slate-400">
              बोलें: <strong className="text-green-400">“अगला कदम बताओ”</strong>
            </span>

            <button
              onClick={handleNextStep}
              className="px-5 py-2 rounded-xl bg-green-500 hover:bg-green-400 text-black text-xs font-mono-tech font-extrabold flex items-center gap-1.5 shadow-[0_0_15px_rgba(34,197,94,0.4)] active:scale-95 transition-all"
            >
              <span>{currentStepIndex === currentTask.steps.length - 1 ? 'पूर्ण (Finish)' : 'अगला कदम बताओ (Next)'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Voice Prompt Suggestions in Terminal Style */}
      <div className="p-3 rounded-xl bg-black border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono-tech text-slate-400">
        <span className="flex items-center gap-1.5 text-green-400">
          <FileCode2 className="w-3.5 h-3.5" />
          <span>VOICE PROTOCOL COMMANDS:</span>
        </span>
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2 py-0.5 rounded bg-slate-950 border border-green-500/40 text-green-300">
            "Google पर नया ID बनाना है"
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-950 border border-green-500/40 text-green-300">
            "अगला कदम बताओ"
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-950 border border-green-500/40 text-green-300">
            "Google Security खोलो"
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-950 border border-green-500/40 text-green-300">
            "पासवर्ड कैसे बदलें"
          </span>
        </div>
      </div>
    </div>
  );
};
